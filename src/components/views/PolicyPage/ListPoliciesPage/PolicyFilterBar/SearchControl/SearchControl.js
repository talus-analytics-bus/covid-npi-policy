import React from "react";

import styles from "./SearchControl.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

let timeout;

const DateRangeControl = props => {
  const {
    setPolicyFilters,
    setStatus,
    searchTextInputValue,
    setSearchTextInputValue,
    // setPolicyObject,
  } = React.useContext(policyContext);

  const updateSearchFilter = text => {
    console.log("UpdateSearchFIlter");
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
    setSearchTextInputValue(value);
    clearTimeout(timeout);
    timeout = setTimeout(() => updateSearchFilter(value), 300);
  };

  const clearSearch = e => {
    e.preventDefault();
    setSearchTextInputValue("");

    setPolicyFilters(prev => ({
      ...prev,
      _text: undefined,
    }));
  };

  return (
    <label className={styles.searchControl}>
      <input
        type="text"
        value={searchTextInputValue}
        onChange={onChange}
        placeholder="search"
      />
      <button aria-label="Clear Search" onClick={clearSearch} />
    </label>
  );
};

export default DateRangeControl;
