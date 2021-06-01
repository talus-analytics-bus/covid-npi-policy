import { MapPanel } from "components/common/MapboxMap/content/MapPanel/MapPanel";
import { OptionDrawer } from "components/common/MapOptions";
import { OptionRadioSet } from "components/common/OptionControls";
import { Option } from "components/common/OptionControls/types";
import React, { FC } from "react";
import { MapId } from "components/common/MapboxMap/plugins/mapTypes";

interface AmpMapOptionsPanelProps {
  mapId: MapId;
  /**
   * Setter function for this map's `mapId`, which determines what source is
   * used for the map.
   * @param newMapId The new `mapId` to which the map component should be set.
   */
  setMapId(newMapId: string): void;
}
export const AmpMapOptionsPanel: FC<AmpMapOptionsPanelProps> = ({
  mapId,
  setMapId,
}) => {
  /**
   * The possible geographic resolutions of map that can be viewed.
   */
  const geoOptions: Option[] = [
    {
      name: "Countries",
      value: "global",
      description: "View data for the world at the country level",
    },
    {
      name: "US States",
      value: "us",
      description:
        "View data for the United States at the state or county level",
      child: (
        <OptionRadioSet
          key={"subGeoToggle"}
          options={usSubGeoOptions}
          callback={selected => setMapId(selected[0].value as string)}
          selectedOptions={usSubGeoOptions.filter(o => o.value === mapId)}
        />
      ),
    },
  ];

  /**
   * The default geographic resolution selection for the map.
   */
  // const defaultOptionGeo: Option =
  // geoOptions.find(o => o.value === defaults.mapId) || geoOptions[0];
  return (
    <MapPanel
      tabType={"expand"}
      tabName={"Map options"}
      maxHeight={true}
      bodyStyle={{ padding: "0" }}
    >
      <OptionDrawer title={"Geographic resolution"}>
        <OptionRadioSet
          key={"geoToggle"}
          options={geoOptions}
          callback={selected => {
            setMapId(selected[0].value as string);
          }}
          selectedOptions={geoOptions.filter(o =>
            mapId.startsWith(o.value as string)
          )}
        />
      </OptionDrawer>
      <OptionDrawer title={"View states by"}>
        <>Test</>
      </OptionDrawer>
      <OptionDrawer title={"COVID-19 cases"}>
        <>Test</>
      </OptionDrawer>
    </MapPanel>
  );
};

/**
 * Geographic resolutions of USA maps that can be viewed. Currently, state and
 * county maps are supported.
 */
const usSubGeoOptions: Option[] = [
  {
    name: "State-level policies",
    value: "us",
    description: "View policies at the state level",
  },
  {
    name: "County-level policies",
    value: "us-county",
    description: "View policies at the county level",
  },
];
