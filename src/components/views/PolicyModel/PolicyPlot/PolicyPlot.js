import React from "react";
import {
  VictoryChart,
  VictoryZoomContainer,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryScatter,
  VictoryLabel,
  createContainer,
  LineSegment,
  VictoryPortal,
} from "victory";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import AddInterventionCursor from "./AddInterventionCursor/AddInterventionCursor";
import PastInterventionInfo from "./PastInterventionInfo/PastInterventionInfo";
import AddInterventionDialog from "./AddInterventionDialog/AddInterventionDialog";
import LineExtension from "./LineExtension/LineExtension";

import styles from "./PolicyPlot.module.scss";

const plotColors = [
  // '#00a79d',
  "#14477A",
  "#14477A",
  "#6C92AB",
  "#aeaeae",
  "#00447c",
  "#aeaeae",
  "#7a4500",
  "#aeaeae",
  "#774573",
];

const interventionColors = {
  Lockdown: "#661B3C",
  "mobility policies implemented": "#7F7F7F",
  "Unclear lockdown level": "#7F7F7F",
  "Mixed distancing levels": "#7F7F7F",
  "Stay at home": "#C1272D",
  "Safer at home": "#D66B3E",
  "New open": "#ECBD62",
  "New normal": "#ECBD62",
};

const labelNames = {
  infected_a: "Infected",
  infected_b: "Hospitalized",
  infected_c: "ICU",
  dead: "Deaths",
};

const VictoryZoomCursorContainer = createContainer("zoom", "cursor");

const PolicyModel = props => {
  const [pastInterventionProps, setPastInterventionProps] = React.useState({
    x: 0,
    y: 0,
    policyName: "",
    effectiveDate: "",
  });

  const [addIntDialogState, setAddIntDialogState] = React.useState({
    show: false,
    x: 0,
    y: 0,
    date: "",
  });

  //   const [windowSize, setWindowSize] = React.useState({
  //     height: window.innerHeight,
  //     width: window.innerWidth,
  //   });
  //
  //   const updateWindowSize = e => {
  //     setWindowSize({
  //       height: window.innerHeight,
  //       width: window.innerWidth,
  //     });
  //   };
  //
  //   React.useEffect(() => {
  //     window.addEventListener("resize", updateWindowSize);
  //     return () => {
  //       window.removeEventListener("resize", updateWindowSize);
  //     };
  //   }, []);

  // const percentProportion = 0.14;
  // const chartProportion = 0.45;
  // const navigatorProportion = 0.125

  // The actuals lines of the plot
  const actualsLines = Object.entries(props.data.curves).map(
    ([curveName, data], index) => {
      if (!["R effective", "pctChange"].includes(curveName)) {
        return (
          <VictoryLine
            key={curveName}
            style={{
              data: { stroke: plotColors[index], strokeWidth: 0.75 },
            }}
            data={data.actuals}
            // interpolation={'monotoneX'}
          />
        );
      } else {
        return false;
      }
    }
  );

  // WHY doesn't Victory let me return multiple lines from
  // the same map function? no reason that shouldn't work.
  // the model (dashed) lines of the plot
  const modelLines = Object.entries(props.data.curves).map(
    ([curveName, data], index) => {
      if (
        !["R effective", "pctChange"].includes(curveName) &
        !curveName.startsWith("CF_")
      ) {
        return (
          <VictoryLine
            key={curveName}
            style={{
              data: {
                stroke: plotColors[index],
                strokeWidth: 0.75,
                strokeDasharray: 2,
              },
            }}
            data={data.model}
            // interpolation={"natural"}
          />
        );
      } else {
        return false;
      }
    }
  );

  const counterfactualArea = Object.entries(props.data.curves).map(
    ([curveName, data], index) => {
      if (curveName.startsWith("CF_")) {
        return (
          <VictoryArea
            key={curveName}
            style={{
              data: {
                stroke: "#409385",
                fill: "#40938566",
                strokeWidth: 0.75,
                strokeDasharray: 0,
              },
            }}
            data={data.model}
            // interpolation={"natural"}
          />
        );
      } else {
        return false;
      }
    }
  );

  const interventionLines = props.data.interventions.map(intervention => (
    <VictoryLine
      key={intervention.name + intervention.intervention_start_date}
      style={{
        data: {
          stroke: interventionColors[intervention.name.split("_")[0]],
          strokeWidth: 0.75,
        },
      }}
      data={[
        {
          x: Date.parse(intervention.intervention_start_date),
          // extend the lines slightly below zero so the circles can
          // sit on the date axis without getting chopped off.
          // this is a hack, the proper approach would be a custom
          // label component that sits within a <VictoryPortal>.
          // not going to take the time because I expect this request to change.
          // y: -(props.caseLoadAxis[1] * (window.innerWidth / 40000)),
          // ...and it changed.
          y: 0,
        },
        {
          x: Date.parse(intervention.intervention_start_date),
          y: props.caseLoadAxis[1],
        },
      ]}
    />
  ));

  const pctChangeInterventionLines = props.data.interventions.map(
    intervention => {
      if (
        new Date(intervention.intervention_start_date) > props.zoomDateRange[0]
      ) {
        return (
          <VictoryLine
            key={intervention.name + intervention.intervention_start_date}
            labelComponent={
              <VictoryPortal>
                <LineExtension
                  color={interventionColors[intervention.name.split("_")[0]]}
                  strokeWidth={0.75}
                  // start={11}
                />
              </VictoryPortal>
            }
            labels={[""]}
            style={{
              data: {
                stroke: interventionColors[intervention.name.split("_")[0]],
                strokeWidth: 0.75,
              },
            }}
            data={[
              {
                x: Date.parse(intervention.intervention_start_date),
                y: 0,
              },
              {
                x: Date.parse(intervention.intervention_start_date),
                y: 0,
              },
            ]}
          />
        );
      } else {
        return null;
      }
    }
  );

  const interventionPoints = props.data.interventions.map(intervention => {
    const interStartDate = new Date(intervention.intervention_start_date);
    const now = new Date();

    const nearbyInterventions = props.data.interventions.filter(
      inter =>
        new Date(inter.intervention_start_date) < interStartDate &&
        interStartDate - new Date(inter.intervention_start_date) <
          1000 * 60 * 60 * 24 * 5
    );

    const dotHeight =
      props.caseLoadAxis[1] * (0.8 - nearbyInterventions.length * 0.15);

    return (
      <VictoryScatter
        key={intervention.name + intervention.intervention_start_date}
        labelComponent={<VictoryLabel style={{ display: "none" }} />}
        size={interStartDate > now ? 3.5 : 4}
        style={{
          data: {
            fill:
              interStartDate > now
                ? "white"
                : interventionColors[intervention.name.split("_")[0]],
            stroke:
              interStartDate > now
                ? interventionColors[intervention.name.split("_")[0]]
                : "white",
            strokeWidth: 0.75,
          },
        }}
        events={[
          {
            childName: "all",
            target: "data",

            eventHandlers: {
              onMouseEnter: (event, eventKey) => {
                setPastInterventionProps({
                  state: props.selectedState,
                  policyName: intervention.name.split("_")[0],
                  effectiveDate: intervention.intervention_start_date,
                  x:
                    window.pageXOffset +
                    event.target.getBoundingClientRect().left,
                  y:
                    interStartDate < now
                      ? window.pageYOffset +
                        event.target.getBoundingClientRect().top
                      : // need to adjust for the different size circle
                        window.pageYOffset +
                        event.target.getBoundingClientRect().top -
                        2,
                });
              },
            },
          },
        ]}
        data={[
          {
            x: interStartDate,
            y: dotHeight,
            label: intervention.name,
          },
        ]}
      />
    );
  });

  return (
    <section className={styles.main}>
      <PastInterventionInfo
        {...{ pastInterventionProps, setPastInterventionProps }}
      />
      <AddInterventionDialog
        position={addIntDialogState}
        setPosition={setAddIntDialogState}
        addIntervention={props.addIntervention}
        selectedState={props.selectedState}
      />
      <label className={styles.legendLabel}>
        <Tippy
          content={
            <div className={styles.legend}>
              <div className={styles.lockdown}>
                <span />
                <p>Lockdown policies</p>
              </div>
              <div className={styles.safer}>
                <span />
                <p>Safer at home policies</p>
              </div>
              <div className={styles.stay}>
                <span />
                <p>Stay at home policies</p>
              </div>
              <div className={styles.normal}>
                <span />
                <p>New normal policies</p>
              </div>
              <div className={styles.proposed}>
                <span />
                <p>Proposed</p>
              </div>
              <div className={styles.actuals}>
                <span />
                <p>Actuals</p>
              </div>
              <div className={styles.modeled}>
                <span />
                <p>Modeled</p>
              </div>
              <div className={styles.noPolicies}>
                <span />
                <p>Cases Without Policies</p>
              </div>
            </div>
          }
          allowHTML={true}
          interactive={true}
          maxWidth={"30rem"}
          theme={"light"}
          placement={"bottom"}
          offset={[-30, 10]}
        >
          <h4>Legend</h4>
        </Tippy>
      </label>
      {/* <svg style={{ height: 0 }}> */}
      {/*   <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%"> */}
      {/*     <stop offset="0%" style={{ stopColor: '#00447c', stopOpacity: 1 }} /> */}
      {/*     <stop */}
      {/*       offset="100%" */}
      {/*       style={{ stopColor: '#00447c', stopOpacity: 0 }} */}
      {/*     /> */}
      {/*   </linearGradient> */}
      {/*   <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"> */}
      {/*     <stop */}
      {/*       offset="0%" */}
      {/*       style={{ stopColor: '#00447c', stopOpacity: 0.5 }} */}
      {/*     /> */}
      {/*     <stop */}
      {/*       offset="100%" */}
      {/*       style={{ stopColor: '#00447c', stopOpacity: 0 }} */}
      {/*     /> */}
      {/*   </linearGradient> */}
      {/* </svg> */}
      <VictoryChart
        padding={{ top: 11, bottom: 2, left: 50, right: 10 }}
        // domainPadding={5}
        responsive={true}
        width={500}
        height={40}
        // height={
        //   (windowSize.height / windowSize.width) * 500 * percentProportion > 25
        //     ? (windowSize.height / windowSize.width) * 500 * percentProportion
        //     : 25
        // }
        // style={{ height: percentProportion * 100 + "%" }}
        scale={{ x: "time" }}
        containerComponent={
          <VictoryZoomContainer
            className={styles.pct}
            allowZoom={false}
            allowPan={false}
            zoomDimension="x"
            zoomDomain={{ x: props.zoomDateRange }}
            // onZoomDomainChange={domain => {
            //   props.setZoomDateRange(domain.x);
            // }}
          />
        }
      >
        {/* <VictoryLabel */}
        {/*   text="R Effective" */}
        {/*   x={4.5} */}
        {/*   y={4} */}
        {/*   style={{ */}
        {/*     fontSize: 6, */}
        {/*     fontWeight: 700, */}
        {/*     fontFamily: "Rawline", */}
        {/*     fill: "#6d6d6d", */}
        {/*   }} */}
        {/* /> */}
        <VictoryAxis
          dependentAxis
          tickFormat={tick => (tick === parseInt(tick) ? parseInt(tick) : null)}
          offsetX={50}
          crossAxis={false}
          label={
            props.contactPlotType === "pctChange"
              ? "% of normal\ncontact rate"
              : "R Effective"
          }
          axisLabelComponent={
            <VictoryLabel
              dy={0}
              style={{
                fill: "#6d6d6d",
                fontFamily: "Rawline",
                fontWeight: "500",
                fontSize: 5,
                textAnchor: "middle",
              }}
            />
          }
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
              fontSize: 5,
              textAnchor:
                props.contactPlotType === "pctChange" ? "end" : "middle",
            },
          }}
        />
        <VictoryArea
          style={{
            data: { stroke: "#14477A", strokeWidth: 0.75, fill: "#14477Abb" },
          }}
          data={props.data.curves[props.contactPlotType].actuals}
          interpolation={"stepAfter"}
        />
        <VictoryArea
          style={{
            data: {
              stroke: "#14477A",
              strokeWidth: 0.75,
              strokeDasharray: 2,
              fill: "#5C87B3BB",
            },
          }}
          data={props.data.curves[props.contactPlotType].model}
          interpolation={"stepAfter"}
        />
        <VictoryLine
          labelComponent={
            <VictoryPortal>
              <LineExtension />
            </VictoryPortal>
          }
          labels={[`TODAY`]}
          style={{ data: { stroke: "#7FC6FA", strokeWidth: 1.5 } }}
          data={[
            { x: new Date(), y: 0 },
            { x: new Date(), y: 3 },
          ]}
        />
        {pctChangeInterventionLines}
      </VictoryChart>
      <VictoryChart
        // animate={{ duration: 1000 }}
        padding={{ top: 6, bottom: 20, left: 50, right: 10 }}
        // domainPadding={5}
        responsive={true}
        width={500}
        height={150}
        events={
          props.activeTab === "interventions"
            ? [
                {
                  target: "parent",
                  eventHandlers: {
                    onClick: (event, eventKey) => {
                      const today = new Date();
                      if (
                        eventKey.cursorValue !== null &&
                        eventKey.cursorValue.x > today
                      ) {
                        setAddIntDialogState({
                          show: true,
                          x: event.clientX,
                          y: window.pageYOffset + event.clientY,
                          date: eventKey.cursorValue.x,
                        });
                      }
                    },
                  },
                },
              ]
            : []
        }
        // height={
        //   (windowSize.height / windowSize.width) * 500 * chartProportion > 100
        //     ? (windowSize.height / windowSize.width) * 500 * chartProportion
        //     : 100
        // }
        // style={{ height: chartProportion * 100 + "%" }}
        scale={{ x: "time" }}
        containerComponent={
          <VictoryZoomCursorContainer
            className={styles.chart}
            cursorLabelComponent={
              (props.activeTab === "interventions") &
              (pastInterventionProps.policyName === "") ? (
                <AddInterventionCursor showLabel={!addIntDialogState.show} />
              ) : (
                <LineSegment />
              )
            }
            cursorComponent={<LineSegment style={{ display: "none" }} />}
            cursorLabel={({ datum }) => `add intervention`}
            allowZoom={false}
            // If we want to re-enable panning, there will
            // need to be better event handling to separate
            // panning and clicking to add interventions.
            allowPan={false}
            zoomDimension="x"
            zoomDomain={{ x: props.zoomDateRange }}
            // onZoomDomainChange={domain => {
            //   props.setZoomDateRange(domain.x);
            // }}
          />
        }
      >
        {/* <VictoryLabel */}
        {/*   text="CASELOAD" */}
        {/*   x={4.5} */}
        {/*   y={6} */}
        {/*   style={{ */}
        {/*     fontSize: 6, */}
        {/*     fontWeight: 700, */}
        {/*     fontFamily: "Rawline", */}
        {/*     fill: "#6d6d6d", */}
        {/*   }} */}
        {/* /> */}
        <VictoryAxis
          dependentAxis
          label={labelNames[props.selectedCurves[0]] + "\n"}
          // props.contactPlotType === "pctChange" ? "caseload\n" : "Caseload"
          // }
          tickFormat={tick => (tick >= 1000 ? tick / 1000 + "K" : tick)}
          offsetX={50}
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
        {/* Today marker */}
        <VictoryLine
          style={{ data: { stroke: "#7FC6FA", strokeWidth: 1.5 } }}
          data={[
            { x: new Date(), y: 0 },
            { x: new Date(), y: props.caseLoadAxis[1] },
          ]}
        />

        {actualsLines}
        {counterfactualArea}
        {modelLines}
        {interventionLines}
        {interventionPoints}
      </VictoryChart>

      {/* <NavigatorPlot */}
      {/*   curves={props.data.curves} */}
      {/*   zoomDateRange={props.zoomDateRange} */}
      {/*   setZoomDateRange={props.setZoomDateRange} */}
      {/*   domain={props.domain} */}
      {/*   caseLoadAxis={props.caseLoadAxis} */}
      {/* /> */}
    </section>
  );
};

export default PolicyModel;
