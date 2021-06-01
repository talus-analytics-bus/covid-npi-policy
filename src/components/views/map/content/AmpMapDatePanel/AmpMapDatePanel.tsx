import { DateSlider } from "components/common";
import { MapPanel } from "components/common/MapboxMap/content/MapPanel/MapPanel";
import { Moment } from "moment";
import React, { FC, ReactElement } from "react";

type ComponentProps = {
  date: Moment;
  setDate: Function;
  minDate: string;
  maxDate: string;
};
export const AmpMapDatePanel: FC<ComponentProps> = ({
  date,
  setDate,
  minDate,
  maxDate,
}): ReactElement => {
  return (
    <MapPanel tabName={"Date selection"} bodyStyle={{ zIndex: "2" }}>
      <DateSlider
        {...{
          label: "Choose date or press play to view change over time",
          date,
          setDate,
          minDate,
          maxDate,
          key: "DateSlider",
        }}
      />
    </MapPanel>
  );
};
