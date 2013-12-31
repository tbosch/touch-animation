angular.module('scroll').directive('scrollFooter', function () {
  return {
    require: '^scroller',
    link: function (scope, element, attrs, ngScrollerCtrl) {
      element.addClass('scroll-footer');

      var headerFooterSlowDownFactor = 5,
        footerHeight = element.height(),
        footerDuration = footerHeight * headerFooterSlowDownFactor;

      ngScrollerCtrl.addAnimationDecorator(0, animationDecorator);
      element.parent().on('slideYEnd', footerEffect);

      function animationDecorator(animationSpec) {
        animationSpec.footer = {
          type: 'par',
          children: ['footerMain']
        };

        animationSpec.footerMain = {
          type: 'atom',
          target: element.parent()[0],
          effect: [
            {offset: 0, transform: 'translateZ(0) translateY(0px)'},
            {offset: 1, transform: 'translateZ(0) translateY(-' + footerHeight + 'px)'}
          ],
          timing: {
            duration: footerDuration
          }
        };
        animationSpec.main.children.push('footer');
      }

      function footerEffect(event, touchAnimation) {
        var touchAnimation = ngScrollerCtrl.scrollAnimation;
        var footerAnimation = touchAnimation.getAnimationByName('footer');
        if (touchAnimation.currentTime() < footerAnimation.startTime) {
          return false;
        }
        touchAnimation.goTo(footerAnimation.startTime, {
          duration: 0.3,
          easing: 'ease-out'
        });
      }
    }
  };
});