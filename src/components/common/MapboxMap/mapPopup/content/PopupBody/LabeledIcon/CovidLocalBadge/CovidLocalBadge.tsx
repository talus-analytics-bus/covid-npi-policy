import React, { FunctionComponent, ReactElement } from "react";
import { Link } from "react-router-dom";
import localLogo from "../../../../../plugins/assets/icons/logo-local-pill.png";
import styles from "./covidlocalbadge.module.scss";

const COVID_LOCAL_URL = process.env.REACT_APP_COVID_LOCAL_URL;
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
        <a
          href={COVID_LOCAL_URL + "metrics"}
          target="_blank"
          className={styles.label}
        >
          <img src={localLogo} alt="The COVID Local logo in badge size" />
          <span>{label}</span>
        </a>
      </div>
    );
  else return null;
};
