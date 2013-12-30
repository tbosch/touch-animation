angular.module('scroll').directive('scrollPullToRefresh', function () {
  return {
    require: '^scroller',
    link: function (scope, element, attrs, ngScrollerCtrl) {
      ngScrollerCtrl.addAnimationDecorator(10, animationDecorator);

      function animationDecorator(animationSpec) {
        animationSpec.headerPullToRefresh = {
          target: element[0],
          type: 'atom',
          effect: [
            {offset: 0, transform: 'translateZ(0) rotate(0p)'},
            {offset: 1, transform: 'translateZ(0) rotate(360deg)'}
          ],
          timing: {
            duration: animationSpec.resolvedDuration('header')
          }
        };
        animationSpec.header.children.push('headerPullToRefresh');
      }
    }
  };
});
