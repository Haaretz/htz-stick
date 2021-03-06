/**
 *  HTZ STICK
 *
 * A flexible module for performant sticking of elements on scroll
 *
 * @module htz-stick
 * @license MIT
 */

import debounce from 'lodash-es/debounce';
import dispatchEvent from 'htz-dispatch-event';
import updateStyle from './lib/update-style';
import evaluateStick from './lib/evaluate-stick';


/**
 * Make an element stickable
 *
 * @param {HTMLElement} target - The element to make sticky. Should be contained inside an element
 *    which will keep its size and remain static.
 * @param {Object} options
 * @param {String} [options.stickyClass='is-sticky'] - The class that will be
 *    attached to target when it becomes sticky.
 * @param {Boolean} [options.guardHeight=true] - Should `target` be wrapped by an element
 *    with an explicit height to prevent layout collapsing when `target`
 *    becomes `position: fixed`.
 * @param {HTMLElement} [options.stickWithin] - Limit sticky behavior to the
 *    boundaries of the `stickWithin` element. Default's to the stuck element's
 *    parent-parent element.
 * @param {Integer|HTMLElement} [options.topSpacing=0] - Determines how far from
 *    the top of the screen the element will stick. If `topSpacing` is an
 *    `HTMLElement`, the element's height will be calculated and used.
 * @param {HTMLElement} [options.stickAfter] - Only make `elem` sticky after
 *    `stickAfter` reaches sticking position.
 * @param {Integer} [options.delta=0] - Only stick if scroll delta exceeds provided amount.
 * @param {String} [options.direction='both'] - Only stick when scrolling in
 *    indicated direction. Can be one of `'both'`, `'up'` or '`down`'.
 * @param {module:htz-stick#secondaryAction} [options.secondaryAction] - A custom
 *    callback to run whenever evaluating the scroll event.
 *
 * @fires module:htz-stick#stick:before-init - Fired before an instance is initialized
 * @fires module:htz-stick#stick:after-init  - Fired after an instance is initialized.
 * @fires module:htz-stick#stick:before-stick - Fired before an element is made sticky.
 * @fires module:htz-stick#stick:after-stick - Fired after an element is made sticky.
 * @fires module:htz-stick#stick:before-unstick - Fired before an element becomes unstuck
 * @fires module:htz-stick#stick:after-unstick - Fired after an element becomes unstuck
 * @fires module:htz-stick#stick:before-destroy - Fired before an instance is destroyed.
 * @fires module:htz-stick#stick:after-destroy - Fired after an instance is destroyed.
 *
 * @return {module:htz-stick#API} - API
 *
 * @public
 */
export default function htzStick(
  target,
  {
    stickyClass: stickyClass = 'is-sticky',
    guardHeight: guardHeight = true,
    stickWithin: stickWithin = undefined,
    topSpacing: topSpacing = 0,
    stickAfter: stickAfter = undefined,
    delta: delta = 0,
    direction: direction = 'both',
    secondaryAction: secondaryAction = undefined,
  } = {}
) {
  const stickInside = stickWithin || target.parentElement;
  const targetStyle = target.style;

  // Cache initial values of `position` and `top` CSS properties.
  const { position: originalPosition, top: originalTop } = targetStyle;

  const wrapper = guardHeight ? document.createElement('div') : target.parentElement;

  let isInitialized = false;

  let isStuck = false;
  let position = originalPosition;
  let top = isNaN(parseFloat(originalTop)) ? originalTop : parseFloat(originalTop);
  let lastWinScrollY = getScrollPosition();


  if (guardHeight) {
    wrapper.style.display = 'none';
    wrapper.style.height = `${target.offsetHeight}px`;
    target.parentNode.insertBefore(wrapper, target);
    wrapper.appendChild(target);
    wrapper.style.display = null;
  }

  function onScroll() {
    window.requestAimationFrame ?
      window.requestAimationFrame(onChange) :
      onChange();
  }

  const onResize = debounce(
    () => {
      unsetStyle();
      setStyle();
      // destroy();
      // init();
    },
    125,
    { maxWait: 500 }
  );


  init();

  // Used to handle both `scroll` and `resize` events.
  function onChange() {
    const wasSticky = isStuck;
    const lastPosition = position;
    const lastTop = top;
    const winScrollY = getScrollPosition();

    const {
      makeSticky,
      newPosition,
      newTop,
    } = evaluateStick(
      target,
      stickInside,
      topSpacing,
      lastWinScrollY,
      winScrollY,
      stickAfter,
      delta,
      direction,
      wasSticky
    );

    lastWinScrollY = winScrollY;


    if (makeSticky && !wasSticky) {
      /**
       * Fired before an element is made sticky
       * @event module:htz-stick#stick:before-stick
       *
       * @type {Object}
       *
       * @prop {Object} detail
       * @prop {Boolean} detail.wasSticky - Indicates if `target` was sticky before the
       *    event was fired.
       * @prop {Boolean} detail.isSticky - Indicates if `target` should be made sticky.
       * @prop {String} detail.lastPosition - The last known value of the CSS `position`
       *    property before the event was fired
       * @prop {String} detail.newPosition - The value which will be assigned to the CSS
       *    `position` property.
       * @prop {String} detail.lastTop - The last known value of the CSS `top`
       *    property before the event was fired
       * @prop {String} detail.newTop - The value which will be assigned to the CSS
       *    `top` property.
       * @prop {HTMLElement} detail.stickWithin - The container that sets stick limits
       * @prop {HTMLElement} detail.stickAfter - An element to determine sticking
       *    position's top limit.
       * @prop {HTMLElement|Number} detail.topSpacing - The distance from the top of the
       *    viewport `target` should stick in, or an element to stick to.
       * @prop {Integer} detail.delta - Only stick if scroll delta exceeds provided amount.
       * @prop {String} detail.direction - Only stick when scrolling in
       *    indicated direction. Can be one of `'both'`, `'up'` or '`down`'.
       */
      dispatchEvent(
        target,
        'stick:before-stick',
        {
          wasSticky,
          isSticky,
          lastPosition,
          newPosition,
          lastTop,
          newTop,
          stickWithin,
          stickAfter,
          topSpacing,
          delta,
          direction,
        }
      );

      updateStyle(lastPosition, newPosition, lastTop, newTop, targetStyle);
      target.classList.add(stickyClass);

      /**
       * Fired after an element is made sticky
       * @event module:htz-stick#stick:after-stick
       * @type {Object}
       * @prop {Object} detail
       * @prop {Boolean} detail.wasSticky - Indicates if `target` was sticky before the
       *    event was fired.
       * @prop {Boolean} detail.isSticky - Indicates if `target` should be made sticky.
       * @prop {String} detail.lastPosition - The last known value of the CSS `position`
       *    property before the event was fired
       * @prop {String} detail.newPosition - The value which will be assigned to the CSS
       *    `position` property.
       * @prop {String} detail.lastTop - The last known value of the CSS `top`
       *    property before the event was fired
       * @prop {String} detail.newTop - The value which will be assigned to the CSS
       *    `top` property.
       * @prop {HTMLElement} detail.stickWithin - The container that sets stick limits
       * @prop {HTMLElement} detail.stickAfter - An element to determine sticking
       *    position's top limit.
       * @prop {HTMLElement|Number} detail.topSpacing - The distance from the top of the
       *    viewport `target` should stick in, or an element to stick to.
       * @prop {Integer} detail.delta - Only stick if scroll delta exceeds provided amount.
       * @prop {String} detail.direction - Only stick when scrolling in
       *    indicated direction. Can be one of `'both'`, `'up'` or '`down`'.
       */
      dispatchEvent(
        target,
        'stick:after-stick',
        {
          wasSticky,
          isSticky,
          lastPosition,
          newPosition,
          lastTop,
          newTop,
          stickWithin,
          stickAfter,
          topSpacing,
          delta,
          direction,
        }
      );
    }
    else if (wasSticky && !makeSticky) {
      /**
       * Fired before an element stops being sticky
       * @event module:htz-stick#stick:before-unstick
       * @type {Object}
       * @prop {Object} detail
       * @prop {Boolean} detail.wasSticky - Indicates if `target` was sticky before the
       *    event was fired.
       * @prop {Boolean} detail.isSticky - Indicates if `target` should be made sticky.
       * @prop {String} detail.lastPosition - The last known value of the CSS `position`
       *    property before the event was fired
       * @prop {String} detail.newPosition - The value which will be assigned to the CSS
       *    `position` property.
       * @prop {String} detail.lastTop - The last known value of the CSS `top`
       *    property before the event was fired
       * @prop {String} detail.newTop - The value which will be assigned to the CSS
       *    `top` property.
       * @prop {HTMLElement} detail.stickWithin - The container that sets stick limits
       * @prop {HTMLElement} detail.stickAfter - An element to determine sticking
       *    position's top limit.
       * @prop {HTMLElement|Number} detail.topSpacing - The distance from the top of the
       *    viewport `target` should stick in, or an element to stick to.
       * @prop {Integer} detail.delta - Only stick if scroll delta exceeds provided amount.
       * @prop {String} detail.direction - Only stick when scrolling in
       *    indicated direction. Can be one of `'both'`, `'up'` or '`down`'.
       */
      dispatchEvent(
        target,
        'stick:before-unstick',
        {
          wasSticky,
          isSticky,
          lastPosition,
          newPosition,
          lastTop,
          newTop,
          stickWithin,
          stickAfter,
          topSpacing,
          delta,
          direction,
        }
      );

      updateStyle(lastPosition, originalPosition, lastTop, originalTop, targetStyle);
      target.classList.remove(stickyClass);

      /**
       * Fired after an element stops becoming sticky
       * @event module:htz-stick#stick:after-unstick
       * @type {Object}
       * @prop {Object} detail
       * @prop {Boolean} detail.wasSticky - Indicates if `target` was sticky before the
       *    event was fired.
       * @prop {Boolean} detail.isSticky - Indicates if `target` should be made sticky.
       * @prop {String} detail.lastPosition - The last known value of the CSS `position`
       *    property before the event was fired
       * @prop {String} detail.newPosition - The value which will be assigned to the CSS
       *    `position` property.
       * @prop {String} detail.lastTop - The last known value of the CSS `top`
       *    property before the event was fired
       * @prop {String} detail.newTop - The value which will be assigned to the CSS
       *    `top` property.
       * @prop {HTMLElement} detail.stickWithin - The container that sets stick limits
       * @prop {HTMLElement} detail.stickAfter - An element to determine sticking
       *    position's top limit.
       * @prop {HTMLElement|Number} detail.topSpacing - The distance from the top of the
       *    viewport `target` should stick in, or an element to stick to.
       * @prop {Integer} detail.delta - Only stick if scroll delta exceeds provided amount.
       * @prop {String} detail.direction - Only stick when scrolling in
       *    indicated direction. Can be one of `'both'`, `'up'` or '`down`'.
       */
      dispatchEvent(
        target,
        'stick:after-unstick',
        {
          wasSticky,
          isSticky,
          lastPosition,
          newPosition,
          lastTop,
          newTop,
          stickWithin,
          stickAfter,
          topSpacing,
          delta,
          direction,
        }

      );
    }
    else updateStyle(lastPosition, newPosition, lastTop, newTop, targetStyle);

    isStuck = makeSticky;
    position = isStuck ? newPosition : originalPosition;
    top = isStuck ? newTop : originalTop;

    // Fire misc callback
    if (
      secondaryAction &&
      Object.prototype.toString.call(secondaryAction) === '[object Function]'
    ) {
      secondaryAction({
        wasSticky,
        isSticky,
        lastPosition,
        newPosition,
        lastTop,
        newTop,
        stickWithin,
        stickAfter,
        topSpacing,
        delta,
        direction,
      });
    }
  }

  function setStyle() {
    if (isInitialized) {
      if (guardHeight) wrapper.style.height = `${target.offsetHeight}px`;
      onScroll();
    }
  }

  function unsetStyle() {
    updateStyle(position, originalPosition, top, originalTop, targetStyle);
    target.classList.remove(stickyClass);
    if (guardHeight) wrapper.style.height = null;
    position = originalPosition;
    top = originalTop;
    isStuck = false;
  }


  /**
   * Initialize sticky elem
   *
   * @callback module:htz-stick#init
   *
   * @public
   */
  function init() {
    if (!isInitialized) {
      /**
       * Fired before a sticky element is initialized
       * @event module:htz-stick#stick:before-init
       * @type {Object}
       */
      dispatchEvent(target, 'stick:before-init');

      setStyle();

      window.addEventListener('scroll', onScroll, false);
      window.addEventListener('resize', onResize);

      /**
       * Fired after a sticky element is initialized
       * @event module:htz-stick#stick:after-init
       * @type {Object}
       */
      dispatchEvent(target, 'stick:after-init');

      isInitialized = true;
    }
    else {
      destroy();
      init();
    }
  }

  /**
   * Reset styles and detach event listeners
   *
   * @callback module:htz-stick#destroy
   */
  function destroy() {
    if (isInitialized) {
      /**
       * Fired before a sticky instance is destroyed
       * @event module:htz-stick#stick:before-destroy
       * @type {Object}
       */
      dispatchEvent(target, 'stick:before-destroy');

      unsetStyle();

      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      /**
       * Fired after a sticky instance is destroyed
       * @event module:htz-stick#stick:after-destroy
       * @type {Object}
       */
      dispatchEvent(target, 'stick:after-destroy');

      isInitialized = false;
    }
  }


  /**
   * Check if `target` is currently sticky
   * @callback module:htz-stick#isSticky
   *
   * @return {Boolean}
   *
   * @public
   */
  function isSticky() { return isStuck; }


  /**
   * @typedef {Object} module:htz-stick#API
   * @prop {HTMLElement} target - The target element.
   * @prop {module:htz-stick#isSticky} isSticky - returns true
   * @prop {module:htz-stick#init} init - Initialize an instance. Attach event
   *    listeners and add styles as needed.
   * @prop {module:htz-stick#destroy} destroy - Destroy an instance. Remove
   *    styling and classes applied by `htz-stick` and detach event listeners.
   */
  return {
    target,
    isSticky,
    init,
    destroy,
  };
}


// ----------------------- //
//                         //
// PRIVATE UTILITY METHODS //
//                         //
// ----------------------- //

/**
 * Get the current scroll position
 *
 * @private
 *
 * @return {Number} - The current scroll position.
 */
function getScrollPosition() {
  return window.scrollY || window.pageYOffset || 0;
}


// ---------------------- //
//                        //
// JSDOC TYPE DEFINITIONS //
//                        //
// ---------------------- //
/**
 * A callbeck to enable secondary actions on stuck function
 * @callback module:htz-stick#secondaryAction
 *
 * @param {Object} options
 * @param {Boolean} options.wasSticky - Indicates if `target` was sticky before the
 *    event was fired.
 * @param {Boolean} options.isSticky - Indicates if `target` should be made sticky.
 * @param {String} options.lastPosition - The last known value of the CSS `position`
 *    property before the event was fired
 * @param {String} options.newPosition - The value which will be assigned to the CSS
 *    `position` property.
 * @param {String} options.lastTop - The last known value of the CSS `top`
 *    property before the event was fired
 * @param {String} options.newTop - The value which will be assigned to the CSS
 *    `top` property.
 * @param {HTMLElement} options.stickWithin - The container that sets stick limits
 * @param {HTMLElement} options.stickAfter - An element to determine sticking
 *    position's top limit.
 * @param {HTMLElement|Number} options.topSpacing - The distance from the top of the
 *    viewport `target` should stick in, or an element to stick to.
 * @param {Integer} options.delta - Only stick if scroll delta exceeds provided amount.
 * @param {String} options.direction - Only stick when scrolling in indicated
 *    direction. Can be one of `'both'`, `'up'` or '`down`'.
 */
