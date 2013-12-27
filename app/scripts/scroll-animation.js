angular.module('scroll').factory('touchAnimation', ['gesture', function(gesture) {

  function TouchAnimation(options) {
    var self = this;
    if (options.timeToPixelRatio) {
      this.timeToPixelRatio = options.timeToPixelRatio;
    } else {
      this.headerDuration = options.headerDuration;
    }
    this.headerDuration = options.headerDuration;
    this.footerDuration = options.footerDuration;
    this.gesture = options.gesture;

    this.duration = options.animation.duration;
    this.animation = options.animation;

    gesture(options.gesture.element, options.gesture.type, function(action, pixelOffset) {
      if (action === 'start') {
        self.gestureStart = {
          time: self.player.currentTime
        };
      }
      if (action === 'move' || action === 'start') {
        var newTime = self.gestureStart.time + (pixelOffset / self.timeToPixelRatio);
        if (newTime<0) {
          newTime = 0;
        }
        if (action === 'start') {
          self.gestureVelocity = 0;
        } else if (action === 'move') {
          if (self.lastGesture && self.player.timeline.currentTime !== self.lastGesture.time) {
            // TODO: Apply some smoothing over time, e.g.
            // take the last three points and calculate the average velocity...
            self.gestureVelocity =
              (newTime - self.lastGesture.offset) /
                (self.player.timeline.currentTime - self.lastGesture.time);
          }
        }
        self.lastGesture = {
          offset: newTime,
          time: self.player.timeline.currentTime
        };

        utils.setPlayerCurrentTimeInRaf(self.player, newTime);
      }
      if (action === 'end') {
        var lowerBound = self.headerDuration,
            upperBound = self.duration - self.footerDuration;
        if (self.player.currentTime <= lowerBound) {
          // TODO: Which duration to take?
          utils.animatePlayerTo(self.player, lowerBound, 0.3, 'ease-out');
        } else if (self.player.currentTime >= upperBound) {
          // TODO: Which duration to take?
          utils.animatePlayerTo(self.player, upperBound, 0.3, 'ease-out');
        } else {
          // TODO: Is this the right calculation?
          var oldTime = self.player.currentTime,
            newTime = oldTime + self.gestureVelocity / 2;

          newTime = Math.max(newTime, lowerBound);
          newTime = Math.min(newTime, upperBound);
          utils.animatePlayerTo(self.player, newTime, Math.abs((newTime - oldTime) / self.gestureVelocity * 2), 'ease-out');
        }
      }
    });

    this.player = document.timeline.play(this.animation);
    this.player.paused = true;
    utils.setPlayerCurrentTimeInRaf(this.player, this.headerDuration);

    this.updateAnimation = function(animation) {
      var self = this;
      // Needs to be in a raf as otherwise the events
      // of the animation might fire immediately, which
      // is something the caller might not expect.
      utils.raf(function() {
        self.duration = animation.duration;
        self.animation = animation;
        self.player.source = animation;
      });
    };
  }

  return TouchAnimation;
}]);
