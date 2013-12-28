angular.module('scroll').factory('touchAnimation', ['gesture', function(gesture) {
  // TODO: refactor this so that it does not use a prototype!
  // TODO: look through all methods and use consistent style
  // of parameter list vs parameter object...

  function TouchAnimation(options) {
    var self = this;
    this.timeToPixelRatio = options.timeToPixelRatio;
    this.gesture = options.gesture;

    // TODO refactor names:
    // options.animation.animation seems wired...

    this.animation = options.animation;

    this.effects = options.effects || [];

    gesture(options.gesture.element, options.gesture.type, function(event) {
      var action = event.type,
          pixelOffset = (event.gesture && event.gesture.current.offset) || 0;
      if (action === 'start') {
        event.gesture.playerStartTime = self.player.currentTime;
      }
      if (action === 'move' || action === 'start') {
        var newTime = event.gesture.playerStartTime + (pixelOffset / self.timeToPixelRatio);
        if (newTime<0) {
          newTime = 0;
        }
        utils.setPlayerCurrentTimeInRaf(self.player, newTime);
      }
      if (action === 'end') {
        var gestureVelocity = event.gesture.current.velocity / self.timeToPixelRatio;
        self.executeEffects(gestureVelocity);
      }
      if (action === 'prepare') {
        utils.stopAnimatePlayer(self.player);
      }
    });

    this.player = document.timeline.play(options.animation.animation);
    this.player.paused = true;
    if (options.startAnimation) {
      var startTime = this.animation.animationStart(options.startAnimation);
      if (startTime) {
        utils.setPlayerCurrentTimeInRaf(this.player, startTime);
      }
    }

    this.updateAnimation = function(options) {
      var animation = options.animation,
          effects = options.effects || [];
      var self = this;
      // Needs to be in a raf as otherwise the events
      // of the animation might fire immediately, which
      // is something the caller might not expect.
      utils.raf(function() {
        self.effects = effects;
        self.animation = animation;
        self.player.source = animation;
      });
    };

    // TODO: should be private
    this.executeEffects = function(currentVelocity) {
      var self = this;
      var now = this.player.currentTime;
      var effect = this.findEffect(now);
      if (!effect) {
        return;
      }
      var animation = effect.listener({
        currentTime: now,
        velocity: currentVelocity,
        animationStart: effect.animationStart,
        animationEnd: effect.animationEnd
      });
      if (animation) {
        var targetTime = animation.targetTime;
        targetTime = this.boundedTime(targetTime);
        utils.animatePlayerTo(self.player, targetTime, animation.duration, animation.easing || 'linear');
      }
    };

    // TODO: should be private
    this.boundedTime = function(targetTime) {
      targetTime = Math.max(0, targetTime);
      targetTime = Math.min(this.player.source.duration, targetTime);
      return targetTime;
    };

    // TODO: should be private
    this.findEffect = function(time) {
      time = this.boundedTime(time);
      var i, effect, start, end;
      for (i=0; i<this.effects.length; i++) {
        effect = this.effects[i];
        start = this.animation.animationStart(effect.animationName);
        end = this.animation.animationEnd(effect.animationName);
        // TODO: this should be only "< end". However,
        // animationEnd seems to be inclusive...
        if (time >= start && time <= end) {
          return {
            listener: effect.listener,
            animationStart: start,
            animationEnd: end
          };
        }
      }
      return null;
    };
  }

  return TouchAnimation;
}]);
