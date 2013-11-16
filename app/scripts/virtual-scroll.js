(function() {
  var block1 = document.getElementById('block0'),
    block2 = document.getElementById('block1'),
    block3 = document.getElementById('block2');

  var anim1 = new Animation(block1, [
    { offset: 0, transform: 'translateZ(0) translateY(0)' },
    { offset: 1, transform: 'translateZ(0) translateY(150px)' }
  ], {
    duration: 1
    /*
    easing: 'linear step-start linear',
    _easingTimes: [0, 0.2, 0.2, 1],
    */
    //delay: 0,
  });
  var anim21 = new Animation(block2, [
    { offset: 0, transform: 'translateZ(0) translateY(50px)' },
    { offset: 1, transform: 'translateZ(0) translateY(150px)' }
  ], {
    duration: 0.67
  });
  var anim22 = new Animation(block2, [
    { offset: 0, transform: 'translateZ(0) translateY(0px)' },
    { offset: 1, transform: 'translateZ(0) translateY(50px)' }
  ], {
    duration: 0.33
  });
  var anim31 = new Animation(block3, [
    { offset: 0, transform: 'translateZ(0) translateY(100px)' },
    { offset: 1, transform: 'translateZ(0) translateY(150px)' }
  ], {
    duration: 0.33
  });
  var anim32 = new Animation(block3, [
    { offset: 0, transform: 'translateZ(0) translateY(0px)' },
    { offset: 1, transform: 'translateZ(0) translateY(100px)' }
  ], {
    duration: 0.67
  });

  var parGroup = new ParGroup([anim1, new SeqGroup([anim21, anim22]), new SeqGroup([anim31, anim32])], {
    duration: 1,
    iterations: Infinity
  });

  var player = document.timeline.play(parGroup);
})();