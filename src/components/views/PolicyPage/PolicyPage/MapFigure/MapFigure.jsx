import React from "react";

import * as MiniMap from "../../MiniMap/MiniMap";

import styles from "./MapFigure.module.scss";

const MapFigure = ({ state, policy }) => {
  let locationTitle = policy && policy.auth_entity[0].place.area2;
  if (locationTitle === "Unspecified")
    locationTitle = policy && policy.auth_entity[0].place.area1;

  return (
    <figure className={styles.miniMapHolder}>
      <figcaption>
        <h4>{locationTitle}</h4>
        This policy was authorized by {locationTitle} and affects ....
      </figcaption>
      <MiniMap.SVG
        country={
          policy && policy.place && policy.place.map(place => place.iso3)
        }
        state={state && state}
        counties={
          policy
            ? policy.place
              ? [...policy.place.map(place => place.area2.split(" County")[0])]
              : []
            : []
        }
      />
    </figure>
  );
};

export default MapFigure;
