import * as d3 from "d3";
// import { pointer } from "d3";

export function getHandleMouseMove(
  xScale: any, // TODO type
  setMousePath: Function,
  height: number
) {
  return (e: React.MouseEvent) => {
    // mouse moving over canvas
    const mouse = d3.pointer(e);
    const date = xScale.invert(mouse[0]);
    //FIXME: fetch real data, maybe from raw data, or
    // inverting the values of all paths?
    // see commented out below for bisect example
    const i = Math.floor(Math.random() * 20);
    const p = Math.floor(Math.random() * 3);
    const v = Math.floor(Math.random() * 5);
    const o = Math.floor(Math.random() * 10);
    const ed = Math.floor(Math.random() * 40);
    //   setTooltipContent(
    //     <AlertsChartPopup
    //       data={{
    //         date: date,
    //         numReportingFacilities: 124,
    //         numFacilitiesWithAlerts: 60,
    //         icu: i,
    //         ppe: p,
    //         vent: v,
    //         ops: o,
    //         ed: ed,
    //       }}
    //     />
    //   );
    setMousePath("M" + mouse[0] + "," + height + " " + mouse[0] + "," + 0);
  };
}
