import React, {
  FC,
  ReactElement,
  useEffect,
  useState,
  useContext,
} from "react";
import { LoadingSpinner, Sparkline } from "src/components/common";
import {
  MapFeature,
  MapId,
  NumericObservation,
} from "src/components/common/MapboxMap/plugins/mapTypes";
import moment, { Moment } from "moment";
import styles from "./AmpCaseSparkline.module.scss";
import { updateData, getLabelFromMapMetricId } from "./helpers";
import MapOptionContext from "src/components/views/map/context/MapOptionContext";
import { Margin } from "src/components/common/D3React/types";
import { defaults } from "src/components/common/MapboxMap/plugins/data";
import { VersionRecord } from "src/api/queryTypes";
import { formatLocalDate } from "src/components/misc/FormatAndDisplay/FormatAndDisplay";

interface AmpCaseSparklineProps {
  mapId: MapId;
  feature: MapFeature;
  dataDate: Moment;
}
export const AmpCaseSparkline: FC<AmpCaseSparklineProps> = ({
  mapId,
  feature,
  dataDate,
}): ReactElement | null => {
  const [data, setData] = useState<NumericObservation[] | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  type AmpCaseSparklineMapOptionContext = {
    circle: string | null;
    versions?: VersionRecord[];
  };

  const { circle, versions }: AmpCaseSparklineMapOptionContext = useContext<
    any
  >(MapOptionContext);
  const metricIdForSparkline: string | null | undefined =
    circle || defaults[mapId].circle;
  // if true, use last available data point as the sparkline date instead of
  // the date defined in props
  const metricVersion: VersionRecord | undefined = versions?.find(
    v =>
      (v.map_types.includes(mapId) || v.map_types.includes("all")) &&
      v.name.startsWith("COVID-19")
  );
  if (metricVersion === undefined)
    console.error(
      "Could not find version data for metric with ID = " + metricIdForSparkline
    );
  const metricLastDatumDate: Moment = moment(metricVersion?.last_datum_date);
  const dataNotForDataDate: boolean = metricLastDatumDate < dataDate;

  useEffect(() => {
    if (ready) setReady(false);
    if (metricIdForSparkline !== undefined)
      updateData(mapId, feature, setData, setReady, metricIdForSparkline);
    // TODO fix dependency array
    // eslint-disable-next-line
  }, [metricIdForSparkline]);

  const margin: Margin = {
    top: 5,
    bottom: 0,
    left: 1,
    right: 1,
  };

  // hardcode loading spinner height to fit well in popup header
  const height: number = 30;

  // JSX // ------------------------------------------------------------------ /
  if (metricIdForSparkline !== undefined)
    return (
      <LoadingSpinner
        style={{ height: height + margin.top + 42 }}
        right={true}
        delay={500}
        {...{ isReady: ready }}
      >
        <Sparkline
          {...{
            width: 150,
            height,
            classes: [styles.caseSparkline],
            data,
            dataDate: dataNotForDataDate ? metricLastDatumDate : dataDate,
            unit: !dataNotForDataDate
              ? ["case", "cases"]
              : [
                `case on ${formatLocalDate(metricLastDatumDate)}`,
                `cases on ${formatLocalDate(metricLastDatumDate)}`,
              ],
            label: getLabelFromMapMetricId(metricIdForSparkline),
            customOptions: {
              xMin: "2020-01-21",
              margin,
              noDataText: "No case data to show.",
            },
          }}
        />
      </LoadingSpinner>
    );
  else return null;
};
