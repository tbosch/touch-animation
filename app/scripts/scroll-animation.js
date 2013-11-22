(function () {
  function TouchAnimation(options) {
    var self = this;
    this.duration = options.animation.duration;
    if (options.timeToPixelRatio) {
      this.timeToPixelRatio = options.timeToPixelRatio;
    } else {
      this.headerDuration = options.headerDuration;
    }
    this.headerDuration = options.headerDuration;
    this.footerDuration = options.footerDuration;
    this.animation = options.animation;
    this.gesture = options.gesture;
    this.gesture.addPositionListener(function(pixelOffset, action) {
      self.stopAnimateTo();

      if (action === 'start') {
        self.gestureStart = {
          time: self.player.currentTime
        };
      }
      if (action === 'move' || action === 'start') {
        var newTime = self.gestureStart.time + (pixelOffset / self.timeToPixelRatio);
        if (self.lastGesture) {
          // TODO: Apply some smoothing over time, e.g.
          // take the last three points and calculate the average velocity...
          self.gestureVelocity =
            (newTime - self.lastGesture.offset) /
            (self.player.timeline.currentTime - self.lastGesture.time);
        }
        self.lastGesture = {
          offset: newTime,
          time: self.player.timeline.currentTime
        };

        self.player.currentTime = newTime;
      }
      if (action === 'stop') {
        var lowerBound = self.headerDuration,
            upperBound = self.duration - self.footerDuration;
        if (self.player.currentTime <= lowerBound) {
          self.animateTo(lowerBound);
        } else if (self.player.currentTime >= upperBound) {
          self.animateTo(upperBound);
        } else {
          // TODO: Is this the right calculation?
          var newTime = self.player.currentTime + self.gestureVelocity / 2;
          newTime = Math.max(newTime, lowerBound);
          newTime = Math.min(newTime, upperBound);
          self.animateTo(newTime, Math.abs(self.gestureVelocity) / 2);
        }
      }
    });

    this.player = document.timeline.play(this.animation);
    this.player.paused = true;
    this.player.currentTime = this.headerDuration;
  }

  TouchAnimation.prototype = {
    stopAnimateTo: function(finished) {
      var state, newTime, playedRatio;
      if (state = this.animateToRunning) {
        delete this.animateToRunning;
        // TODO: check this generically (the finished flag)
        if (!finished) {
          // TODO: is this correct?
          // TODO: Does not include eased timing right now...
          var animatedTime = this.player.currentTime;
          playedRatio = animatedTime / this.player.source.duration;
          newTime = state.startTime + ((state.targetTime - state.startTime) * playedRatio);
        } else {
          newTime = state.targetTime;
          playedRatio = 1;
        }
        console.log('stopped animation: playedRatio='+playedRatio);
        this.player.source = this.animation;
        this.player.paused = true;
        this.player.currentTime = newTime;
      }
    },
    animateTo: function(targetTime, playbackRate) {
      this.stopAnimateTo();
      var self = this,
          startTime = this.player.currentTime;
      this.animateToRunning = {
        startTime: startTime,
        targetTime: targetTime
      };
      console.log('animateTo: start='+ startTime+ ' target='+targetTime+' playRate='+playbackRate);
      var group = new SeqGroup([this.animation], {
        delay:  -Math.min(targetTime,startTime),
        duration: Math.max(targetTime,startTime)
      });

      if (targetTime>startTime) {
        group = new SeqGroup([group], {
          // extreme ease-out
          easing: 'cubic-bezier(0, 0, 0.1, 1)'
        });
      } else {
        group = new SeqGroup([group], {
          // extreme ease-in
          easing: 'cubic-bezier(0.9, 0, 1, 1)',
          direction: 'reverse'
        });
      }

      group.onend = function() {
        self.stopAnimateTo(true);
      };
      // start animation phase.
      this.player.source = group;
      this.player.playbackRate = playbackRate || 0.5;
      this.player.currentTime = 0;
      this.player.paused = false;
    }
  };

  window.ScrollAnimation = TouchAnimation;
})();
