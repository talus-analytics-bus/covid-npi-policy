import classNames from "classnames";
import React, { FC, useEffect, useState } from "react";
import styles from "../OptionControls.module.scss";
import { Option, OptionWidget } from "../types";
import { OptionRadio } from "./OptionRadio/OptionRadio";

interface OptionRadioSetProps extends OptionWidget {}

export const OptionRadioSet: FC<OptionRadioSetProps> = ({
  title,
  options,
  selectedOptions,
  callback,
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
            {...{
              ...o,
              selectedOptions,
              key: o.value,
            }}
          />
        ))}
      </section>
    </div>
  );
};
export default OptionRadioSet;
