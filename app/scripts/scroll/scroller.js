angular.module('scroll').directive('scroller', ['touchAnimation', 'animationUtils', function (touchAnimation, animationUtils) {
  return {
    compile: function (element) {
      element.addClass('scroll-viewport');
      var scrollContent = angular.element(element[0].querySelector('[scroll-row]'));
      if (!scrollContent.length) {
        throw new Error('The scroller directive requires a child div with a "scroll-row" directive');
      }
      scrollContent.addClass('scroll-row');

      var block0 = angular.element('<div class="scroll-block0"></div>'),
          block0row = scrollContent.clone();
      block0row.attr('ng-repeat', 'row in block0rows track by $index');
      block0.append(block0row);
      element.append(block0);

      var block1 = angular.element('<div class="scroll-block1"></div>'),
          block1row = scrollContent.clone();
      block1row.attr('ng-repeat', 'row in block1rows track by $index');
      block1.append(block1row);
      element.append(block1);

      scrollContent.remove();

      return function(scope, element, attrs, ctrl) {
        link(scope, element, attrs, ctrl, scrollContent);
      }
    },
    controller: ScrollerController,
    scope: true
  };

  function link(scope, viewPort, attrs, ctrl, rowTemplate) {

    viewPort.append(rowTemplate);
    var rowHeight = rowTemplate.height();
    ctrl.rowHeight = rowHeight;
    rowTemplate.remove();

    var innerViewport = angular.element('<div class="inner-viewport"></div>'),
      block0 = angular.element(viewPort[0].querySelector('.scroll-block0')),
      block1 = angular.element(viewPort[0].querySelector('.scroll-block1'));

    innerViewport.append(viewPort.children());
    viewPort.append(innerViewport);
    innerViewport.append(block0);
    innerViewport.append(block1);

    var block0page = 0,
        block1page = 1;

    var viewPortHeight,
        rowsPerPage;

    scope.$watchCollection(attrs.scroller, rowsChanged);

    return;

    var lastRowCount, lastRows;
    function rowsChanged(rows) {
      // TODO: Add a resize listener and update those variables only then!
      viewPortHeight = viewPort.height();
      rowsPerPage = Math.ceil(viewPortHeight / rowHeight) + 1;
      lastRows = rows;

      updateBlockRows();

      if (rows.length !== lastRowCount) {
        lastRowCount = rows.length;
        layout();
      }

      function layout() {
        if (!ctrl.scrollAnimation) {
          ctrl.scrollAnimation = touchAnimation({
            animationFactory: animationFactory,
            timeToPixelRatio: rowHeight * -1,
            gesture: {type: 'y', element: viewPort}
          });
          ctrl.scrollAnimation.goTo(ctrl.scrollAnimation.getAnimationByName('content').startTime);
          viewPort.on('slideYEnd', contentEffect);
          viewPort.on('pointerstart', stopContentEffect);
        } else {
          ctrl.scrollAnimation.updateAnimationIfNeeded();
        }
      }

    }

    function updateBlockRows() {
      scope.block0rows = lastRows.slice(block0page*rowsPerPage, block0page*rowsPerPage + rowsPerPage);
      fillMissingRowsInPage(scope.block0rows);
      scope.block1rows = lastRows.slice(block1page*rowsPerPage, block1page*rowsPerPage + rowsPerPage);
      fillMissingRowsInPage(scope.block1rows);
    }

    function fillMissingRowsInPage(rows) {
      var i;
      for (i=rows.length; i<rowsPerPage; i++) {
        rows.push({});
      }
    }

    function fillPage(pageIndex) {
      scope.$apply(function () {
        if (pageIndex % 2) {
          block1page = pageIndex;
        } else {
          block0page = pageIndex;
        }
        updateBlockRows();
      });
    }

    function animationFactory(animationSpec) {
      contentAnimation(animationSpec);
      ctrl.decorateAnimation(animationSpec);

      return animationSpec;

      function contentAnimation(animationSpec) {
        var contentDuration = lastRowCount * rowHeight - viewPortHeight;
        var blockDuration = 2 * rowsPerPage * rowHeight,
            blockIterations = contentDuration / blockDuration;

        animationSpec.block0 = {
          type: 'atom',
          target: block0[0],
          effect: [
            { offset: 0, transform: 'translateZ(0) translateY(100%)' },
            { offset: 1, transform: 'translateZ(0) translateY(-100%)' }
          ],
          timing: {
            iterationStart: 0.5,
            duration: blockDuration,
            iterations: blockIterations
          },
          events: {
            oniterate: function(event) {
              fillPage(event.iterationIndex * 2);
            }
          }
        };

        animationSpec.block1 = {
          type: 'atom',
          target: block1[0],
          effect: [
            { offset: 0, transform: 'translateZ(0) translateY(0%)' },
            { offset: 1, transform: 'translateZ(0) translateY(-200%)' }
          ],
          timing: {
            duration: blockDuration,
            iterations: blockIterations
          },
          events: {
            oniterate: function(event) {
              fillPage(event.iterationIndex * 2 + 1);
            }
          }
        };

        animationSpec.content = {
          type: 'par',
          // extra information for animation decorators
          // TODO: Move into a "meta" object in the animationSpec
          // which is copied into the real animationsByName hash!
          // -> by this, e.g. the effects can use it too!
          rowCount: lastRowCount,
          rowHeight: rowHeight,
          children: [
            'block0',
            'block1'
          ]
        };
        animationSpec.main = {
          type: 'seq',
          children: [ 'content' ]
        };
      }
    }

    var _stopContentEffect;
    function stopContentEffect() {
      if (_stopContentEffect) {
        stopContentEffect();
        stopContentEffect = null;
      }
    }

    function contentEffect(event, gesture) {
      // TODO: Is this the right calculation?
      var contentAnimation = ctrl.scrollAnimation.getAnimationByName('content'),
        currentTime = ctrl.scrollAnimation.currentTime();
      if (currentTime < contentAnimation.startTime || currentTime > contentAnimation.endTime) {
        return false;
      }

      var gestureVelocity = gesture.velocity * -1,
        oldTime = currentTime,
        newTime = oldTime + gestureVelocity / 2;
      newTime = Math.max(contentAnimation.startTime, newTime);
      newTime = Math.min(contentAnimation.endTime, newTime);

      _stopContentEffect = ctrl.scrollAnimation.goTo(newTime, {
        duration: Math.abs((newTime - oldTime) / gestureVelocity * 2),
        easing: 'ease-out'
      });
    }
  }

  function ScrollerController() {
    var animationDecorators = [];
    this.addAnimationDecorator = function(order, decorator) {
      animationDecorators.push({
        order: order || 0,
        decorator: decorator
      });
    };
    this.decorateAnimation = function (animationSpec) {
      var args = arguments;
      animationDecorators.sort(function(entry1, entry2) {
        return entry1.order - entry2.order;
      });
      angular.forEach(animationDecorators, function (entry) {
        entry.decorator.apply(this, args);
      });
    };
  }


}]);