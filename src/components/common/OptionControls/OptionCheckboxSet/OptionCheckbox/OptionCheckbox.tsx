import { InfoTooltip } from "components/common";
import React, { FC, useState } from "react";
import styles from "../../OptionControls.module.scss";
import { Option } from "../../types";
import { IndentedChild } from "../../IndentedChild/IndentedChild";
import classNames from "classnames";

export const OptionCheckbox: FC<Option> = ({
  name,
  value,
  selectedOptions = [],
  description,
  child,
  field = "",
}) => {
  const checked: boolean = selectedOptions.some(o => o.value === value);
  const [inputId] = useState<string>("radio-" + Math.random().toString());
  return (
    <div className={classNames(styles.optionRadio, styles.optionWidget)}>
      <span>
        <input
          id={inputId}
          type={"checkbox"}
          value={value}
          checked={checked}
          readOnly={true}
          data-field={field}
        />
        <label htmlFor={inputId}>
          {name}{" "}
          {description && (
            <InfoTooltip id={inputId} text={description} place={"left"} />
          )}
        </label>
      </span>
      {checked && child && <IndentedChild>{child}</IndentedChild>}
    </div>
  );
};
