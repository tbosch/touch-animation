angular.module('scroll').directive('scrollHeader', function () {
  return {
    require: '^scroller',
    link: function (scope, element, attrs, ngScrollerCtrl) {
      element.addClass('scroll-header');

      var headerFooterSlowDownFactor = 5,
        headerHeight = element.height(),
        headerDuration = headerHeight * headerFooterSlowDownFactor;

      ngScrollerCtrl.addAnimationDecorator(0, animationDecorator);
      element.parent().on('swipeendy', headerEffect);

      function animationDecorator(animationSpec) {
        animationSpec.header = {
          type: 'par',
          children: ['headerMain']
        };

        animationSpec.headerMain = {
          type: 'atom',
          target: element.parent()[0],
          effect: [
            {offset: 0, transform: 'translateZ(0) translateY(' + headerHeight + 'px)'},
            {offset: 1, transform: 'translateZ(0) translateY(0px)'}
          ],
          timing: {
            duration: headerDuration
          }
        };
        animationSpec.main.children.unshift('header');
      }

      function headerEffect() {
        var touchAnimation = ngScrollerCtrl.scrollAnimation;
        var headerAnimation = touchAnimation.getAnimationByName('header');
        if (touchAnimation.currentTime() > headerAnimation.endTime) {
          return false;
        }
        touchAnimation.goTo(headerAnimation.endTime, {
          duration: 0.3,
          easing: 'ease-out'
        });
      }
    }
  };
});
