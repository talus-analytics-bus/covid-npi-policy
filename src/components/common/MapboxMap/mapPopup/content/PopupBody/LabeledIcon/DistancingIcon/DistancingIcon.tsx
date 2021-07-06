import React, { FunctionComponent } from "react";
import { LabeledIcon } from "../LabeledIcon";
import styles from "./distancingicon.module.scss";
import { metricMeta } from "../../../../../plugins/data";

// assets
import { CovidLocalBadge } from "../CovidLocalBadge/CovidLocalBadge";

type DistancingIconProps = {
  value: string | null;
};

const getDistancingLevelAndPhase: Function = (
  value: string
): (string | null)[] => {
  const UNDEFINED_DISTANCING_LEVEL: (string | null)[] = [
    "Not available",
    null,
    null,
  ];
  const distancing: Record<string, Record<string, any>> | undefined =
    metricMeta.lockdown_level.valueStyling;
  if (value !== null && distancing !== undefined) {
    const valueInfo: Record<string, any> = distancing[value];
    if (valueInfo === undefined) return UNDEFINED_DISTANCING_LEVEL;
    else {
      const { label, phase, icon } = valueInfo;
      return [label, phase, icon];
    }
  } else {
    return UNDEFINED_DISTANCING_LEVEL;
  }
};

export const DistancingIcon: FunctionComponent<DistancingIconProps> = ({
  value,
}) => {
  const [labelText, phaseText, iconImgSrc] = getDistancingLevelAndPhase(value);
  return (
    <LabeledIcon
      {...{
        icon: iconImgSrc && (
          <img
            style={{ width: 30 }}
            src={iconImgSrc}
            alt={"Icon: " + labelText}
          />
        ),
        label: (
          <div>
            <strong className={styles.labelText}>{labelText}</strong>
            <CovidLocalBadge
              {...{ label: phaseText || "View on COVID-Local" }}
            />
          </div>
        ),
        // maxLabelWidth: 100,
      }}
    />
  );
};
export default DistancingIcon;
