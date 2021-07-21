import { FC } from "react";
import classNames from "classnames";
import { Option, OptionWidget } from "../types";
import { OptionRadio } from "./OptionRadio/OptionRadio";
import styles from "../OptionControls.module.scss";

interface OptionRadioSetProps extends OptionWidget {}

export const OptionRadioSet: FC<OptionRadioSetProps> = ({
  title,
  options,
  selectedOptions,
  callback,
  setInfoTooltipContent = () => {},
  infoTooltipSize,
}) => {
  return (
    <div className={classNames(styles.optionRadioSet, styles.optionWidget)}>
      {title && (
        <div className={styles.titleAndTooltip}>
          <div className={styles.title}>{title}</div>
        </div>
      )}
      <section
        onChange={e => {
          // prevent events from propagating up to parent radio sets, if any
          e.stopPropagation();

          // get click element value
          const el: HTMLInputElement = e.target as HTMLInputElement;

          // set selected options to option with that value
          const newSelectedOptions: Option[] = options.filter(
            o => o.value === el.value
          );
          callback(newSelectedOptions);
        }}
      >
        {options.map(o => (
          <OptionRadio
            key={o.value}
            {...{
              ...o,
              selectedOptions,
              setInfoTooltipContent,
              infoTooltipSize,
            }}
          />
        ))}
      </section>
    </div>
  );
};
export default OptionRadioSet;
