// TODO: Make this directive go to a parent element
// with two children: One for the content and one for the actions that should be shown.
// - apply css classes automatically!
angular.module('scroll').directive('swipeLeftActions', ['touchAnimation', function(touchAnimationFactory) {
  return {
    link: function(scope, element, attrs) {
      var width = element.width();
      var touchAnimation = touchAnimationFactory({
        animationFactory: animationFactory,
        gesture: {type: 'x', element: element}
      });
      element.on('slideXEnd', closestHideOrShow);

      var clearParentEventListener = element.parent().on('pointerdown', function(e) {
        var isChild = false;
        var $target = angular.element(e.target);
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
      });
      element.on('$destroy', function() {
        clearParentEventListener();
      });

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

      function closestHideOrShow() {
        var animation = touchAnimation.getAnimationByName('main'),
          currentTime = touchAnimation.currentTime();
        var diffStart = Math.abs(currentTime - animation.startTime),
          targetTime;

        if (diffStart / animation.duration > 0.2) {
          show()
        } else {
          hide()
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