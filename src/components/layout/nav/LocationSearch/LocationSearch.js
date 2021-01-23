import React from "react";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";

import PlaceQuery from "../../../misc/PlaceQuery.js";

import styles from "./LocationSearch.module.scss";

const LocationSearch = () => {
  const [places, setPlaces] = React.useState();
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    const getPlaces = async () => {
      const allPlaces = await PlaceQuery({ place_type: ["country"] });
      setPlaces(allPlaces);
    };

    getPlaces();
  }, []);

  let fuse;
  if (places) {
    fuse = new Fuse(places, {
      keys: ["iso", "name"],
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
            <Link to={`/policies/${r.iso}/national`} key={r.iso}>
              {r.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
