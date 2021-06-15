import React, { FunctionComponent } from "react";
import BodySection, {
  BodySectionProps,
} from "components/common/MapboxMap/mapPopup/content/PopupBody/BodySection/BodySection";
import DistancingIcon from "components/common/MapboxMap/mapPopup/content/PopupBody/LabeledIcon/DistancingIcon/DistancingIcon";
import { DistancingLevel } from "components/common/MapboxMap/plugins/mapTypes";
import { ActionLink } from "components/common/MapboxMap/mapPopup/MapPopup";

interface DistancingBodySectionProps extends BodySectionProps {
  title: string;
  distancingLevel: DistancingLevel;
  modelLink?: ActionLink;
}
export const DistancingBodySection: FunctionComponent<DistancingBodySectionProps> = ({
  title,
  distancingLevel,
  modelLink,
  updating = false,
}) => {
  return (
    <BodySection
      {...{
        title,
        content: <DistancingIcon {...{ value: distancingLevel }} />,
        actions: modelLink ? [modelLink] : [],
        updating,
      }}
    />
  );
};
export default DistancingBodySection;
