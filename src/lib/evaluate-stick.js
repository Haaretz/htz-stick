/**
 * EVALUATE STICK
 *
 * A utility for evaluating an element's stickiness
 *
 * @module evaluate-stick
 * @license MIT
 */


/**
 * Evaluate if an element should be sticky, and the values to
 * assign to the css `position` and `top` properties.
 *
 * @param {HTMLElement} target - The element to evaluate
 * @param {HTMLElement} stickWithin - The container that sets stick limits
 * @param {HTMLElement|Number} topSpacing - The distance from the top of the
 *    viewport `target` should stick in, or an element to stick to.
 * @param {Number} lastWinScrollY - The last known scroll position before the current one.
 * @param {Number} winScrollY - The current scroll position.
 * @param {HTMLElement} offsetElem - An element to determine sticking
 *    position's top limit.
 * @param {Integer} delta - Only stick if scroll delta exceeds provided amount.
 * @param {String} direction - Only stick when scrolling in indicated direction.
 *    Can be one of `'both'`, `'up'` or '`down`'.
 * @param {Boolean} isSticky - Indicates if `target` is currently sticky.
 *
 * @return {Object} Evaluated results. Has `makeSticky`, `newPosition` and
 *    `newTop` properties.
 */
export default function evaluateStick(
  target,
  stickWithin,
  topSpacing,
  lastWinScrollY,
  winScrollY,
  offsetElem,
  delta,
  direction,
  isSticky
) {
  let newPosition; let newTop;

  const wrapper = target.parentElement;
  const topLimitElem = (offsetElem || wrapper).offsetTop >= stickWithin.offsetTop ?
    offsetElem || wrapper :
    stickWithin;
  const distance = topSpacing.tagName ? topSpacing.getBoundingClientRect().bottom : topSpacing;

  const {
    top: targetRectTop,
    bottom: targetRectBot,
  } = target.getBoundingClientRect();

  const wrapperRectTop = wrapper.getBoundingClientRect().top;
  const stickWithinRectBot = stickWithin.getBoundingClientRect().bottom;

  const targetHeight = targetRectBot - targetRectTop;
  const limitTop = topLimitElem.getBoundingClientRect().top + winScrollY - distance;
  const limitBottom = stickWithinRectBot + winScrollY - targetHeight - distance;

  const velocity = winScrollY - lastWinScrollY;
  const aboveDelta = isSticky || delta <= Math.abs(velocity);
  const isRightDirection = direction === 'both' ||
    (direction === 'down' ? velocity >= 0 : velocity <= 0);

  const makeSticky = aboveDelta && isRightDirection && winScrollY >= limitTop;

  if (makeSticky) {
    if (winScrollY <= limitBottom) {
      newPosition = 'fixed';
      newTop = distance;
    }
    else {
      newPosition = 'relative';
      newTop = stickWithinRectBot - (wrapperRectTop + targetHeight);
    }
  }
  else {
    newPosition = 'relative';
    newTop = 0;
  }

  return {
    makeSticky,
    newPosition,
    newTop,
  };
}
