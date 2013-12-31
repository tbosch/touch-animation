angular.module('scroll').directive('scrollIndicator', function () {
  return {
    require: 'scroller',
    // should be executed AFTER scroller directive!
    priority: -1,
    link: function (scope, element, attrs, ngScrollerCtrl) {
      var indicator = angular.element('<div class="scroll-indicator"></div>');
      var indicatorBar = angular.element('<div class="scroll-indicator-bar"></div>');
      indicatorBar.append(indicator);
      element.append(indicatorBar);
      var indicatorHeight;

      indicatorBar.on('swipestarty', function(event, gesture) {
        gesture.stopPropagation();
      });
      indicatorBar.on('swipemovey', function(event, gesture) {
        gesture.stopPropagation();
      });
      indicatorBar.on('swipeendy', function(event, gesture) {
        gesture.stopPropagation();
      });
      var gestureStartTime;
      indicator.on('swipestarty', function(event, gesture) {
        gestureStartTime = ngScrollerCtrl.scrollAnimation.currentTime();
      });
      indicatorBar.on('swipemovey', function(event, gesture) {
        var contentAnimation = ngScrollerCtrl.scrollAnimation.getAnimationByName('content');
        var newTime = gestureStartTime + (gesture.offset * contentAnimation.duration / (ngScrollerCtrl.viewPortHeight - indicatorHeight));
        newTime = Math.max(newTime, contentAnimation.startTime);
        newTime = Math.min(newTime, contentAnimation.endTime);
        ngScrollerCtrl.scrollAnimation.goTo(newTime);
      });


      ngScrollerCtrl.addAnimationDecorator(1000, animationDecorator);

      function animationDecorator(animationSpec) {
        indicatorHeight = Math.max(50, ngScrollerCtrl.viewPortHeight / (ngScrollerCtrl.rowHeight * ngScrollerCtrl.rowCount) * ngScrollerCtrl.viewPortHeight);
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
            {offset: 1, transform: 'translateZ(0) translateY(' + (ngScrollerCtrl.viewPortHeight - indicatorHeight) + 'px)'}
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
              {offset: 0, transform: 'translateZ(0) translateY(' + (ngScrollerCtrl.viewPortHeight - indicatorHeight) + 'px)'},
              {offset: 1, transform: 'translateZ(0) translateY(' + (ngScrollerCtrl.viewPortHeight - indicatorHeight + indicatorHeight * 0.5) + 'px)'}
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