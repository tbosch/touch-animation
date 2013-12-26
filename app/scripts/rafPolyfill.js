(function() {
  // raf polyfill.
  // uses setInterval and not setTimeout so that the intervals are really
  // equally spaced...

  var nextCallbacks = [];
  var cssanim = document.querySelector('.cssanim');
  var clockMillis = function() {
    return Date.now();
  };
  cssanim.addEventListener('webkitAnimationIteration', function() {
    // handleCallbacks
  }, false);

  function handleCallback() {
    // TODO: Don't use so much memory here!
    var i,
      oldCallbacks = nextCallbacks;
    nextCallbacks = [];
    for (i=0; i<oldCallbacks.length; i++) {
      oldCallbacks[i]();
    }
  }

  return;
  window.setInterval(handleCallback, 1000/60);

  window.requestAnimationFrame = function(callback) {
    // TODO: Adjust the time for skipped intervals?
    nextCallbacks.push(callback);
    // window.setTimeout(callback, 1000/100);
  };


})();