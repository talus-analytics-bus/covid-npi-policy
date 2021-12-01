import React, { FC } from "react";
import styled, { FlattenSimpleInterpolation } from "styled-components";
import { ElementsOrNull } from "../MapboxMap/plugins/mapTypes";

interface NotificationDrapeProps {
  children: ElementsOrNull;
  show?: boolean;
  onClose?: () => void;
  useDefaultCloseButton?: boolean;
  customCSS?: FlattenSimpleInterpolation;
  narrow?: boolean;
}

const Drape = styled.div`
  display: ${({ show }) => (show ? "flex" : "none")};
  padding: 8px 15px;
  /* border-radius: 0 0 12px 12px; */
  ${({ customCSS }) => customCSS};
`;

export const NotificationDrape: FC<NotificationDrapeProps> = ({
  children,
  customCSS,
  show = true,
  onClose,
  useDefaultCloseButton = false,
  narrow = false,
}) => {
  return (
    <Drape
      style={{ right: narrow ? "128px" : "150px" }}
      // style={{ right: narrow ? "453px" : "150px" }}
      {...{ customCSS, show }}
    >
      {children}
    </Drape>
  );
};

export default NotificationDrape;
