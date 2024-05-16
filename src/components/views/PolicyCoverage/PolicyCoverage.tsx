import React, { useCallback } from "react";
import { useEffect } from "react";
import styled from "styled-components";
import { AmpPage } from "types";

// "react-map-gl@5.3.16"

import Map, {
  Layer,
  LngLat,
  MapLayerMouseEvent,
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

interface PolicyCoverageProps {
  setPage: SetPage;
  setLoading: SetLoading;
}

const MapContainer = styled.div`
  position: relative;
  height: calc(100vh - 116px);
  top: 116px;
  width: 100%;
`;

export interface PopupState {
  iso3: string;
  lnglat: LngLat;
  setPopupState: React.Dispatch<React.SetStateAction<PopupState | null>>;
}

const PolicyCoverage = ({ setPage, setLoading }: PolicyCoverageProps) => {
  useSetPageAndDisableLoading(setPage, setLoading);

  const [hoveredISO, setHoveredISO] = React.useState(" ");
  const [popupState, setPopupState] = React.useState<PopupState | null>(null);

  const outlineLayer = {
    id: `countries-outline`,
    type: `line` as `line`,
    source: `countries_v13c-6uk894`,
    "source-layer": "countries_v13c-6uk894",
    paint: {
      "line-color": "blue",
      "line-width": 2,
    },
    beforeId: "country-label",
  };

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    setHoveredISO(event.features?.[0]?.properties?.ISO_A3 ?? " ");
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

  return (
    <MapContainer>
      <Map
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN!}
        // mapStyle="mapbox://styles/ryan-talus/clddahzv7007j01qbgn0bba8w"
        mapStyle="mapbox://styles/nicoletalus/ckp5qwi392djb18qbvlf0hiku"
        projection={{ name: "mercator" }}
        interactive={true}
        initialViewState={{
          longitude: 0,
          latitude: 15,
          zoom: 0,
          // these bounds are weird due to a bug in mapbox with non-mercator projections:
          // https://github.com/mapbox/mapbox-gl-js/issues/11284
          // bounds: [
          //   [350, 70],
          //   [-90, -45],
          // ],
        }}
        maxZoom={5}
        minZoom={0}
        onMouseMove={onHover}
        // interactiveLayerIds={[countryLayer.id]}
        onClick={onClick}
      >
        {/* This source provides country shapes and their ISO codes */}
        <Source
          id="country-borders"
          type="vector"
          url="mapbox://ryan-talus.2o1iyjoj"
        >
          {/* This layer paints all colors including grey background color */}
          <Layer
            key={outlineLayer.id}
            {...outlineLayer}
            filter={["==", "ISO_A3", hoveredISO]}
          />
          {
            // <Layer key={countryLayer.id} {...countryLayer} />
          }
        </Source>
        {
          // <NavigationControl position="top-left" showCompass={false} />
          // {popupState && <MapPopup popupState={popupState} mapType={mapType} />}
        }
      </Map>
    </MapContainer>
  );
};

export default PolicyCoverage;
