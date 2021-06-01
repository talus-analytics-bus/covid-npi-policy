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
   * The currently selected options in this option's set.
   */
  selectedOptions?: Option[];

  /**
   * True if this option is a default selection, false otherwise. The first one
   * will be used if there is no default.
   */
  readonly isDefault?: boolean;

  /**
   * A description of the option that will be shown as a tooltip.
   */
  readonly description?: string;

  /**
   * Indented child element shown only when this option is selected.
   */
  readonly child?: ReactElement;
}

export interface OptionWidget {
  /**
   * The title to show above the option widget, if any.
   */
  readonly title?: string;

  /**
   * The callback function called on the currently selected options whenever
   * they are altered.
   * @param selected {Option[]} The currently selected option(s)
   * @returns Nothing.
   */
  callback(selected: Option[]): void;
}
