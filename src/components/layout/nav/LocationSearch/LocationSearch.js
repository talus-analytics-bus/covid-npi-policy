import React from "react";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";
import axios from "axios";

// import PlaceQuery from "../../../misc/PlaceQuery.js";

import styles from "./LocationSearch.module.scss";

const API_URL = process.env.REACT_APP_API_URL;

const LocationSearch = () => {
  const [places, setPlaces] = React.useState();
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    const getPlaces = async () => {
      let params = new URLSearchParams();
      params.append("fields", "id");
      params.append("fields", "loc");
      params.append("fields", "iso3");
      params.append("include_policy_count", "true");
      params.append("level", "country");

      const countries = await axios(`${API_URL}/get/place`, { params });

      params.append("fields", "level");
      params.set("level", "state / province");
      params.append("iso3", "usa");

      const states = await axios(`${API_URL}/get/place`, { params });

      const allPlaces = [...countries.data.data, ...states.data.data];

      const disalowedSubstrings = ["county", "city"];
      const filteredPlaces = allPlaces.filter(
        place =>
          !disalowedSubstrings.some(sub =>
            place.loc.toLowerCase().includes(sub)
          )
      );

      setPlaces(filteredPlaces);
    };

    getPlaces();
  }, []);

  let fuse;
  if (places) {
    fuse = new Fuse(places, {
      keys: ["iso3", "loc", "level"],
    });
  }

  const results =
    fuse &&
    fuse
      .search(searchValue)
      .filter(r => r.loc !== "United States of America (USA)");

  return (
    <div className={styles.searchContainer}>
      <input
        className={styles.searchBar}
        type="text"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        placeholder="Search for location"
      />
      {results && (
        <div className={styles.results}>
          {results.length > 0 && (
            <div className={styles.header}>
              <span>Place</span> <span>National Policy Count</span>
            </div>
          )}
          {results.slice(0, 4).map(r => (
            <Link
              className={styles.result}
              to={{
                pathname: r.level
                  ? `/policies/${r.iso3}/${r.loc.split(",")[0]}`
                  : `/policies/${r.iso3}/national`,
                state: undefined,
              }}
              key={r.loc + r.level}
            >
              <span>{r.loc.replace(/\([A-Z]*\)/, "")}</span>
              <span>
                <strong>{r.n_policies}</strong>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
