import React, { FC, ReactElement, useEffect, useState } from "react";
import { LoadingSpinner, Sparkline } from "components/common";
import {
  MapFeature,
  MapId,
  NumericObservation,
} from "components/common/MapboxMap/plugins/mapTypes";
import moment, { Moment } from "moment";
import styles from "./CaseSparkline.module.scss";
import { updateData } from "./helpers";

type ComponentProps = {
  mapId: MapId;
  feature: MapFeature;
  dataDate: Moment;
};
export const CaseSparkline: FC<ComponentProps> = ({
  mapId,
  feature,
  dataDate,
}): ReactElement => {
  const [data, setData] = useState<NumericObservation[] | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    updateData(mapId, feature, dataDate, setData, setReady);
  }, [dataDate]);

  if (ready)
    return (
      <Sparkline
        {...{
          width: 150,
          height: 30,
          classes: [styles.caseSparkline],
          data,
          dataDate,
          unit: "cases",
          label: "7-day moving average",
          customOptions: {
            xMin: moment("2020-01-21"),
            margin: { top: 5, bottom: 0, left: 1, right: 1 },
          },
        }}
      />
    );
  else return <LoadingSpinner />;
};
