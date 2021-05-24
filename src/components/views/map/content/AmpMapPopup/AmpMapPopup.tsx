// library components
import React, { FunctionComponent } from "react";
import moment, { Moment } from "moment";

// local components
import MapPopup, {
  ActionLink,
} from "components/common/MapboxMap/mapPopup/MapPopup";
import DistancingBodySection from "./content/DistancingBodySection/DistancingBodySection";
import PoliciesBodySection from "./content/PoliciesBodySection/PoliciesBodySection";
import {
  DistancingLevel,
  MapId,
  PolicyResolution,
} from "components/common/MapboxMap/plugins/mapTypes";
import * as FMT from "components/misc/FormatAndDisplay/FormatAndDisplay";

type AmpMapPopupProps = {
  mapId: MapId;
  featureName: string;
  dataDate: Moment;
  distancingLevel: DistancingLevel;
  policyCategories: string[];
  policySubcategories: string[];
  policyCount: number | null;
  modelLink?: ActionLink;
  policiesLink?: ActionLink;
  policyResolution: PolicyResolution;
};

export const AmpMapPopup: FunctionComponent<AmpMapPopupProps> = ({
  mapId,
  featureName,
  dataDate,
  distancingLevel,
  policyCategories,
  policySubcategories,
  policyCount = 1032,
  modelLink,
  policiesLink,
  policyResolution,
}) => {
  return (
    <MapPopup
      {...{
        headerTitle: featureName,
        headerSub: (
          <>
            as of <FMT.LocalDate>{dataDate}</FMT.LocalDate>
          </>
        ),
        bodySections: [
          <DistancingBodySection
            {...{
              title:
                mapId !== "us-county"
                  ? "Distancing level"
                  : "Distancing level of state",
              distancingLevel,
              modelLink,
            }}
          />,
          <PoliciesBodySection
            {...{
              categories: policyCategories,
              subcategories: policySubcategories,
              count: policyCount,
              policiesLink,
              policyResolution,
              mapId,
            }}
          />,
        ],
      }}
    />
  );
};
export default AmpMapPopup;
