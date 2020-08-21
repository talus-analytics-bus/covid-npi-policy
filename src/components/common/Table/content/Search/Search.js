// standard packages
import React, { useState, useEffect, useRef } from "react";

// assets and styles
import styles from "./search.module.scss";
import classNames from "classnames";

/**
 * @method Search
 * Handle custom pagination for `Table` component
 */
export const Search = ({ onChangeFunc = val => {}, searchText, ...props }) => {
  const [curTimeout, setCurTimeout] = useState(null);
  let searchRef = useRef(null);

  useEffect(() => {
    if (searchText === null) {
      searchRef.current.value = "";
    }
  }, [searchText]);
  return (
    <div className={styles.search}>
      <input
        onChange={e => {
          clearTimeout(curTimeout);
          const v = e.target.value !== "" ? e.target.value : null;
          const newTimeout = setTimeout(() => {
            onChangeFunc(v);
          }, 500);
          setCurTimeout(newTimeout);
        }}
        type="text"
        placeholder="search for..."
        ref={searchRef}
      />
      <i className={"material-icons"}>search</i>
    </div>
  );
};

export default Search;
