import React, { useCallback, useRef } from "react";
import { useEffect } from "react";
import styled from "styled-components";
import { AmpPage } from "types";

// "react-map-gl@5.3.16"

import Map, {
  FillLayer,
  Layer,
  LineLayer,
  LngLat,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  Source,
} from "react-map-gl";

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

enum MapType {
  USA = "USA",
  World = "World",
}

const usMapBounds = [
  [-21.155989509715667, 15.597516194781097],
  [20.240006846583366, -20.418786807120235],
] as [[number, number], [number, number]];

const worldMapBounds = [
  [-141.78623293980732, 60.46188253859922],
  [179.97107965372615, -54.77460938717267],
] as [[number, number], [number, number]];

const PolicyCoverage = ({ setPage, setLoading }: PolicyCoverageProps) => {
  useSetPageAndDisableLoading(setPage, setLoading);

  const [mapType, setMapType] = React.useState(MapType.World);
  const [hoveredPlaceName, setHoveredPlaceName] = React.useState(" ");
  const [popupState, setPopupState] = React.useState<PopupState | null>(null);

  const mapRef = useRef<MapRef | null>(null);

  // const outlineLayer = {
  //   id: `countries-outline`,
  //   type: `line` as `line`,
  //   source: `countries_v13c-6uk894`,
  //   "source-layer": "countries_v13c-6uk894",
  //   paint: {
  //     "line-color": "blue",
  //     "line-width": 2,
  //   },
  //   // beforeId: "country-label",
  // };

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    console.log(event.features?.[0]?.properties?.state_name ?? " ");
    console.log(event.features?.[0]);
    console.log(mapRef.current?.getStyle().layers);
    setHoveredPlaceName(event.features?.[0]?.properties?.state_name ?? " ");
    // setHoveredAbbrev(event.features?.[0]?.properties?.ISO_A3 ?? " ");
  }, []);

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const iso3 = event.features?.[0]?.properties?.ISO_A3;

    if (
      !iso3 ||
      !event.lngLat
      // || !countriesRecievedAndDisbursed.some(c => c.iso3 === iso3)
    ) {
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

  let mapStyle = "mapbox://styles/nicoletalus/ckp5qwi392djb18qbvlf0hiku";
  if (mapType === MapType.USA) {
    mapStyle = "mapbox://styles/nicoletalus/ckq9vwu8t0w4w17k0nwj4z9kz";
  }

  const stateFill: FillLayer = {
    id: `us-states-fill`,
    type: `fill` as `fill`,
    "source-layer": "albersusa",
    paint: {
      "fill-color": "rgba(54, 120, 108, .85)",
      "fill-outline-color": "white",
    },
    filter: ["match", ["get", "type"], ["state"], true, false],
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
    <MapContainer>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN!}
        mapStyle={mapStyle}
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
        interactiveLayerIds={[stateFill.id]}
        onClick={onClick}
      >
        <Source
          id="us-states"
          type="vector"
          url="mapbox://lobenichou.albersusa"
        >
          <Layer key={stateFill.id} {...stateFill} beforeId="state-points" />
          <Layer key={stateBorders.id} {...stateBorders} />
        </Source>
        {/* This source provides country shapes and their ISO codes */}

        {
          // <Source
          //   id="country-borders"
          //   type="vector"
          //   url="mapbox://nicoletalus.3a8qy0w1"
          // />
        }

        {
          // <Source
          //   id="country-borders"
          //   type="vector"
          //   url="mapbox://ryan-talus.2o1iyjoj"
          // >
        }
        {/* This layer paints all colors including grey background color */}
        {
          // <Layer
          //   key={outlineLayer.id}
          //   {...outlineLayer}
          //   filter={["==", "ISO_A3", hoveredISO]}
          // />
        }
        {
          // <Layer key={countryLayer.id} {...countryLayer} />
        }
        {
          // </Source>
        }
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
