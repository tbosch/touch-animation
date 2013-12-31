# touch animations

TODO:
- deploy to gh-pages and send link around
  * see http://yeoman.io/deployment.html
  * before: add correct comments in to html so that yeoman can build it!
- are the temp players (for touchAnimation.goTo) getting removed correctly?
- scroll indicator is hard to touch on mobile devices. how to improve this?
- optimize performance on iPad2!
- support mouse wheel

# Notes

- fastclick.js did not work well with checkboxes on iOS. So used a span instead...
- Don't use plain checkboxes or buttons in virtual lists, as it will slow down the performance on iOS
  a lot as iOS uses rounded corners and gradient backgrounds!

# open bugs with web-animations:

- see file `web-animations-fixes.js`