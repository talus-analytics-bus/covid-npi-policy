import { LoadingSpinner } from "components/common";
import React, { FunctionComponent } from "react";
import { ElementsOrNull } from "../../../../plugins/mapTypes";
import { ActionLink } from "../../../MapPopup";
import styles from "./bodysection.module.scss";

export interface BodySectionProps {
  title?: string;
  content?: ElementsOrNull;
  action?: ActionLink;
  customContent?: ElementsOrNull;
  /**
   * True if component is currently updating and loading indicator should be
   * shown, false if content should be shown.
   */
  updating?: boolean;
}
export const BodySection: FunctionComponent<BodySectionProps> = ({
  title,
  content,
  action,
  customContent = null,
  updating = false,
}): JSX.Element => {
  return (
    <div className={styles.bodySection}>
      <div className={styles.title}>{title}</div>
      <LoadingSpinner
        ready={!updating}
        delay={250}
        style={{
          height: "100%",
        }}
        childrenStyle={{
          height: "100%",
          display: "flex",
          flexFlow: "column",
        }}
      >
        <>
          <div className={styles.content}>{content}</div>
          <div className={styles.action}>{action}</div>
        </>
      </LoadingSpinner>
    </div>
  );
};

export default BodySection;
