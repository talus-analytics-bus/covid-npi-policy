// 3rd party packages
import classNames from "classnames";
import PrimaryButton from "components/common/PrimaryButton/PrimaryButton";
import React, { ReactElement, FC } from "react";
import styles from "./ClearFiltersBtn.module.scss";

interface ClearFiltersBtnProps {
  onClick?(...args: any[]): void;

  /**
   * True if button should right-justify, false if button should left-justify.
   */
  right?: boolean;
}
/**
 * "Clear filters" button that calls a function to clear filters when clicked.
 * @param {Object} props Props
 * @returns Clear filters button if `onClick` is defined, null otherwise.
 */
export const ClearFiltersBtn: FC<ClearFiltersBtnProps> = ({
  onClick,
  right = false,
}): ReactElement | null => {
  if (onClick === undefined) return null;
  else
    return (
      <PrimaryButton
        isSecondary
        isSmall
        isRight={right}
        label={"Clear filters"}
        onClick={onClick}
      />
    );
};
