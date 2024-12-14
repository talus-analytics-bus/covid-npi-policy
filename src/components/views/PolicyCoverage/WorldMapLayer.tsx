import { Layer, Source, FillLayer, LineLayer } from "react-map-gl";
import { MapType } from "./PolicyCoverage";

import coverage_by_place from "data/coverage_by_place";

export const worldMapBounds = [
  [-141.78623293980732, 60.46188253859922],
  [179.97107965372615, -54.77460938717267],
] as [[number, number], [number, number]];

export const COUNTRY_FILL_LAYER_ID = `world-countries-fill`;

type CoverageLevel = typeof coverage_by_place[number]["coverage"];

const coverageColors: Record<CoverageLevel, string> = {
  "No data": "rgba(212, 216, 220, 1)",
  Partial: "rgba(107, 182, 167, 1)",
  Complete: "rgba(54, 120, 108, 1)",
};

interface WorldMapLayerProps {
  mapType: MapType;
  hoveredPlaceName: string;
}

const WorldMapLayer = ({ mapType, hoveredPlaceName }: WorldMapLayerProps) => {
  const countryColorMatch = [];
  for (const { iso3, coverage } of coverage_by_place) {
    if (iso3 === "Unspecified") continue;
    countryColorMatch.push(iso3, coverageColors[coverage]);
  }
  countryColorMatch.push("white");

  const countryFill: FillLayer = {
    id: COUNTRY_FILL_LAYER_ID,
    type: `fill` as `fill`,
    "source-layer": `countries_slim_v13c03`,
    paint: {
      "fill-outline-color": "white",
      "fill-color": ["match", ["get", "ISO_A3"], ...countryColorMatch],
    },
  };

  const countryBorders: LineLayer = {
    id: `world-countries-outline`,
    type: `line` as `line`,
    "source-layer": `countries_slim_v13c03`,
    paint: {
      "line-color": `white`,
      "line-width": 2,
    },
    filter: ["==", "ISO_A3", hoveredPlaceName],
  };

  return (
    <Source
      id="world-countries"
      type="vector"
      url="mapbox://nicoletalus.92q1pclg"
    >
      <Layer
        key={countryFill.id}
        {...countryFill}
        // beforeId="country-label"
        layout={{ visibility: mapType === MapType.World ? "visible" : "none" }}
      />
      <Layer key={countryBorders.id} {...countryBorders} />
    </Source>
  );
};

export default WorldMapLayer;
