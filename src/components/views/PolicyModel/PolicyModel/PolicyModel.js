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

import { Caseload, Deaths } from "api/Queries.tsx";

// import PolicyPlot from '../PolicyPlot/PolicyPlot';
import State from "../State/State";
import LoadingState from "../LoadingState/LoadingState";
import NavigatorPlot from "../PolicyPlot/NavigatorPlot/NavigatorPlot";

import styles from "./PolicyModel.module.scss";

import states from "./states";

import infoIcon from "../../../../assets/icons/info-blue.svg";
import ampLogo from "../../../../assets/images/ampLogo.svg";

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

const rollingAverage = (series, windowSize) => {
  const padded = [...Array(windowSize).fill(0), ...series];
  return series.map((day, index) => {
    const w = padded.slice(index + 1, index + windowSize + 1);
    return w.reduce((acc, curr) => acc + curr, 0) / w.length;
  });
};

const PolicyModel = ({ setLoading, setPage }) => {
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    const loadedModels = await loadModels(selectedStates);

    // get curves, max, min from models
    const modelCurves = parseModels(
      loadedModels,
      selectedCurves,
      counterfactualSelected
    );

    if (activeTab === "caseload") {
      const stateFullName = states.find(
        state => state.abbr === selectedStates[0]
      ).name;

      const caseloadData =
        selectedCurves[0] === "infected_a"
          ? await Caseload({
              stateName: stateFullName,
              windowSizeDays: 1,
            })
          : await Deaths({
              stateName: stateFullName,
              windowSizeDays: 1,
            });

      const caseloadPoints = caseloadData.map(day => ({
        // convert dates to ISO format before parsing
        x: new Date(day.date_time.replace(" ", "T").replace(" +00", "")),
        // ignoring negative new cases and deaths
        y: Math.max(day.value, 0),
      }));

      const averageValues = rollingAverage(
        caseloadPoints.map(p => p.y),
        7
      );
      const averagePoints = averageValues.map((p, i) => ({
        x: caseloadPoints[i].x,
        y: p,
      }));

      const seriesMax = Math.max(...caseloadPoints.map(p => p.y));

      if (selectedCurves[0] === "infected_a") {
        modelCurves[selectedStates[0]].curves["infected_a"] = {
          ...modelCurves[selectedStates[0]].curves["infected_a"],
          actuals: caseloadPoints,
          actuals_yMax: seriesMax,
          average: averagePoints,
          actuals_end: caseloadPoints.slice(-1)[0].x,
        };
      } else {
        modelCurves[selectedStates[0]].curves["dead"] = {
          ...modelCurves[selectedStates[0]].curves["dead"],
          actuals: caseloadPoints,
          actuals_yMax: seriesMax,
          average: averagePoints,
          actuals_end: caseloadPoints.slice(-1)[0].x,
        };
      }

      modelCurves[selectedStates[0]]["actuals_yMax"] = seriesMax;
    }

    setCurves({ ...modelCurves });

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

    const domainStartDate =
      activeTab === "caseload" ? new Date(dates[0].toISOString()) : new Date();

    const domainEndDate =
      activeTab === "caseload"
        ? new Date()
        : new Date(dates.slice(-1)[0].toISOString());

    domainStartDate.setDate(domainStartDate.getDate() - 30);
    domainEndDate.setDate(domainEndDate.getDate() + 20);

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
                  Policy status in each state relative to daily cases and
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
              Choose view
              <div
                className={styles.radio}
                onChange={e => setActiveTab(e.target.value)}
              >
                <label>
                  <input
                    type="radio"
                    value="caseload"
                    defaultChecked={activeTab === "caseload"}
                    name="view-mode"
                  />
                  Current and historical data
                </label>
                <label>
                  <input
                    type="radio"
                    value="interventions"
                    defaultChecked={activeTab === "interventions"}
                    name="view-mode"
                  />
                  Model
                </label>
              </div>
            </label>
            {/* <label> */}
            {/*   Show COVID count by */}
            {/*   <div */}
            {/*     className={styles.radio} */}
            {/*     onChange={e => setActiveTab(e.target.value)} */}
            {/*   > */}
            {/*     <label> */}
            {/*       <input type="radio" value="infected_a" name="covid-count" /> */}
            {/*       Current and historical data */}
            {/*     </label> */}
            {/*     <label> */}
            {/*       <input type="radio" value="dead" name="covid-count" /> */}
            {/*        */}
            {/*     </label> */}
            {/*   </div> */}
            {/* </label> */}
            <label>
              Show COVID count by
              <select
                style={{ width: "15rem" }}
                value={selectedCurves[0]}
                onChange={e => {
                  setSelectedCurves([e.target.value, "R effective"]);
                }}
              >
                <option value="infected_a">
                  {
                    { caseload: "Daily cases", interventions: "Active cases" }[
                      activeTab
                    ]
                  }
                </option>
                {/* <option value="infected_b">Hospitalized</option> */}
                {/* <option value="infected_c">ICU</option> */}
                <option value="dead">
                  {
                    {
                      caseload: "Daily deaths",
                      interventions: "Cumulative deaths",
                    }[activeTab]
                  }
                </option>
              </select>
              <Tippy
                interactive={true}
                allowHTML={true}
                content={
                  <p className={styles.ipopup}>
                    {covidCountHoverText[activeTab][selectedCurves[0]]}
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
                activeTab={activeTab}
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
