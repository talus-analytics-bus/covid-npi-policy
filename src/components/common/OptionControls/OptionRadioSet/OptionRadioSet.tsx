import React, { FC, useEffect, useState } from "react";
import styles from "../OptionControls.module.scss";
import { Option, OptionWidget } from "../types";
import { OptionRadio } from "./OptionRadio/OptionRadio";

interface OptionRadioSetProps extends OptionWidget {
  /**
   * List of radio options to show.
   */
  options: Option[];

  /**
   * The default option
   */
  // defaultOption: Option;
  selectedOptions: Option[];
}

export const OptionRadioSet: FC<OptionRadioSetProps> = ({
  title,
  options,
  selectedOptions,
  callback,
}) => {
  return (
    <div className={styles.optionRadioSet}>
      {title && <span>{title}</span>}
      <section>
        {options.map(o => (
          <OptionRadio
            {...{
              ...o,
              selectedOptions,
              key: o.value,
              onChange: e => {
                // get click element value
                console.log(e.target);
                const el: HTMLInputElement = e.target as HTMLInputElement;

                // set selected options to option with that value
                const newSelectedOptions: Option[] = options.filter(
                  o => o.value === el.value
                );
                callback(newSelectedOptions);
              },
            }}
          />
        ))}
      </section>
    </div>
  );
};
export default OptionRadioSet;
