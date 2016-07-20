/**
 *  UPDATE STYLE
 *
 * A utility for updating a sticky element's style
 *
 * @module update-style
 * @license MIT
 */

/**
 * Update the sticky element's styles
 *
 * @param {String} lastPosition - The last known value of the `position` css property.
 * @param {String} newPosition - The value to assign to the `position` css property.
 * @param {String} lastTop - The last known value of the `top` css property.
 * @param {String} newTop - The value to assign to the `top` css property.
 * @param {Object} style - An HTMLElement's `style` object.
 */
export default function updateStyle(lastPosition, newPosition, lastTop, newTop, style) {
  const changePos = lastPosition !== newPosition;
  const changeTop = lastTop !== newTop;

  if (changePos && changeTop) {
    const lastStyleString = style.cssText;
    const styleString = `position: ${newPosition}; top: ${newTop}px; ${
      lastStyleString
        .replace(/position\s*:\s*[^;]*\b;?/g, '')
        .replace(/top\s*:\s*[^;]*\b;?/g, '')
    }`;

    style.cssText = styleString; // eslint-disable-line no-param-reassign
  }
  else if (changePos) style.position = newPosition; // eslint-disable-line no-param-reassign
  else if (changeTop) style.top = `${newTop}px`; // eslint-disable-line no-param-reassign
}
