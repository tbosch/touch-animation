angular.module('touchAnimation').factory('touchAnimation', ['animationUtils', function(animationUtils) {

  return touchAnimationFactory;

  function touchAnimationFactory(options) {
    var player,
      animationsByName,
      self,
      animationFactory = options.animationFactory,
      mainElement = options.gesture.element;

    updateAnimationIfNeeded();

    var gestureStartTime,
        velocityEffectStop;
    mainElement.on('slide'+options.gesture.type.toUpperCase()+'Start', function(e, gesture) {
      gestureStartTime = player.currentTime;
    });
    mainElement.on('slide'+options.gesture.type.toUpperCase()+'Move', function(e, gesture) {
      var pixelOffset = gesture.offset;
      var newTime = gestureStartTime + (pixelOffset * -1);
      if (newTime<0) {
        newTime = 0;
      }
      velocityEffectStop = goTo(newTime);
    });

    return self = {
      updateAnimationIfNeeded: updateAnimationIfNeeded,
      getAnimationByName: getAnimationByName,
      currentTime: currentTime,
      goTo: goTo
    };

    function goTo(targetTime, timing) {
      if (!timing) {
        player.currentTime = targetTime;
      } else {
        return animationUtils.animatePlayerTo(player, targetTime, timing.duration || 1, timing.easing || 'linear');
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
      var animationSpec = new animationUtils.AnimationSpec();
      animationFactory(animationSpec);
      if (animationUtils.equals(animationSpec, lastAnimationSpec)) {
        return;
      }
      lastAnimationSpec = animationUtils.copy(animationSpec);
      animationsByName = animationSpec.build();

      if (!player) {
        player = document.timeline.play(animationsByName.main);
        player.paused = true;
      } else {
        player.source = animationsByName.main;
      }
    }
  }
}]);
