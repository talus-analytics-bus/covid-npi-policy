import React, { Dispatch, SetStateAction } from "react";
type InfoTooltipContextProps = {
  setInfoTooltipContent: (() => void) | Dispatch<SetStateAction<string | null>>;
};

const InfoTooltipContext = React.createContext<InfoTooltipContextProps>({
  setInfoTooltipContent: () => {},
});
export const InfoTooltipProvider = InfoTooltipContext.Provider;
export default InfoTooltipContext;
