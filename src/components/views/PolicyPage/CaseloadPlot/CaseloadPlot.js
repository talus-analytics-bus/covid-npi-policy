import React from "react";
import axios from "axios";

import {
  VictoryChart,
  VictoryCursorContainer,
  VictoryLine,
  VictoryAxis,
  VictoryScatter,
  VictoryLabel,
  createContainer,
  LineSegment,
  VictoryPortal,
} from "victory";

import { Caseload } from "api/queryTypes";

import styles from "./CaseloadPlot.module.scss";

const interventionColors = {
  Lockdown: "#661B3C",
  "mobility policies implemented": "#7F7F7F",
  "Unclear lockdown level": "#7F7F7F",
  "Mixed distancing levels": "#7F7F7F",
  "Stay-at-home": "#C1272D",
  "Safer-at-home": "#D66B3E",
  "Stay at home": "#C1272D",
  "Safer at home": "#D66B3E",
  "New open": "#ECBD62",
  "New normal": "#ECBD62",
};

const CaseloadPlot = ({
  country,
  state,
  policyPageCaseload,
  setPolicyPageCaseload,
}) => {
  // const country = country
  const stateForAPI = state === "Unspecified" ? undefined : state;

  //   React.useEffect(() => {
  //     const getCaseload = async () => {
  //       console.log(`MAKE REQUEST: ${country}, ${stateForAPI}`);
  //       const response = await Caseload({
  //         countryIso3: country,
  //         stateName: stateForAPI, // leave undefined if country-level data required
  //       });
  //
  //       setPolicyPageCaseload({
  //         ...policyPageCaseload,
  //         [country]: {
  //           [stateForAPI || "national"]: response.map(point => ({
  //             x: Date.parse(point.date_time),
  //             y: point.value,
  //           })),
  //         },
  //       });
  //     };
  //
  //     if (country) {
  //       if (!Object.keys(policyPageCaseload).includes(country)) {
  //         getCaseload();
  //       }
  //       if (Object.keys(policyPageCaseload).includes(country)) {
  //         if (!policyPageCaseload[country][stateForAPI || "national"]) {
  //           getCaseload();
  //         }
  //       }
  //     }
  //   }, [country, stateForAPI, policyPageCaseload, setPolicyPageCaseload]);

  return (
    <VictoryChart
      // animate={{ duration: 1000 }}
      padding={{ top: 6, bottom: 20, left: 40, right: 10 }}
      // domainPadding={5}
      responsive={true}
      width={500}
      height={150}
      scale={{ x: "time" }}
      containerComponent={
        <VictoryCursorContainer
          className={styles.chart}
          // cursorLabelComponent={
          //     <InspectDayCursor
          //       showInfo={!addIntDialogState.show}
          //       data={props.data}
          //       interventionColors={interventionColors}
          //       state={props.selectedState}
          //       labelNames={labelNames}
          //       contactPlotType={props.contactPlotType}
          //     />
          // }
          // cursorComponent={<LineSegment style={{ display: "none" }} />}
          cursorLabel={({ datum }) => `Cursor from model here...`}
          cursorDimension="x"
        />
      }
    >
      <VictoryAxis
        dependentAxis
        label={"Caseload\n"}
        tickFormat={tick => (tick >= 1000 ? tick / 1000 + "K" : tick)}
        offsetX={40}
        style={{
          grid: {
            stroke: "#aaaaaa",
            strokeWidth: 1,
          },
          axis: { stroke: "#fff", strokeWidth: 0 },
          ticks: { strokeWidth: 0 },
          tickLabels: {
            fill: "#6d6d6d",
            fontFamily: "Rawline",
            fontWeight: "500",
            fontSize: 6,
          },
        }}
        axisLabelComponent={
          <VictoryLabel
            dy={1}
            style={{
              fill: "#6d6d6d",
              fontFamily: "Rawline",
              fontWeight: "500",
              fontSize: 6,
              textAnchor: "middle",
            }}
          />
        }
      />
      <VictoryAxis
        orientation="bottom"
        style={{
          tickLabels: {
            fontFamily: "Rawline",
            fontWeight: "500",
            fontSize: 7,
            fill: "#6d6d6d",
          },
        }}
      />

      {policyPageCaseload[country] &&
        policyPageCaseload[country][stateForAPI || "national"] && (
          <VictoryLine
            style={{
              data: { stroke: "#14477A", strokeWidth: 0.75 },
            }}
            data={policyPageCaseload[country][stateForAPI || "national"]}
          />
        )}
    </VictoryChart>
  );
};

export default CaseloadPlot;
