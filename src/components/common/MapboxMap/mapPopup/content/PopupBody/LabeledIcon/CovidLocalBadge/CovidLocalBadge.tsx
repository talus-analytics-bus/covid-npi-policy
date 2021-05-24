import React, { FunctionComponent, ReactElement } from "react";
import localLogo from "../../../../../plugins/assets/icons/logo-local-pill.png";
import styles from "./covidlocalbadge.module.scss";

type CovidLocalBadgeProps = {
  label: string;
};

export const CovidLocalBadge: FunctionComponent<CovidLocalBadgeProps> = ({
  label,
}: {
  label: string | null;
}): ReactElement | null => {
  if (label !== null)
    return (
      <div className={styles.covidLocalBadge}>
        <img src={localLogo} alt="The COVID Local logo in badge size" />
        <span className={styles.label}>{label}</span>
      </div>
    );
  else return null;
};
