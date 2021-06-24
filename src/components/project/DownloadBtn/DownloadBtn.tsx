import { Export } from "api/Queries";
import { PrimaryButton } from "components/common";
import { Filters } from "components/common/MapboxMap/plugins/mapTypes";
import React, {
  ReactNode,
  Dispatch,
  SetStateAction,
  FC,
  ReactElement,
} from "react";

interface DownloadBtnProps {
  readonly styles: { [k: string]: string };
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
  styles,
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
    thisClassNames[styles[d]] = true;
  });
  // flag for whether the download button should say loading or not
  if (render)
    return (
      <PrimaryButton
        iconName={"get_app"}
        label={
          <div>
            {!buttonLoading && render && message}
            {buttonLoading && (
              <>
                <span>Downloading, please wait...</span>
              </>
            )}
          </div>
        }
        customClassNames={[styles.downloadBtn, ...Object.keys(thisClassNames)]}
        onClick={(e: Event) => {
          e.stopPropagation();
          if (class_name[0] === "All_data") {
            window.location.assign(
              "https://ghssidea.org/downloads/COVID%20AMP%20-%20Policy%20and%20Plan%20Data%20Export.xlsx"
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
            }).then(d => setButtonLoading(false));
          }
        }}
      />
    );
  else return null;
};

export default DownloadBtn;
