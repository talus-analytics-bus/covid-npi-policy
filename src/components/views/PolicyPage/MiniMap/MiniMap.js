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

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

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

  const featureContextValue = { features, scope: scope };

  React.useEffect(() => {
    console.log("MiniMap topology");
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
          countries: feature(topology, topology.objects.countries).features,
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
// <MiniMap countries={[]} state={} counties={[]} />
// draws a single map with some features
// contained in the scope of the Provider

export const SVG = props => {
  const featureContextConsumer = React.useContext(featureContext);

  // both 500 to make it square,
  // screen size will be set with CSS
  const width = 250;
  const height = 250;

  // let paths = null;

  // TODO: combine these if statements

  const {
    counties: propsCounties,
    country: propsCountries,
    state: propsState,
  } = props;

  let paths = React.useMemo(() => {
    let paths;

    if (
      featureContextConsumer.scope === "USA" &&
      featureContextConsumer.features.counties
    ) {
      // console.count("create paths");
      const state = featureContextConsumer.features.states.find(
        state => state.properties.name === propsState
      );

      if (!state) return "none";

      const fips = state.id;

      const selectedCounties = featureContextConsumer.features.counties.filter(
        county => county.id.startsWith(fips)
      );

      let projection;
      // using geoalbers projection for alaska because it
      // looks tiny in mercator
      if (fips === "02") {
        projection = geoAlbersUsa().fitSize([width, height], {
          type: "FeatureCollection",
          features: selectedCounties,
        });
      } else {
        // using mercator for other states for familiarity and
        // because Albers is undefined for some US territories
        projection = geoMercator().fitSize([width, height], {
          type: "FeatureCollection",
          features: selectedCounties,
        });
      }

      paths = selectedCounties.map((geometry, index) => {
        const path = geoPath().projection(projection)(geometry);
        return (
          <Tippy content={geometry.properties.name + " county"}>
            <path
              key={index}
              fill={
                propsCounties.includes(geometry.properties.name) ||
                propsCounties[0] === "Unspecified"
                  ? "#4E8490"
                  : "#ffffff"
              }
              stroke={
                propsCounties.includes(geometry.properties.name) ||
                propsCounties[0] === "Unspecified"
                  ? "#ffffff"
                  : "#707070"
              }
              d={path}
            />
          </Tippy>
        );
      });
    }

    if (
      propsCountries &&
      featureContextConsumer.scope === "world" &&
      featureContextConsumer.features.countries
    ) {
      const countries = featureContextConsumer.features.countries.filter(
        country => propsCountries.includes(country.properties.ADM0_A3)
      );

      if (!countries === undefined) return "none";

      const projection = geoMercator().fitSize([width, height], {
        type: "FeatureCollection",
        features: countries,
      });
      // .rotate(geoCentroid(country).map((x, i) => (i === 1 ? -23 : x * -1)));

      paths = featureContextConsumer.features.countries.map(
        (geometry, index) => {
          const path = geoPath().projection(projection)(geometry);
          return (
            <path
              key={index}
              fill={
                propsCountries.includes(geometry.properties.ADM0_A3)
                  ? "#4E8490"
                  : "#ffffff00"
              }
              stroke={
                "#707070"
                // propsCountries.includes(geometry.properties.ADM0_A3)
                //   ? "#707070"
                //   : "#70707020"
              }
              d={path}
            />
          );
        }
      );
    }
    return paths;
  }, [
    featureContextConsumer.features.counties,
    featureContextConsumer.features.countries,
    featureContextConsumer.features.states,
    featureContextConsumer.scope,
    propsCounties,
    propsCountries,
    propsState,
  ]);

  // console.count("render minmap SVG");
  return (
    <>
      {paths !== "none" ? (
        <div className={styles.container}>
          {propsCountries && paths === null ? (
            <div className={styles.placeholder}>
              <em>loading map...</em>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              // style={{ overflow: "visible", zIndex: -1, position: "relative" }}
            >
              <g transform={"scale(1)"}>{paths}</g>
            </svg>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

// eslint-disable-next-line
import * as MiniMap from "./MiniMap";
export { MiniMap };
