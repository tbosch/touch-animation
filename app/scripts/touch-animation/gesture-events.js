(function() {
  var GESTURE_START_DISTANCE = 5,
      $rootElement = angular.element(document);

  preventBounceEffect();
  addRootListeners();

  function addRootListeners() {
    $rootElement.on('touchstart touchmove touchend mousedown mousemove mouseup', touchMouseEvent);
  }

  var pressStart;
  function touchMouseEvent(e) {
    var event = {
      pressed: isPressed(e),
      pos: getPos(e),
      touch: isTouch(e),
      target: e.target
    };
    if (pressStart && event.touch!==pressStart.touch) {
      // prevent mousedown/mouseup after touchstart/touchend
      return;
    }
    if (event.pressed && !pressStart) {
      pressStart = event;
      event.type = 'start';
      trigger(pressStart.target, 'pointerdown');
    } else if (!event.pressed && pressStart) {
      event.type = 'end';
    } else if (pressStart && event.pressed) {
      event.type = 'move';
    }

    handleGesture(event);

    if (event.type === 'end') {
      trigger(pressStart.target, 'pointerup');
      pressStart = null;
    }
  }

  function trigger(target, type, data) {
    if (target.nodeName) {
      target = angular.element(target);
    }
    var stopped = false;
    data = data || {};
    // TODO: Can't inspect the event that Angular creates during
    // triggerHandler. That's why we add another stopPropagation
    // to the data...
    data.stopPropagation = function() {
      stopped = true;
    };
    while (target.length && !stopped) {
      target.triggerHandler(type, data);
      target = target.parent();
    }
  }


  var gestureStart;
  function handleGesture(event) {
    var diff, absDiff, newOffset, gesture;
    if (gestureStart) {
      newOffset = event.pos[gestureStart.gestureType] - gestureStart.pos[gestureStart.gestureType];

      gesture = {
        type: gestureStart.gestureType,
        offset: newOffset,
        // calculate the velocity in seconds, as web animations are also
        // using seconds!
        velocity: gestureStart.velocity(newOffset) * 1000
      };

      triggerGestureEvent(event.pressed?'Move':'End', gesture);
      if (!event.pressed) {
        gestureStart = null;
      }

    } else if (event.pressed) {
      diff = {
        x: event.pos.x - pressStart.pos.x,
        y: event.pos.y - pressStart.pos.y
      };
      absDiff = {
        x: Math.abs(diff.x),
        y: Math.abs(diff.y)
      };
      if (Math.max(absDiff.x, absDiff.y) > GESTURE_START_DISTANCE) {
        gestureStart = event;
        gestureStart.velocity = velocity();
        if (absDiff.x > absDiff.y) {
          gestureStart.gestureType = 'x';
        } else {
          gestureStart.gestureType = 'y';
        }

        gesture = {
          type: gestureStart.gestureType,
          offset: 0,
          velocity: 0
        };
        triggerGestureEvent('Start', gesture);
      }
    }
  }

  function triggerGestureEvent(suffix, gesture) {
    trigger(gestureStart.target, 'slide'+gestureStart.gestureType.toUpperCase()+suffix, gesture);
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

  function velocity() {
    var lastTime, lastValue, lastVelocity;
    return update;

    function update(newValue) {
      var newTime = Date.now(),
        velocity;
      if (!lastTime) {
        velocity = 0;
      } else {
        velocity = (newValue - lastValue) / (newTime - lastTime);
        if (velocity === 0 || velocity === Infinity || velocity === -Infinity || isNaN(velocity)) {
          velocity = lastVelocity;
        }
      }
      lastVelocity = velocity;
      lastTime = newTime;
      lastValue = newValue;
      return velocity;
    }
  }
})();
