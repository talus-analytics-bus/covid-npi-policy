import React, {
  FC,
  ReactElement,
  useEffect,
  useState,
  useContext,
} from "react";
import { LoadingSpinner, Sparkline } from "components/common";
import {
  MapFeature,
  MapId,
  NumericObservation,
} from "components/common/MapboxMap/plugins/mapTypes";
import { Moment } from "moment";
import styles from "./AmpCaseSparkline.module.scss";
import { updateData, getLabelFromMapMetricId } from "./helpers";
import MapOptionContext from "components/views/map/context/MapOptionContext";
import { Margin } from "components/common/D3React/types";
import { defaults } from "components/common/MapboxMap/plugins/data";

type ComponentProps = {
  mapId: MapId;
  feature: MapFeature;
  dataDate: Moment;
};
export const AmpCaseSparkline: FC<ComponentProps> = ({
  mapId,
  feature,
  dataDate,
}): ReactElement | null => {
  const [data, setData] = useState<NumericObservation[] | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const { circle }: { circle: string | null } = useContext<any>(
    MapOptionContext
  );
  const metricIdForSparkline: string | null | undefined =
    circle || defaults[mapId].circle;

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
            dataDate,
            unit: ["case", "cases"],
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
