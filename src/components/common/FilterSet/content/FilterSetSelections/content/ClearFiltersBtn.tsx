// 3rd party packages
import classNames from "classnames";
import React, { ReactElement, FC } from "react";
import styles from "./ClearFiltersBtn.module.scss";

interface ClearFiltersBtnProps {
  onClick?(...args: any[]): void;

  /**
   * True if button should right-justify, false if button should left-justify.
   */
  right?: boolean;

  /**
   * Theme to use, or undefined if default.
   */
  theme?: string;
}
/**
 * "Clear filters" button that calls a function to clear filters when clicked.
 * @param {Object} props Props
 * @returns Clear filters button if `onClick` is defined, null otherwise.
 */
export const ClearFiltersBtn: FC<ClearFiltersBtnProps> = ({
  onClick,
  right = false,
  theme,
}): ReactElement | null => {
  if (onClick === undefined) return null;
  else
    return (
      <button
        onClick={onClick}
        className={classNames(styles.clearFiltersBtn, {
          [styles.right]: right,
          [styles["theme-" + theme]]: theme !== undefined,
        })}
      >
        Clear filters
      </button>
    );
};
