import { KeyboardEvent } from "react";
import { KeyboardEventHandler } from "react";

/**
 * Returns a `handleKeyPress` function for the `Search` function component.
 * @param callback The function called on key press.
 * @returns A `handleKeyPress` function for the `Search` function component.
 */
export function getHandleKeyPress(
  callback?: (e: KeyboardEvent, ...args: any[]) => void
): KeyboardEventHandler<HTMLInputElement> {
  return (e: KeyboardEvent) => {
    if (callback !== undefined) callback(e);
  };
}
