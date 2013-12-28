angular.module('scroll').directive('scrollHeader', function () {
  return {
    require: '^ngScroller',
    link: function (scope, element, attrs, ngScrollerCtrl) {
      var headerFooterSlowDownFactor = 5,
      // estimate header/footer as high as a row
        headerDuration = 1 * headerFooterSlowDownFactor,
        headerHeight = utils.getHeight(element[0]);

      element.addClass('scroll-header');
      ngScrollerCtrl.animationDecorators.push(animationDecorator);

      function animationDecorator(builder, effects) {
        var headerAnimation = new Animation(element.parent()[0], [
          {offset: 0, transform: 'translateZ(0) translateY(' + headerHeight + 'px)'},
          {offset: 1, transform: 'translateZ(0) translateY(0px)'}
        ], headerDuration);
        builder.addAnimation('header', 0, headerAnimation);

        effects.push({
          animationName: 'header',
          listener: headerEffect
        });

        function headerEffect(event) {
          // TODO: Is this the right calculation?
          return {
            targetTime: event.animationEnd,
            duration: 0.3,
            easing: 'ease-out'
          };
        }
      }
    }
  };
});
