import React from "react";
import classNames from "classnames";
import styles from "./radiotoggle.module.scss";
import { darkSelectedBlue } from "../../../assets/styles/vars.module.scss";
import { InfoTooltip } from "..";

/**
 * Generic radio toggle
 * @method RadioToggle
 */
const RadioToggle = ({
  choices = [],
  curVal = "a",
  callback,
  onClick,
  label,
  labelPos = "top",
  theme,
  className,
  tooltipMode = "icon", // 'icon' or 'footnote'
  children,
  ...props
}) => {
  // display radios as sets of columns?
  const showRadiosAsCols = false;
  // const showRadiosAsCols = choices.length > 6;

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
      if (callback !== undefined && input.disabled !== true)
        callback(input.value);
    }
  };

  if (onClick === undefined) onClick = (a, b) => b;

  if (props.selectpicker) {
    return (
      <div
        className={classNames(styles.radioToggle, {
          [styles.disabled]: props.disabled === true,
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
    const curValChoice = choices.find(c => getIsChecked(curVal, c));
    // get checked value's tooltip if any and display beneath form if tooltip
    // mode is "footnote"
    const footnote =
      tooltipMode === "footnote" &&
      curValChoice !== undefined &&
      curValChoice.tooltip !== undefined ? (
        <span className={styles.footnote}>{curValChoice.tooltip}</span>
      ) : null;
    return (
      <div
        className={classNames(
          classNames(className !== undefined ? className : ""),
          styles.radioToggle,
          styles[theme],
          {
            [styles.disabled]: props.disabled === true,
            [styles.horizontal]: props.horizontal === true,
            [styles.labelPosInline]: labelPos === "inline",
            [styles.labelPosTop]: labelPos === "top",
            [styles.right]: props.right === true,
            [styles.left]: props.left === true,
          }
        )}
      >
        <div className={styles.label}>{label}</div>
        <form className={classNames({ [styles.asGrid]: showRadiosAsCols })}>
          {choices.map(c => {
            const isChecked = getIsChecked(curVal, c);
            return (
              <>
                <span
                  key={c.value}
                  className={classNames({
                    [styles.hasChildren]: c.children !== undefined,
                  })}
                >
                  {onClick(
                    c.value,
                    <label
                      style={{
                        color:
                          curVal.toString() === c.value.toString()
                            ? darkSelectedBlue
                            : "",
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
                        checked={isChecked}
                        readOnly
                      />
                      <span>
                        {getLabelJsx(c.name || c.label)}
                        {c.tooltip && tooltipMode === "icon" && (
                          <InfoTooltip
                            id={c.value}
                            text={c.tooltip}
                            setInfoTooltipContent={props.setInfoTooltipContent}
                            wide={c.wideTooltip === true}
                            style={c.tooltipStyle}
                            place={props.tooltipPlace}
                          />
                        )}
                      </span>
                    </label>
                  )}
                </span>
                {isChecked && c.children}
              </>
            );
          })}
        </form>
        {footnote}
      </div>
    );
  }
};

/**
 * Given plain text, convert to series of DOM lines separated by line breaks
 * with the defined character limit.
 * @method getLabelJsx
 * @param  {[type]}    text [description]
 * @return {[type]}         [description]
 */
const getLabelJsx = text => {
  const maxChars = 30;
  const words = text.split(" ");
  let line = "";
  const lines = [];

  words.forEach(word => {
    const possibleLine = line + " " + word;
    if (possibleLine.length < maxChars) {
      line += " " + word;
    } else if (line !== "") {
      const newLine = line;
      lines.push(newLine.trim());
      line = word;
    }
  });
  lines.push(line.trim());

  return lines.map((d, i) => (
    <React.Fragment key={d + "-" + i}>
      {d}
      {i !== lines.length - 1 && <br />}
    </React.Fragment>
  ));
};

export default RadioToggle;
function getIsChecked(curVal, c) {
  return curVal.toString() === c.value.toString();
}
