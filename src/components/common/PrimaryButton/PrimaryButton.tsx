// 3rd party packages
import React, { FC, ReactElement } from "react";
import classNames from "classnames";

// third party packages
import { Link } from "react-router-dom";

// assets and styles
import styles from "./primarybutton.module.scss";

interface PrimaryButtonProps {
  label: string | ReactElement;
  iconName?: string | null;
  onClick?(...args: any[]): void;
  url?: string | null;
  urlIsExternal?: boolean;
  isSecondary?: boolean;
  isSmall?: boolean;
  isLink?: boolean;
  isIcon?: boolean;
  isRight?: boolean;
  disabled?: boolean;
  customClassNames?: string[];
}

/**
 * Standard primary button for frontends.
 * @method PrimaryButton
 */
export const PrimaryButton: FC<PrimaryButtonProps> = ({
  // button text
  label = "Click here",

  // if using icon: material icon name
  iconName = null,

  // callback on click
  onClick = null,

  // if link: URL to go to
  url = null,

  // if link: whether target is in app or external
  urlIsExternal = false,

  // if true: button is secondary and styled as such
  isSecondary = false,

  // if true: smaller
  isSmall = false,

  // if true: button is link
  isLink = false,

  // if true: button is simply the icon itself with no other styling
  isIcon = false,

  // if true: right-justify button
  isRight = false,

  // if true: disabled class applied
  disabled = false,

  // additional class names to apply, if any
  customClassNames = [],
}) => {
  const icon =
    iconName !== null ? <i className={"material-icons"}>{iconName}</i> : null;

  const unwrappedButton = (
    <button
      onClick={e => {
        if (onClick) onClick(e);
      }}
      className={classNames(styles.button, {
        [styles.secondary]: isSecondary,
        [styles.small]: isSmall,
        [styles.link]: isLink,
        [styles.icon]: isIcon,
      })}
    >
      {icon}
      {!isIcon && label}
    </button>
  );

  // put button in link if needed
  let button;
  if (url !== null) {
    if (urlIsExternal) {
      button = (
        <a target={"_blank"} rel="noreferrer" href={url}>
          {unwrappedButton}
        </a>
      );
    } else {
      button = <Link to={url}>{unwrappedButton}</Link>;
    }
  } else {
    button = unwrappedButton;
  }

  // JSX // ---------------------------------------------------------------- //
  const wrapperClasses = { [styles.disabled]: disabled };
  customClassNames.forEach(name => {
    wrapperClasses[name] = true;
  });

  return (
    <div
      className={classNames(styles.wrapper, wrapperClasses, {
        [styles.right]: isRight,
      })}
    >
      {button}
    </div>
  );
};

export default PrimaryButton;
