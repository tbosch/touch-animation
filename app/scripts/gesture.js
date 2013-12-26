(function () {
  window.gesture = {
    SlideYGesture : SlideYGesture
  };

  function Gesture() {
    this.listeners = [];
  }

  Gesture.prototype = {
    addPositionListener: function (listener) {
      this.listeners.push(listener);
    },
    _callListeners: function (position, action) {
      var i, listener;
      for (i = 0; i < this.listeners.length; i++) {
        listener = this.listeners[i];
        listener(position, action);
      }
    }
  };

  function SlideYGesture(elem, dir) {
    var self = this;
    dir = dir || 1;

    this.active = false;
    // TODO restrict the touchable region / make it defineable!

    /* prevent bounce effect in iOS, ... */
    elem.addEventListener("touchmove", function(e) {
      e.preventDefault();
    }, false);
    elem.addEventListener("scroll", function(e) {
      e.preventDefault();
    }, false);

    elem.addEventListener("touchstart", touchMove, false);
    elem.addEventListener("touchend", touchMove, false);
    elem.addEventListener("touchmove", touchMove, false);
    elem.addEventListener("mousedown", touchMove, false);
    elem.addEventListener("mousemove", touchMove, false);
    elem.addEventListener("mouseup", touchMove, false);


    function getEventPos(event) {
      return event.pageY || event.changedTouches[0].pageY;
    }

    function isPressed(event) {
      if (event.type === 'touchend' || event.type==='mouseup') {
        return false;
      }
      // If the mouse goes off screen, is unpressed there and then goes
      // back on screen we need to detect this.
      if (event.changedTouches) {
        return !!event.changedTouches.length;
      }
      return !!event.which;
    }

    function touchMove(event) {
      var pressed = isPressed(event),
        eventPos = getEventPos(event);
      if (!self.active && pressed) {
        self.active = true;
        self.startPos = eventPos;
        self._callListeners(0, 'start');
      } else if (pressed) {
        self._callListeners(dir * (eventPos - self.startPos), 'move');
      } else {
        mouseUp(event);
      }
    }

    function mouseUp(event) {
      var eventPos = getEventPos(event);
      if (self.active) {
        self._callListeners(dir * (eventPos - self.startPos), 'stop');
      }
      self.active = false;
    }

  }

  SlideYGesture.prototype = new Gesture();

})();
