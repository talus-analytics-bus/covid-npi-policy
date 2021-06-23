import React, { FC } from "react";
import {
  DATA_PAGE_LINK_TEXT,
  PolicyLinkBaseProps,
  ZERO_POLICY_MSG,
} from "../../helpers";
import { PolicyLink } from "../PolicyLink";
import styles from "./PolicyDataLink.module.scss";

interface PolicyPageLinkProps extends PolicyLinkBaseProps {
  /**
   * True if there are no policy data to link to and a grayed out, disabled
   * version of the link should be displayed, false otherwise.
   */
  noData?: boolean;
}

export const PolicyDataLink: FC<PolicyPageLinkProps> = ({
  tooltip,
  to,
  target,
  noData = false,
  children,
}) => {
  return (
    <PolicyLink
      page={"data"}
      {...{
        tooltip: noData ? ZERO_POLICY_MSG : tooltip,
        to,
        target,
        disabled: noData,
      }}
    >
      {children || (
        <button className={styles.buttonAsLink}>{DATA_PAGE_LINK_TEXT}</button>
      )}
    </PolicyLink>
  );
};
