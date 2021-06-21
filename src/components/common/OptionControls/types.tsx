import { ReactElement } from "react-transition-group/node_modules/@types/react";

export interface Option {
  /**
   * The name of the option shown in radio sets, etc.
   */
  readonly name: string;

  /**
   * The value of the option used in data processes.
   */
  readonly value: string | number;

  /**
   * The value of the parent option of this option, if any
   */
  readonly parent?: string | number;

  /**
   * The currently selected options in this option's set.
   */
  selectedOptions?: Option[] | never[];

  // /**
  //  * Change event handler function called when input changes.
  //  * @param e {React.ChangeEvent<HTMLInputElement>} Change event
  //  */
  // onChange(e: ChangeEvent<HTMLInputElement>): void;

  /**
   * A description of the option that will be shown as a tooltip.
   */
  readonly description?: string | ReactElement;

  /**
   * Indented child element shown only when this option is selected.
   */
  readonly child?: ReactElement;

  /**
   * The data field with which this option is associated.
   */
  readonly field?: string;

  /**
   * Function called when option is clicked, for special options like the
   * "Select all" option.
   */
  onClick?(): void;

  /**
   * True if this option is a checkbox that should be rendered as indeterminate
   * and false otherwise.
   */
  indeterminate?: boolean;

  /**
   * Optional: Function to set tooltip content. If undefined, tooltip will be
   * rendered inside component.
   */
  setInfoTooltipContent?(): void;

  /**
   * Optional: Function called on an option value to determine whether this
   * option is considered checked.
   * @param v The value of the child option.
   */
  isChecked?(v: string | number): boolean;
}

export interface OptionWidget {
  /**
   * The title to show above the option widget, if any.
   */
  readonly title?: string;

  /**
   * List of options to show.
   */
  options: Option[];

  /**
   * The selected options
   */
  selectedOptions: Option[];

  /**
   * The callback function called on the currently selected options whenever
   * they are altered.
   * @param selected {Option[]} The currently selected option(s)
   * @returns Nothing.
   */
  callback(selected: Option[]): void;

  /**
   * Custom styles to apply to widget container (div).
   */
  customStyle?: Record<string, any>;

  /**
   * Optional: Function to set tooltip content. If undefined, tooltip will be
   * rendered inside component.
   */
  setInfoTooltipContent?(): void;
}

export type OptionSetEntry = {
  id: number;
  group?: string;
  label: string;
  value: string;
};

// export type FilterDefs = {

// }

// export type FilterDefEntry = {
//   field: string;
//   entity_name: "Policy";
//   label: string;
//   radio: boolean;
//   defaultRadioValue
// }
