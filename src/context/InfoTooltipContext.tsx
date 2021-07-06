import React from "react";
type InfoTooltipContextProps = {
  setInfoTooltipContent(): void;
};

const InfoTooltipContext = React.createContext<InfoTooltipContextProps>({
  setInfoTooltipContent: () => {},
});
export const InfoTooltipProvider = InfoTooltipContext.Provider;
export default InfoTooltipContext;
