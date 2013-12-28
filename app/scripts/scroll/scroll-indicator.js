angular.module('scroll').directive('scrollIndicator', function () {
  return {
    require: 'scroller',
    // should be executed AFTER scroller directive!
    priority: -1,
    link: function (scope, element, attrs, ngScrollerCtrl) {
      var indicator = angular.element('<div class="scroll-indicator"></div>');
      element.append(indicator);
      var viewPortHeight = element.height();

      ngScrollerCtrl.animationDecorators.push(animationDecorator);

      function animationDecorator(builder) {
        var newCount = builder.rowCount;
        var indicatorHeight = Math.max(10, viewPortHeight / (ngScrollerCtrl.rowHeight * newCount) * viewPortHeight);
        indicator[0].style.height = indicatorHeight + 'px';

        builder.addParallelAnimation('header', 'header', function (timing) {
          return new Animation(indicator[0], [
            {offset: 0, transform: 'translateZ(0) translateY(-' + (indicatorHeight * 0.5) + 'px)'},
            {offset: 1, transform: 'translateZ(0) translateY(0)'}
          ], timing);
        });

        builder.addParallelAnimation('content', 'content', function (timing) {
          return new Animation(indicator[0], [
            {offset: 0, transform: 'translateZ(0) translateY(0px)'},
            {offset: 1, transform: 'translateZ(0) translateY(' + (viewPortHeight - indicatorHeight) + 'px)'}
          ], timing);
        });

        builder.addParallelAnimation('footer', 'footer', function (timing) {
          return new Animation(indicator[0], [
            {offset: 0, transform: 'translateZ(0) translateY(' + (viewPortHeight - indicatorHeight) + 'px)'},
            {offset: 1, transform: 'translateZ(0) translateY(' + (viewPortHeight - indicatorHeight + indicatorHeight * 0.5) + 'px)'}
          ], timing);
        });

      }
    }
  };
});