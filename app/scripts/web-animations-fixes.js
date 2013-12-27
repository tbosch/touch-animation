function floatingEqual(n1, n2) {
  // comparison for floating point numbers need to compensate
  // for an epsilon rounding error.
  return Math.abs(n1 - n2) < 0.000001;
}

TimedItem.prototype._modulusWithClosedOpenRange = function(x, range) {
  var modulus = x % range;
  // This line is new. Needed for iOS7 and iOS6, as
  // e.g. 0.4 % 0.4 is a very small number but no 0!
  // --> this leads to problems in _modulusWithOpenClosedRange
  //     at the end of the animation.
  if (floatingEqual(modulus, 0)) {
    modulus = 0;
  }
  var result = modulus < 0 ? modulus + range : modulus;
  return result;
};

// TODO Bugs: with the events (why we are using a CustomEffect
// and not onstart/onend/oniterate):
// - no events while scrubbing backwards
// - no events during running velocity animation. This might be due to the fact that
//   we reparent the animation temporarily during animation.
// - events in a seqgroup don't wait for the previous animations to fire
function fixedOnIterate(animation, listener) {
  var timing = {};
  if (animation.duration) {
    timing.duration = animation.duration;
  }
  if (animation.iterations) {
    timing.iterations = animation.iterations;
  }
  if (animation.delay) {
    timing.delay = animation.delay;
  }

  var eventsAnim = new Animation(null, {
    sample: sampleEvents
  }, animation.specified);

  var oldIteration;
  function sampleEvents(timeFraction, iteration) {
    if (iteration !== oldIteration) {
      listener({
        iterationIndex: iteration
      });
      oldIteration = iteration;
    }
  }

  return new ParGroup([animation, eventsAnim]);
}