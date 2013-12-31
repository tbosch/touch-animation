angular.module('scroll').directive('scroller', ['touchAnimation', '$compile', function (touchAnimation, $compile) {
  return {
    compile: function (element) {
      element.addClass('scroll-viewport');
      var scrollContent = angular.element(element[0].querySelector('[scroll-row]'));
      if (!scrollContent.length) {
        throw new Error('The scroller directive requires a child div with a "scroll-row" directive');
      }
      scrollContent.addClass('scroll-row');
      scrollContent.remove();

      var innerViewport = angular.element('<div class="inner-viewport"></div>');
      innerViewport.append(element.children());
      element.append(innerViewport);

      return function(scope, element, attrs, ctrl) {
        link(scope, element, attrs, ctrl, scrollContent);
      }
    },
    controller: ScrollerController,
    scope: true
  };

  function link(scope, viewPort, attrs, ctrl, rowTemplate) {

    ctrl.rowHeight = calcRowHeight();
    console.log(ctrl.rowHeight);

    var innerViewPort = angular.element(viewPort[0].querySelectorAll('.inner-viewport'));
    var blocks = createBlockElements(),
      block0 = blocks.block0, block1 = blocks.block1,
      blocksScope = blocks.scope;

    var block0page = 0,
        block1page = 1;

    scope.$watchCollection(attrs.scroller, rowsChanged);

    return;

    function calcRowHeight() {
      viewPort.append(rowTemplate);
      var rowHeight = rowTemplate.height();
      rowTemplate.remove();
      return rowHeight;
    }

    function createBlockElements() {
      var blocks = angular.element('<div></div>');

      var block0 = angular.element('<div class="scroll-block0"></div>'),
        block0row = rowTemplate.clone();
      block0row.attr('ng-repeat', 'row in block0rows track by $index');
      block0.append(block0row);

      var block1 = angular.element('<div class="scroll-block1"></div>'),
        block1row = rowTemplate.clone();
      block1row.attr('ng-repeat', 'row in block1rows track by $index');
      block1.append(block1row);

      var blocksScope = scope.$new();
      blocks.append(block0);
      blocks.append(block1);

      innerViewPort.append(blocks);
      $compile(blocks)(blocksScope);

      return {
        scope: blocksScope,
        block0: block0,
        block1: block1
      };
    }

    var lastRows;
    // TODO: Add a resize listener to call this method also!
    function rowsChanged(rows) {
      lastRows = rows;
      ctrl.rowCount = rows.length;

      layout();
    }

    function layout() {
      ctrl.viewPortHeight = viewPort.height();
      ctrl.rowsPerPage = Math.ceil(ctrl.viewPortHeight / ctrl.rowHeight) + 1;

      updateBlockRows();

      if (!ctrl.scrollAnimation) {
        ctrl.scrollAnimation = touchAnimation({
          animationFactory: animationFactory,
          timeToPixelRatio: ctrl.rowHeight * -1,
          gesture: {type: 'y', element: viewPort}
        });
        ctrl.scrollAnimation.goTo(ctrl.scrollAnimation.getAnimationByName('content').startTime);
        viewPort.on('swipeendy', contentEffect);
        viewPort.on('pointerdown', stopContentEffect);
      } else {
        ctrl.scrollAnimation.updateAnimationIfNeeded();
      }
    }

    function updateBlockRows() {
      scope.block0rows = lastRows.slice(block0page*ctrl.rowsPerPage, block0page*ctrl.rowsPerPage + ctrl.rowsPerPage);
      fillMissingRowsInPage(scope.block0rows);
      scope.block1rows = lastRows.slice(block1page*ctrl.rowsPerPage, block1page*ctrl.rowsPerPage + ctrl.rowsPerPage);
      fillMissingRowsInPage(scope.block1rows);
    }

    function fillMissingRowsInPage(rows) {
      var i;
      for (i=rows.length; i<ctrl.rowsPerPage; i++) {
        rows.push({});
      }
    }

    function fillPage(pageIndex) {
      blocksScope.$apply(function () {
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
        var contentDuration = ctrl.rowCount * ctrl.rowHeight - ctrl.viewPortHeight;
        var blockDuration = 2 * ctrl.rowsPerPage * ctrl.rowHeight,
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
        _stopContentEffect();
        _stopContentEffect = null;
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