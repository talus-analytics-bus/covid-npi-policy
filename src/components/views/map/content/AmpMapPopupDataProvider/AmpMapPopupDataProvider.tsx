// library components
import React, { FunctionComponent as FC, useEffect, useState } from "react";

// local components
import {
  CountryFeature,
  CountyFeature,
  DistancingLevel,
  MapFeature,
  MapId,
  MapMetric,
  PolicyResolution,
  StateFeature,
} from "components/common/MapboxMap/plugins/mapTypes";
import AmpMapPopup from "../AmpMapPopup/AmpMapPopup";
import { Moment } from "moment";
import { LoadingSpinner } from "components/common";
import { ActionLink } from "components/common/MapboxMap/mapPopup/MapPopup";

// local constants
import { allMapMetrics } from "components/common/MapboxMap/plugins/data";

// helper functions
import {
  getDistancingMapMetric,
  getFeatureMetric,
  getFeatureName,
  getModelLink,
  getPoliciesLink,
  PoliciesLink,
  ZERO_POLICY_MSG,
} from "./helpers";
import { execute, PolicyStatusCounts } from "components/misc/Queries";
import { mapStyles } from "components/common/MapboxMap/plugins/sources";

type UpdateDataProps = {
  feature: MapFeature;
  dataDate: Moment;
  mapMetrics: Record<string, any>;
  setPoliciesLink: Function;
  setPolicyCount: Function;
  setDistancingLevel: Function;
  setReady: Function;
  map: Record<string, any>;
  mapId: MapId;
  circle: string | null;
  paramArgs: Record<string, any>;
};
const updateData: Function = async ({
  feature,
  dataDate,
  setPoliciesLink,
  setPolicyCount,
  setDistancingLevel,
  setReady,
  map,
  mapId,
  circle,
  paramArgs,
}: UpdateDataProps) => {
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
    policiesLink: getPoliciesLink(
      feature,
      filtersWithDate,
      paramArgs.policyResolution
    ),
    policyCount: PolicyStatusCounts({
      method: "post",
      geo_res: mapStyles[mapId].geo_res,
      count_sub: paramArgs.policyResolution === "subgeo",
      include_min_max: false,
      include_zeros: false,
      filters: { ...filtersWithDate, ...getLocationFilters(mapId, feature) },
      one: true,
      merge_like_policies: false,
    }),
    distancingLevel: fetchedDistancingLevel,
  };
  const executeArgs: any = { queries };
  const res: any = await execute(executeArgs);
  const policyCount: number | null =
    res.policyCount.length > 0 ? res.policyCount[0].value : null;
  const policiesLink: ActionLink =
    policyCount === 0 ? (
      <PoliciesLink tooltip={ZERO_POLICY_MSG} />
    ) : policyCount === null ? null : (
      res.policiesLink
    );
  const distancingLevel: string | null = res.distancingLevel;
  setPoliciesLink(policiesLink);
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
  circle: string | null;
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
  circle,
}) => {
  const [policiesLink, setPoliciesLink] = useState<ActionLink>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [distancingLevel, setDistancingLevel] = useState<DistancingLevel>(null);
  const [policyCount, setPolicyCount] = useState<number | null>(null);
  const featureName: string = getFeatureName(feature);

  useEffect(() => {
    const stateName: string | undefined = (feature as StateFeature).properties
      .state_name;
    const iso3: string | undefined = (feature as CountryFeature).properties
      .ISO_A3;
    updateData({
      feature,
      dataDate,
      setPoliciesLink,
      setPolicyCount,
      setDistancingLevel,
      setReady,
      map,
      mapId,
      circle,
      paramArgs: {
        policyResolution,
        stateName,
        iso3,
        filters,
      },
    });
  }, [feature.state]);

  if (ready)
    return (
      <AmpMapPopup
        {...{
          mapId,
          feature,
          featureName,
          dataDate,
          distancingLevel,
          policyCategories,
          policySubcategories,
          policyCount,
          modelLink: getModelLink(feature),
          policiesLink,
          policyResolution,
          circle,
        }}
      />
    );
  else return <LoadingSpinner delay={500} />;
};

export default AmpMapPopupDataProvider;

const getLocationFilters = (
  mapId: string,
  feature: MapFeature
): Record<string, any> => {
  switch (mapId) {
    case "us":
      return getUsStateLocationFilters(feature as StateFeature);
    case "us-county":
      return getUsCountyLocationFilters(feature as CountyFeature);
    case "global":
    default:
      return getCountryLocationFilters(feature as CountryFeature);
  }
  function getUsStateLocationFilters(
    feature: StateFeature
  ): Record<string, any> {
    return {
      iso3: ["USA"],
      area1: [feature.properties.state_name],
    };
  }

  function getUsCountyLocationFilters(
    feature: StateFeature
  ): Record<string, any> {
    return {
      iso3: ["USA"],
      area1: [feature.properties.state_name],
      ansi_fips: [feature.id],
    };
  }

  function getCountryLocationFilters(
    feature: CountryFeature
  ): Record<string, any> {
    return {
      iso3: [feature.properties.ISO_A3],
    };
  }
};
