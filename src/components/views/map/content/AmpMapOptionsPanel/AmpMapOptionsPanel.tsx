import { MapPanel } from "components/common/MapboxMap/content/MapPanel/MapPanel";
import React from "react";
export const AmpMapOptionsPanel = () => {
  return (
    <MapPanel tabStyle={"expand"} tabName={"Map options"} maxHeight={true}>
      <div>Map options body</div>
    </MapPanel>
  );
};
