angular.module('touchAnimation').factory('animationGesture', ['$rootElement', 'animationUtils', function($rootElement, animationUtils) {
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

  function handleGestureDetection(event) {
    var diff, absDiff, gestureType, result;
    if (event.pressed) {
      if (pressStart) {

        // ignore mousedown/up emulation after touch events
        if (event.touch !== pressStart.touch) {
          return;
        }
        diff = {
          x: event.pos.x - pressStart.pos.x,
          y: event.pos.y - pressStart.pos.y
        };
        absDiff = {
          x: Math.abs(diff.x),
          y: Math.abs(diff.y)
        };
        if (Math.max(absDiff.x, absDiff.y) > GESTURE_START_DISTANCE) {
          if (absDiff.x > absDiff.y) {
            gestureType = 'x';
          } else {
            gestureType = 'y';
          }
          result = gestureType;
          pressStart = null;
        }
      } else {
        pressStart = {
          pos: event.pos,
          touch: event.touch
        };
        angular.forEach(findListeners(angular.element(event.target)), function(listener) {
          listener({
            type: 'prepare'
          });
        });
      }
    } else {
      pressStart = null;
    }
    return result;
  }

  function handleGesture(event, startGestureType) {
    var diff, newDuration, newOffset, newVelocity;
    if (currentGesture) {
      // ignore mousedown/up emulation after touch events
      if (event.touch !== currentGesture.touch) {
        return;
      }

      newDuration = event.timeStamp - currentGesture.start.time;
      newOffset = event.pos[currentGesture.type] - currentGesture.start.pos;
      // calculate the velocity in seconds, as web animations are also
      // using seconds!
      newVelocity = (newOffset - currentGesture.current.offset) / (newDuration - currentGesture.current.duration) * 1000;
      if (newVelocity === 0 || newVelocity === Infinity || newVelocity === -Infinity || isNaN(newVelocity)) {
        newVelocity = currentGesture.current.velocity;
      }

      currentGesture.current = {
        offset: newOffset,
        duration: newDuration,
        velocity: newVelocity
      };

      if (currentGesture.listener) {
        currentGesture.listener({
          type: event.pressed?'move':'end',
          gesture: currentGesture
        });
      }
      if (!event.pressed) {
        currentGesture = null;
      }

    } else if (startGestureType) {
      currentGesture = {
        type: startGestureType,
        listener: findListener(startGestureType, angular.element(event.target)),
        start: {
          pos: event.pos[startGestureType],
          time: event.timeStamp
        },
        current: {
          offset: 0,
          duration: 0,
          velocity: 0
        },
        touch: event.touch
      };
      if (currentGesture.listener) {
        currentGesture.listener({
          type: 'start',
          gesture: currentGesture
        });
      }
    }
    return currentGesture;
  }

  function touchMouseEvent(e) {
    var event = {
        pressed: isPressed(e),
        pos: getPos(e),
        touch: isTouch(e),
        target: e.target,
        timeStamp: e.timeStamp
      };

    var startGestureType = handleGestureDetection(event);
    handleGesture(event, startGestureType);
  }

  function findListener(type, element) {
    var listeners;
    while (element.length) {
      listeners = element.data('$gestureListeners');
      if (listeners && listeners[type]) {
        return rafThrottledEventListener(listeners[type]);
      }
      element = element.parent();
    }
    return null;
  }

  function findListeners(element) {
    var result = [],
        listeners;
    while (element.length) {
      listeners = element.data('$gestureListeners');
      angular.forEach(listeners, function(listener) {
        result.push(listener);
      });
      element = element.parent();
    }
    return result;
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
    // TODO: Can we detect when the finger goes off the screen
    // and then stop the gesture?
    if (event.changedTouches) {
      return !!event.changedTouches.length;
    }
    return !!event.which;
  }

  function isTouch(event) {
    return event.type.indexOf('touch') === 0;
  }

  function preventBounceEffect() {
    $rootElement.on('touchmove', function(e) {
      e.preventDefault();
    });
    $rootElement.on("scroll", function(e) {
      e.preventDefault();
    });
  }


  function rafThrottledEventListener(listener) {
    var nextMoveEvent = null;
    return function(event) {
      if (event.type === 'move') {
        if (!nextMoveEvent) {
          nextMoveEvent = event;
          animationUtils.raf(function() {
            listener(nextMoveEvent);
            nextMoveEvent = null;
          });
        } else {
          nextMoveEvent = event;
        }
      } else {
        animationUtils.raf(function() {
          listener(event);
        });
      }
    };
  }
}]);
