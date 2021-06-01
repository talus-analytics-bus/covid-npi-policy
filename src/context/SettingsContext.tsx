import React from "react";
type SettingsContextProps = {
  features: {
    /**
     * True if map options should allow viewing policies applicable only to
     * geographies beneath the selected geography level, false otherwise.
     *
     * For example, if true, the map options on the countries map will allow
     * users to view the counts of policies affecting sub-country geographies,
     * such as states / provinces and localities, at the country level.
     */
    readonly allowSubGeos: boolean;
  };
};

const SettingsContext = React.createContext<SettingsContextProps>({
  features: { allowSubGeos: false },
});
export const SettingsProvider = SettingsContext.Provider;
export default SettingsContext;
