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

  // TODO: discuss these methods with the web-animations team!
  return {
    builder: createAnimationBuilder,
    animatePlayerTo: animatePlayerTo,
    stopAnimatePlayer: stopAnimatePlayer,
    raf: raf,
    indexAnimationByName: indexAnimationByName
  };

  // ------------------

  function createAnimationBuilder() {
    var animations = [],
      parallelAnimations = [];

    return {
      addAnimation: addAnimation,
      addParallelAnimation: addParallelAnimation,
      build: build
    };

    function addAnimation(name, order, animation) {
      animation.name = name;
      animations.push({
        order: order,
        animation: animation
      });
    }

    function addParallelAnimation(startAnimationName, endAnimationName, factory) {
      parallelAnimations.push({
        start: startAnimationName,
        end: endAnimationName,
        factory: factory
      });
    }

    function build() {
      var res = new SeqGroup();
      animations.sort(function(entry1, entry2) {
        return entry1.order - entry2.order;
      });
      var animationsByName = {};
      angular.forEach(animations, function(entry) {
        res.append(entry.animation);
        animationsByName[entry.animation.name] = entry.animation;
      });

      if (parallelAnimations.length) {
        var par = new ParGroup();
        par.append(res);
        angular.forEach(parallelAnimations, function(entry) {
          var startAnimation = animationsByName[entry.start],
            endAnimation = animationsByName[entry.end];
          if (!startAnimation || !endAnimation) {
            return;
          }
          var start = startAnimation.startTime,
            end = endAnimation.endTime,
            animation = entry.factory({
              delay: start,
              duration: end - start
            });
          par.append(animation);
        });
        res = par;
      }
      return res;
    }

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
});