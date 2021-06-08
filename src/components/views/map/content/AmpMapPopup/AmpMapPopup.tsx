// library components
import React, { FunctionComponent } from "react";
import { Moment } from "moment";

// local components
import MapPopup, {
  ActionLink,
} from "components/common/MapboxMap/mapPopup/MapPopup";
import DistancingBodySection from "./content/DistancingBodySection/DistancingBodySection";
import PoliciesBodySection from "./content/PoliciesBodySection/PoliciesBodySection";
import {
  DistancingLevel,
  MapFeature,
  MapId,
  PolicyResolution,
} from "components/common/MapboxMap/plugins/mapTypes";
import * as FMT from "components/misc/FormatAndDisplay/FormatAndDisplay";
import { AmpCaseSparkline } from "./content/AmpPopupHeader/content/AmpCaseSparkline/AmpCaseSparkline";

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
  policiesLink?: ActionLink;
  policyResolution: PolicyResolution;
  updating: boolean;
  ready: boolean;
};

export const AmpMapPopup: FunctionComponent<AmpMapPopupProps> = ({
  mapId,
  feature,
  featureName,
  dataDate,
  distancingLevel,
  policyCategories,
  policySubcategories,
  policyCount,
  modelLink,
  policiesLink,
  policyResolution,
  updating,
  ready,
}) => {
  const updatingOrNotReady: boolean = updating || !ready;
  return (
    <MapPopup
      {...{
        headerTitle: featureName,
        headerSub: (
          <>
            as of <FMT.LocalDate>{dataDate}</FMT.LocalDate>
          </>
        ),
        headerRightContent: (
          <AmpCaseSparkline
            {...{ mapId, feature, dataDate, unit: "", label: "" }}
          />
        ),
        bodySections: [
          <DistancingBodySection
            {...{
              key: "distancingBody",
              title:
                mapId !== "us-county"
                  ? "Distancing level"
                  : "Distancing level of state",
              distancingLevel,
              modelLink,
              updating: updatingOrNotReady,
            }}
          />,
          <PoliciesBodySection
            {...{
              key: "policiesBody",
              categories: policyCategories,
              subcategories: policySubcategories,
              count: policyCount,
              policiesLink,
              policyResolution,
              mapId,
              updating: updating || !ready,
            }}
          />,
        ],
      }}
    />
  );
};
export default AmpMapPopup;
