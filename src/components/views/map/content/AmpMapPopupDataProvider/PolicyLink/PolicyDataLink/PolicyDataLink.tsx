// 3rd party packages
import React, { FC } from "react";

// local components and objects
import Settings from "Settings";
import { PolicyLink } from "../PolicyLink";
import {
  DATA_PAGE_LINK_TEXT,
  PolicyLinkBaseProps,
  ZERO_POLICY_MSG,
} from "../../helpers";

// styles and assets
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
  const isNoDataMode: boolean = noData && Settings.DISABLE_POLICY_LINK_IF_ZERO;
  return (
    <PolicyLink
      {...{
        tooltip: isNoDataMode ? ZERO_POLICY_MSG : tooltip,
        to,
        target,
        disabled: isNoDataMode,
      }}
    >
      {children || (
        <button className={styles.buttonAsLink}>{DATA_PAGE_LINK_TEXT}</button>
      )}
    </PolicyLink>
  );
};
