angular.module('scroll').directive('scrollIndicator', function () {
  return {
    require: 'scroller',
    // should be executed AFTER scroller directive!
    priority: -1,
    link: function (scope, element, attrs, ngScrollerCtrl) {
      var indicator = angular.element('<div class="scroll-indicator"></div>');
      element.append(indicator);
      var viewPortHeight = element.height();

      ngScrollerCtrl.addAnimationDecorator(1000, animationDecorator);

      function animationDecorator(animationSpec) {
        var indicatorHeight = Math.max(10, viewPortHeight / (ngScrollerCtrl.rowHeight * animationSpec.content.rowCount) * viewPortHeight);
        indicator[0].style.height = indicatorHeight + 'px';

        if (animationSpec.header) {
          animationSpec.headerIndicator = {
            target: indicator[0],
            type: 'atom',
            effect: [
              {offset: 0, transform: 'translateZ(0) translateY(-' + (indicatorHeight * 0.5) + 'px)'},
              {offset: 1, transform: 'translateZ(0) translateY(0)'}
            ],
            timing: {
              duration: animationSpec.resolvedDuration('header')
            }
          };
          animationSpec.header.children.push('headerIndicator');
        }

        animationSpec.contentIndicator = {
          target: indicator[0],
          type: 'atom',
          effect: [
            {offset: 0, transform: 'translateZ(0) translateY(0px)'},
            {offset: 1, transform: 'translateZ(0) translateY(' + (viewPortHeight - indicatorHeight) + 'px)'}
          ],
          timing: {
            duration: animationSpec.resolvedDuration('content')
          }
        };
        animationSpec.content.children.push('contentIndicator');

        if (animationSpec.footer) {
          animationSpec.footerIndicator = {
            type: 'atom',
            target: indicator[0],
            effect: [
              {offset: 0, transform: 'translateZ(0) translateY(' + (viewPortHeight - indicatorHeight) + 'px)'},
              {offset: 1, transform: 'translateZ(0) translateY(' + (viewPortHeight - indicatorHeight + indicatorHeight * 0.5) + 'px)'}
            ],
            timing: {
              duration: animationSpec.resolvedDuration('footer')
            }
          };
          animationSpec.footer.children.push('footerIndicator');
        }

      }
    }
  };
});