// 3rd party packages
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEventHandler,
  FC,
  ReactElement,
} from "react";

// assets and styles
import styles from "./search.module.scss";

interface SearchProps {
  /**
   * Function called taking the search value that has just been entered as an
   * argument and performing behaviors in response to searching, usually
   * setting the value shown in the search bar or elsewhere.
   * @param val The search value that has just been entered.
   */
  onChangeFunc(val: string | null): void;

  /**
   * The search text.
   */
  searchText: string | null;
}

/**
 * Text search bar.
 * @method Search
 */
export const Search: FC<SearchProps> = ({
  onChangeFunc,
  searchText,
}): ReactElement => {
  const [curTimeout, setCurTimeout] = useState<NodeJS.Timeout | null>(null);
  let searchRef = useRef<HTMLInputElement>(null);

  // when search text changes, update search text shown in search bar input
  useEffect(() => {
    if (searchRef.current === null) return;
    else {
      if (searchText === null) {
        searchRef.current.value = "";
      } else searchRef.current.value = searchText;
    }
  }, [searchText]);
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (curTimeout !== null) clearTimeout(curTimeout);
      const v = e.target.value !== "" ? e.target.value : null;
      const newTimeout = setTimeout(() => {
        onChangeFunc(v);
      }, 500);
      setCurTimeout(newTimeout);
    },
    [curTimeout, onChangeFunc]
  );
  return (
    <div className={styles.search}>
      <input
        onChange={onChange}
        type="text"
        placeholder="search for..."
        ref={searchRef}
      />
      <i className={"material-icons"}>search</i>
    </div>
  );
};

export default Search;
