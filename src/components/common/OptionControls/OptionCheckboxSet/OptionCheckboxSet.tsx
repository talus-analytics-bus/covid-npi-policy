import React, { FC, useEffect, useRef, useState } from "react";
import styles from "../OptionControls.module.scss";
import { Option, OptionWidget } from "../types";
import { OptionCheckbox } from "./OptionCheckbox/OptionCheckbox";

interface OptionRadioSetProps extends OptionWidget {
  /**
   * The data field with which this checkbox set is associated.
   */
  field: string;
  emptyMeansAll?: boolean;

  /**
   * True if a "Select all" checkbox should be included at the top
   */
  selectAll?: boolean;
}

export const OptionCheckboxSet: FC<OptionRadioSetProps> = ({
  title,
  options,
  selectedOptions,
  callback,
  field,
  emptyMeansAll = false,
  selectAll = false,
}) => {
  let setRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (emptyMeansAll) callback(options);
  }, []);

  const allSelected: boolean = selectedOptions.length === options.length;
  const someSelected: boolean = selectedOptions.length > 0;
  const selectAllIndeterminate = selectAll && !allSelected && someSelected;

  return (
    <div className={styles.optionRadioSet}>
      {title && <div className={styles.title}>{title}</div>}
      <section
        ref={setRef}
        onChange={e => {
          // prevent events from propagating up to parent radio sets, if any
          e.stopPropagation();

          // get click element value
          const clickedEl: HTMLInputElement = e.target as HTMLInputElement;
          const clickedVal = clickedEl.value;
          const ignore = !clickedEl.checked;
          const setEl: HTMLDivElement | null = setRef.current;
          if (setEl !== null) {
            const inputs = setEl.querySelectorAll(
              `input:checked[type='checkbox'][data-field='${field}']`
            );
            // set selected options to option with that value
            const newSelectedOptions: Option[] = [];
            inputs.forEach(
              (value: Element, key: number, parent: NodeListOf<Element>) => {
                const match: Option | undefined = options.find(
                  o => o.value === value.getAttribute("value")
                );
                if (match && (!ignore || match.value !== clickedVal))
                  newSelectedOptions.push(match);
              }
            );
            if (!ignore) {
              const match = options.find(o => o.value === clickedVal);
              if (
                match &&
                !newSelectedOptions.find(o => o.value === match.value)
              )
                newSelectedOptions.push(match);
            }
            if (clickedVal === "all") {
              const allSelected: boolean =
                newSelectedOptions.length === options.length;
              if (allSelected) callback([]);
              return;
            }

            if (emptyMeansAll && newSelectedOptions.length === 0)
              callback(options);
            else callback(newSelectedOptions);
          }
        }}
      >
        {selectAll && (
          <OptionCheckbox
            name={"Select all"}
            value={"all"}
            key={"select-all"}
            selectedOptions={
              allSelected ? [{ name: "Select all", value: "all" }] : []
            }
            field={"special-all"}
            onClick={() => {
              callback(options);
            }}
            indeterminate={selectAllIndeterminate}
          />
        )}
        {options.map(o => (
          <OptionCheckbox
            {...{
              ...o,
              selectedOptions,
              key: o.value,
              field,
            }}
          />
        ))}
      </section>
    </div>
  );
};
export default OptionCheckboxSet;
