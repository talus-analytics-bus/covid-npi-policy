import React from "react";
import classNames from "classnames";
import styles from "./radiotoggle.module.scss";
import { darkSelectedBlue } from "../../../assets/styles/vars.scss";
import { InfoTooltip } from "..";

/**
 * Generic radio toggle
 * @method RadioToggle
 */
const RadioToggle = ({
  choices,
  curVal,
  callback,
  onClick,
  label,
  className,
  ...props
}) => {
  /**
   * When radio button changes, set current choice equal to its value.
   * @method onChange
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  const onChange = e => {
    e.stopPropagation();
    if (props.selectpicker) {
      callback(e.target.value);
    } else {
      const input = e.target.closest("label").querySelector("input");
      callback(input.value);
    }
  };

  if (onClick === undefined) onClick = (a, b) => b;

  if (props.selectpicker) {
    return (
      <div
        className={classNames(styles.radioToggle, {
          [styles.disabled]: props.disabled === true
        })}
      >
        <div className={classNames(className !== undefined ? className : "")}>
          {label}
        </div>
        <select onChange={callback ? onChange : undefined}>
          {choices.map(c => (
            <option value={c.value} key={c.value}>
              {c.name || c.label}
            </option>
          ))}
        </select>
      </div>
    );
  } else {
    return (
      <div
        className={classNames(styles.radioToggle, {
          [styles.disabled]: props.disabled === true,
          [styles.horizontal]: props.horizontal === true,
          [styles.right]: props.right === true,
          [styles.left]: props.left === true
        })}
      >
        <div
          role="label"
          className={classNames(className !== undefined ? className : "")}
        >
          {label}
        </div>
        <form>
          {choices.map(c => (
            <span key={c.value}>
              {onClick(
                c.value,
                <label
                  style={{
                    color:
                      curVal.toString() === c.value.toString()
                        ? darkSelectedBlue
                        : ""
                  }}
                  disabled={
                    props.disabled === true || c.disabled === true
                      ? "disabled"
                      : ""
                  }
                  onClick={callback ? onChange : undefined}
                >
                  <input
                    disabled={
                      props.disabled === true || c.disabled === true
                        ? "disabled"
                        : ""
                    }
                    type="radio"
                    name={c.name || c.label}
                    value={c.value}
                    checked={curVal.toString() === c.value.toString()}
                    readOnly
                  />
                  <span>
                    {c.name || c.label}
                    {c.tooltip && (
                      <InfoTooltip
                        id={c.value}
                        text={c.tooltip}
                        setInfoTooltipContent={props.setInfoTooltipContent}
                      />
                    )}
                  </span>
                </label>
              )}
            </span>
          ))}
        </form>
      </div>
    );
  }
};

export default RadioToggle;
