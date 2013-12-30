angular.module('touchAnimation').factory('touchAnimation', ['animationGesture', 'animationUtils', function(animationGesture, animationUtils) {

  // negative, so that the user can scroll to the top
  // but the animation goes forward.
  var TIME_TO_PIXEL_RATIO = -1;

  return touchAnimationFactory;

  function touchAnimationFactory(options) {
    var player,
      effects = options.effects || [],
      animationsByName,
      self,
      startAnimation = options.startAnimation,
      animationFactory = options.animationFactory;

    updateAnimationIfNeeded();
    animationGesture(options.gesture.element, options.gesture.type, gestureListener);

    return self = {
      updateAnimationIfNeeded: updateAnimationIfNeeded,
      getAnimationByName: getAnimationByName
    };

    function gestureListener(event) {
      var action = event.type,
        pixelOffset = (event.gesture && event.gesture.current.offset) || 0;
      if (action === 'start') {
        event.gesture.playerStartTime = player.currentTime;
      }
      if (action === 'move' || action === 'start') {
        var newTime = event.gesture.playerStartTime + (pixelOffset / TIME_TO_PIXEL_RATIO);
        if (newTime<0) {
          newTime = 0;
        }
        player.currentTime = newTime;
      }
      if (action === 'end') {
        var gestureVelocity = event.gesture.current.velocity / TIME_TO_PIXEL_RATIO;
        executeEffects(gestureVelocity);
      }
      if (action === 'prepare') {
        animationUtils.stopAnimatePlayer(player);
      }
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
        if (startAnimation) {
          var startTime = animationsByName[startAnimation].startTime;
          player.currentTime = startTime;
        }
      } else {
        player.source = animationsByName.main;
      }
    }

    function executeEffects(currentVelocity) {
      var i, effect, animation, now;
      now = player.currentTime;
      for (i=0; i<effects.length; i++) {
        effect = effects[i];
        animation = effect({
          currentTime: now,
          velocity: currentVelocity,
          animation: effect.animation
        }, self);
        if (animation) {
          var targetTime = animation.targetTime;
          targetTime = boundedTime(targetTime);
          animationUtils.animatePlayerTo(player, targetTime, animation.duration, animation.easing || 'linear');
          return;
        }
      }
    }

    function boundedTime(targetTime) {
      targetTime = Math.max(0, targetTime);
      targetTime = Math.min(player.source.duration, targetTime);
      return targetTime;
    }

  }
}]);
