(function () {
  // return;

  // Name: TouchAnimation

  // -------------

  // Usecase: scrolling with acceleration
  // 1. follow the finger while the finger touches.
  // 2. get slower at the end of the scrolling.
  // 3. When animation is at the end and finger leaves the screen: flip backwards (pull to refresh, ...)
  // 4. When finger leaves the screen otherwise, continue scrolling with
  //    a given acceleration that decreases over time.

  // Input:
  // - Animation
  //   * Does some things at various times of the animation.
  //   * Have to be linear with the gesture direction!
  //     Note: For path animations, use the easing: paced timing function!
  // - gesture: slide-x, slide-y, pinch-out/in
  //   * Should be auto detected by evaluating the transform properties...
  //   * pinch-out, pinch-in: Looks for the transform:scale properties!
  // - timing functions:
  //   * during gesture phase
  //   * Needs to be linear in most parts, otherwise the "follow the finger" does not work!
  //   * Could also be auto generated: Only use case right now is for the end of the animation
  //   * E.g. flag: gestureSlowDownAtEnds would be enough (with a time duration when to slow down...)
  // - events:
  //   * onGestureEnd(callback: function(event, timeInAnimation, lastAnimationVelocity)
  //     -> could call animateToPoint
  //   * onTimeRangeEnter(start, end, callback: function(event, timeInAnimation, lastAnimationVelocity)
  //     -> during gesture
  //        - e.g. for pull to refresh to load data in the background
  //        - could then pause the TouchAnimation and continue when the data is there.

  // API (all time based, so it's easy to support Paths, zoom, ...!)
  // - paused: true / false
  // - currentTime
  // - velocity: define during gesture phase and during animation phase!
  // - animateToPoint(easeIn, easeOut, animationPoint)
  // - onGestureEnd(callback: function(event, timeInAnimation, lastAnimationVelocity)
  // - onTimeRangeEnter(start, end, callback: function(event, timeInAnimation, lastAnimationVelocity)


  // Note on animateToPoint:
  // - adjusts the velocity of the player manually over time (via setTimeout)
  //   depending on the difference of the current position to the target position.
  // - Reason: Don't need to convert the animation in this case (e.g. wrap into another SeqGroup, ...)
  // - Reason: Need the timed loop anyways to calculate the velocity for the gesture!
  // - Reason: Wrapping SeqGroup with start and end and easein / easeout is difficult!

  // -------------
  // Applied: Scrolling vertically with acceleration:
  // - Define Animation with translateY(0) to translateY(200px)
  // - Gesture slide-y will be autodetected
  // - Timing function:
  //   * after time is between 0 and 50 or between 150 and 200, apply factor of 0.5
  // - onGestureEnd:
  //   * depending on velocity define an end point for the animation.
  //     If current velocity is too slow (or 0) define easeIn as true.
  //     and call animateToPoint({point: somePoint, easeIn: false/true, easeOut: true});
  // - onTimeRangeEnter:
  //   * When at the start/end of the animation, and current velocity is >0,
  //     call animateToPoint with a point in the opposite direction.

  // --------------
  // Applied: Carousel:
  // - Same as in scrolling.
  //   But: Define points with which animateToPoint is called
  //   using a defined raster.

  // ---------------------------------

  // -------------
  // TODO:
  // - how to define a parent timed item that eases in/out of a part of an existing linear animation?
  //   *

  function TouchAnimation(options) {
    var self = this;
    this.duration = options.animation.duration;
    this.pixelToTimeRatio = options.animationPixels / this.duration;
    this.gestureEaseOut = {
      offset: options.gestureEaseOut.offset / this.pixelToTimeRatio,
      factor: options.gestureEaseOut.factor
    };
    this.animation = options.animation;
    this.gesture = options.gesture;
    this.gesture.addPositionListener(function(pixelOffset, action) {
      if (action === 'start') {
        self.gestureStart = {
          time: self.player.currentTime
        };
      }
      if (action === 'move' || action === 'start') {
        var newTime = self.gestureStart.time + (pixelOffset / self.pixelToTimeRatio);
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

        self.player.currentTime = self.gestureTimingFunction(newTime);
      }
      if (action === 'stop') {
        var lowerBound = self.gestureEaseOut.offset,
            upperBound = self.duration - lowerBound;
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
    this.player.currentTime = this.gestureEaseOut.offset;
  }

  TouchAnimation.prototype = {
    gestureTimingFunction: function(time) {
      var self = this;
      if (!this.gestureEaseOut) {
        return time;
      }
      var borders = [this.gestureEaseOut.offset, this.duration-this.gestureEaseOut.offset];
      if (time<=borders[0]) {
        return adjust(borders[0]);
      } else if (time >= borders[1]) {
        return adjust(borders[1]);
      }
      return time;

      function adjust(border) {
        return (border * (self.gestureEaseOut.factor-1) + time) /
          self.gestureEaseOut.factor;
      }
    },
    animateTo: function(targetTime, playbackRate) {
      var self = this,
          startTime = this.player.currentTime;
      console.log('animateTo', startTime, targetTime, playbackRate);
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
        // start gesture phase again.
        // TODO: enable listening for gestures!
        console.log('animateTo done');
        self.player.source = self.animation;
        self.player.currentTime = targetTime;
        self.player.paused = true;
      };
      // start animation phase.
      // TODO: disable listening for gestures!
      this.player.source = group;
      this.player.playbackRate = playbackRate || 0.5;
      this.player.currentTime = 0;
      this.player.paused = false;
    }
  };

  window.ScrollAnimation = TouchAnimation;
})();
