import { InfoTooltip } from "components/common";
import { FC, useState } from "react";
import styles from "../../OptionControls.module.scss";
import { Option } from "../../types";
import { IndentedChild } from "../../IndentedChild/IndentedChild";
import classNames from "classnames";

export const OptionRadio: FC<Option> = ({
  name,
  value,
  selectedOptions = [],
  description,
  child,
  setInfoTooltipContent = () => {},
  infoTooltipSize,
}) => {
  const checked: boolean = selectedOptions.some(o => o.value === value);
  const [inputId] = useState<string>("radio-" + Math.random().toString());
  return (
    <div className={classNames(styles.optionRadio, styles.optionWidget)}>
      <span>
        <input
          id={inputId}
          type={"radio"}
          value={value}
          checked={checked}
          readOnly={true}
        />
        <label htmlFor={inputId}>
          <span className={styles.optionLabel}>
            <span>
              {name}
              {description && (
                <InfoTooltip
                  id={inputId}
                  text={description}
                  place={"left"}
                  wide={false}
                  iconSize={infoTooltipSize}
                  {...{ setInfoTooltipContent }}
                />
              )}
            </span>
          </span>
        </label>
      </span>
      {checked && child && <IndentedChild>{child}</IndentedChild>}
    </div>
  );
};
