angular.module('scroll').factory('animationBuilder', function() {
  return createAnimationBuilder;

  function createAnimationBuilder() {
    var animations = {},
      parallelAnimations = [];

    return {
      addAnimation: addAnimation,
      addParallelAnimation: addParallelAnimation,
      build: build
    };

    function addAnimation(name, order, animation) {
      animations[name] = {
        name: name,
        order: order,
        animation: animation
      };
    }

    function addParallelAnimation(startAnimationName, endAnimationName, factory) {
      parallelAnimations.push({
        start: startAnimationName,
        end: endAnimationName,
        factory: factory
      });
    }

    function build() {
      var res = new SeqGroup();
      var animationArr = [];
      angular.forEach(animations, function(entry) {
        animationArr.push(entry);
      });
      animationArr.sort(function(entry1, entry2) {
        return entry1.order - entry2.order;
      });
      angular.forEach(animationArr, function(entry) {
        res.append(entry.animation);
      });

      if (parallelAnimations.length) {
        var par = new ParGroup();
        par.append(res);
        angular.forEach(parallelAnimations, function(entry) {
          if (!animations[entry.start] || !animations[entry.end]) {
            return;
          }
          var start = getAnimationStart(entry.start),
              end = getAnimationEnd(entry.end),
              animation = entry.factory({
                delay: start,
                duration: end-start
              });
          par.append(animation);
        });
        res = par;
      }
      return res;

      function getAnimationStart(name) {
        var i, entry, start = 0;
        for (i=0; i<animationArr.length; i++) {
          entry = animationArr[i];
          if (entry.name === name) {
            return start;
          } else {
            start += entry.animation.duration;
          }
        }
      }

      function getAnimationEnd(name) {
        return getAnimationStart(name) + animations[name].animation.duration;
      }
    }

  }


});