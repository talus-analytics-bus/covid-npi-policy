import { FC } from "react";
import { DownloadBtn } from "..";

const DataDownloadBtn: FC<any> = ({
  class_name,
  classNameForApi,
  buttonLoading,
  setButtonLoading,
  message,
  tableIsReady,
  query,
  filters,
  data,
}) => {
  return (
    <DownloadBtn
      {...{
        render: tableIsReady,
        class_name,
        classNameForApi,
        buttonLoading,
        setButtonLoading,
        searchText: query.searchText,
        filters,
        disabled: data && data.length === 0,
        message,
      }}
    />
  );
};

export default DataDownloadBtn;
