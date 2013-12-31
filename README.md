# touch animations

This is a demo of touch aware animations using the [web-animations](https://github.com/web-animations/web-animations-js) polyfill.

Live demo: [http://tbosch.github.io/touchanimation](http://tbosch.github.io/touchanimation)

## Run locally

- `npm install`
- `bower install`
- `grunt server`
- open [localhost:9000](http://localhost:9000)

## TODO
- deploy to gh-pages and send link around
  * see http://yeoman.io/deployment.html
  * before: add correct comments in to html so that yeoman can build it!
- are the temp players (for touchAnimation.goTo) getting removed correctly?
- scroll indicator is hard to touch on mobile devices. how to improve this?
- support mouse wheel
- add tests :-)
- make jshint pass

Ideas for performance improvements:

- discuss with web-animation team about player that runs a player...
- collect move listeners in start event -> faster!
- skip multiple moves for same raf

## Notes / bugs:

- fastclick.js did not work well with checkboxes on iOS. So used a span instead.
- Don't use plain checkboxes or buttons in virtual lists, as it will slow down the performance on iOS
  a lot as iOS uses rounded corners and gradient backgrounds!
- see file `web-animations-fixes.js`
