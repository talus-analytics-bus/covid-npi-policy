import React from "react";
import axios from "axios";
import { feature } from "topojson";
import {
  geoAlbersUsa,
  geoPath,
  geoMercator,
  // These are for ortho
  // geoOrthographic,
  // geoCentroid,
} from "d3-geo";

import styles from "./MiniMap.module.scss";

// API:
// <MiniMap.Provider scope={'str'}/>
// manages the expensive API request and
// feature computation from the TopoJSON arcs
// in shared state across a set of minimaps.
// only one Provider should be rendered at a time.

const featureContext = React.createContext();

export const Provider = props => {
  const { scope } = props;
  const [features, setFeatures] = React.useState({
    countries: null,
    states: null,
    counties: null,
  });

  const featureContextValue = { features };

  React.useEffect(() => {
    const getUSTopology = async country => {
      axios.get("/maps/counties-10m.json").then(response => {
        const topology = response.data;

        // These topojson.feature() is an expensive computation
        // so we want this to only happen once, and keep the result
        setFeatures({
          states: feature(topology, topology.objects.states).features,
          counties: feature(topology, topology.objects.counties).features,
        });
      });
    };

    const getWorldTopology = async country => {
      axios.get("/maps/countries.json").then(response => {
        const topology = response.data;

        setFeatures({
          countries: feature(topology, topology.objects.countries_v13c_limited)
            .features,
        });
      });
    };

    if (scope === "USA") {
      getUSTopology();
    }
    if (scope === "world") {
      getWorldTopology();
    }
  }, [scope]);

  return (
    <featureContext.Provider value={featureContextValue}>
      {props.children}
    </featureContext.Provider>
  );
};

// API:
// <MiniMap country={} state={} counties={[]} />
// draws a single map with some features
// contained in the scope of the Provider

export const SVG = props => {
  const featureContextConsumer = React.useContext(featureContext);

  // both 500 to make it easy,
  // screen size will be set with CSS
  const width = 500;
  const height = 500;
  // const country = props.country || "USA";

  let paths = null;

  // TODO: combine these if statements
  if (featureContextConsumer.features.counties) {
    const state = featureContextConsumer.features.states.find(
      state => state.properties.name === props.state
    );
    const fips = state.id;

    const selectedCounties = featureContextConsumer.features.counties.filter(
      county => county.id.startsWith(fips)
    );

    const projection = geoAlbersUsa().fitSize([width, height], {
      type: "FeatureCollection",
      features: selectedCounties,
    });

    paths = selectedCounties.map((geometry, index) => {
      const path = geoPath().projection(projection)(geometry);
      return (
        <path
          key={index}
          fill={
            props.counties.includes(geometry.properties.name) ||
            props.counties[0] === "Unspecified"
              ? "#C1272D"
              : "#CCCCCC"
          }
          stroke={
            props.counties.includes(geometry.properties.name) ||
            props.counties[0] === "Unspecified"
              ? "#661417"
              : "#707070"
          }
          d={path}
        />
      );
    });
  }

  if (featureContextConsumer.features.countries) {
    const country = featureContextConsumer.features.countries.find(
      country => country.properties.ADM0_A3 === props.country
    );

    if (country === undefined) {
      return <></>;
    }

    const projection = geoMercator().fitSize([width, height], {
      type: "FeatureCollection",
      features: [country],
    });
    // .rotate(geoCentroid(country).map((x, i) => (i === 1 ? -23 : x * -1)));

    paths = featureContextConsumer.features.countries.map((geometry, index) => {
      const path = geoPath().projection(projection)(geometry);
      return (
        <path
          key={index}
          fill={
            geometry.properties.ADM0_A3 === props.country
              ? "#C1272D"
              : "#CCCCCC"
          }
          stroke={"#707070"}
          d={path}
        />
      );
    });
  }

  // console.count("render minmap SVG");
  return (
    <div className={styles.container}>
      {props.country && paths === null ? (
        <div className={styles.placeholder}>
          <em>loading map...</em>
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`}>
          <g transform={"scale(1)"}>{paths}</g>
        </svg>
      )}
    </div>
  );
};

// eslint-disable-next-line
import * as MiniMap from "./MiniMap";
export { MiniMap };
