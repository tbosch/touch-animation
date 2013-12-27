angular.module('scroll').directive('scrollPullToRefresh', function () {
  return {
    require: '^ngScroller',
    link: function (scope, element, attrs, ngScrollerCtrl) {
      ngScrollerCtrl.animationDecorators.push(animationDecorator);

      function animationDecorator(builder) {
        builder.addParallelAnimation('header', 'header', function (timing) {
          // TODO: This is slow on Android 2.3!
          // --> deactivate it there!
          return new Animation(element[0], [
            {offset: 0, transform: 'translateZ(0) rotate(0p)'},
            {offset: 1, transform: 'translateZ(0) rotate(360deg)'}
          ], timing);
        });
      }
    }
  };
});
