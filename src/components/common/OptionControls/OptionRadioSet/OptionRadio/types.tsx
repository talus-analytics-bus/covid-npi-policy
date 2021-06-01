import { Option } from "../../types";
export interface RadioOption extends Option {
  selectedOptions: Option[];
  onChange(e: any): void;
}
