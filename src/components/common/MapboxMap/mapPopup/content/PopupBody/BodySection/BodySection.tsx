import React, { FunctionComponent } from "react";
import { ElementsOrNull } from "../../../../plugins/mapTypes";
import { ActionLink } from "../../../MapPopup";
import styles from "./bodysection.module.scss";

export type BodySectionProps = {
  title?: string;
  content?: ElementsOrNull;
  action?: ActionLink;
  customContent?: ElementsOrNull;
};
export const BodySection: FunctionComponent<BodySectionProps> = ({
  title,
  content,
  action,
  customContent = null,
}): JSX.Element => {
  return (
    <div className={styles.bodySection}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{content}</div>
      <div className={styles.action}>{action}</div>
    </div>
  );
};

export default BodySection;
