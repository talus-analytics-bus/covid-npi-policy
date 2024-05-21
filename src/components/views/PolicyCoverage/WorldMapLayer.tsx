import Layer from "react-map-gl/dist/esm/components/layer";
import Source from "react-map-gl/dist/esm/components/source";

export const worldMapBounds = [
  [-141.78623293980732, 60.46188253859922],
  [179.97107965372615, -54.77460938717267],
] as [[number, number], [number, number]];

interface WorldMapProps {
  hoveredPlaceName: string;
}

export const COUNTRY_FILL_LAYER_ID = `world-countries-fill`;

const WorldMapLayer = ({ hoveredPlaceName }: WorldMapProps) => {
  const countryFill = {
    id: COUNTRY_FILL_LAYER_ID,
    type: `fill` as `fill`,
    "source-layer": `countries_slim_v13c03`,
    paint: {
      "fill-color": "rgba(54, 120, 108, .85)",
      "fill-outline-color": "white",
    },
    // filter: ["==", "type", "country"],
  };

  const countryBorders = {
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
      <Layer key={countryFill.id} {...countryFill} beforeId="country-label" />
      <Layer key={countryBorders.id} {...countryBorders} />
    </Source>
  );
};

export default WorldMapLayer;
