import React from "react";
export type SettingsContextProps = {
  /**
   * True if map options should allow viewing policies applicable only to
   * geographies beneath the selected geography level, false otherwise.
   *
   * For example, if true, the map options on the countries map will allow
   * users to view the counts of policies affecting sub-country geographies,
   * such as states / provinces and localities, at the country level.
   */
  readonly ALLOW_SUB_GEOS: boolean;

  /**
   * True if map popup links that route the user to the geography's policy
   * page should be disabled if there are not policies visible with the
   * currently selected map filters, false if it should always be enabled.
   */
  readonly DISABLE_POLICY_LINK_IF_ZERO: boolean;
};

const SettingsContext = React.createContext<SettingsContextProps>({
  ALLOW_SUB_GEOS: false,
  DISABLE_POLICY_LINK_IF_ZERO: false,
});
export const SettingsDefaults: SettingsContextProps = {
  ALLOW_SUB_GEOS: false,
  DISABLE_POLICY_LINK_IF_ZERO: false,
};
export const SettingsProvider = SettingsContext.Provider;
export default SettingsContext;
