import { InfoTooltip } from "components/common";
import React, { FC, useState } from "react";
import styles from "../../OptionControls.module.scss";
import { RadioOption } from "./types";
import { IndentedChild } from "./IndentedChild/IndentedChild";
import classNames from "classnames";

export const OptionRadio: FC<RadioOption> = ({
  name,
  value,
  selectedOptions,
  description,
  child,
  onChange,
}) => {
  const checked: boolean = selectedOptions.some(o => o.value === value);
  const [inputId] = useState<string>("radio-" + Math.random().toString());
  return (
    <div className={classNames(styles.optionRadio, styles.optionWidget)}>
      <input
        onChange={onChange}
        id={inputId}
        type={"radio"}
        value={value}
        checked={checked}
      />
      <label htmlFor={inputId}>{name}</label>
      {description && (
        <InfoTooltip id={inputId} text={description} place={"top"} />
      )}
      {checked && child && <IndentedChild>{child}</IndentedChild>}
    </div>
  );
};
