import { ScaleLinear, ScaleTime } from "d3-scale";
import { TimeInterval } from "d3-time";
import { Moment } from "moment";

export type AxesProps = {
  scale: Scale;
  dim: Dimensions;
  customOptions: CustomOptions;
};
export type CustomOptions = {
  // set whether axis labels are visible
  xLabelsVisible?: boolean;
  yLabelsVisible?: boolean;
  // length of tick marks (to hide them, set to 0)
  xTickSize?: number;
  yTickSize?: number;
  // amount of padding between ticks and tick labels
  xLabelPadding?: number;
  yLabelPadding?: number;
  // target number of ticks on axis
  xNumTicks?: number;
  yNumTicks?: number;
  // set whether main axis lines are visible
  xAxisLineVisible?: boolean;
  yAxisLineVisible?: boolean;
  // set whether main grid lines are visible
  xGridlinesVisible?: boolean;
  yGridlinesVisible?: boolean;
  // set whether additional chart boundary lines are visible
  // only pertains to top and right sides of chart, axis lines
  // treated separately
  // NOTE: the normal gridlines might already be rendering a line
  // at the top/right sides of the chart, regardless of these settings
  rightBoundaryVisible?: boolean;
  topBoundaryVisible?: boolean;
  // custom tick formatter
  customXFormatter?: Function;
  customYFormatter?: Function;
  // custom number of ticks
  // time interval is probably not the only option here..
  customXNumTicks?: TimeInterval;
  customYNumTicks?: TimeInterval;
  // set font to be larger by giving it a string value, eg: '2rem'
  largerFont?: string;
};
export type Scale = {
  x: ScaleLinear<number, number> | ScaleTime<number, number>;
  y: ScaleLinear<number, number> | ScaleTime<number, number>;
};
export type Dimensions = {
  height: number;
  width: number;
};

export type SparklineCustomOptions = {
  xMin?: Moment; // hardcode x-axis minimum
  margin?: { top: number; bottom: number; left: number; right: number };
};
