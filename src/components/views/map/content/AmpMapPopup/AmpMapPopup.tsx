// 3rd party packages
import React, { FC } from "react";
import { Moment } from "moment";

// local components and types
import * as FMT from "src/components/misc/FormatAndDisplay/FormatAndDisplay";
import MapPopup, {
  ActionLink,
} from "src/components/common/MapboxMap/mapPopup/MapPopup";
import DistancingBodySection from "./content/DistancingBodySection/DistancingBodySection";
import PoliciesBodySection from "./content/PoliciesBodySection/PoliciesBodySection";
import {
  DistancingLevel,
  MapFeature,
  MapId,
  PolicyResolution,
} from "src/components/common/MapboxMap/plugins/mapTypes";
import { AmpCaseSparkline } from "./content/AmpPopupHeader/content/AmpCaseSparkline/AmpCaseSparkline";

// TODO document each property below
/**
 * Properties for AmpMapPopup function component
 */
type AmpMapPopupProps = {
  mapId: MapId;
  feature: MapFeature;
  featureName: string;
  dataDate: Moment;
  distancingLevel: DistancingLevel;
  policyCategories: string[];
  policySubcategories: string[];
  policyCount: number | null;
  modelLink?: ActionLink;
  policyActionLinks?: ActionLink[];
  policyResolution: PolicyResolution;
  updating: boolean;
  ready: boolean;

  /**
   * Function called when close button is clicked.
   */
  onClose(curPopupFeature: MapFeature): void;
};

/**
 * Popup displayed when a geographic feature is clicked on a COVID AMP map.
 * @param param0 Properties
 * @returns Function component
 */
export const AmpMapPopup: FC<AmpMapPopupProps> = ({
  mapId,
  feature,
  featureName,
  dataDate,
  distancingLevel,
  policyCategories,
  policySubcategories,
  policyCount,
  modelLink,
  policyActionLinks,
  policyResolution,
  updating,
  ready,
  onClose,
}) => {
  // show loading spinner in body sections if updating or not initialized
  const isUpdatingOrNotReady: boolean = updating || !ready;
  return (
    <MapPopup
      showClose
      headerTitle={featureName}
      headerSub={
        <>
          as of <FMT.LocalDate>{dataDate}</FMT.LocalDate>
        </>
      }
      headerRightContent={
        <AmpCaseSparkline {...{ mapId, feature, dataDate }} />
      }
      onClose={() => onClose(feature)}
      bodySections={[
        <DistancingBodySection
          key={"distancingBody"}
          updating={isUpdatingOrNotReady}
          title={getDistancingLevelLabelFromMapId(mapId)}
          {...{
            distancingLevel,
            modelLink,
          }}
        />,
        <PoliciesBodySection
          key={"policiesBody"}
          updating={updating || !ready}
          count={policyCount}
          categories={policyCategories}
          subcategories={policySubcategories}
          {...{
            policyActionLinks,
            policyResolution,
            mapId,
          }}
        />,
      ]}
    />
  );
};
export default AmpMapPopup;

/**
 * Given the ID of the currently displayed map, returns the label that
 * describes the distancing levels shown on the map. For example, state-level
 * distancing levels are used in county-level maps, so this is indicated.
 *
 * @param mapId
 * The ID of the currently displayed map
 *
 * @returns {string}
 * The label describing the distancing levels shown on the map.
 */
function getDistancingLevelLabelFromMapId(mapId: string): string {
  switch (mapId) {
    case "us-county":
    case "us-county-plus-state":
      return "Distancing level of state";
    default:
      return "Distancing level";
  }
}
