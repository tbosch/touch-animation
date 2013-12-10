(function () {
  var nativeRaf = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  function setCurrentTime(player, time) {
    // TODO: How can I update the currentTime of a player
    // without triggering a raf?
    nativeRaf(function() {
      player.currentTime = time;
    });
  }

  var easePlayer;
  function easeEffect(player, targetTime, playrate, effect) {
    var start = player.currentTime,
      timeDiff = targetTime - start,
      anim = new Animation(null, {
      sample: sample
    }, {
      duration: Math.abs(timeDiff),
      easing: effect
    });
    anim.onend = stop;
    // TODO: What is the correct way to delete a player?
    if (easePlayer) {
      easePlayer.source = anim;
    } else {
      easePlayer = document.timeline.play(anim);
    }
    easePlayer.playbackRate = playrate;
    easePlayer.currentTime = 0;
    easePlayer.paused = false;

    var lastTimeFraction;

    return stop;

    function sample(timeFraction) {
      // Need to do this lasttime check and separate raf. Otherwise
      // this would not work...
      if (lastTimeFraction!==timeFraction) {
        lastTimeFraction = timeFraction;
        setCurrentTime(player, start + timeDiff * timeFraction);
      }
    }

    function stop() {
      easePlayer.source = null;
      easePlayer.paused = true;
    }
  }


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
        if (action === 'start') {
          self.gestureVelocity = 0;
        } else if (action === 'move') {
          if (self.lastGesture) {
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

        setCurrentTime(self.player, newTime);
      }
      if (action === 'stop') {
        var lowerBound = self.headerDuration,
            upperBound = self.duration - self.footerDuration;
        if (self.player.currentTime <= lowerBound) {
          // TODO: Which velocity to take?
          self.animateTo(lowerBound, 2);
        } else if (self.player.currentTime >= upperBound) {
          // TODO: Which velocity to take?
          self.animateTo(upperBound, 2);
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
    setCurrentTime(this.player, this.headerDuration);
  }

  TouchAnimation.prototype = {
    stopAnimateTo: function() {
      if (this.animateToStop) {

        this.animateToStop();
        delete this.animateToStop;
      }
    },
    animateTo: function(targetTime, playbackRate) {
      this.animateToStop = easeEffect(this.player, targetTime, playbackRate || 0.5, 'ease-out');
    }
  };

  window.ScrollAnimation = TouchAnimation;
})();
