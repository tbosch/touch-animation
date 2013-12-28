angular.module('touchAnimation').factory('touchAnimation', ['animationGesture', 'animationUtils', function(animationGesture, animationUtils) {
  return touchAnimationFactory;

  function touchAnimationFactory(options) {
    var player,
      effects,
      animationsByName;

    update(options);
    animationGesture(options.gesture.element, options.gesture.type, gestureListener);

    return {
      update: update
    };

    function gestureListener(event) {
      var action = event.type,
        pixelOffset = (event.gesture && event.gesture.current.offset) || 0;
      if (action === 'start') {
        event.gesture.playerStartTime = player.currentTime;
      }
      if (action === 'move' || action === 'start') {
        var newTime = event.gesture.playerStartTime + (pixelOffset / options.timeToPixelRatio);
        if (newTime<0) {
          newTime = 0;
        }
        player.currentTime = newTime;
      }
      if (action === 'end') {
        var gestureVelocity = event.gesture.current.velocity / options.timeToPixelRatio;
        executeEffects(gestureVelocity);
      }
      if (action === 'prepare') {
        animationUtils.stopAnimatePlayer(player);
      }
    }

    function update(options) {
      effects = options.effects || [];
      animationsByName = animationUtils.indexAnimationByName(options.animation);

      if (!player) {
        player = document.timeline.play(options.animation);
        player.paused = true;
        if (options.startAnimation) {
          var startTime = animationsByName[options.startAnimation].startTime;
          if (startTime) {
            player.currentTime = startTime;
          }
        }
      } else {
        player.source = options.animation;
      }
    }

    function executeEffects(currentVelocity) {
      var now = player.currentTime;
      var effect = findEffect(now);
      if (!effect) {
        return;
      }
      var animation = effect.listener({
        currentTime: now,
        velocity: currentVelocity,
        animation: effect.animation
      });
      if (animation) {
        var targetTime = animation.targetTime;
        targetTime = boundedTime(targetTime);
        animationUtils.animatePlayerTo(player, targetTime, animation.duration, animation.easing || 'linear');
      }
    }

    function boundedTime(targetTime) {
      targetTime = Math.max(0, targetTime);
      targetTime = Math.min(player.source.duration, targetTime);
      return targetTime;
    }

     function findEffect(time) {
      time = boundedTime(time);
      var i, effect, animation, start, end;
      for (i=0; i<effects.length; i++) {
        effect = effects[i];
        animation = animationsByName[effect.animationName];
        start = animation.startTime;
        end = animation.endTime;
        // TODO: this should be only "< end". However,
        // animationEnd seems to be inclusive...
        if (time >= start && time <= end) {
          return {
            listener: effect.listener,
            animation: animation
          };
        }
      }
      return null;
    }
  }
}]);
