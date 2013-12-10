(function() {
  var raf = initRaf();

  window.utils = {
    getHeight: getHeight,
    getWidth: getWidth,
    setPlayerCurrentTimeInRaf: setPlayerCurrentTimeInRafWithStop,
    animatePlayerTo: animatePlayerTo
  };


  function getHeight(elem) {
    var rect = elem.getBoundingClientRect();
    return rect.bottom - rect.top;
  }
  function getWidth(elem) {
    var rect = elem.getBoundingClientRect();
    return rect.right - rect.left;
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

  function setPlayerCurrentTimeInRafWithStop(player, time) {
    stopAnimatePlayer(player);
    setPlayerCurrentTimeInRaf(player, time);
  }

  // TODO: Is there a builtin way to do this?
  function setPlayerCurrentTimeInRaf(player, time) {
    var state = player.currentTimeRaf = player.currentTimeRaf || {
      time: 0,
      inProgress: false
    };
    state.time = time;
    if (!state.inProgress) {
      state.inProgress = true;
      raf(function() {
        state.inProgress = false;
        // TODO: does this trigger another raf?
        player.currentTime = state.time;
      });
    }
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
        setPlayerCurrentTimeInRaf(player, start + timeDiff * timeFraction);
      }
    }

    function stop() {
      animatePlayer.source = null;
      animatePlayer.paused = true;
    }
  }

})();
