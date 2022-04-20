import React, { FC, ReactElement, useContext } from "react";
import MapOptionContext from "src/components/views/map/context/MapOptionContext";
import { Legend, ShowMore } from "src/components/common";
import { MapPanel } from "src/components/common/MapboxMap/content/MapPanel/MapPanel";
import { metricMeta } from "src/components/common/MapboxMap/plugins/data";
import {
  MapId,
  MapSourcesEntry,
  MapSourcesGeometry,
  MetricMeta,
  MetricMetaEntry,
  PolicyResolution,
} from "src/components/common/MapboxMap/plugins/mapTypes";
import styles from "./AmpMapLegendPanel.module.scss";
import {
  isEmpty,
  getAndListString,
  getInitCap,
} from "src/components/misc/UtilsTyped";
import { getMapNouns } from "src/components/common/MapboxMap/MapboxMap";
import { Moment } from "moment";
import { getPolicyCatSubcatPhrase } from "src/components/views/map/content/AmpMapPopup/content/PoliciesBodySection/helpers";
import { Option } from "src/components/common/OptionControls/types";
import InfoTooltipContext from "src/context/InfoTooltipContext";
import { mapSources } from "src/components/common/MapboxMap/plugins/sources";

type AmpMapLegendPanelProps = {
  linCircleScale: boolean;
  policyResolution: PolicyResolution;
  zoomLevel: number;
  panelSetId?: number;
};
export const AmpMapLegendPanel: FC<AmpMapLegendPanelProps> = ({
  linCircleScale,
  policyResolution,
  zoomLevel,
  panelSetId = 0,
}) => {
  const { circle, fill, mapId, filters, date } = useContext<{
    circle?: string | null;
    fill?: string | null;
    mapId?: MapId;
    filters?: Record<string, any>;
    date?: Moment;
  }>(MapOptionContext);

  const { setInfoTooltipContent } = useContext(InfoTooltipContext);

  const circleMeta: MetricMetaEntry | null =
    circle !== null ? (metricMeta as MetricMeta)[circle || ""] : null;
  const fillMeta: MetricMetaEntry | null =
    fill !== null ? (metricMeta as MetricMeta)[fill || ""] : null;
  const { subcatOptions } = useContext(MapOptionContext);
  const metricDefNoun: string = getCircleZoomLabel(mapId, zoomLevel);
  return (
    <MapPanel tabName={"Legend"} {...{ panelSetId }}>
      <div className={styles.legend}>
        {
          <div className={styles.entries}>
            {
              // fill legend entry
              // note: legend entries are listed in reverse order
            }
            {circleMeta !== null && (
              <Legend
                {...{
                  setInfoTooltipContent,
                  className: "mapboxLegend",
                  key: "basemap - quantized - " + circle,
                  metric_definition: circleMeta.metric_definition,
                  metric_displayname: (
                    <span>
                      {circleMeta.metric_displayname}
                      {!linCircleScale ? " (log scale)" : ""}
                      {metricDefNoun}
                    </span>
                  ),
                  metricDefNoun,
                  ...circleMeta.legendInfo.circle,
                }}
              />
            )}
            {
              // circle legend entry
            }
            {fillMeta !== null && (
              <Legend
                {...{
                  setInfoTooltipContent: setInfoTooltipContent,
                  className: "mapboxLegend",
                  key: "bubble - linear - " + fill,
                  metric_definition: fillMeta.metric_definition,
                  wideDefinition: fillMeta.wideDefinition,
                  metric_displayname: (
                    <span>
                      {getFillLegendName({
                        filters,
                        fill,
                        policyResolution,
                        mapId,
                        date,
                        subcatOptions,
                      })}
                    </span>
                  ),
                  ...fillMeta.legendInfo.fill(mapId, policyResolution),
                }}
              />
            )}
          </div>
        }
      </div>
    </MapPanel>
  );
};

type GetFillLegendNameArgs = {
  fill: string | null;
  mapId: MapId;
  filters: Record<string, any>;
  date: Moment;
  policyResolution: PolicyResolution;
  subcatOptions: Option[];
};

const getFillLegendName: Function = ({
  filters,
  fill,
  policyResolution,
  mapId,
  date,
  subcatOptions,
}: GetFillLegendNameArgs): string | ReactElement | null => {
  const isLockdownLevel = fill === "lockdown_level";

  const nouns = getMapNouns(mapId);

  // prepend "sub-" if subgeo policies are being viewed
  if (policyResolution === PolicyResolution.subgeo)
    nouns.level = "sub-" + nouns.level;

  const isPolicyStatus = fill === "policy_status";
  const isPolicyStatusCounts = fill === "policy_status_counts";
  const omicronPrefix: string =
    filters.subtarget !== undefined && filters.subtarget.length > 0
      ? "Omicron-focused "
      : "";
  if (isLockdownLevel) {
    return `Distancing level at ${nouns.level.toLowerCase()} level on ${date.format(
      "MMM D, YYYY"
    )}`;
  } else if (isPolicyStatus) {
    const category = filters["primary_ph_measure"][0].toLowerCase();
    const subcategory = !isEmpty(filters["ph_measure_details"])
      ? getAndListString(filters["ph_measure_details"], "or").toLowerCase()
      : undefined;
    const prefix = nouns.plural + " with at least one policy in effect for ";
    const suffix = ` on ${date.format("MMM D, YYYY")}`;
    if (subcategory !== undefined) {
      return (
        <ShowMore
          text={omicronPrefix + prefix + subcategory + suffix}
          charLimit={60}
        />
      );
    } else return prefix + category + suffix;
  } else if (isPolicyStatusCounts) {
    if (
      filters["primary_ph_measure"] === undefined ||
      filters["primary_ph_measure"].length === 0
    ) {
      const policyNoun: string =
        filters.subtarget !== undefined && filters.subtarget.length > 0
          ? "Omicron-focused policies"
          : "Policies";
      return `${policyNoun} in effect at ${nouns.level} level on ${date.format(
        "MMM D, YYYY"
      )}`;
    } else {
      const desc = getPolicyCatSubcatPhrase(
        filters["primary_ph_measure"] || [],
        filters["ph_measure_details"] || [],
        subcatOptions,
        "policies",
        true // for legend
      ).trim();
      return getInitCap(
        `${omicronPrefix}${desc} on ${date.format("MMM D, YYYY")}`
      );
    }
  }
  return null;
};

const getCircleZoomLabel: Function = (mapId: MapId, zoom: number): string => {
  // get all circle sources
  if (mapSources[mapId] === null || mapSources[mapId] === undefined) return "";
  const sourceIds: string[] = Object.keys(mapSources[mapId] as MapSourcesEntry);
  let zoomLabelSources: MapSourcesGeometry[] = [];
  sourceIds
    .filter(sourceId => sourceId.startsWith("circle"))
    .forEach(sourceId => {
      const circleSource: MapSourcesGeometry = (mapSources[
        mapId
      ] as MapSourcesEntry)[sourceId] as MapSourcesGeometry;
      const overMin: boolean =
        circleSource.def.minzoom === undefined ||
        circleSource.def.minzoom <= zoom;
      const underMax: boolean =
        circleSource.def.maxzoom === undefined ||
        circleSource.def.maxzoom >= zoom;
      const hasZoomLabel: boolean = circleSource.def.zoomLabel !== undefined;
      if (overMin && underMax && hasZoomLabel) {
        zoomLabelSources.push(circleSource);
      }
    });
  // get all sources visible at current zoom
  // apply zoom label from first such source
  if (zoomLabelSources.length > 1 || zoomLabelSources.length === 0) {
    return "";
  } else if (zoomLabelSources[0].def.zoomLabel !== undefined)
    return " " + zoomLabelSources[0].def.zoomLabel;
  else return "";
};
