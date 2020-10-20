import React from "react";
import axios from "axios";
import { feature } from "topojson";
import { geoAlbersUsa, geoPath } from "d3-geo";

import styles from "./MiniMap.module.scss";

// API:
// <MiniMap.Provider scope={'str'}/>
// manages the expensive API request and
// feature computation from the TopoJSON arcs
// in shared state across a set of minimaps.
// only one Provider should be rendered at a time.

const featureContext = React.createContext();

export const Provider = props => {
  const [features, setFeatures] = React.useState({
    countries: null,
    states: null,
    counties: null,
  });

  const featureContextValue = { features };

  React.useEffect(() => {
    const getTopology = async country => {
      axios.get("/maps/counties-albers-10m.json").then(response => {
        const topology = response.data;

        // These topojson.feature() is an expensive computation
        // so we want this to only happen once, and keep the result
        setFeatures({
          // countries: feature(topology, topology.objects.nation).features,
          states: feature(topology, topology.objects.states).features,
          counties: feature(topology, topology.objects.counties).features,
        });
      });
    };

    getTopology(props.scope);
  }, [props.scope]);

  return (
    <featureContext.Provider value={featureContextValue}>
      {props.children}
    </featureContext.Provider>
  );
};

// API:
// <MiniMap country={} state={} county={} />
// draws a single map with some features
// contained in the scope of the Provider

export const SVG = props => {
  const featureContextConsumer = React.useContext(featureContext);

  // both 500 to make it easy,
  // screen size will be set with CSS
  const width = 500;
  const height = 500;
  // const country = props.country || "USA";

  let countyPaths = null;

  console.log(props.state);

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

    countyPaths = selectedCounties.map((geometry, index) => {
      const path = geoPath().projection(projection)(geometry);
      return (
        <path
          key={geometry.properties.name}
          fill={"#CCCCCC"}
          stroke={"#707070"}
          d={path}
          // style={{
          //   fill: props.color,
          //   strokeWidth: props.darkLines ? 1 : 0.5,
          //   stroke: props.darkLines ? `rgba(100, 100, 100, 1)` : "white",
          // }}
        />
      );
    });
  }

  return (
    <div className={styles.container}>
      {props.state && countyPaths === null ? (
        <div className={styles.placeholder}>
          <em>loading map...</em>
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`}>{countyPaths}</svg>
      )}
    </div>
  );
};
