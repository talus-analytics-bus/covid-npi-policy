import React, { FC, useContext } from "react";
import { Link } from "react-router-dom";
import { ReactElement } from "react-transition-group/node_modules/@types/react";
import { InfoTooltip } from "components/common";
import InfoTooltipContext from "context/InfoTooltipContext";
import { PolicyLinkBaseProps } from "../helpers";
import styles from "./PolicyLink.module.scss";

interface PolicyLinkProps extends PolicyLinkBaseProps {
  page: "policy" | "data";
}

export const PolicyLink: FC<PolicyLinkProps> = ({
  tooltip,
  to,
  target,
  disabled = false,
  page,
  children,
}): ReactElement => {
  const { setInfoTooltipContent } = useContext(InfoTooltipContext);
  if (!disabled && to !== undefined)
    return (
      <Link to={to} target={target}>
        {children}
      </Link>
    );
  else
    return (
      <div className={styles.labelAndTooltip}>
        <span data-disabled={true}>{children}</span>
        {tooltip !== undefined && (
          <InfoTooltip
            wide={false}
            {...{
              id: "policyLinkTooltip",
              text: tooltip,
              place: undefined,
              setInfoTooltipContent,
            }}
          />
        )}
      </div>
    );
};
