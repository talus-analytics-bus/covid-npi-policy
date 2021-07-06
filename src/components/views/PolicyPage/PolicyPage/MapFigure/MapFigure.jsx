import React from "react";

import * as MiniMap from "../../MiniMap/MiniMap";

import styles from "./MapFigure.module.scss";

const MapFigure = ({ state, policy, policyPlace }) => {
  let locationTitle =
    policyPlace && policyPlace.loc.split(",")[0].split("(")[0];

  return (
    <figure className={styles.miniMapHolder}>
      <div className={styles.mapHolder}>
        <MiniMap.SVG
          country={
            policy && policy.place && policy.place.map(place => place.iso3)
          }
          state={state && state}
          counties={
            policy
              ? policy.place
                ? [
                    ...policy.place.map(
                      place => place.area2.split(" County")[0]
                    ),
                  ]
                : []
              : []
          }
        />
      </div>
      <figcaption>
        This policy was authorized by {locationTitle} and affects ....
      </figcaption>
    </figure>
  );
};

export default MapFigure;
