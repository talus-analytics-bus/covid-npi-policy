import React from "react";

import styles from "./SearchControl.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

let timeout;

const DateRangeControl = props => {
  const {
    policyFilters,
    setPolicyFilters,
    setStatus,
    // setPolicyObject,
  } = React.useContext(policyContext);

  // local state to handle typing so that
  // updating the filter itself can debounced
  // set this to match the current value in filters
  // on component mount so that the text persists after navigation
  const [searchText, setSearchText] = React.useState(
    (policyFilters._text && policyFilters._text[0]) || ""
  );

  const updateSearchFilter = text => {
    // clear currently loaded policies
    // setPolicyObject({});
    // set new filters
    setPolicyFilters(prev => ({
      ...prev,
      _text: [text],
    }));
    // set status back to initial to return
    // to the loading state
    setStatus(prev => ({ ...prev, searchResults: "initial" }));
  };

  const onChange = event => {
    const value = event.target.value;

    // debounce by 250 ms so we don't spam the server
    setSearchText(value);
    clearTimeout(timeout);
    timeout = setTimeout(() => updateSearchFilter(value), 250);
  };

  return (
    <label className={styles.searchControl}>
      <input
        type="text"
        value={searchText}
        onChange={onChange}
        placeholder="search"
      />
    </label>
  );
};

export default DateRangeControl;
