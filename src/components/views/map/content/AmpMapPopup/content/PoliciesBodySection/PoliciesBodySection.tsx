import PolicyCount from "./content/PolicyCount";
import BodySection from "src/components/common/MapboxMap/mapPopup/content/PopupBody/BodySection/BodySection";
import React, { FunctionComponent, useContext } from "react";
import { ActionLink } from "src/components/common/MapboxMap/mapPopup/MapPopup";
import {
  MapId,
  PolicyResolution,
} from "src/components/common/MapboxMap/plugins/mapTypes";
import { getMapNouns } from "src/components/common/MapboxMap/MapboxMap";
import MapOptionContext from "src/components/views/map/context/MapOptionContext";

type PoliciesBodySectionProps = {
  categories: string[];
  subcategories: string[];
  count: number | null;
  policyActionLinks?: ActionLink[];
  policyResolution: PolicyResolution;
  mapId: MapId;
  updating: boolean;
};
export const PoliciesBodySection: FunctionComponent<PoliciesBodySectionProps> = ({
  categories,
  subcategories,
  count,
  policyActionLinks,
  policyResolution,
  mapId,
  updating,
}) => {
  const { subcatOptions } = useContext(MapOptionContext);
  const nouns: Record<string, string> = getMapNouns(mapId);
  const prefix: string =
    policyResolution === PolicyResolution.subgeo ? "sub-" : "";
  return (
    <BodySection
      {...{
        title: `Policies (${prefix}${nouns.level} level)`,
        content: (
          <PolicyCount
            {...{
              categories,
              subcategories,
              count,
              subcatOptions,
            }}
          />
        ),
        actions: policyActionLinks,
        updating,
      }}
    />
  );
};
export default PoliciesBodySection;
