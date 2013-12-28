angular.module('scroll').directive('scrollFooter', function () {
  return {
    require: '^ngScroller',
    link: function (scope, element, attrs, ngScrollerCtrl) {
      var headerFooterSlowDownFactor = 5,
      // estimate header/footer as high as a row
        footerDuration = 1 * headerFooterSlowDownFactor,
        footerHeight = utils.getHeight(element[0]);

      element.addClass('scroll-footer');
      ngScrollerCtrl.animationDecorators.push(animationDecorator);

      function animationDecorator(builder, effects) {
        var footerAnimation = new Animation(element.parent()[0], [
          {offset: 0, transform: 'translateZ(0) translateY(0px)'},
          {offset: 1, transform: 'translateZ(0) translateY(-' + footerHeight + 'px)'}
        ], {
          duration: footerDuration
        });
        builder.addAnimation('footer', 100, footerAnimation);

        effects.push({
          animationName: 'footer',
          listener: footerEffect
        });

        function footerEffect(event) {
          // TODO: Is this the right calculation?
          return {
            targetTime: event.animationStart,
            duration: 0.3,
            easing: 'ease-out'
          };
        }

      }
    }
  };
});