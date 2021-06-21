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
}): ReactElement => {
  const [data, setData] = useState<NumericObservation[] | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const { circle }: { circle: string | null } = useContext<any>(
    MapOptionContext
  );
  const circleForUpdate: string | null = circle || defaults[mapId].circle;
  const height: number = 30;

  useEffect(() => {
    if (ready) setReady(false);
    updateData(mapId, feature, setData, setReady, circleForUpdate);
  }, [circleForUpdate]);

  const margin: Margin = {
    top: 5,
    bottom: 0,
    left: 1,
    right: 1,
  };

  return (
    <LoadingSpinner
      style={{ height: height + margin.top + 42 }}
      right={true}
      delay={500}
      {...{ ready }}
    >
      <Sparkline
        {...{
          width: 150,
          height,
          classes: [styles.caseSparkline],
          data,
          dataDate,
          unit: ["case", "cases"],
          label: getLabelFromMapMetricId(circleForUpdate),
          customOptions: {
            xMin: "2020-01-21",
            margin,
            noDataText: "No case data to show.",
          },
        }}
      />
    </LoadingSpinner>
  );
};