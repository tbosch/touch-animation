angular.module('scroll').directive('scrollHeader', function () {
  return {
    require: '^scroller',
    link: function (scope, element, attrs, ngScrollerCtrl) {
      var headerFooterSlowDownFactor = 5,
      // estimate header/footer as high as a row
        headerHeight = element.height(),
        headerDuration = headerHeight * headerFooterSlowDownFactor;

      element.addClass('scroll-header');
      ngScrollerCtrl.addAnimationDecorator(0, animationDecorator);
      ngScrollerCtrl.effects.push(headerEffect);

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

      function headerEffect(event, touchAnimation) {
        var headerAnimation = touchAnimation.getAnimationByName('header');
        if (event.currentTime > headerAnimation.endTime) {
          return false;
        }
        // TODO: Is this the right calculation?
        return {
          targetTime: headerAnimation.endTime,
          duration: 0.3,
          easing: 'ease-out'
        };
      }
    }
  };
});
