import PolicyCount from "./PolicyCount";
import BodySection from "components/common/MapboxMap/mapPopup/content/PopupBody/BodySection/BodySection";
import React, { FunctionComponent } from "react";
import { ActionLink } from "components/common/MapboxMap/mapPopup/MapPopup";
import {
  MapId,
  PolicyResolution,
} from "components/common/MapboxMap/plugins/mapTypes";
import { getMapNouns } from "components/common/MapboxMap/MapboxMap";

type PoliciesBodySectionProps = {
  categories: string[];
  subcategories: string[];
  count: number | null;
  policiesLink?: ActionLink;
  policyResolution: PolicyResolution;
  mapId: MapId;
};
export const PoliciesBodySection: FunctionComponent<PoliciesBodySectionProps> = ({
  categories,
  subcategories,
  count,
  policiesLink,
  policyResolution,
  mapId,
}) => {
  const nouns: Record<string, string> = getMapNouns(mapId);
  const prefix: string = policyResolution === "subgeo" ? "sub-" : "";
  return (
    <BodySection
      {...{
        title: `Policies (${prefix}${nouns.level} level)`,
        content: <PolicyCount {...{ categories, subcategories, count }} />,
        action: policiesLink,
      }}
    />
  );
};
export default PoliciesBodySection;
