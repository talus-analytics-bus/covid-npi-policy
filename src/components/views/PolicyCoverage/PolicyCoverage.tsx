import React, { useCallback, useRef } from "react";
import { useEffect } from "react";
import styled from "styled-components";
import { AmpPage } from "types";

// "react-map-gl@5.3.16"

import Map, { LngLat, MapLayerMouseEvent, MapRef } from "react-map-gl";
import UsaMapLayer, { STATE_FILL_LAYER_ID, usMapBounds } from "./UsaMapLayer";
import WorldMapLayer, {
  COUNTRY_FILL_LAYER_ID,
  worldMapBounds,
} from "./WorldMapLayer";

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const useSetPageAndDisableLoading = (
  setPage: SetPage,
  setLoading: SetLoading
) => {
  useEffect(() => {
    setPage("policycoverage");
    setLoading(false);
  });
};

type SetPage = React.Dispatch<React.SetStateAction<AmpPage | null>>;
type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;

const MapContainer = styled.div`
  position: relative;
  height: calc(100vh - 116px);
  top: 116px;
  width: 100%;
`;

const MapTypeSwitcher = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
  border-radius: 5px;
  background-color: #ffffff;
  box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #7b848e;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MapSwitcherLabel = styled.label`
  color: #1d1c1c;
  font-family: "Open Sans";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;

  input {
    position: relative;
    top: 5px;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }
`;

export interface PopupState {
  iso3: string;
  lnglat: LngLat;
  setPopupState: React.Dispatch<React.SetStateAction<PopupState | null>>;
}

interface PolicyCoverageProps {
  setPage: SetPage;
  setLoading: SetLoading;
}

export enum MapType {
  USA = "USA",
  World = "World",
}

const PolicyCoverage = ({ setPage, setLoading }: PolicyCoverageProps) => {
  useSetPageAndDisableLoading(setPage, setLoading);

  const [mapType, setMapType] = React.useState(MapType.World);
  const [hoveredPlaceName, setHoveredPlaceName] = React.useState(" ");
  const [popupState, setPopupState] = React.useState<PopupState | null>(null);

  const mapRef = useRef<MapRef>(null);

  const onHover = useCallback(
    (event: MapLayerMouseEvent) => {
      if (mapType === MapType.USA)
        setHoveredPlaceName(event.features?.[0]?.properties?.state_name ?? " ");
      if (mapType === MapType.World) {
        setHoveredPlaceName(event.features?.[0]?.properties?.ISO_A3 ?? " ");
      }
    },
    [mapType]
  );

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const iso3 = event.features?.[0]?.properties?.ISO_A3;

    if (!iso3 || !event.lngLat) {
      setPopupState(null);
      return;
    }

    setPopupState({
      iso3,
      lnglat: event.lngLat,
      setPopupState,
    });
  }, []);

  const handleChangeMapType = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!mapRef.current) return;
    if (event.target.value === "USA") {
      mapRef.current.fitBounds(usMapBounds);
      setMapType(MapType.USA);
    } else {
      mapRef.current.fitBounds(worldMapBounds);
      setMapType(MapType.World);
    }
  };

  // let mapStyle = "mapbox://styles/nicoletalus/ckp5qwi392djb18qbvlf0hiku";
  // if (mapType === MapType.USA) {
  //   mapStyle = "mapbox://styles/nicoletalus/ckq9vwu8t0w4w17k0nwj4z9kz";
  // }

  return (
    <MapContainer>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN!}
        // mapStyle={mapStyle}
        projection={{ name: "mercator" }}
        interactive={true}
        initialViewState={{
          longitude: 0,
          latitude: 15,
          zoom: 0,
          bounds: worldMapBounds,
        }}
        maxZoom={5}
        minZoom={0}
        onMouseMove={onHover}
        interactiveLayerIds={[STATE_FILL_LAYER_ID, COUNTRY_FILL_LAYER_ID]}
        onClick={onClick}
      >
        <UsaMapLayer {...{ mapType, hoveredPlaceName }} />
        <WorldMapLayer {...{ mapType, hoveredPlaceName }} />

        {
          // <NavigationControl position="top-left" showCompass={false} />
          // {popupState && <MapPopup popupState={popupState} mapType={mapType} />}
        }
      </Map>
      <MapTypeSwitcher>
        <MapSwitcherLabel>
          <input
            type="radio"
            name="mapType"
            value={MapType.USA}
            onChange={handleChangeMapType}
          />

          <span>
            United States
            <br />
            (state-level-policies)
          </span>
        </MapSwitcherLabel>
        <MapSwitcherLabel>
          <input
            defaultChecked
            type="radio"
            name="mapType"
            value={MapType.World}
            onChange={handleChangeMapType}
          />
          World
        </MapSwitcherLabel>
      </MapTypeSwitcher>
    </MapContainer>
  );
};

export default PolicyCoverage;
