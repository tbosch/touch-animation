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
