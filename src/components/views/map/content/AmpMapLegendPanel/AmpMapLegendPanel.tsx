import React, { FC, ReactElement, useContext } from "react";
import MapOptionContext from "components/views/map/context/MapOptionContext";
import { Legend, ShowMore } from "components/common";
import { MapPanel } from "components/common/MapboxMap/content/MapPanel/MapPanel";
import { metricMeta } from "components/common/MapboxMap/plugins/data";
import {
  MapId,
  MetricMeta,
  MetricMetaEntry,
  PolicyResolution,
} from "components/common/MapboxMap/plugins/mapTypes";
import styles from "./AmpMapLegendPanel.module.scss";
import { getAndListString, isEmpty, getInitCap } from "components/misc/Util";
import { getMapNouns } from "components/common/MapboxMap/MapboxMap";
import { Moment } from "moment";
import { getPolicyCatSubcatPhrase } from "components/views/map/content/AmpMapPopup/content/PoliciesBodySection/PolicyCount";
import { Option } from "components/common/OptionControls/types";
import InfoTooltipContext from "context/InfoTooltipContext";

type ComponentProps = {
  linCircleScale: boolean;
  policyResolution: PolicyResolution;
  panelSetId?: number;
};
export const AmpMapLegendPanel: FC<ComponentProps> = ({
  linCircleScale,
  policyResolution,
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
  const { subcategoryOptions } = useContext(MapOptionContext);

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
                    </span>
                  ),
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
                        subcategoryOptions,
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
  subcategoryOptions: Option[];
};

const getFillLegendName: Function = ({
  filters,
  fill,
  policyResolution,
  mapId,
  date,
  subcategoryOptions,
}: GetFillLegendNameArgs): string | ReactElement | null => {
  const isLockdownLevel = fill === "lockdown_level";

  const nouns = getMapNouns(mapId);

  // prepend "sub-" if subgeo policies are being viewed
  if (policyResolution === "subgeo") nouns.level = "sub-" + nouns.level;

  const isPolicyStatus = fill === "policy_status";
  const isPolicyStatusCounts = fill === "policy_status_counts";

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
      return <ShowMore text={prefix + subcategory + suffix} charLimit={60} />;
    } else return prefix + category + suffix;
  } else if (isPolicyStatusCounts) {
    if (
      filters["primary_ph_measure"] === undefined ||
      filters["primary_ph_measure"].length === 0
    )
      return `Policies in effect at ${nouns.level} level on ${date.format(
        "MMM D, YYYY"
      )}`;
    else {
      const desc = getPolicyCatSubcatPhrase(
        filters["primary_ph_measure"] || [],
        filters["ph_measure_details"] || [],
        subcategoryOptions,
        "policies"
      ).trim();
      return getInitCap(`${desc} on ${date.format("MMM D, YYYY")}`);
    }
  }
  return null;
};
