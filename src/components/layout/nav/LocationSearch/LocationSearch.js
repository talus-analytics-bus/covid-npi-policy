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
      // const allPlaces = await PlaceQuery({ place_type: ["country"] });

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

      console.log(countries);
      console.log(states);

      setPlaces([...countries.data.data, ...states.data.data]);
    };

    getPlaces();
  }, []);

  let fuse;
  if (places) {
    fuse = new Fuse(places, {
      keys: ["iso3", "loc", "level"],
    });
  }

  const results = fuse && fuse.search(searchValue);

  return (
    <div>
      <input
        type="text"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
      />
      {results && (
        <div className={styles.resuls}>
          {results.slice(0, 4).map(r => (
            <Link
              to={{
                pathname: r.level
                  ? `/policies/${r.iso3}/${r.loc.split(",")[0]}`
                  : `/policies/${r.iso3}/national`,
                state: undefined,
              }}
              key={r.loc}
            >
              {r.loc}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
