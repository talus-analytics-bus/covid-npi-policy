import { InfoTooltip } from "src/components/common";
import React, { FC, useEffect, useState } from "react";
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
  onClick = undefined,
  indeterminate = false,
  setInfoTooltipContent,
  customClasses = [],
}) => {
  const checked: boolean = selectedOptions.some(o => o.value === value);
  const [inputId] = useState<string>("radio-" + Math.random().toString());
  useEffect(() => {
    const el: HTMLInputElement | null = document.getElementById(
      inputId
    ) as HTMLInputElement;
    // render indeterminate if applicable
    if (el !== null) el.indeterminate = indeterminate;
  }, [inputId, indeterminate]);

  // JSX // ---------------------------------------------------------------- //
  return (
    <div
      className={classNames(
        styles.optionRadio,
        styles.optionWidget,
        ...customClasses
      )}
    >
      <span>
        <input
          id={inputId}
          type={"checkbox"}
          value={value}
          checked={checked}
          readOnly={true}
          data-field={field}
          onClick={onClick}
        />
        <label htmlFor={inputId}>
          <span className={styles.optionLabel}>{name}</span>{" "}
          {description && (
            <InfoTooltip
              id={inputId}
              text={description}
              place={"left"}
              wide={false}
              {...{ setInfoTooltipContent }}
            />
          )}
        </label>
      </span>
      {checked && child && <IndentedChild>{child}</IndentedChild>}
    </div>
  );
};
