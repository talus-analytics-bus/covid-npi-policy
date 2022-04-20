import { OptionCheckbox } from "src/components/common/OptionControls/OptionCheckboxSet/OptionCheckbox/OptionCheckbox";
import React, { FC } from "react";

type DownloadOptionsChoices = {
  /**
   * If true, Excel download includes all columns in dataset, otherwise it
   * only includes the summary table info shown on the Data page. Defaults
   * to false.
   */
  includeAllCols: boolean;
};

interface DownloadOptionsProps {
  choices: DownloadOptionsChoices;
}

export const DownloadOptions: FC<DownloadOptionsProps> = ({ choices }) => {
  return (
    <OptionCheckbox
      name={"Download all columns"}
      value={choices.includeAllCols.toString()}
    />
  );
};
