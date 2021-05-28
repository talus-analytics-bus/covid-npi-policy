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
    <MapPanel tabName={"Date selection"}>
      <DateSlider
        {...{
          label: "View policies and cases over the course of the outbreak",
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
