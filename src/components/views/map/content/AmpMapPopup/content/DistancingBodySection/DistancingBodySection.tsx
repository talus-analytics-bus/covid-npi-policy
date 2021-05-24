import React, { FunctionComponent, ReactElement } from "react";
import { Link, LinkProps } from "react-router-dom";
import BodySection from "components/common/MapboxMap/mapPopup/content/PopupBody/BodySection/BodySection";
import DistancingIcon from "components/common/MapboxMap/mapPopup/content/PopupBody/LabeledIcon/DistancingIcon/DistancingIcon";
import { DistancingLevel } from "components/common/MapboxMap/plugins/mapTypes";
import { ActionLink } from "components/common/MapboxMap/mapPopup/MapPopup";

type DistancingBodySectionProps = {
  title: string;
  distancingLevel: DistancingLevel;
  modelLink?: ActionLink;
};
export const DistancingBodySection: FunctionComponent<DistancingBodySectionProps> = ({
  title,
  distancingLevel,
  modelLink,
}) => {
  return (
    <BodySection
      {...{
        title,
        content: <DistancingIcon {...{ value: distancingLevel }} />,
        action: modelLink,
      }}
    />
  );
};
export default DistancingBodySection;
