(function() {
  var jqProto = angular.element.prototype;
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
})();

angular.module('touchAnimation').factory('animationUtils', function() {
  var raf = initRaf();
  var isArray = angular.isArray,
    isObject = angular.isObject,
    isFunction = angular.isFunction;

  // TODO: discuss these methods with the web-animations team!
  return {
    animatePlayerTo: animatePlayerTo,
    stopAnimatePlayer: stopAnimatePlayer,
    raf: raf,
    indexAnimationByName: indexAnimationByName,
    AnimationSpec: createAnimationSpec(),
    copy: copy,
    equals: equals
  };

  // ------------------

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

  function stopAnimatePlayer(player) {
    if (player.animatePlayer) {
      player.animatePlayer.stop();
      player.animatePlayer = null;
    }
  }

  // TODO: Is there a builtin way to do this?
  var animatePlayer;
  function animatePlayerTo(player, targetTime, duration, easing, done) {
    stopAnimatePlayer(player);
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
    // TODO: What is the correct way to delete
    // a player with a custom effect?
    // Right now we are reusing the old one...
    if (animatePlayer) {
      animatePlayer.source = anim;
      animatePlayer.playbackRate = 1;
      animatePlayer.currentTime = 0;
      animatePlayer.paused = false;
    } else {
      animatePlayer = document.timeline.play(anim);
    }

    player.animatePlayer = {
      stop: stop
    };

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
      animatePlayer.source = null;
      animatePlayer.paused = true;
    }
  }

  function indexAnimationByName(animation, target) {
    target = target || {};
    if (animation.name) {
      target[animation.name] = animation;
    }
    angular.forEach(animation.children, function(child) {
      indexAnimationByName(child, target);
    });
    return target;
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

  // Copy of the angular method, but it also ignores DOM nodes
  function copy(source, destination){
    if (isWindow(source) || isScope(source)) {
      throw Error(
        "Can't copy! Making copies of Window or Scope instances is not supported.");
    }

    if (!destination) {
      destination = source;
      if (source) {
        if (isArray(source)) {
          destination = copy(source, []);
        } else if (isDate(source)) {
          destination = new Date(source.getTime());
        } else if (isRegExp(source)) {
          destination = new RegExp(source.source);
        } else if (isObject(source) && !isDOMNode(source)) {
          destination = copy(source, {});
        }
      }
    } else {
      if (source === destination) throw Error(
        "Can't copy! Source and destination are identical.");
      if (isArray(source)) {
        destination.length = 0;
        for ( var i = 0; i < source.length; i++) {
          destination.push(copy(source[i]));
        }
      } else {
        angular.forEach(destination, function(value, key){
          delete destination[key];
        });
        for ( var key in source) {
          destination[key] = copy(source[key]);
        }
      }
    }
    return destination;
  }

  // Copy of the angular method, but it also ignores DOM nodes
  function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == 'object') {
        if (isArray(o1)) {
          if (!isArray(o2)) return false;
          if ((length = o1.length) == o2.length) {
            for(key=0; key<length; key++) {
              if (!equals(o1[key], o2[key])) return false;
            }
            return true;
          }
        } else if (isDate(o1)) {
          return isDate(o2) && o1.getTime() == o2.getTime();
        } else if (isRegExp(o1) && isRegExp(o2)) {
          return o1.toString() == o2.toString();
        } else {
          if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2) || isDOMNode(o2)) return false;
          keySet = {};
          for(key in o1) {
            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
            if (!equals(o1[key], o2[key])) return false;
            keySet[key] = true;
          }
          for(key in o2) {
            if (!keySet.hasOwnProperty(key) &&
              key.charAt(0) !== '$' &&
              o2[key] !== undefined &&
              !isFunction(o2[key])) return false;
          }
          return true;
        }
      }
    }
    return false;
  }

  function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
  }

  function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
  }

  function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }

  function isDate(value){
    return toString.call(value) === '[object Date]';
  }

  function isDOMNode(value) {
    return value && value.nodeName;
  }


});