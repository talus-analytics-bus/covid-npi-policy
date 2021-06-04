import React, { FC } from "react";
import { Option, OptionWidget } from "../types";
import styles from "../OptionControls.module.scss";
import classNames from "classnames";
import { InfoTooltip } from "components/common";

interface OptionSelectProps extends OptionWidget {}
export const OptionSelect: FC<OptionSelectProps> = ({
  title,
  options,
  selectedOptions,
  callback,
  customStyle = {},
}) => {
  return (
    <div className={classNames(styles.optionWidget, styles.optionSelect)}>
      {title && (
        <div className={styles.titleAndTooltip}>
          <div className={styles.title}>{title}</div>{" "}
          {selectedOptions.length > 0 && selectedOptions[0].description && (
            <InfoTooltip
              id={"selectTooltip"}
              text={selectedOptions[0].description}
              place={"left"}
            />
          )}
        </div>
      )}
      <select
        value={
          selectedOptions.length > 0
            ? selectedOptions[0].value
            : options[0].value
        }
        onChange={e => {
          const el: HTMLSelectElement = e.target;
          const newSelectedOptions: Option[] = options.filter(
            o => o.value === el.value
          );
          callback(newSelectedOptions);
        }}
        style={customStyle}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
};
