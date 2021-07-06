import React, { FunctionComponent } from "react";
import { ElementsOrNull } from "../../../plugins/mapTypes";
import styles from "./popupbody.module.scss";

type PopupBodyProps = {
  sections?: ElementsOrNull;
  customContent?: ElementsOrNull;
};
export const PopupBody: FunctionComponent<PopupBodyProps> = ({
  sections = null,
  customContent = null,
}): JSX.Element => {
  // display templatized body if no custom content, otherwise display custom
  if (customContent === null)
    return (
      <Container>
        <div className={styles.bodySections}>{sections}</div>
      </Container>
    );
  else return <Container>{customContent}</Container>;
};

// define container element for popup header content
const Container: FunctionComponent<{
  children: ElementsOrNull;
}> = ({ children }) => {
  return <div className={styles.popupBody}>{children}</div>;
};

export default PopupBody;
