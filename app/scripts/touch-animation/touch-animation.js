angular.module('touchAnimation', []).
  directive('ngTap', function() {
    return {
      link: function(scope, element, attr) {
        element.on('tap', function() {
          scope.$apply(attr.ngTap);
        });
      }
    };
  }).
  factory('touchAnimation', [function() {

  var raf = initRaf();
  var AnimationSpec = createAnimationSpec();

  addJqWidthHeight(angular.element.prototype);

  return touchAnimationFactory;

  function touchAnimationFactory(options) {
    var player,
      animationsByName,
      self,
      animationFactory = options.animationFactory,
      mainElement = options.gesture.element;

    updateAnimationIfNeeded();

    var gestureStartTime;
    mainElement.on('swipestart'+options.gesture.type, function(e, gesture) {
      gestureStartTime = player.currentTime;
    });
    mainElement.on('swipemove'+options.gesture.type, function(e, gesture) {
      var newTime = gestureStartTime + (gesture.offset * -1);
      newTime = Math.max(newTime, animationsByName.main.startTime);
      newTime = Math.min(newTime, animationsByName.main.endTime);
      goTo(newTime);
    });

    mainElement.on('$destroy', destroy);

    return self = {
      updateAnimationIfNeeded: updateAnimationIfNeeded,
      getAnimationByName: getAnimationByName,
      currentTime: currentTime,
      goTo: goTo,
      destroy: destroy
    };

    function destroy() {
      deletePlayer(player);
    }

    function goTo(targetTime, timing) {
      if (!timing) {
        raf(function() {
          player.currentTime = targetTime;
        });
      } else {
        return animatePlayerTo(player, targetTime, timing.duration || 1, timing.easing || 'linear');
      }
    }

    function currentTime() {
      return player.currentTime;
    }

    function getAnimationByName(name) {
      return animationsByName[name];
    }

    var lastAnimationSpec;
    function updateAnimationIfNeeded() {
      var animationSpec = new AnimationSpec();
      var targets = {};
      animationFactory(animationSpec);
      // delete all the target elements, so we can use
      // angular's copy and equals methods
      angular.forEach(animationSpec, function(part, name) {
        if (part.target) {
          targets[name] = part.target;
          part.target = null;
        }
      });
      if (angular.equals(animationSpec, lastAnimationSpec)) {
        return;
      }
      lastAnimationSpec = angular.copy(animationSpec);
      // copy back the target elements...
      angular.forEach(animationSpec, function(part, name) {
        if (targets[name]) {
          part.target = targets[name];
        }
      });

      animationsByName = animationSpec.build();

      if (!player) {
        player = document.timeline.play(animationsByName.main);
        player.paused = true;
      } else {
        player.source = animationsByName.main;
      }
    }
  }


  // ------------------
  // - utils
  // ------------------

  function addJqWidthHeight(jqProto) {
    if (!jqProto.height) {
      jqProto.height = jqHeight;
    }
    if (!jqProto.width) {
      jqProto.width = jqWidth;
    }

    function jqHeight() {
      var elem = this[0];
      if (!elem) {
        return 0;
      }
      var rect = elem.getBoundingClientRect();
      return rect.bottom - rect.top;
    }

    function jqWidth() {
      var elem = this[0];
      if (!elem) {
        return 0;
      }
      var rect = elem.getBoundingClientRect();
      return rect.right - rect.left;
    }

  }

  // ------------------
  function deletePlayer(player) {
    // TODO: Is this the right way to delete a player??
    player.source = null;
    player.paused = false;
  }

  function initRaf() {
    var nativeRaf = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    var raf;
    if (nativeRaf) {
      raf = function(callback) {
        nativeRaf(callback);
      };
    } else {
      raf = function(callback) {
        setTimeout(callback, 1000 / 60);
      };
    }
    return raf;
  }

  // TODO: Is there a builtin way to do this?
  function animatePlayerTo(player, targetTime, duration, easing, done) {
    var lastTimeFraction,
      start = player.currentTime,
      timeDiff = targetTime - start,
      anim = new Animation(null, {
        sample: sample
      }, {
        duration: duration,
        easing: easing
      });
    anim.onend = function() {
      stop();
      done && done();
    };
    var animatePlayer = document.timeline.play(anim);
    return stop;

    function sample(timeFraction) {
      // Need to do this lasttime check and a separate raf. Otherwise
      // we get into a stack overflow...
      if (lastTimeFraction!==timeFraction) {
        lastTimeFraction = timeFraction;
        raf(function() {
          player.currentTime = start + timeDiff * timeFraction;
        });
      }
    }

    function stop() {
      deletePlayer(animatePlayer);
    }
  }

  function createAnimationSpec() {
    function AnimationSpec() {

    }

    AnimationSpec.prototype = {
      resolvedDuration: resolvedDuration,
      build: build
    };

    function resolvedDuration(partName) {
      var self = this,
        part = this[partName],
        timing = part.timing || {};
      if (!part) {
        throw new Error('Could not find part '+partName);
      }
      var base = timing.duration;
      var result;
      if (!base) {
        base = 0;
        if (part.type === 'par') {
          angular.forEach(part.children, function(childName) {
            base = Math.max(base, self.resolvedDuration(childName));
          });
        } else if (part.type === 'seq') {
          angular.forEach(part.children, function(childName) {
            base += self.resolvedDuration(childName);
          });
        }
      }
      if (timing.iterations) {
        base = base * timing.iterations;
      }
      return base;
    }

    function build() {
      var spec = this;
      var builtParts = {};

      angular.forEach(spec, function(part, name) {
        build(name);
      });

      return builtParts;

      function build(partName) {
        var part = builtParts[partName],
          events;
        if (!part) {
          var partSpec = spec[partName],
            part;
          if (!partSpec) {
            throw new Error('Could not find the spec for animation '+partName);
          }
          if (partSpec.type === 'atom') {
            part = new Animation(partSpec.target, partSpec.effect, partSpec.timing);
          } else if (partSpec.type === 'seq') {
            var children = [];
            angular.forEach(partSpec.children, function(childName) {
              children.push(build(childName));
            });
            part = new SeqGroup(children, partSpec.timing);
          } else if (partSpec.type === 'par') {
            var children = [];
            angular.forEach(partSpec.children, function(childName) {
              children.push(build(childName));
            });
            part = new ParGroup(children, partSpec.timing);
          } else {
            throw new Error('Unknown animation type '+partSpec.type);
          }
          events = partSpec.events;
          if (events) {
            if (events.oniterate) {
              // apply bugfix for oniterate
              part = fixedOnIterate(part, events.oniterate);
            }
            if (events.onstart) {
              part.onstart = events.onstart;
            }
            if (events.onend) {
              part.onend = event.onend;
            }
          }
        }
        return builtParts[partName] = part;
      }
    }

    return AnimationSpec;
  }

}]);
