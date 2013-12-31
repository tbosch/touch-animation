angular.module('demo').directive('leftSwipeable', ['touchAnimation', '$rootElement', function(touchAnimationFactory, $rootElement) {
  return {
    link: function(scope, element, attrs) {
      var width = element.width();
      var touchAnimation = touchAnimationFactory({
        animationFactory: animationFactory,
        gesture: {type: 'x', element: element}
      });

      element.on('slideXEnd', closestHideOrShow);
      var clearParentEventListener = $rootElement.on('pointerdown', hideIfOnOtherElement);
      element.on('$destroy', clearParentEventListener);

      function hideIfOnOtherElement(e, data) {
        var isChild = false;
        var $target = angular.element(e.target || data.target);
        while ($target.length) {
          if ($target[0] === element[0]) {
            isChild = true;
            break;
          }
          $target = $target.parent();
        }
        if (!isChild) {
          hide();
        }
      }

      function hide() {
        var animation = touchAnimation.getAnimationByName('main');
        if (animation.startTime !== animation.player.currentTime) {
          touchAnimation.goTo(animation.startTime, {
            duration: 0.5,
            easing: 'ease-out'
          });
        }
      }

      function show() {
        var animation = touchAnimation.getAnimationByName('main');
        touchAnimation.goTo(animation.endTime, {
          duration: 0.5,
          easing: 'ease-out'
        });
      }

      function closestHideOrShow(event, gesture) {
        var animation = touchAnimation.getAnimationByName('main');
        var movedRatio = gesture.offset / animation.duration;
        if (movedRatio > 0.2) {
          hide()
        } else if (movedRatio < 0.2) {
          show()
        }
      }

      function animationFactory(animationSpec) {
        animationSpec.main = {
          target: element[0],
          type: 'atom',
          effect: [
            { offset: 0, transform: 'translateZ(0) translateX(0%)' },
            { offset: 1, transform: 'translateZ(0) translateX(-60%)' }
          ],
          timing: {
            duration: width
          }
        };
      }
    }
  };
}]);