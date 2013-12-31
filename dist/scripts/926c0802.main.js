!function(){function a(){l.on("touchstart touchmove touchend mousedown mousemove mouseup",b)}function b(a){var b={pressed:g(a),pos:f(a),touch:h(a),target:a.target};m&&b.touch!==m.touch||(b.pressed&&!m?(m=b,b.type="start",c(m.target,"pointerdown",b)):!b.pressed&&m?b.type="end":m&&b.pressed&&(b.type="move"),m&&!n&&"end"===b.type&&c(m.target,"tap",b),d(b),"end"===b.type&&(c(m.target,"pointerup",b),m=null))}function c(a,b,c){a.nodeName&&(a=angular.element(a));var d=!1;for(c=c||{},c.stopPropagation=function(){d=!0};a.length&&!d;)a.triggerHandler(b,c),a=a.parent()}function d(a){var b,c,d,f;n?(d=a.pos[n.gestureType]-n.pos[n.gestureType],f={type:n.gestureType,offset:d,velocity:1e3*n.velocity(d)},e(a.pressed?"move":"end",f),a.pressed||(n=null)):a.pressed&&(b={x:a.pos.x-m.pos.x,y:a.pos.y-m.pos.y},c={x:Math.abs(b.x),y:Math.abs(b.y)},Math.max(c.x,c.y)>k&&(n=a,n.velocity=j(),n.gestureType=c.x>c.y?"x":"y",f={type:n.gestureType,offset:0,velocity:0},e("start",f)))}function e(a,b){c(n.target,"swipe"+a+n.gestureType,b)}function f(a){return a.changedTouches?{x:a.changedTouches[0].pageX,y:a.changedTouches[0].pageY}:{x:a.pageX,y:a.pageY}}function g(a){return"touchend"===a.type||"mouseup"===a.type?!1:a.changedTouches?!!a.changedTouches.length:!!a.which}function h(a){return 0===a.type.indexOf("touch")}function i(){l.on("touchmove",function(a){a.preventDefault()}),l.on("scroll",function(a){a.preventDefault()})}function j(){function a(a){var e,f=Date.now();return b?(e=(a-c)/(f-b),(0===e||1/0===e||e===-1/0||isNaN(e))&&(e=d)):e=0,d=e,b=f,c=a,e}var b,c,d;return a}var k=5,l=angular.element(document);i(),a();var m,n}(),angular.module("touchAnimation",[]).directive("ngTap",function(){return{link:function(a,b,c){b.on("tap",function(){a.$apply(c.ngTap)})}}}).factory("touchAnimation",[function(){function a(a){function b(){c(k)}function d(a,b){return b?e(k,a,b.duration||1,b.easing||"linear"):(g(function(){k.currentTime=a}),void 0)}function f(){return k.currentTime}function i(a){return l[a]}function j(){var a=new h,b={};n(a),angular.forEach(a,function(a,c){a.target&&(b[c]=a.target,a.target=null)}),angular.equals(a,q)||(q=angular.copy(a),angular.forEach(a,function(a,c){b[c]&&(a.target=b[c])}),l=a.build(),k?k.source=l.main:(k=document.timeline.play(l.main),k.paused=!0))}var k,l,m,n=a.animationFactory,o=a.gesture.element;j();var p;return o.on("swipestart"+a.gesture.type,function(){p=k.currentTime}),o.on("swipemove"+a.gesture.type,function(a,b){var c=p+-1*b.offset;c=Math.max(c,l.main.startTime),c=Math.min(c,l.main.endTime),d(c)}),o.on("$destroy",b),m={updateAnimationIfNeeded:j,getAnimationByName:i,currentTime:f,goTo:d,destroy:b};var q}function b(a){function b(){var a=this[0];if(!a)return 0;var b=a.getBoundingClientRect();return b.bottom-b.top}function c(){var a=this[0];if(!a)return 0;var b=a.getBoundingClientRect();return b.right-b.left}a.height||(a.height=b),a.width||(a.width=c)}function c(a){a.source=null,a.paused=!1}function d(){var a,b=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;return a=b?function(a){b(a)}:function(a){setTimeout(a,1e3/60)}}function e(a,b,d,e,f){function h(b){j!==b&&(j=b,g(function(){a.currentTime=k+l*b}))}function i(){c(n)}var j,k=a.currentTime,l=b-k,m=new Animation(null,{sample:h},{duration:d,easing:e});m.onend=function(){i(),f&&f()};var n=document.timeline.play(m);return i}function f(){function a(){}function b(a){var b=this,c=this[a],d=c.timing||{};if(!c)throw new Error("Could not find part "+a);var e=d.duration;return e||(e=0,"par"===c.type?angular.forEach(c.children,function(a){e=Math.max(e,b.resolvedDuration(a))}):"seq"===c.type&&angular.forEach(c.children,function(a){e+=b.resolvedDuration(a)})),d.iterations&&(e*=d.iterations),e}function c(){function a(d){var e,f=c[d];if(!f){var f,g=b[d];if(!g)throw new Error("Could not find the spec for animation "+d);if("atom"===g.type)f=new Animation(g.target,g.effect,g.timing);else if("seq"===g.type){var h=[];angular.forEach(g.children,function(b){h.push(a(b))}),f=new SeqGroup(h,g.timing)}else{if("par"!==g.type)throw new Error("Unknown animation type "+g.type);var h=[];angular.forEach(g.children,function(b){h.push(a(b))}),f=new ParGroup(h,g.timing)}e=g.events,e&&(e.oniterate&&(f=fixedOnIterate(f,e.oniterate)),e.onstart&&(f.onstart=e.onstart),e.onend&&(f.onend=event.onend))}return c[d]=f}var b=this,c={};return angular.forEach(b,function(b,c){a(c)}),c}return a.prototype={resolvedDuration:b,build:c},a}var g=d(),h=f();return b(angular.element.prototype),a}]),angular.module("scroll",["touchAnimation"]),angular.module("scroll").directive("scroller",["touchAnimation","$compile",function(a,b){function c(c,d,e,f,g){function h(){d.append(g);var a=g.height();return g.remove(),a}function i(){var a=angular.element("<div></div>"),d=angular.element('<div class="scroll-block0"></div>'),e=g.clone();e.attr("ng-repeat","row in block0rows track by $index"),d.append(e);var f=angular.element('<div class="scroll-block1"></div>'),h=g.clone();h.attr("ng-repeat","row in block1rows track by $index"),f.append(h);var i=c.$new();return a.append(d),a.append(f),r.append(a),b(a)(i),{scope:i,block0:d,block1:f}}function j(a){y=a,f.rowCount=a.length,k()}function k(){f.viewPortHeight=d.height(),f.rowsPerPage=Math.ceil(f.viewPortHeight/f.rowHeight)+1,l(),f.scrollAnimation?f.scrollAnimation.updateAnimationIfNeeded():(f.scrollAnimation=a({animationFactory:o,timeToPixelRatio:-1*f.rowHeight,gesture:{type:"y",element:d}}),f.scrollAnimation.goTo(f.scrollAnimation.getAnimationByName("content").startTime),d.on("swipeendy",q),d.on("pointerdown",p))}function l(){c.block0rows=y.slice(w*f.rowsPerPage,w*f.rowsPerPage+f.rowsPerPage),m(c.block0rows),c.block1rows=y.slice(x*f.rowsPerPage,x*f.rowsPerPage+f.rowsPerPage),m(c.block1rows)}function m(a){var b;for(b=a.length;b<f.rowsPerPage;b++)a.push({})}function n(a){v.$apply(function(){a%2?x=a:w=a,l()})}function o(a){function b(a){var b=f.rowCount*f.rowHeight-f.viewPortHeight,c=2*f.rowsPerPage*f.rowHeight,d=b/c;a.block0={type:"atom",target:t[0],effect:[{offset:0,transform:"translateZ(0) translateY(100%)"},{offset:1,transform:"translateZ(0) translateY(-100%)"}],timing:{iterationStart:.5,duration:c,iterations:d},events:{oniterate:function(a){n(2*a.iterationIndex)}}},a.block1={type:"atom",target:u[0],effect:[{offset:0,transform:"translateZ(0) translateY(0%)"},{offset:1,transform:"translateZ(0) translateY(-200%)"}],timing:{duration:c,iterations:d},events:{oniterate:function(a){n(2*a.iterationIndex+1)}}},a.content={type:"par",children:["block0","block1"]},a.main={type:"seq",children:["content"]}}return b(a),f.decorateAnimation(a),a}function p(){z&&(z(),z=null)}function q(a,b){var c=f.scrollAnimation.getAnimationByName("content"),d=f.scrollAnimation.currentTime();if(d<c.startTime||d>c.endTime)return!1;var e=-1*b.velocity,g=d,h=g+e/2;h=Math.max(c.startTime,h),h=Math.min(c.endTime,h),z=f.scrollAnimation.goTo(h,{duration:Math.abs((h-g)/e*2),easing:"ease-out"})}f.rowHeight=h(),console.log(f.rowHeight);var r=angular.element(d[0].querySelectorAll(".inner-viewport")),s=i(),t=s.block0,u=s.block1,v=s.scope,w=0,x=1;return c.$watchCollection(e.scroller,j),void 0;var y,z}function d(){var a=[];this.addAnimationDecorator=function(b,c){a.push({order:b||0,decorator:c})},this.decorateAnimation=function(){var b=arguments;a.sort(function(a,b){return a.order-b.order}),angular.forEach(a,function(a){a.decorator.apply(this,b)})}}return{compile:function(a){a.addClass("scroll-viewport");var b=angular.element(a[0].querySelector("[scroll-row]"));if(!b.length)throw new Error('The scroller directive requires a child div with a "scroll-row" directive');b.addClass("scroll-row"),b.remove();var d=angular.element('<div class="inner-viewport"></div>');return d.append(a.children()),a.append(d),function(a,d,e,f){c(a,d,e,f,b)}},controller:d,scope:!0}}]),angular.module("scroll").directive("scrollHeader",function(){return{require:"^scroller",link:function(a,b,c,d){function e(a){a.header={type:"par",children:["headerMain"]},a.headerMain={type:"atom",target:b.parent()[0],effect:[{offset:0,transform:"translateZ(0) translateY("+h+"px)"},{offset:1,transform:"translateZ(0) translateY(0px)"}],timing:{duration:i}},a.main.children.unshift("header")}function f(){var a=d.scrollAnimation,b=a.getAnimationByName("header");return a.currentTime()>b.endTime?!1:(a.goTo(b.endTime,{duration:.3,easing:"ease-out"}),void 0)}b.addClass("scroll-header");var g=5,h=b.height(),i=h*g;d.addAnimationDecorator(0,e),b.parent().on("swipeendy",f)}}}),angular.module("scroll").directive("scrollFooter",function(){return{require:"^scroller",link:function(a,b,c,d){function e(a){a.footer={type:"par",children:["footerMain"]},a.footerMain={type:"atom",target:b.parent()[0],effect:[{offset:0,transform:"translateZ(0) translateY(0px)"},{offset:1,transform:"translateZ(0) translateY(-"+h+"px)"}],timing:{duration:i}},a.main.children.push("footer")}function f(a,b){var b=d.scrollAnimation,c=b.getAnimationByName("footer");return b.currentTime()<c.startTime?!1:(b.goTo(c.startTime,{duration:.3,easing:"ease-out"}),void 0)}b.addClass("scroll-footer");var g=5,h=b.height(),i=h*g;d.addAnimationDecorator(0,e),b.parent().on("swipeendy",f)}}}),angular.module("scroll").directive("scrollIndicator",function(){return{require:"scroller",priority:-1,link:function(a,b,c,d){function e(a){h=Math.max(50,d.viewPortHeight/(d.rowHeight*d.rowCount)*d.viewPortHeight),f[0].style.height=h+"px",a.header&&(a.headerIndicator={target:f[0],type:"atom",effect:[{offset:0,transform:"translateZ(0) translateY(-"+.5*h+"px)"},{offset:1,transform:"translateZ(0) translateY(0)"}],timing:{duration:a.resolvedDuration("header")}},a.header.children.push("headerIndicator")),a.contentIndicator={target:f[0],type:"atom",effect:[{offset:0,transform:"translateZ(0) translateY(0px)"},{offset:1,transform:"translateZ(0) translateY("+(d.viewPortHeight-h)+"px)"}],timing:{duration:a.resolvedDuration("content")}},a.content.children.push("contentIndicator"),a.footer&&(a.footerIndicator={type:"atom",target:f[0],effect:[{offset:0,transform:"translateZ(0) translateY("+(d.viewPortHeight-h)+"px)"},{offset:1,transform:"translateZ(0) translateY("+(d.viewPortHeight-h+.5*h)+"px)"}],timing:{duration:a.resolvedDuration("footer")}},a.footer.children.push("footerIndicator"))}var f=angular.element('<div class="scroll-indicator"></div>'),g=angular.element('<div class="scroll-indicator-bar"></div>');g.append(f),b.append(g);var h;g.on("swipestarty",function(a,b){b.stopPropagation()}),g.on("swipemovey",function(a,b){b.stopPropagation()}),g.on("swipeendy",function(a,b){b.stopPropagation()});var i;f.on("swipestarty",function(){i=d.scrollAnimation.currentTime()}),g.on("swipemovey",function(a,b){var c=d.scrollAnimation.getAnimationByName("content"),e=i+b.offset*c.duration/(d.viewPortHeight-h);e=Math.max(e,c.startTime),e=Math.min(e,c.endTime),d.scrollAnimation.goTo(e)}),d.addAnimationDecorator(1e3,e)}}}),angular.module("scroll").directive("scrollPullToRefresh",function(){return{require:"^scroller",link:function(a,b,c,d){function e(a){a.headerPullToRefresh={target:b[0],type:"atom",effect:[{offset:0,transform:"translateZ(0) rotate(0p)"},{offset:1,transform:"translateZ(0) rotate(360deg)"}],timing:{duration:a.resolvedDuration("header")}},a.header.children.push("headerPullToRefresh")}d.addAnimationDecorator(10,e)}}}),angular.module("demo",["scroll"]).controller("ScrollController",function(){this.rows=[],this.addRows=function(a){var b,c;for(b=0;a>b;b++)c={index:this.rows.length,text:"todo no "+this.rows.length},this.rows.push(c)},this.addRows(40),this.delete=function(a){var b;for(b=0;b<this.rows.length;b++)if(this.rows[b]===a)return this.rows.splice(b,1),void 0}}),angular.module("demo").directive("leftSwipeable",["touchAnimation","$rootElement",function(a,b){return{link:function(c,d){function e(a,b){for(var c=!1,e=angular.element(a.target||b.target);e.length;){if(e[0]===d[0]){c=!0;break}e=e.parent()}c||f()}function f(){var a=k.getAnimationByName("main");a.startTime!==a.player.currentTime&&k.goTo(a.startTime,{duration:.5,easing:"ease-out"})}function g(){var a=k.getAnimationByName("main");k.goTo(a.endTime,{duration:.5,easing:"ease-out"})}function h(a,b){var c=k.getAnimationByName("main"),d=b.offset/c.duration;d>.2?f():.2>d&&g()}function i(a){a.main={target:d[0],type:"atom",effect:[{offset:0,transform:"translateZ(0) translateX(0%)"},{offset:1,transform:"translateZ(0) translateX(-60%)"}],timing:{duration:j}}}var j=d.width(),k=a({animationFactory:i,gesture:{type:"x",element:d}});d.on("swipeendx",h);var l=b.on("pointerdown",e);d.on("$destroy",l)}}}]);