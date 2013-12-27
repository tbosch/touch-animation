angular.module('scroll').directive('ngScroller', ['touchAnimation', 'animationBuilder', function (TouchAnimation, animationBuilder) {
  return {
    compile: function (element) {
      element.addClass('scroll-viewport');
      var scrollContent = angular.element(element[0].querySelector('.scroll-row'));

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
    controller: NgScrollerController,
    require: 'ngScroller',
    scope: true
  };

  function link(scope, viewPort, attrs, ctrl, rowTemplate) {

    viewPort.append(rowTemplate);
    var rowHeight = utils.getHeight(rowTemplate[0]);
    ctrl.rowHeight = rowHeight;
    rowTemplate.remove();

    var scrollAnimation;

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

    scope.$watchCollection(attrs.ngScroller, rowsChanged);

    return;

    var lastRowCount;
    function rowsChanged(rows) {
      // TODO: Add a resize listener and update those variables only then!
      viewPortHeight = utils.getHeight(viewPort[0]);
      rowsPerPage = Math.ceil(viewPortHeight / rowHeight) + 1;

      updateBlockRows();

      if (rows.length !== lastRowCount) {
        lastRowCount = rows.length;
        layout();
      }

      function layout() {
        var animation = createAnimation(lastRowCount, function (pageIndex) {
          scope.$apply(function () {
            if (pageIndex % 2) {
              block1page = pageIndex;
            } else {
              block0page = pageIndex;
            }
            updateBlockRows();
          });
        });

        if (!scrollAnimation) {
          scrollAnimation = createScrollAnimation(animation);
        } else {
          scrollAnimation.updateAnimation(animation);
        }
      }

      function updateBlockRows() {
        scope.block0rows = rows.slice(block0page*rowsPerPage, block0page*rowsPerPage + rowsPerPage);
        fillMissingRowsInPage(scope.block0rows);
        scope.block1rows = rows.slice(block1page*rowsPerPage, block1page*rowsPerPage + rowsPerPage);
        fillMissingRowsInPage(scope.block1rows);
      }

      function fillMissingRowsInPage(rows) {
        var i;
        for (i=rows.length; i<rowsPerPage; i++) {
          rows.push({});
        }
      }
    }

    function createScrollAnimation(animation) {
      var headerFooterSlowDownFactor = 5,
      // estimate header/footer as high as a row
        headerDuration = 1 * headerFooterSlowDownFactor,
        footerDuration = 1 * headerFooterSlowDownFactor;

      return new TouchAnimation({
        animation: animation,
        // TODO: move this into the gesture property as pixelToTime
        timeToPixelRatio: rowHeight * -1,
        gesture: {type: 'y', element: viewPort},
        headerDuration: headerDuration,
        footerDuration: footerDuration
      });
    }

    function createAnimation(rowCount, renderPage) {
      var builder = animationBuilder();
      builder.rowCount = rowCount;
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

        block0Anim = fixedOnIterate(block0Anim, function(event) {
          renderPage(event.iterationIndex * 2);
        });

        var block1Anim = new Animation(block1[0], [
          { offset: 0, transform: 'translateZ(0) translateY(0%)' },
          { offset: 1, transform: 'translateZ(0) translateY(-200%)' }
        ], {
          duration: blockDuration,
          iterations: blockIterations
        });

        block1Anim = fixedOnIterate(block1Anim, function(event) {
          renderPage(event.iterationIndex * 2 + 1);
        });

        builder.addAnimation('content', 50, new ParGroup([block0Anim, block1Anim]));
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