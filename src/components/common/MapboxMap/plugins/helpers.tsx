/**
 * Returns true if the element `el` is the Mapbox canvas, false otherwise.
 *
 * Used to determine whether the canvas is being interacted with, such as
 * during a click or hover event.
 * @param el The element to be interrogated
 * @returns {boolean} True if element is the Mapbox canvas, false otherwise
 */
export function elementIsMapCanvas(el: HTMLElement): boolean {
  return el.classList.contains("mapboxgl-canvas") && el.tagName === "CANVAS";
}
