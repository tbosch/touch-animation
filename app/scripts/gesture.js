angular.module('scroll').factory('gesture', ['$rootElement', function($rootElement) {
  var GESTURE_START_DISTANCE = 5,
      pressStart,
      currentGesture;

  preventBounceEffect();
  addRootListeners();
  return addListener;

  function addListener(element, gestureType, callback) {
    var listeners = gestureListeners(element);
    listeners[gestureType] = callback;
  }

  function gestureListeners(element) {
    var res = element.data('$gestureListeners');
    if (!res) {
      res = {};
      element.data('$gestureListeners', res);
    }
    return res;
  }

  function addRootListeners() {
    $rootElement.on('touchstart touchmove touchend mousedown mousemove mouseup', touchMouseEvent);
  }

  function touchMouseEvent(e) {
    var pressed = isPressed(e),
        pos = getPos(e),
        diff, absDiff, gestureType;

    if (pressStart) {
      diff = {
         x: pos.x - pressStart.x,
         y: pos.y - pressStart.y
      };
      absDiff = {
        x: Math.abs(diff.x),
        y: Math.abs(diff.y)
      }
    }

    if (!pressed) {
      pressStart = null;
      if (currentGesture) {
        endGesture(currentGesture.listener, diff[currentGesture.type]);
        currentGesture = null;
      }
    } else if (currentGesture) {
      updateGesture(currentGesture.listener, diff[currentGesture.type]);
    } else {
      if (!pressStart) {
        pressStart = pos;
      } else {
        if (Math.max(absDiff.x, absDiff.y) > GESTURE_START_DISTANCE) {
          if (absDiff.x > absDiff.y) {
            gestureType = 'x';
          } else {
            gestureType = 'y';
          }
          currentGesture = {
            type: gestureType,
            listener: startGesture(gestureType, angular.element(e.target))
          };
        }
      }
    }
  }

  function startGesture(type, element) {
    var gestureListener;
    var gestureListeners = element.inheritedData('$gestureListeners') || {};
    gestureListener = gestureListeners[type];
    if (gestureListener) {
      gestureListener('start', 0);
    }
    return gestureListener;
  }

  function endGesture(listener, pixelOffset) {
    if (listener) {
      listener('end', pixelOffset);
    }
  }

  function updateGesture(listener, pixelOffset) {
    if (listener) {
      listener('move', pixelOffset);
    }
  }

  function getPos(event) {
    if (event.changedTouches) {
      return {
        x: event.changedTouches[0].pageX,
        y: event.changedTouches[0].pageY
      };
    } else {
      return {
        x: event.pageX,
        y: event.pageY
      };
    }
  }

  function isPressed(event) {
    if (event.type === 'touchend' || event.type==='mouseup') {
      return false;
    }
    // If the mouse goes off screen, is unpressed there and then goes
    // back on screen we don't get a touchend/mouseup event.
    if (event.changedTouches) {
      return !!event.changedTouches.length;
    }
    return !!event.which;
  }

  function preventBounceEffect() {
    $rootElement.on('touchmove', function(e) {
      e.preventDefault();
    });
    $rootElement.on("scroll", function(e) {
      e.preventDefault();
    });
  }
}]);
