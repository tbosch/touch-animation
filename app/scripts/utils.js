(function() {
  window.utils = {
    getHeight: getHeight,
    getWidth: getWidth
  };


  function getHeight(elem) {
    var rect = elem.getBoundingClientRect();
    return rect.bottom - rect.top;
  }
  function getWidth(elem) {
    var rect = elem.getBoundingClientRect();
    return rect.right - rect.left;
  }
})();
