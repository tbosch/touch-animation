(function() {
  window.utils = {
    getHeight: getHeight
  };


  function getHeight(elem) {
    var rect = elem.getBoundingClientRect();
    return rect.bottom - rect.top;
  }
})();
