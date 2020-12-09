import React, { useState } from "react";
import axios from "axios";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import loadModels, {
  requestIntervention,
  clearState,
  API_URL,
} from "./LoadModels";

import parseModels from "./parseModels";

import { Caseload } from "../../../misc/Queries.js";

// import PolicyPlot from '../PolicyPlot/PolicyPlot';
import State from "../State/State";
import LoadingState from "../LoadingState/LoadingState";
import NavigatorPlot from "../PolicyPlot/NavigatorPlot/NavigatorPlot";

import styles from "./PolicyModel.module.scss";

import states from "./states";

import infoIcon from "../../../../assets/icons/info-blue.svg";
import ampLogo from "../../../../assets/images/ampLogo.svg";

const covidCountHoverText = {
  infected_a: "Number of individuals with an active COVID-19 infection by day",
  infected_b:
    "Number of individuals currently hospitalized for COVID-19 infection by day",
  infected_c:
    "Number of individuals currently hospitalized and in intensive care unit (ICU) for COVID-19 infection by day",
  dead: "Cumulative deaths from COVID-19 by day",
};

const rollingAverage = (series, windowSize) => {
  const padded = [...Array(windowSize).fill(0), ...series];
  return series.map((day, index) => {
    const w = padded.slice(index + 1, index + windowSize + 1);
    return w.reduce((acc, curr) => acc + curr, 0) / w.length;
  });
};

const PolicyModel = ({ setLoading, setPage }) => {
  const [activeTab, setActiveTab] = useState("caseload");

  // use selected states to load the required models
  const [selectedStates, setSelectedStates] = useState([
    window.location.hash.split("#")[1] || "AL",
  ]);

  const [counterfactualSelected, setCounterfactualSelected] = useState(false);

  // curves selected for parsing
  const [selectedCurves, setSelectedCurves] = useState([
    "infected_a",
    // 'infected_b',
    // 'infected_c',
    // "dead",
    "R effective",
    "pctChange",
  ]);

  const [contactPlotType, setContactPlotType] = useState("pctChange");

  const [curves, setCurves] = useState();
  const [zoomDateRange, setZoomDateRange] = useState([
    new Date("2020-01-01"),
    new Date("2021-01-01"),
  ]);

  const [domain, setDomain] = useState([
    new Date("2020-01-01"),
    new Date("2021-01-01"),
  ]);

  const [caseLoadAxis, setCaseLoadAxis] = useState([0, 10000]);

  // memoization helps here but it would also
  // need to track the latest intervention as a
  // dependency and I don't have that built yet
  // const callbackModels = React.useMemo(
  //   async () => await loadModels(selectedStates),
  //   [selectedStates]
  // )

  const setup = React.useCallback(async () => {
    console.log("setup");
    console.log("interventions");
    const loadedModels = await loadModels(selectedStates);

    // get curves, max, min from models
    const modelCurves = parseModels(
      loadedModels,
      selectedCurves,
      counterfactualSelected
    );

    if (activeTab === "caseload") {
      console.log("Caseload");

      const caseloadData = await Caseload({
        stateName: "Maryland",
        windowSizeDays: 1,
      });

      const caseloadPoints = caseloadData.map(day => ({
        x: new Date(day.date_time),
        y: day.value,
      }));

      modelCurves["MD"].curves["caseload"] = {
        actuals: caseloadPoints,
        modeled: [],
      };

      const averageValues = rollingAverage(
        caseloadPoints.map(p => p.y),
        7
      );
      const averagePoints = averageValues.map((p, i) => ({
        x: caseloadPoints[i].x,
        y: p,
      }));

      const md = [
        { y: new Date("2020-12-07"), x: 19 },
        { y: new Date("2020-12-06"), x: 26 },
        { y: new Date("2020-12-05"), x: 30 },
        { y: new Date("2020-12-04"), x: 26 },
        { y: new Date("2020-12-03"), x: 49 },
        { y: new Date("2020-12-02"), x: 42 },
        { y: new Date("2020-12-01"), x: 32 },
        { y: new Date("2020-11-30"), x: 16 },
        { y: new Date("2020-11-29"), x: 23 },
        { y: new Date("2020-11-28"), x: 33 },
        { y: new Date("2020-11-27"), x: 22 },
        { y: new Date("2020-11-26"), x: 29 },
        { y: new Date("2020-11-25"), x: 37 },
        { y: new Date("2020-11-24"), x: 33 },
        { y: new Date("2020-11-23"), x: 14 },
        { y: new Date("2020-11-22"), x: 19 },
        { y: new Date("2020-11-21"), x: 17 },
        { y: new Date("2020-11-20"), x: 26 },
        { y: new Date("2020-11-19"), x: 21 },
        { y: new Date("2020-11-18"), x: 16 },
        { y: new Date("2020-11-17"), x: 26 },
        { y: new Date("2020-11-16"), x: 7 },
        { y: new Date("2020-11-15"), x: 9 },
        { y: new Date("2020-11-14"), x: 20 },
        { y: new Date("2020-11-13"), x: 12 },
        { y: new Date("2020-11-12"), x: 12 },
        { y: new Date("2020-11-11"), x: 16 },
        { y: new Date("2020-11-10"), x: 12 },
        { y: new Date("2020-11-09"), x: 9 },
        { y: new Date("2020-11-08"), x: 11 },
        { y: new Date("2020-11-07"), x: 7 },
        { y: new Date("2020-11-06"), x: 12 },
        { y: new Date("2020-11-05"), x: 10 },
        { y: new Date("2020-11-04"), x: 10 },
        { y: new Date("2020-11-03"), x: 7 },
        { y: new Date("2020-11-02"), x: 3 },
        { y: new Date("2020-11-01"), x: 5 },
        { y: new Date("2020-10-31"), x: 10 },
        { y: new Date("2020-10-30"), x: 10 },
        { y: new Date("2020-10-29"), x: 12 },
        { y: new Date("2020-10-28"), x: 7 },
        { y: new Date("2020-10-27"), x: 9 },
        { y: new Date("2020-10-26"), x: 3 },
        { y: new Date("2020-10-25"), x: 5 },
        { y: new Date("2020-10-24"), x: 13 },
        { y: new Date("2020-10-23"), x: 8 },
        { y: new Date("2020-10-22"), x: 12 },
        { y: new Date("2020-10-21"), x: 8 },
        { y: new Date("2020-10-20"), x: 9 },
        { y: new Date("2020-10-19"), x: 4 },
        { y: new Date("2020-10-18"), x: 1 },
        { y: new Date("2020-10-17"), x: 4 },
        { y: new Date("2020-10-16"), x: 4 },
        { y: new Date("2020-10-15"), x: 6 },
        { y: new Date("2020-10-14"), x: 10 },
        { y: new Date("2020-10-13"), x: 9 },
        { y: new Date("2020-10-12"), x: 4 },
        { y: new Date("2020-10-11"), x: 4 },
        { y: new Date("2020-10-10"), x: 5 },
        { y: new Date("2020-10-09"), x: 11 },
        { y: new Date("2020-10-08"), x: 6 },
        { y: new Date("2020-10-07"), x: 6 },
        { y: new Date("2020-10-06"), x: 6 },
        { y: new Date("2020-10-05"), x: 3 },
        { y: new Date("2020-10-04"), x: 1 },
        { y: new Date("2020-10-03"), x: 7 },
        { y: new Date("2020-10-02"), x: 1 },
        { y: new Date("2020-10-01"), x: 0 },
        { y: new Date("2020-09-30"), x: 3 },
        { y: new Date("2020-09-29"), x: 8 },
        { y: new Date("2020-09-28"), x: 3 },
        { y: new Date("2020-09-27"), x: 10 },
        { y: new Date("2020-09-26"), x: 8 },
        { y: new Date("2020-09-25"), x: 8 },
        { y: new Date("2020-09-24"), x: 7 },
        { y: new Date("2020-09-23"), x: 7 },
        { y: new Date("2020-09-22"), x: 12 },
        { y: new Date("2020-09-21"), x: 4 },
        { y: new Date("2020-09-20"), x: 3 },
        { y: new Date("2020-09-19"), x: 7 },
        { y: new Date("2020-09-18"), x: 8 },
        { y: new Date("2020-09-17"), x: 6 },
        { y: new Date("2020-09-16"), x: 6 },
        { y: new Date("2020-09-15"), x: 10 },
        { y: new Date("2020-09-14"), x: 1 },
        { y: new Date("2020-09-13"), x: 2 },
        { y: new Date("2020-09-12"), x: 8 },
        { y: new Date("2020-09-11"), x: 4 },
        { y: new Date("2020-09-10"), x: 8 },
        { y: new Date("2020-09-09"), x: 9 },
        { y: new Date("2020-09-08"), x: 3 },
        { y: new Date("2020-09-07"), x: 5 },
        { y: new Date("2020-09-06"), x: 3 },
        { y: new Date("2020-09-05"), x: 7 },
        { y: new Date("2020-09-04"), x: 11 },
        { y: new Date("2020-09-03"), x: 12 },
        { y: new Date("2020-09-02"), x: 5 },
        { y: new Date("2020-09-01"), x: 6 },
        { y: new Date("2020-08-31"), x: 3 },
        { y: new Date("2020-08-30"), x: 6 },
        { y: new Date("2020-08-29"), x: 10 },
        { y: new Date("2020-08-28"), x: 14 },
        { y: new Date("2020-08-27"), x: 5 },
        { y: new Date("2020-08-26"), x: 10 },
        { y: new Date("2020-08-25"), x: 13 },
        { y: new Date("2020-08-24"), x: 3 },
        { y: new Date("2020-08-23"), x: 6 },
        { y: new Date("2020-08-22"), x: 11 },
        { y: new Date("2020-08-21"), x: 5 },
        { y: new Date("2020-08-20"), x: 8 },
        { y: new Date("2020-08-19"), x: 11 },
        { y: new Date("2020-08-18"), x: 9 },
        { y: new Date("2020-08-17"), x: 2 },
        { y: new Date("2020-08-16"), x: 3 },
        { y: new Date("2020-08-15"), x: 5 },
        { y: new Date("2020-08-14"), x: 11 },
        { y: new Date("2020-08-13"), x: 8 },
        { y: new Date("2020-08-12"), x: 8 },
        { y: new Date("2020-08-11"), x: 13 },
        { y: new Date("2020-08-10"), x: 6 },
        { y: new Date("2020-08-09"), x: 8 },
        { y: new Date("2020-08-08"), x: 12 },
        { y: new Date("2020-08-07"), x: 14 },
        { y: new Date("2020-08-06"), x: 15 },
        { y: new Date("2020-08-05"), x: 6 },
        { y: new Date("2020-08-04"), x: 7 },
        { y: new Date("2020-08-03"), x: 8 },
        { y: new Date("2020-08-02"), x: 9 },
        { y: new Date("2020-08-01"), x: 13 },
        { y: new Date("2020-07-31"), x: 5 },
        { y: new Date("2020-07-30"), x: 10 },
        { y: new Date("2020-07-29"), x: 20 },
        { y: new Date("2020-07-28"), x: 11 },
        { y: new Date("2020-07-27"), x: 7 },
        { y: new Date("2020-07-26"), x: 7 },
        { y: new Date("2020-07-25"), x: 11 },
        { y: new Date("2020-07-24"), x: 13 },
        { y: new Date("2020-07-23"), x: 4 },
        { y: new Date("2020-07-22"), x: 3 },
        { y: new Date("2020-07-21"), x: 20 },
        { y: new Date("2020-07-20"), x: 5 },
        { y: new Date("2020-07-19"), x: 9 },
        { y: new Date("2020-07-18"), x: 9 },
        { y: new Date("2020-07-17"), x: 12 },
        { y: new Date("2020-07-16"), x: 6 },
        { y: new Date("2020-07-15"), x: 7 },
        { y: new Date("2020-07-14"), x: 9 },
        { y: new Date("2020-07-13"), x: 6 },
        { y: new Date("2020-07-12"), x: 9 },
        { y: new Date("2020-07-11"), x: 7 },
        { y: new Date("2020-07-10"), x: 15 },
        { y: new Date("2020-07-09"), x: 13 },
        { y: new Date("2020-07-08"), x: 9 },
        { y: new Date("2020-07-07"), x: 20 },
        { y: new Date("2020-07-06"), x: 3 },
        { y: new Date("2020-07-05"), x: 7 },
        { y: new Date("2020-07-04"), x: 13 },
        { y: new Date("2020-07-03"), x: 11 },
        { y: new Date("2020-07-02"), x: 7 },
        { y: new Date("2020-07-01"), x: 15 },
        { y: new Date("2020-06-30"), x: 15 },
        { y: new Date("2020-06-29"), x: 7 },
        { y: new Date("2020-06-28"), x: 11 },
        { y: new Date("2020-06-27"), x: 15 },
        { y: new Date("2020-06-26"), x: 13 },
        { y: new Date("2020-06-25"), x: 21 },
        { y: new Date("2020-06-24"), x: 16 },
        { y: new Date("2020-06-23"), x: 18 },
        { y: new Date("2020-06-22"), x: 8 },
        { y: new Date("2020-06-21"), x: 14 },
        { y: new Date("2020-06-20"), x: 22 },
        { y: new Date("2020-06-19"), x: 14 },
        { y: new Date("2020-06-18"), x: 20 },
        { y: new Date("2020-06-17"), x: 14 },
        { y: new Date("2020-06-16"), x: 35 },
        { y: new Date("2020-06-15"), x: 8 },
        { y: new Date("2020-06-14"), x: 13 },
        { y: new Date("2020-06-13"), x: 26 },
        { y: new Date("2020-06-12"), x: 25 },
        { y: new Date("2020-06-11"), x: 31 },
        { y: new Date("2020-06-10"), x: 33 },
        { y: new Date("2020-06-09"), x: 35 },
        { y: new Date("2020-06-08"), x: 27 },
        { y: new Date("2020-06-07"), x: 9 },
        { y: new Date("2020-06-06"), x: 38 },
        { y: new Date("2020-06-05"), x: 34 },
        { y: new Date("2020-06-04"), x: 2 },
        { y: new Date("2020-06-03"), x: 20 },
        { y: new Date("2020-06-02"), x: 21 },
        { y: new Date("2020-06-01"), x: 29 },
        { y: new Date("2020-05-31"), x: 34 },
        { y: new Date("2020-05-30"), x: 24 },
        { y: new Date("2020-05-29"), x: 37 },
        { y: new Date("2020-05-28"), x: 43 },
        { y: new Date("2020-05-27"), x: 41 },
        { y: new Date("2020-05-26"), x: 38 },
        { y: new Date("2020-05-25"), x: 38 },
        { y: new Date("2020-05-24"), x: 35 },
        { y: new Date("2020-05-23"), x: 32 },
        { y: new Date("2020-05-22"), x: 53 },
        { y: new Date("2020-05-21"), x: 23 },
        { y: new Date("2020-05-20"), x: 34 },
        { y: new Date("2020-05-19"), x: 42 },
        { y: new Date("2020-05-18"), x: 32 },
        { y: new Date("2020-05-17"), x: 50 },
        { y: new Date("2020-05-16"), x: 49 },
        { y: new Date("2020-05-15"), x: 56 },
        { y: new Date("2020-05-14"), x: 54 },
        { y: new Date("2020-05-13"), x: 47 },
        { y: new Date("2020-05-12"), x: 46 },
        { y: new Date("2020-05-11"), x: 49 },
        { y: new Date("2020-05-10"), x: 47 },
        { y: new Date("2020-05-09"), x: 49 },
        { y: new Date("2020-05-08"), x: 63 },
        { y: new Date("2020-05-07"), x: 60 },
        { y: new Date("2020-05-06"), x: 44 },
        { y: new Date("2020-05-05"), x: 52 },
        { y: new Date("2020-05-04"), x: 52 },
        { y: new Date("2020-05-03"), x: 49 },
        { y: new Date("2020-05-02"), x: 47 },
        { y: new Date("2020-05-01"), x: 50 },
        { y: new Date("2020-04-30"), x: 58 },
        { y: new Date("2020-04-29"), x: 69 },
        { y: new Date("2020-04-28"), x: 54 },
        { y: new Date("2020-04-27"), x: 44 },
        { y: new Date("2020-04-26"), x: 53 },
        { y: new Date("2020-04-25"), x: 49 },
        { y: new Date("2020-04-24"), x: 68 },
        { y: new Date("2020-04-23"), x: 52 },
        { y: new Date("2020-04-22"), x: 47 },
        { y: new Date("2020-04-21"), x: 49 },
        { y: new Date("2020-04-20"), x: 57 },
        { y: new Date("2020-04-19"), x: 44 },
        { y: new Date("2020-04-18"), x: 41 },
        { y: new Date("2020-04-17"), x: 42 },
        { y: new Date("2020-04-16"), x: 30 },
        { y: new Date("2020-04-15"), x: 48 },
        { y: new Date("2020-04-14"), x: 37 },
        { y: new Date("2020-04-13"), x: 49 },
        { y: new Date("2020-04-12"), x: 37 },
        { y: new Date("2020-04-11"), x: 43 },
        { y: new Date("2020-04-10"), x: 34 },
        { y: new Date("2020-04-09"), x: 30 },
        { y: new Date("2020-04-08"), x: 31 },
        { y: new Date("2020-04-07"), x: 22 },
        { y: new Date("2020-04-06"), x: 16 },
        { y: new Date("2020-04-05"), x: 21 },
        { y: new Date("2020-04-04"), x: 17 },
        { y: new Date("2020-04-03"), x: 20 },
        { y: new Date("2020-04-02"), x: 12 },
        { y: new Date("2020-04-01"), x: 9 },
        { y: new Date("2020-03-31"), x: 8 },
        { y: new Date("2020-03-30"), x: 11 },
        { y: new Date("2020-03-29"), x: 7 },
        { y: new Date("2020-03-28"), x: 7 },
        { y: new Date("2020-03-27"), x: 3 },
        { y: new Date("2020-03-26"), x: 2 },
        { y: new Date("2020-03-25"), x: 0 },
        { y: new Date("2020-03-24"), x: 1 },
        { y: new Date("2020-03-23"), x: 0 },
        { y: new Date("2020-03-22"), x: 1 },
        { y: new Date("2020-03-21"), x: 0 },
        { y: new Date("2020-03-20"), x: 1 },
        { y: new Date("2020-03-19"), x: 0 },
        { y: new Date("2020-03-18"), x: 2 },
        { y: new Date("2020-03-17"), x: -2 },
        { y: new Date("2020-03-16"), x: 2 },
        { y: new Date("2020-03-15"), x: 0 },
        { y: new Date("2020-03-14"), x: 0 },
        { y: new Date("2020-03-13"), x: 0 },
        { y: new Date("2020-03-12"), x: 0 },
        { y: new Date("2020-03-11"), x: 0 },
        { y: new Date("2020-03-10"), x: 0 },
        { y: new Date("2020-03-09"), x: 0 },
        { y: new Date("2020-03-08"), x: 0 },
        { y: new Date("2020-03-07"), x: 0 },
        { y: new Date("2020-03-06"), x: 0 },
        { y: new Date("2020-03-05"), x: 0 },
      ];

      modelCurves[selectedStates[0]].curves["infected_a"] = {
        ...modelCurves[selectedStates[0]].curves["infected_a"],
        // actuals: caseloadPoints,
        // average: averagePoints,
        actuals: md,
        average: [],
      };

      const mdReverse = md.reverse();

      const MDaverageValues = rollingAverage(
        mdReverse.map(p => p.y),
        7
      );
      const MDaveragePoints = MDaverageValues.map((p, i) => ({
        x: mdReverse[i].x,
        y: p,
      }));

      modelCurves[selectedStates[0]].curves["maryland"] = {
        ...modelCurves[selectedStates[0]].curves["maryland"],
        actuals: mdReverse,
        average: MDaveragePoints,
      };

      modelCurves[selectedStates[0]]["actuals_yMax"] = Math.max(
        ...caseloadPoints.map(p => p.y)
      );

      console.log(modelCurves);
    }
    console.log(
      modelCurves[selectedStates[0]].curves["infected_a"].actuals_yMax
    );
    setCurves({ ...modelCurves });

    console.log(modelCurves);

    // set up axes
    const dates = Object.values(modelCurves)
      .map(state => state.dateRange)
      .flat()
      .sort((date1, date2) => {
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
      });

    const zoomStartDate =
      activeTab === "interventions"
        ? new Date()
        : new Date(dates[0].toISOString());

    const zoomEndDate =
      activeTab === "interventions"
        ? new Date(dates.slice(-1)[0].toISOString())
        : new Date();

    zoomStartDate.setDate(zoomStartDate.getDate() - 10);

    // Initialize the zoom range as all dates
    // using new Date() to create a separate date object
    setZoomDateRange([zoomStartDate, zoomEndDate]);

    const domainStartDate = new Date(dates[0].toISOString());
    const domainEndDate = new Date(dates.slice(-1)[0].toISOString());

    domainStartDate.setMonth(domainStartDate.getMonth() - 1);
    domainEndDate.setMonth(domainEndDate.getMonth() + 1);

    setDomain([domainStartDate, domainEndDate]);

    // const defaultScaleTo = modelCurves
    //   ? Object.values(modelCurves)
    //       .map(state =>
    //         state.interventions.map(inter => {
    //           // console.log(inter.intervention_type);
    //           return inter.intervention_type === "intervention";
    //         })
    //       )
    //       .flat()
    //       .some(el => el === true)
    //     ? "model"
    //     : "actuals"
    //   : "actuals";

    const defaultScaleTo = activeTab === "caseload" ? "actuals" : "model";

    setCaseLoadAxis([
      0,
      Math.max(
        ...Object.values(modelCurves).map(
          state => state[`${defaultScaleTo}_yMax`]
        )
      ),
    ]);
  }, [
    // callbackModels,
    activeTab,
    selectedStates,
    selectedCurves,
    counterfactualSelected,
    setCurves,
    setZoomDateRange,
    setDomain,
    setCaseLoadAxis,
  ]);

  const [scaleTo, setScaleTo] = React.useState("actuals");

  React.useEffect(() => {
    setScaleTo(
      curves
        ? Object.values(curves)
            .map(state =>
              state.interventions.map(
                inter => inter.intervention_type === "intervention"
              )
            )
            .flat()
            .some(el => el === true)
          ? "model"
          : "actuals"
        : "actuals"
    );
  }, [curves]);

  React.useEffect(() => {
    if (curves && Object.values(curves).length > 0) {
      setCaseLoadAxis([
        0,
        Math.max(
          ...Object.values(curves).map(state => state[`${scaleTo}_yMax`])
        ),
      ]);
    }
  }, [curves, scaleTo]);

  const [dataDates, setDataDates] = React.useState();

  React.useEffect(() => {
    const getDataDates = async () => {
      const dates = await axios.get(API_URL + "update_date/");
      const formattedDates = {};
      formattedDates.last_policy_update = new Date(
        dates.data.last_policy_update
      ).toLocaleDateString();
      formattedDates.last_data_update = new Date(
        dates.data.last_data_update
      ).toLocaleDateString();

      setDataDates(formattedDates);
    };

    getDataDates();
  }, []);

  const addIntervention = (state, intervention) => {
    const newCurves = Object.assign({}, curves);
    delete newCurves[state];
    setCurves(newCurves);
    requestIntervention(state, intervention).then(() => setup());
  };

  const resetState = state => {
    const newCurves = Object.assign({}, curves);
    delete newCurves[state];
    setCurves(newCurves);

    clearState(state).then(() => setup());
  };

  // on init render, set loading to false and page to `model`
  React.useEffect(() => {
    setLoading(false);
    setPage("model");
  }, [setLoading, setPage]);

  React.useEffect(() => {
    setup();
  }, [selectedStates, selectedCurves, counterfactualSelected, setup]);

  return (
    <div className={styles.background}>
      <article className={styles.main}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            COVID AMP <strong>Policy Model</strong>
          </h1>
          <div className={styles.wrapContainer}>
            <div className={styles.visualize}>
              <img src={ampLogo} alt="COVID AMP Logo" />
              <div className={styles.text}>
                <h2>Visualize</h2>
                <p>
                  Policy status in each state relative to active cases and
                  fatalities
                </p>
              </div>
            </div>
            <div className={styles.predict}>
              <img src={ampLogo} alt="COVID AMP Logo" />
              <div className={styles.text}>
                <h2>Predict</h2>
                <p>How future policies will impact active cases</p>
              </div>
            </div>
            <div className={styles.show}>
              <img src={ampLogo} alt="COVID AMP Logo" />
              <div className={styles.text}>
                <h2>Show</h2>
                <p>
                  How much benefit previous policies had on mitigating the
                  outbreak
                </p>
              </div>
            </div>
          </div>
          {/* <div className={styles.dataDates}> */}
          {/*   <p> */}
          {/*     {dataDates && ( */}
          {/*       <> */}
          {/*         Policy data as of{" "} */}
          {/*         <strong>{dataDates.last_policy_update}</strong> */}
          {/*       </> */}
          {/*     )} */}
          {/*   </p> */}
          {/*   <p> */}
          {/*     {dataDates && ( */}
          {/*       <> */}
          {/*         Case data as of{" "} */}
          {/*         <strong>{dataDates.last_data_update}</strong> */}
          {/*       </> */}
          {/*     )} */}
          {/*   </p> */}
          {/* </div> */}
        </div>
        <div className={styles.controlRow}>
          <div className={styles.selectControls}>
            <label>
              Choose state
              <select
                value={selectedStates[0]}
                onChange={e => {
                  setSelectedStates([e.target.value]);
                  window.location.hash = e.target.value;
                }}
                aria-label={"Select a state to display"}
              >
                {states.map(state => (
                  <option key={state.abbr} value={state.abbr}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Show COVID count by
              <select
                style={{ width: "13rem" }}
                value={selectedCurves[0]}
                onChange={e => {
                  setSelectedCurves([e.target.value, "R effective"]);
                }}
              >
                <option value="infected_a">Active Cases</option>
                {/* <option value="infected_b">Hospitalized</option> */}
                {/* <option value="infected_c">ICU</option> */}
                <option value="dead">Deaths</option>
              </select>
              <Tippy
                interactive={true}
                allowHTML={true}
                content={
                  <p className={styles.ipopup}>
                    {covidCountHoverText[selectedCurves[0]]}
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
                    top: "2.75rem",
                    right: "2.5rem",
                  }}
                />
              </Tippy>
            </label>

            {/* <label> */}
            {/*   Reduction in contacts */}
            {/*   <select */}
            {/*     onChange={e => setContactPlotType(e.target.value)} */}
            {/*     style={{ width: "13rem" }} */}
            {/*   > */}
            {/*     <option value="pctChange">% reduction</option> */}
            {/*     <option value="R effective">Effective R value</option> */}
            {/*   </select> */}
            {/*   <Tippy */}
            {/*     interactive={true} */}
            {/*     allowHTML={true} */}
            {/*     content={ */}
            {/*       contactPlotType === "pctChange" ? ( */}
            {/*         <p className={styles.ipopup}> */}
            {/*           Estimated percentage reduction in contacts due to policies */}
            {/*           implemented, relative to baseline contact rate. */}
            {/*         </p> */}
            {/*       ) : ( */}
            {/*         <p className={styles.ipopup}> */}
            {/*           Estimated average number of people each infectious person */}
            {/*           is expected to infect. */}
            {/*         </p> */}
            {/*       ) */}
            {/*     } */}
            {/*     // maxWidth={"30rem"} */}
            {/*     theme={"light"} */}
            {/*     placement={"bottom"} */}
            {/*     offset={[-30, 10]} */}
            {/*   > */}
            {/*     <img */}
            {/*       className={styles.infoIcon} */}
            {/*       src={infoIcon} */}
            {/*       alt="More information" */}
            {/*       style={{ */}
            {/*         position: "absolute", */}
            {/*         top: "2.75rem", */}
            {/*         right: "2.5rem", */}
            {/*       }} */}
            {/*     /> */}
            {/*   </Tippy> */}
            {/* </label> */}
          </div>
          <div className={styles.navigator}>
            {/* {console.log("\npolicymodel zoomDateRange")} */}
            {/* {console.log(zoomDateRange)} */}
            {curves && curves[selectedStates[0]] && (
              <NavigatorPlot
                curves={curves[selectedStates[0]].curves}
                zoomDateRange={zoomDateRange}
                setZoomDateRange={setZoomDateRange}
                domain={domain}
                caseLoadAxis={caseLoadAxis}
              />
            )}
          </div>
        </div>
        <div className={styles.tabrow}>
          {/* <button */}
          {/*   onClick={() => setActiveTab('existing')} */}
          {/*   style={{ */}
          {/*     background: activeTab === 'existing' ? '#bde7ff' : '#bde7ff32', */}
          {/*     color: activeTab === 'existing' ? 'inherit' : 'white', */}
          {/*   }} */}
          {/* > */}
          {/*   Existing policies */}
          {/* </button> */}
          {/* <button */}
          {/*   onClick={() => setActiveTab('interventions')} */}
          {/*   style={{ */}
          {/*     background: */}
          {/*       activeTab === 'interventions' ? '#bde7ff' : '#bde7ff32', */}
          {/*     color: activeTab === 'interventions' ? 'inherit' : 'white', */}
          {/*   }} */}
          {/* > */}
          {/*   Evaluate policy interventions */}
          {/* </button> */}
          {/* <div className={styles.location}> */}
          {/*    */}
          {/* </div> */}
        </div>
        <section className={styles.tabarea}>
          <div className={styles.settingsBar}>
            {/* <label> */}
            {/*   Add a state to compare */}
            {/*   <select */}
            {/*     value={selectedStates[0]} */}
            {/*     onChange={e => */}
            {/*       setSelectedStates([e.target.value, ...selectedStates]) */}
            {/*     } */}
            {/*     disabled={selectedStates.length >= 3} */}
            {/*   > */}
            {/*     {states.map(state => ( */}
            {/*       <option key={state.abbr} value={state.abbr}> */}
            {/*         {state.name} */}
            {/*       </option> */}
            {/*     ))} */}
            {/*   </select> */}
            {/* </label> */}

            {/* <label> */}
            {/*   <input */}
            {/*     type="checkbox" */}
            {/*     checked={counterfactualSelected} */}
            {/*     onChange={() => */}
            {/*       setCounterfactualSelected(!counterfactualSelected) */}
            {/*     } */}
            {/*   /> */}
            {/*   COVID COUNT WITH NO ACTIONS TAKEN */}
            {/* </label> */}
          </div>
          {selectedStates.map((state, index) => {
            if (curves && curves[state]) {
              // console.log(curves[state])
              return (
                <State
                  key={state + index}
                  index={index}
                  zoomDateRange={zoomDateRange}
                  setZoomDateRange={setZoomDateRange}
                  addIntervention={addIntervention}
                  // dateOffset={0}
                  caseLoadAxis={caseLoadAxis}
                  selectedState={state}
                  setSelectedStates={setSelectedStates}
                  selectedStates={selectedStates}
                  curves={curves[state]}
                  setCurves={setCurves}
                  allCurves={curves}
                  domain={domain}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  counterfactualSelected={counterfactualSelected}
                  setCounterfactualSelected={setCounterfactualSelected}
                  resetState={resetState}
                  dataDates={dataDates}
                  contactPlotType={contactPlotType}
                  selectedCurves={selectedCurves}
                  setScaleTo={setScaleTo}
                  scaleTo={scaleTo}
                />
              );
            } else {
              // This is where a loading component should go
              return (
                <LoadingState
                  key={state}
                  index={index}
                  state={state}
                  zoomDateRange={zoomDateRange}
                  setZoomDateRange={setZoomDateRange}
                  // dateOffset={0}
                  selectedCurves={selectedCurves}
                  caseLoadAxis={caseLoadAxis}
                  selectedState={state}
                  setSelectedStates={setSelectedStates}
                  selectedStates={selectedStates}
                  // curves={curves[state]}
                  domain={domain}
                  activeTab={activeTab}
                  counterfactualSelected={counterfactualSelected}
                  setCounterfactualSelected={setCounterfactualSelected}
                  contactPlotType={contactPlotType}
                />
              );
            }
          })}
        </section>
      </article>
    </div>
  );
};

export default PolicyModel;
