import PolicyCount from "./PolicyCount";
import BodySection from "components/common/MapboxMap/mapPopup/content/PopupBody/BodySection/BodySection";
import React, { FunctionComponent, useContext } from "react";
import { ActionLink } from "components/common/MapboxMap/mapPopup/MapPopup";
import {
  MapId,
  PolicyResolution,
} from "components/common/MapboxMap/plugins/mapTypes";
import { getMapNouns } from "components/common/MapboxMap/MapboxMap";
import MapOptionContext from "components/views/map/context/MapOptionContext";

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
