angular.module('scroll').directive('ngScroller', ['$compile', '$parse', 'touchAnimation', 'animationBuilder', function ($compile, $parse, TouchAnimation, animationBuilder) {
  return {
    compile: function (element) {
      element.addClass('scroll-viewport');
      var scrollContent = angular.element(element[0].querySelector('.scroll-row'));
      var rowLink = $compile(scrollContent);
      scrollContent.remove();

      return function (scope, element, attrs, ctrl) {
        link(scope, element, attrs, rowLink, ctrl);
      };
    },
    controller: NgScrollerController,
    require: 'ngScroller'
  };

  function link(scope, viewPort, attrs, rowLink, ctrl) {

    var rowModelExpression = $parse(attrs.ngScroller),
      rowsParentScope = scope.$new(),
      scrollAnimation;

    var innerViewport = angular.element('<div class="inner-viewport"></div>'),
      block0 = angular.element('<div class="scroll-block0"></div>'),
      block1 = angular.element('<div class="scroll-block1"></div>');

    ctrl.innerViewport = innerViewport;

    innerViewport.append(viewPort.children());
    viewPort.append(innerViewport);
    innerViewport.append(block0);
    innerViewport.append(block1);

    var block0Rows = [], block1Rows = [];

    block0Rows.push(createRow(block0));
    var rowHeight = utils.getHeight(block0Rows[0].elm[0]);
    ctrl.rowHeight = rowHeight;

    var viewPortHeight = utils.getHeight(viewPort[0]);

    var rowsPerPage = Math.ceil(viewPortHeight / rowHeight) + 1;

    fillBlockRows(block0Rows, rowsPerPage, block0);
    fillBlockRows(block1Rows, rowsPerPage, block1);

    var lastRowCount;
    scope.$watch(checkRowModel);

    return;

    function checkRowModel() {
      var rows = rowModelExpression(scope),
        newCount = rows.length;

      if (newCount != lastRowCount) {

        // TODO: how to recreate the animation??
        // TODO: need to keep the current position!
        // TODO: keep the gesture
        // TODO: How to destroy the player??
        var animation = createAnimation(newCount, function (pageIndices) {
          rowsParentScope.$apply(function () {
            var i;
            for (i = 0; i < pageIndices.length; i++) {
              updatePage(pageIndices[i], rows);
            }
          });
        });

        if (!scrollAnimation) {
          scrollAnimation = createScrollAnimation(animation);
          updatePage(0, rows);
          updatePage(1, rows);
          console.log('created animation');
        } else {
          scrollAnimation.updateAnimation(animation);
          // TOOD: This needs to be a different page index! updatePage(0, rows);
          // TODO: This needs to be a different page index! updatePage(1, rows);
          console.log('updated animation');
        }
      }
      return lastRowCount = newCount;
    }

    function createRow(parent) {
      var childScope = rowsParentScope.$new();
      var row = rowLink(childScope, function (clone) {
        parent.append(clone);
      });
      return {
        scope: childScope,
        elm: row
      };
    }

    function fillBlockRows(blockRows, count, parent) {
      var i;
      for (i = blockRows.length; i < count; i++) {
        blockRows.push(createRow(parent));
      }
    }

    function updatePage(pageIndex, rowModel) {
      var targetRows = pageIndex % 2 ? block1Rows : block0Rows,
        i;
      for (i = 0; i < rowsPerPage; i++) {
        targetRows[i].scope.row = rowModel[pageIndex * rowsPerPage + i];
      }
    }

    function createScrollAnimation(animation) {
      var headerFooterSlowDownFactor = 5,
      // estimate header/footer as high as a row
        headerDuration = 1 * headerFooterSlowDownFactor,
        footerDuration = 1 * headerFooterSlowDownFactor;

      // document.timeline.play(totalAnimation());
      return new TouchAnimation({
        animation: animation,
        // TODO: move this into the gesture property as pixelToTime
        timeToPixelRatio: rowHeight * -1,
        gesture: {type: 'y', element: viewPort},
        headerDuration: headerDuration,
        footerDuration: footerDuration
      });
    }

    function createAnimation(rowCount, renderPages) {
      var builder = animationBuilder();
      ctrl.decorateAnimation(builder);
      contentAnimation(builder);

      return builder.build();

      function contentAnimation(builder) {
        var contentDuration = rowCount - (viewPortHeight / rowHeight);
        var blockDuration = 2 * rowsPerPage,
            blockIterations = contentDuration / blockDuration;

        var block0Anim = new Animation(block0[0], [
          { offset: 0, transform: 'translateZ(0) translateY(100%)' },
          { offset: 1, transform: 'translateZ(0) translateY(-100%)' }
        ], {
          iterationStart: 0.5,
          duration: blockDuration,
          iterations: blockIterations
        });

        var block1Anim = new Animation(block1[0], [
          { offset: 0, transform: 'translateZ(0) translateY(0%)' },
          { offset: 1, transform: 'translateZ(0) translateY(-200%)' }
        ], {
          duration: blockDuration,
          iterations: blockIterations
        });

        // TODO Bugs: with the events (why we are using a CustomEffect
        // and not onstart/onend/oniterate):
        // - no events while scrubbing backwards
        // - no events during running velocity animation. This might be due to the fact that
        //   we reparent the animation temporarily during animation.
        // - events in a seqgroup don't wait for the previous animations to fire

        var eventsAnim = new Animation(null, {
          sample: sampleEvents
        }, {
          duration: blockDuration,
          iterations: blockIterations
        });

        var block0Fill = 0,
          block1Fill = 1;

        function sampleEvents(timeFraction, iteration) {
          var block0FillNew,
            block1FillNew;
          if (timeFraction >= 0.5) {
            block0FillNew = (iteration + 1) * 2;
          } else if (timeFraction < 0.5) {
            block0FillNew = iteration * 2;
          }
          block1FillNew = iteration * 2 + 1;
          var changedPages = [];
          if (block0FillNew != block0Fill) {
            block0Fill = block0FillNew;
            changedPages.push(block0Fill);
          }
          if (block1FillNew != block1Fill) {
            block1Fill = block1FillNew;
            changedPages.push(block1Fill);
          }
          if (changedPages.length) {
            renderPages(changedPages);
          }
        }

        builder.addAnimation('content', 50, new ParGroup([block0Anim, block1Anim, eventsAnim]));
      }
    }
  }

  function NgScrollerController() {
    this.animationDecorators = [];
    var self = this;
    this.decorateAnimation = function (builder) {
      angular.forEach(self.animationDecorators, function (decorator) {
        decorator(builder);
      });
    };
  }
}]);