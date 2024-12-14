import { FillLayer, Layer, LineLayer, Source } from "react-map-gl";
import { MapType } from "./PolicyCoverage";

export const usMapBounds = [
  [-21.155989509715667, 15.597516194781097],
  [20.240006846583366, -20.418786807120235],
] as [[number, number], [number, number]];

export const STATE_FILL_LAYER_ID = `us-states-fill`;

interface UsaMapLayerProps {
  mapType: MapType;
  hoveredPlaceName: string;
}

const UsaMapLayer = ({ mapType, hoveredPlaceName }: UsaMapLayerProps) => {
  const stateFill: FillLayer = {
    id: STATE_FILL_LAYER_ID,
    type: `fill` as `fill`,
    "source-layer": "albersusa",
    paint: {
      "fill-color": "rgba(54, 120, 108, .85)",
      "fill-outline-color": "white",
    },
    filter: ["==", "type", "state"],
    layout: {
      visibility: mapType === MapType.USA ? "visible" : "none",
    },
  };

  const stateBorders: LineLayer = {
    id: `us-states-outline`,
    type: `line` as `line`,
    "source-layer": `albersusa`,
    paint: {
      "line-color": `white`,
      "line-width": 2,
    },
    filter: [
      "all",
      ["==", "type", "state"],
      ["==", "state_name", hoveredPlaceName],
    ],
  };

  return (
    <Source id="us-states" type="vector" url="mapbox://lobenichou.albersusa">
      <Layer
        key={stateFill.id}
        {...stateFill}
        // beforeId="state-points"
      />
      <Layer key={stateBorders.id} {...stateBorders} />
    </Source>
  );
};

export default UsaMapLayer;
