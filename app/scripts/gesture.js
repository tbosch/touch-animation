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

    elem.addEventListener("touchmove", touchMove, false);
    elem.addEventListener("mousedown", touchMove, false);
    elem.addEventListener("mousemove", touchMove, false);
    elem.addEventListener("mouseup", mouseUp, false);

    function getEventPos(event) {
      return event.pageY || event.changedTouches[0].pageY;
    }

    function touchMove(event) {
      // TODO: This does not work for touch events yet!
      var pressed = event.which === 1,
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
      // Prevent selection while mouse move!
      event.preventDefault();
    }

    function mouseUp(event) {
      // TODO: Detect this more reliably!
      // E.g. using a timeout (when the mouse is not moved any more, we stop!)
      var eventPos = getEventPos(event);
      if (self.active) {
        self._callListeners(dir * (eventPos - self.startPos), 'stop');
      }
      self.active = false;
    }

  }

  SlideYGesture.prototype = new Gesture();

})();
