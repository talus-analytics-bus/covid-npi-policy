import { FC } from "react";
import styles from "../paginator.module.scss";
import classNames from "classnames";

interface PageButtonProps {
  label?: string;
  iconName?: string;
  onClick?(...args: any[]): void;
  customClassNames?: { [k: string]: boolean };
}

/**
 * Numbered button that when clicked sets current page to that number
 * @method PageButton
 */
export const PageButton: FC<PageButtonProps> = ({
  label, // button label, the number
  iconName, // optional: name of material icon to show
  onClick, // callback fired when button clicked
  customClassNames = {}, // optional: key = class name, value = true if use
}) => {
  // get material icon if any
  const icon =
    iconName !== undefined ? (
      <i className={classNames("material-icons")}>{iconName}</i>
    ) : null;

  // return page button
  return (
    <button
      className={classNames(styles.pageButton, customClassNames)}
      {...{ onClick }}
    >
      {icon}
      {label}
    </button>
  );
};
