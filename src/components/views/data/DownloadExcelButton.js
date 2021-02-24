import React from "react";
import { PrimaryButton } from "../../common";
import { Export } from "../../misc/Queries.js";
import { comma } from "../../misc/Util.js";
import styles from "./data.module.scss";

export const DownloadExcelButton = ({
  render = true,
  message = "Download",
  class_name = [],
  classNameForApi,
  filters,
  disabled,
  searchText,
  buttonLoading = false,
  setButtonLoading = () => "",
}) => {
  // define custom class names
  const thisClassNames = {
    [styles.loading]: buttonLoading || disabled,
  };
  class_name.forEach(d => {
    thisClassNames[styles[d]] = true;
  });
  // flag for whether the download button should say loading or not
  return (
    render && (
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
        onClick={e => {
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
    )
  );
};

export function DownloadStatusMessage({
  data,
  nouns,
  hasFilters,
  numInstances,
}) {
  return (
    <span key={"download_status_message"}>
      {data && data.length === 0 && <>No {nouns.p.toLowerCase()} found</>}
      {data && data.length > 0 && (
        <>
          <span className={styles.primaryText}>
            Download {!hasFilters ? "all" : "filtered"} data
          </span>
          <br />({comma(numInstances)}{" "}
          {numInstances !== 1
            ? nouns.p.toLowerCase()
            : nouns.s.toLowerCase().replace("_", " ")}
          , .xlsx)
        </>
      )}
    </span>
  );
}
