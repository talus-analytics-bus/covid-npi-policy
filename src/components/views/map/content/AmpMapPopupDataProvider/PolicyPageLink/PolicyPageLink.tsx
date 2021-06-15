import React, { FC, useContext } from "react";
import { Link } from "react-router-dom";
import { ReactElement } from "react-transition-group/node_modules/@types/react";
import { InfoTooltip } from "components/common";
import InfoTooltipContext from "context/InfoTooltipContext";
import { PoliciesLinkProps } from "../helpers";

export const PolicyPageLink: FC<PoliciesLinkProps> = ({
  tooltip,
  to,
  target,
  disabled = false,
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
      <>
        <span data-disabled={true}>View policies</span>
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
      </>
    );
};
