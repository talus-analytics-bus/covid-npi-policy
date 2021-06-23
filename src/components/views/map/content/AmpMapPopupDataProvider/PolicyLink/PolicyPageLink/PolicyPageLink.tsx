import React from "react";
import { FC } from "react";
import { PolicyLinkBaseProps } from "../../helpers";
import { PolicyLink } from "../PolicyLink";

interface PolicyPageLinkProps extends PolicyLinkBaseProps {}

export const PolicyPageLink: FC<PolicyPageLinkProps> = ({
  tooltip,
  to,
  target,
  disabled = false,
  children,
}) => {
  return (
    <PolicyLink {...{ tooltip, to, target, disabled }}>{children}</PolicyLink>
  );
};
