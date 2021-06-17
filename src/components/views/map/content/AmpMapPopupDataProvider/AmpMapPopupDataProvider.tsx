// library components
import React, {
  FunctionComponent as FC,
  useContext,
  useEffect,
  useState,
} from "react";

// local components
import {
  CountryFeature,
  DistancingLevel,
  MapFeature,
  MapId,
  MapMetric,
  PolicyResolution,
  StateFeature,
} from "components/common/MapboxMap/plugins/mapTypes";
import AmpMapPopup from "../AmpMapPopup/AmpMapPopup";
import { Moment } from "moment";
import { ActionLink } from "components/common/MapboxMap/mapPopup/MapPopup";

// local constants
import { allMapMetrics } from "components/common/MapboxMap/plugins/data";

// helper functions
import {
  getDistancingMapMetric,
  getFeatureMetric,
  getFeatureName,
  getLocationFilters,
  getMapIdFromFeature,
  getModelLink,
  getPolicyLink,
  ZERO_POLICY_MSG,
} from "./helpers";
import { execute, PolicyStatusCounts } from "components/misc/Queries";
import { mapStyles } from "components/common/MapboxMap/plugins/sources";
import SettingsContext, { SettingsContextProps } from "context/SettingsContext";
import { PolicyPageLink } from "./PolicyLink/PolicyPageLink/PolicyPageLink";
import { PolicyDataLink } from "./PolicyLink/PolicyDataLink/PolicyDataLink";
import MapOptionContext, {
  MapOptionContextProps,
} from "../../context/MapOptionContext";
import { Option } from "components/common/OptionControls/types";

type UpdateDataProps = {
  feature: MapFeature;
  dataDate: Moment;
  ready: boolean;
  updating: boolean;
  mapMetrics: Record<string, any>;
  setActionLinks: Function;
  setPolicyCount: Function;
  setDistancingLevel: Function;
  setReady: Function;
  setUpdating: Function;
  map: Record<string, any>;
  mapId: MapId;
  DISABLE_POLICY_LINK_IF_ZERO: boolean;
  circle: string | null;
  paramArgs: Record<string, any>;
  subcategoryOptions: Option[];
};
const updateData: Function = async ({
  feature,
  dataDate,
  ready,
  setActionLinks,
  setPolicyCount,
  setDistancingLevel,
  setReady,
  setUpdating,
  map,
  mapId,
  DISABLE_POLICY_LINK_IF_ZERO,
  paramArgs,
  subcategoryOptions,
}: UpdateDataProps) => {
  if (ready) setUpdating(true);

  // if county map, get state `lockdown_level
  const distancingMapMetric: MapMetric[] = getDistancingMapMetric(
    mapId,
    allMapMetrics
  );
  const fetchedDistancingLevel = await getFeatureMetric({
    feature,
    mapMetrics: distancingMapMetric,
    dataDate,
    metricId: "lockdown_level",
    map,
    mapId,
    policyResolution: paramArgs.policyResolution,
    paramArgs,
  });
  const dateStr: string = dataDate.format("YYYY-MM-DD");
  const filtersWithDate: Record<string, any> = {
    ...paramArgs.filters,
    dates_in_effect: [dateStr, dateStr],
  };
  const queries: any = {
    policiesLink: getPolicyLink(
      feature,
      filtersWithDate,
      paramArgs.policyResolution,
      "policy",
      mapId
    ),
    dataLink: getPolicyLink(
      feature,
      filtersWithDate,
      paramArgs.policyResolution,
      "data",
      mapId,
      subcategoryOptions
    ),
    policyCount: PolicyStatusCounts({
      method: "post",
      geo_res: getPolicyCountGeoResFromMapId(mapId),
      count_sub: paramArgs.policyResolution === "subgeo",
      include_min_max: false,
      include_zeros: true,
      filters: { ...filtersWithDate, ...getLocationFilters(mapId, feature) },
      one: true,
      merge_like_policies: false,
      counted_parent_geos: mapId === "us-county-plus-state" ? ["state"] : [],
    }),
    distancingLevel: fetchedDistancingLevel,
  };
  const executeArgs: any = { queries };
  const res: any = await execute(executeArgs);
  const placeHasPoliciesToday: boolean = res.policyCount.length > 0;
  const placeHasPolicies: boolean = res.policyCount.max_all_time !== null;
  const policyCount: number | null =
    placeHasPoliciesToday && placeHasPolicies ? res.policyCount[0].value : null;
  const policiesLink: ActionLink =
    policyCount === 0 && DISABLE_POLICY_LINK_IF_ZERO ? (
      <PolicyPageLink tooltip={ZERO_POLICY_MSG} />
    ) : policyCount === null ? null : (
      res.policiesLink
    );
  const dataLink: ActionLink =
    policyCount === 0 ? (
      <PolicyDataLink noData={true} />
    ) : policyCount === null ? null : (
      res.dataLink
    );
  const distancingLevel: string | null = res.distancingLevel;
  setUpdating(false);
  setActionLinks([policiesLink, dataLink]);
  setPolicyCount(policyCount);
  setDistancingLevel(distancingLevel);
  setReady(true);
};

type ComponentProps = {
  mapId: MapId;
  feature: MapFeature;
  dataDate: Moment;
  policyCategories?: string[];
  policySubcategories?: string[];
  map: Record<string, any>;
  filters: Record<string, any>;
  policyResolution: PolicyResolution;
};

export const AmpMapPopupDataProvider: FC<ComponentProps> = ({
  mapId,
  feature,
  dataDate,
  policyCategories = [],
  policySubcategories = [],
  map,
  policyResolution,
  filters,
}) => {
  const [actionLinks, setActionLinks] = useState<ActionLink[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [distancingLevel, setDistancingLevel] = useState<DistancingLevel>(null);
  const [policyCount, setPolicyCount] = useState<number | null>(null);
  const featureName: string = getFeatureName(feature);

  // context
  const { DISABLE_POLICY_LINK_IF_ZERO } = useContext<SettingsContextProps>(
    SettingsContext
  );
  const { subcategoryOptions } = useContext<MapOptionContextProps>(
    MapOptionContext
  );
  // get map ID used for data requests based on the feature
  const mapIdForData = getMapIdFromFeature(feature, mapId);

  useEffect(() => {
    const stateName: string | undefined = (feature as StateFeature).properties
      .state_name;
    const iso3: string | undefined = (feature as CountryFeature).properties
      .ISO_A3;
    updateData({
      feature,
      dataDate,
      ready,
      setActionLinks,
      setPolicyCount,
      setDistancingLevel,
      setReady,
      setUpdating,
      map,
      mapId: mapIdForData,
      DISABLE_POLICY_LINK_IF_ZERO,
      subcategoryOptions,
      paramArgs: {
        policyResolution,
        stateName,
        iso3,
        filters,
      },
    });
  }, [feature.state]);

  return (
    <AmpMapPopup
      {...{
        mapId: mapIdForData,
        feature,
        featureName,
        dataDate,
        distancingLevel,
        policyCategories,
        policySubcategories,
        policyCount,
        modelLink: getModelLink(feature),
        policyActionLinks: actionLinks,
        policyResolution,
        updating,
        ready,
      }}
    />
  );
};

export default AmpMapPopupDataProvider;

/**
 * Given the ID of the currently displayed map, returns the geographic
 * resolution that should be used in queries counting policies that affects
 * areas displayed on the map. For example, the map of 'us-county-plus-state'
 * should count at the 'county' geographic resolution, although it includes
 * counts of state policies.
 * @param mapId The ID of the currently displayed map
 * @returns
 * The geographic resolution that should be used for policy status
 * count queries
 */
function getPolicyCountGeoResFromMapId(mapId: MapId): string | undefined {
  let policyCountGeoRes;
  switch (mapId) {
    // case "us-county":
    // case "us-county-plus-state":
    //   policyCountGeoRes = mapStyles["us-county"].geo_res;
    //   break;
    default:
      policyCountGeoRes = mapStyles[mapId].geo_res;
      break;
  }
  if (policyCountGeoRes === undefined)
    throw Error("Unexpected map ID: " + mapId);
  return policyCountGeoRes;
}
