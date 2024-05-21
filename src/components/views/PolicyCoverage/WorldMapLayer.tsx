import Layer from "react-map-gl/dist/esm/components/layer";
import Source from "react-map-gl/dist/esm/components/source";

export const worldMapBounds = [
  [-141.78623293980732, 60.46188253859922],
  [179.97107965372615, -54.77460938717267],
] as [[number, number], [number, number]];

interface WorldMapProps {
  mapType: MapType;
  hoveredPlaceName: string;
}

export const COUNTRY_FILL_LAYER_ID = `world-countries-fill`;

import coverage_by_place from "data/coverage_by_place";
import { FillLayer, LineLayer } from "mapbox-gl";
import { MapType } from "./PolicyCoverage";

type CoverageLevel = typeof coverage_by_place[number]["coverage"];

const coverageColors: Record<CoverageLevel, string> = {
  "No data": "rgba(212, 216, 220, 1)",
  Partial: "rgba(107, 182, 167, 1)",
  Complete: "rgba(54, 120, 108, 1)",
};

const WorldMapLayer = ({ mapType, hoveredPlaceName }: WorldMapProps) => {
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

  console.log(countryFill);

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
      <Layer key={countryBorders.id} {...countryBorders} visibility={false} />
    </Source>
  );
};

export default WorldMapLayer;
