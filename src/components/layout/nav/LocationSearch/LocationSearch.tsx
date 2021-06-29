// 3rd party packages
import React, { FC, KeyboardEventHandler, ReactElement } from "react";
import Fuse, { FuseOptions } from "fuse.js";
import { Link } from "react-router-dom";
import axios from "axios";

// styles
import styles from "./LocationSearch.module.scss";

// local helper functions
import { removeParenthetical } from "components/misc/UtilsTyped";

// custom hooks
import useHistory from "components/common/hooks/useHistory";
import { PlaceRecord } from "components/misc/dataTypes";
import { KeyboardEvent } from "react";

// constants
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Provide a search bar and results list to find and select places.
 * @returns {ReactElement} LocationSearch function component
 */
const LocationSearch: FC = (): ReactElement => {
  const [places, setPlaces] = React.useState<PlaceRecord[]>();
  const [searchValue, setSearchValue] = React.useState("");

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const getPlaces = async () => {
      const params = new URLSearchParams();
      params.append("fields", "id");
      params.append("fields", "loc");
      params.append("fields", "iso3");
      params.append("fields", "level");
      params.append("include_policy_count", "true");
      params.append("levels", "country");
      params.append("levels", "Tribal nation");

      const countries = await axios(`${API_URL}/get/place`, { params });

      params.append("fields", "level");
      params.set("levels", "state / province");
      params.append("iso3", "usa");

      const states = await axios(`${API_URL}/get/place`, { params });

      const allPlaces = [...countries.data.data, ...states.data.data];

      const disallowedSubstrings = ["county", "city"];
      const filteredPlaces: PlaceRecord[] = allPlaces.filter(
        place =>
          !disallowedSubstrings.some(sub =>
            place.loc.toLowerCase().includes(sub)
          )
      );

      setPlaces(filteredPlaces);
    };

    getPlaces();
  }, []);

  let fuse;
  if (places) {
    const options: Fuse.FuseOptions<PlaceRecord> = {
      keys: ["iso3", "loc"],
    };
    fuse = new Fuse<PlaceRecord, FuseOptions<PlaceRecord>>(places, options);
  }

  const resultsTmp: PlaceRecord[] =
    fuse !== undefined
      ? (fuse.search<PlaceRecord>(searchValue) as PlaceRecord[])
      : [];
  const results: PlaceRecord[] = resultsTmp.filter(
    (pl: PlaceRecord) => pl.loc !== "United States of America (USA)"
  );

  const history = useHistory();

  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (
    e: KeyboardEvent
  ) => {
    if (e.key === "Enter") {
      if (results === undefined) return;
      const r = results[0];
      if (r === undefined || r.loc === undefined) return;
      const url: string =
        r.level !== "Country"
          ? `/policies/${r.iso3}/${r.loc.split(",")[0]}`
          : `/policies/${r.iso3}/national`;

      // update history state and navigate to URL
      history.pushState({}, "", url);
      dispatchEvent(new PopStateEvent("popstate"));

      if (inputRef.current !== null && inputRef.current !== undefined)
        inputRef.current.blur();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
  };
  return (
    <div className={styles.searchContainer}>
      <input
        autoFocus
        ref={inputRef}
        onKeyPress={handleKeyPress}
        className={styles.searchBar}
        type="text"
        value={searchValue}
        onChange={onChange}
        placeholder="Search for location"
      />
      {results && (
        <div className={styles.results}>
          {results.length > 0 && (
            <div className={styles.header}>
              <span>Place</span>
              {/* <span>National Policy Count</span> */}
            </div>
          )}
          {results.slice(0, 4).map(r => {
            if (r.loc === undefined || r.level === null) return null;
            else
              return (
                <Link
                  className={
                    r.level ? styles.stateResult : styles.countryResult
                  }
                  to={{
                    pathname: r.level
                      ? `/policies/${r.iso3}/${r.loc.split(",")[0]}`
                      : `/policies/${r.iso3}/national`,
                    state: undefined,
                  }}
                  key={r.loc + r.level}
                >
                  <span>{removeParenthetical(r.loc)}</span>
                  <span>{/* <strong>{r.n_policies}</strong> */}</span>
                </Link>
              );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
