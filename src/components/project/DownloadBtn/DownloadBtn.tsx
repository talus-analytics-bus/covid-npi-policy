import { Export } from "api/Queries";
import { LoadingSpinner, PrimaryButton } from "components/common";
import { Filters } from "components/common/MapboxMap/plugins/mapTypes";
import React, {
  ReactNode,
  Dispatch,
  SetStateAction,
  FC,
  ReactElement,
} from "react";

// styles and assets
import styles from "./DownloadBtn.module.scss";

interface DownloadBtnProps {
  render: boolean;
  message: string | ReactNode;
  class_name: string[];
  classNameForApi: string;
  filters: Filters;
  disabled: boolean | null;
  searchText: string | null;
  buttonLoading: boolean;
  setButtonLoading?: Dispatch<SetStateAction<boolean>>;
}

export const DownloadBtn: FC<DownloadBtnProps> = ({
  render = true,
  message = "Download",
  class_name = [],
  classNameForApi,
  filters,
  disabled,
  searchText,
  buttonLoading = false,
  setButtonLoading = () => "",
}): ReactElement | null => {
  // define custom class names
  const thisClassNames: Record<string, boolean> = {};
  if (buttonLoading || disabled) thisClassNames[styles.inactive] = true;
  class_name.forEach(d => {
    thisClassNames[d] = true;
  });
  // flag for whether the download button should say loading or not
  if (render)
    return (
      <PrimaryButton
        isSecondary={class_name.includes("secondary")}
        iconName={!buttonLoading ? "get_app" : null}
        label={
          <div>
            {!buttonLoading && render && message}
            {buttonLoading && (
              <div className={styles.spinnerAndText}>
                <LoadingSpinner inline small />
                <div>Downloading, please wait...</div>
              </div>
            )}
          </div>
        }
        customClassNames={[styles.downloadBtn, ...Object.keys(thisClassNames)]}
        onClick={(e: Event) => {
          e.stopPropagation();
          if (class_name[0] === "All_data") {
            window.location.assign(
              `${process.env.REACT_APP_API_URL}/export/static/full`
              // "https://ghssidea.org/downloads/COVID%20AMP%20-%20Policy%20and%20Plan%20Data%20Export.xlsx"
            );
          } else if (class_name[0] === "All_data_summary") {
            window.location.assign(
              `${process.env.REACT_APP_API_URL}/export/static/summary`
              // "https://ghssidea.org/downloads/COVID%20AMP%20-%20Policy%20and%20Plan%20Data%20Export%20%summary%29.xlsx"
            );
          } else {
            setButtonLoading(true);

            Export({
              method: "post",
              filters: {
                ...filters,
                _text: searchText !== null ? [searchText] : [],
              },
              class_name: classNameForApi,
            }).then(() => {
              setButtonLoading(false);
            });
          }
        }}
      />
    );
  else return null;
};

export default DownloadBtn;
