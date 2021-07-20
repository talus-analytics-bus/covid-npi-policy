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
  VictoryBar,
  VictoryPortal,
} from "victory";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import infoIcon from "../../../../assets/icons/info-blue.svg";

// import AddInterventionCursor from "./AddInterventionCursor/AddInterventionCursor";
import InspectDayCursor from "./InspectDayCursor/InspectDayCursor";
import InspectDayLine from "./InspectDayLine/InspectDayLine";
import PastInterventionInfo from "./PastInterventionInfo/PastInterventionInfo";
import AddInterventionDialog from "./AddInterventionDialog/AddInterventionDialog";
import LineExtension from "./LineExtension/LineExtension";

import styles from "./PolicyPlot.module.scss";

const plotColors = [
  // '#00a79d',
  "#14477A",
  "#6C92AB",
  "#aeaeae",
  "#14477A",
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
  "No restrictions": "gray",
  "Stay-at-home": "#C1272D",
  "Safer-at-home": "#D66B3E",
  "Stay at home": "#C1272D",
  "Safer at home": "#D66B3E",
  "New open": "#ECBD62",
  "New normal": "#ECBD62",
  "Partially open": "#ECBD62",
  Open: "#f4ddaf",
};

const phaseNames = {
  Lockdown: "Phase I",
  "Unclear lockdown level": "",
  "Mixed distancing levels": "",
  "Stay-at-home": "Phase II",
  "Safer-at-home": "Phase III",
  "Stay at home": "Phase II",
  "Safer at home": "Phase III",
  "New open": "Phase IV",
  "New normal": "Phase IV",
  Open: "Phase IV",
};

const labelNames = {
  caseload: {
    infected_a: "Daily cases",
    dead: "Daily deaths",
  },
  interventions: {
    infected_a: "Active cases",
    infected_b: "Hospitalized",
    infected_c: "ICU",
    dead: "Cumulative deaths",
  },
};

const covidCountHoverText = {
  caseload: {
    infected_a:
      "Number of new cases per day, as reported by the New York Times",
    dead: "Number of new deaths per day, as reported by the New York Times",
  },
  interventions: {
    infected_a:
      "Number of individuals with an active COVID-19 infection by day",
    infected_b:
      "Number of individuals currently hospitalized for COVID-19 infection by day",
    infected_c:
      "Number of individuals currently hospitalized and in intensive care unit (ICU) for COVID-19 infection by day",
    dead: "Cumulative deaths from COVID-19 by day",
  },
};

const VictoryZoomCursorContainer = createContainer("zoom", "cursor");

const PolicyModel = props => {
  const [pastInterventionProps, setPastInterventionProps] = React.useState({
    x: 0,
    y: 0,
    policyName: "",
    effectiveDate: "",
    interventionColors: interventionColors,
    phaseNames: phaseNames,
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

  const plotRef = React.useRef();
  //   const [plotBBox, setPlotBBox] = React.useState();
  //
  //   const updatePlotBBox = e => {
  //     setPlotBBox(plotRef.current.getBoundingClientRect());
  //   };
  //
  //   React.useEffect(() => {
  //     updatePlotBBox();
  //
  //     window.addEventListener("resize", updatePlotBBox);
  //     return () => {
  //       window.removeEventListener("resize", updatePlotBBox);
  //     };
  //   }, []);
  //
  //   console.log(plotBBox);

  // const percentProportion = 0.14;
  // const chartProportion = 0.45;
  // const navigatorProportion = 0.125

  const [YZoomAnimated, setYZoomAnimated] = React.useState(
    props.caseLoadAxis[1]
  );
  const [YZoomAfterAnimated, setYZoomAfterAnimated] = React.useState(
    props.caseLoadAxis[1]
  );
  const [animID, setAnimID] = React.useState();

  React.useEffect(() => {
    // cancel existing animation if
    // the animation is interrupted
    if (animID !== undefined) {
      // console.log("Cancel Animation");
      cancelAnimationFrame(animID);
    }
    // console.log("Animation Setup\n\n\n");
    const target = props.caseLoadAxis[1];
    let start = props.caseLoadAxis[1];
    let current = YZoomAnimated;

    // in case the animation is interrupted
    if (start === target) {
      start = current;
    }

    const targetDuration = 100; // ms
    // there's roughly 16 ms per frame...
    // if you're running this on a supercomputer
    // where this has a chance of actually
    // hitting 60 fps...
    const steps = targetDuration / 16;
    const yStep = (target - start) / steps;

    const animationStep = () => {
      // console.log("animationStep Called");
      // console.log(`Current: ${current}, Target: ${target}, Step: ${yStep}`);

      if (current === 10000) {
        // console.log("Skip Animation");
        setYZoomAnimated(target);
        return;
      }

      if (current < target && current + yStep < target) {
        setYZoomAnimated(current + yStep);
        current += yStep;
        setAnimID(requestAnimationFrame(animationStep));
        return;
      }

      if (current > target && current + yStep > target) {
        setYZoomAnimated(current + yStep);
        current += yStep;
        setAnimID(requestAnimationFrame(animationStep));
        return;
      }

      // console.log("Done Animating");
      setYZoomAnimated(target);
      setYZoomAfterAnimated(target);
      return;
    };

    setAnimID(requestAnimationFrame(animationStep));
  }, [props.caseLoadAxis]);

  // The actuals lines of the plot
  // const actualsLines = Object.entries(props.data.curves).map(
  //   ([curveName, data], index) => {
  //     if (!["R effective", "pctChange"].includes(curveName)) {
  //       return (
  //         <VictoryLine
  //           key={curveName}
  //           style={{
  //             data: { stroke: plotColors[index], strokeWidth: 0.75 },
  //           }}
  //           data={data.actuals}
  //           // interpolation={'monotoneX'}
  //         />
  //       );
  //     } else {
  //       return false;
  //     }
  //   }
  // );

  const actualsBars = Object.entries(props.data.curves).map(
    ([curveName, data], index) => {
      if (!["R effective", "pctChange"].includes(curveName)) {
        return (
          <VictoryBar
            key={curveName}
            style={{
              data: {
                fill: "#dadada",
                // {
                //   maryland: "rgba(240,0,0,.5)",
                //   infected_a: "rgba(0,240,0,.5)",
                // }[curveName],
              },
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

  const averageLines = Object.entries(props.data.curves).map(
    ([curveName, data], index) => {
      if (!["R effective", "pctChange"].includes(curveName) && data.average) {
        return (
          <VictoryLine
            key={curveName}
            style={{
              data: { stroke: plotColors[index], strokeWidth: 0.75 },
            }}
            data={data.average}
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
          // y: -(caseloadAxisAnimated[1] * (window.innerWidth / 40000)),
          // ...and it changed.
          y: 0,
        },
        {
          x: Date.parse(intervention.intervention_start_date),
          y: YZoomAnimated,
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

    const dotHeight = YZoomAnimated * (0.8 - nearbyInterventions.length * 0.15);

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
                  interventionColors: interventionColors,
                  phaseNames: phaseNames,
                  state: props.selectedState,
                  policyName: intervention.name.split("_")[0],
                  effectiveDate: intervention.intervention_start_date,
                  dotSize: event.target.getBoundingClientRect().width,
                  x:
                    event.target.getBoundingClientRect().left -
                    plotRef.current.getBoundingClientRect().left,
                  y:
                    event.target.getBoundingClientRect().top -
                    plotRef.current.getBoundingClientRect().top,
                  // window.pageYOffset,
                  // interStartDate < now
                  // ? event.target.getBoundingClientRect().top
                  // : // need to adjust for the different size circle
                  // event.target.getBoundingClientRect().top - 2,
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
    <section className={styles.main} ref={plotRef}>
      <PastInterventionInfo
        {...{ pastInterventionProps, setPastInterventionProps }}
      />
      <AddInterventionDialog
        position={addIntDialogState}
        setPosition={setAddIntDialogState}
        addIntervention={props.addIntervention}
        selectedState={props.selectedState}
        interventionColors={interventionColors}
        data={props.data}
      />
      <div className={styles.abovePlot}>
        {props.activeTab === "interventions" && (
          <p className={styles.instruction}>
            <svg x="0px" y="0px" viewBox="0 0 25.2 25.2">
              <circle style={{ fill: "#FFFFFF" }} cx="12.6" cy="12.6" r="12" />
              <path
                style={{ fill: "#8D64DD" }}
                d="M20.8,12.2v0.9c0,0.5-0.4,0.9-0.9,0.9h-6v6c0,0.5-0.4,0.9-0.9,0.9h-0.9c-0.5,0-0.9-0.4-0.9-0.9v-6h-6
  c-0.5,0-0.9-0.4-0.9-0.9v-0.9c0-0.5,0.4-0.9,0.9-0.9h6v-6c0-0.5,0.4-0.9,0.9-0.9H13c0.5,0,0.9,0.4,0.9,0.9v6h6
  C20.4,11.3,20.8,11.7,20.8,12.2z M21.6,21.6c-4.9,4.9-13,4.9-17.9,0s-4.9-13,0-17.9s13-4.9,17.9,0S26.5,16.7,21.6,21.6z M23.6,12.6
  c0-6.1-4.9-11-11-11s-11,4.9-11,11s4.9,11,11,11S23.6,18.7,23.6,12.6z"
              />
            </svg>
            Use cursor on graph to set new policy
            {/* Switch to model view to add interventions */}
          </p>
        )}
      </div>
      <Tippy
        interactive={true}
        allowHTML={true}
        content={
          <p className={styles.ipopup}>
            {covidCountHoverText[props.activeTab][props.selectedCurves[0]]}
          </p>
        }
        maxWidth={"30rem"}
        theme={"light"}
        placement={"bottom"}
        offset={[-30, 10]}
      >
        <img
          className={styles.infoIcon}
          src={infoIcon}
          alt="More information"
          style={{
            position: "absolute",
            height: "2.5%",
            top: {
              caseload: {
                infected_a: "35.5%",
                dead: "35%",
              },
              interventions: {
                infected_a: "46.8%",
                infected_b: "48.5%",
                infected_c: "53.5%",
                dead: "42.5%",
              },
            }[props.activeTab][props.selectedCurves[0]],
            left: "2.2%",
          }}
        />
      </Tippy>
      {props.activeTab === "interventions" && (
        <Tippy
          interactive={true}
          allowHTML={true}
          content={
            props.contactPlotType === "pctChange" ? (
              <p className={styles.ipopup}>
                Estimated percentage of baseline contact rate given policies
                implemented.
              </p>
            ) : (
              <p className={styles.ipopup}>
                Estimated average number of people each infectious person is
                expected to infect.
              </p>
            )
          }
          // maxWidth={"30rem"}
          theme={"light"}
          placement={"bottom"}
          offset={[-30, 10]}
        >
          <img
            className={styles.infoIcon}
            src={infoIcon}
            alt="More information"
            style={{
              position: "absolute",
              height: "2.5%",
              top: "12.5%",
              left: "2.7%",
            }}
          />
        </Tippy>
      )}
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
      {props.activeTab === "interventions" && (
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
            tickValues={
              props.contactPlotType === "pctChange" ? [0, 50, 100] : [0, 1, 2]
            }
            tickFormat={tick =>
              props.contactPlotType === "pctChange" ? tick + "%" : tick
            }
            offsetX={50}
            crossAxis={false}
            label={
              props.contactPlotType === "pctChange"
                ? "% of normal\ncontact rate"
                : "R Effective\n"
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
          {/* <VictoryArea */}
          {/*   style={{ */}
          {/*     data: { stroke: "#14477A", strokeWidth: 0.75, fill: "#14477Abb" }, */}
          {/*   }} */}
          {/*   data={props.data.curves[props.contactPlotType].actuals} */}
          {/*   interpolation={"stepAfter"} */}
          {/* /> */}
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
      )}
      <VictoryChart
        // animate={{ duration: 1000 }}
        padding={{ top: 6, bottom: 20, left: 50, right: 10 }}
        // domainPadding={5}
        responsive={true}
        width={500}
        height={props.activeTab === "interventions" ? 150 : 200}
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
                          x:
                            event.clientX -
                            plotRef.current.getBoundingClientRect().left,
                          y:
                            plotRef.current.getBoundingClientRect().height *
                            0.438,
                          // plotRef.current.getBoundingClientRect().top,
                          date: eventKey.cursorValue.x,
                        });
                      } else {
                        setAddIntDialogState({
                          ...addIntDialogState,
                          show: false,
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
              pastInterventionProps.policyName === "" ? (
                <InspectDayCursor
                  showInfo={!addIntDialogState.show}
                  data={props.data}
                  interventionColors={interventionColors}
                  state={props.selectedState}
                  labelNames={labelNames}
                  contactPlotType={props.contactPlotType}
                  activeTab={props.activeTab}
                />
              ) : (
                // <AddInterventionCursor showLabel={!addIntDialogState.show} />
                <LineSegment />
              )
            }
            cursorComponent={<LineSegment style={{ display: "none" }} />}
            //   pastInterventionProps.policyName === "" ? (
            //     <LineSegment />
            //   ) : (
            //     <LineSegment style={{ display: "none" }} />
            //   )
            // }
            cursorLabel={({ datum }) => `add intervention`}
            allowZoom={false}
            // If we want to re-enable panning, there will
            // need to be better event handling to separate
            // panning and clicking to add interventions.
            allowPan={false}
            // zoomDimension="x"
            cursorDimension="x"
            zoomDomain={{ x: props.zoomDateRange, y: [0, YZoomAnimated] }}
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
          label={labelNames[props.activeTab][props.selectedCurves[0]] + "\n"}
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

        {/* {props.activeTab === "caseload" && actualsLines} */}
        {props.activeTab === "caseload" && actualsBars}
        {props.activeTab === "caseload" && averageLines}
        {counterfactualArea}
        {props.activeTab === "interventions" && modelLines}
        {interventionLines}
        {interventionPoints}
        {/* Today marker */}

        <VictoryLine
          style={{ data: { stroke: "#7FC6FA", strokeWidth: 1.5 } }}
          data={[
            { x: new Date(), y: 0 },
            { x: new Date(), y: YZoomAnimated },
          ]}
        />
      </VictoryChart>

      {/* <NavigatorPlot */}
      {/*   curves={props.data.curves} */}
      {/*   zoomDateRange={props.zoomDateRange} */}
      {/*   setZoomDateRange={props.setZoomDateRange} */}
      {/*   domain={props.domain} */}
      {/*   caseLoadAxis={caseloadAxisAnimated} */}
      {/* /> */}
    </section>
  );
};

/**
 * Return the policy name to display, given its data value
 * @method PastInterventionInfo
 * @param  {[type]}             props [description]
 */
export const getDisplayNameFromPolicyName = ({ policyName, proposed }) => {
  let displayName = policyName;
  if (policyName === "No restrictions") {
    displayName = "No active restrictions";
  } else if (policyName === "New normal") {
    displayName = "Partially open policies";
  } else {
    displayName += " policies";
  }
  if (proposed === undefined) {
    return displayName;
  } else if (proposed) {
    displayName += " proposed";
  } else displayName += " implemented";
  if (policyName === "Open") displayName = policyName;
  return displayName;
};

export default PolicyModel;
