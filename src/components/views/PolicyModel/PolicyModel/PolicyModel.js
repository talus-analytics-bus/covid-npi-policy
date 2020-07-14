import React, { useState } from "react";
import axios from "axios";

import loadModels, {
  requestIntervention,
  clearState,
  API_URL,
} from "./LoadModels";
import parseModels from "./parseModels";

// import PolicyPlot from '../PolicyPlot/PolicyPlot';
import State from "../State/State";
import LoadingState from "../LoadingState/LoadingState";
import NavigatorPlot from "../PolicyPlot/NavigatorPlot/NavigatorPlot";

import styles from "./PolicyModel.module.scss";

import states from "./states";

const PolicyModel = ({ setLoading, setPage }) => {
  const [activeTab] = useState("interventions");

  // use selected states to load the required models
  const [selectedStates, setSelectedStates] = useState(["CO"]);

  const [counterfactualSelected, setCounterfactualSelected] = useState(false);

  // curves selected for parsing
  const [selectedCurves, setSelectedCurves] = useState([
    "infected_a",
    // 'infected_b',
    // 'infected_c',
    // 'dead',
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

    // console.log(modelCurves)
    setCurves(modelCurves);

    // set up axes
    const dates = Object.values(modelCurves)
      .map(state => state.dateRange)
      .flat();

    // Initialize the zoom range as all dates
    setZoomDateRange([
      dates.reduce((prev, curr) => (prev > curr ? curr : prev)),
      dates.reduce((prev, curr) => (prev < curr ? curr : prev)),
    ]);

    // set overall domain; this will be used for the navigator plot.
    setDomain([
      dates.reduce((prev, curr) => (prev > curr ? curr : prev)),
      dates.reduce((prev, curr) => (prev < curr ? curr : prev)),
    ]);

    setCaseLoadAxis([
      0,
      Math.max(...Object.values(modelCurves).map(state => state.yMax)),
    ]);
  }, [
    // callbackModels,
    selectedStates,
    selectedCurves,
    counterfactualSelected,
    setCurves,
    setZoomDateRange,
    setDomain,
    setCaseLoadAxis,
  ]);

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
          <h1 className={styles.title}>COVID AMP policy model</h1>
          <div className={styles.dataDates}>
            <p>
              {dataDates && (
                <>
                  Policy data as of{" "}
                  <strong>{dataDates.last_policy_update}</strong>
                </>
              )}
            </p>
            <p>
              {dataDates && (
                <>
                  Caseload data as of{" "}
                  <strong>{dataDates.last_data_update}</strong>
                </>
              )}
            </p>
          </div>
        </div>
        <div className={styles.introduction}>
          <p>
            The COVID AMP policy model allows users to evaluate the impact of
            policies on the outbreak:
            <ol>
              <li>
                <strong>Visualize</strong> when policies were implemented in
                each state relative to caseload and fatalities
              </li>
              <li>
                <strong>Predict</strong> how future policies will impact
                caseload
              </li>
              <li>
                <strong>Show</strong> how much benefit previous policies had on
                mitigating the outbreak
              </li>
            </ol>
          </p>
        </div>
        <div className={styles.controlRow}>
          <div className={styles.selectControls}>
            <label>
              Change state
              <select
                value={selectedStates[0]}
                onChange={e => {
                  setSelectedStates([e.target.value]);
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
              COVID case count
              <select
                value={selectedCurves[0]}
                onChange={e => {
                  setSelectedCurves([e.target.value, "R effective"]);
                }}
              >
                <option value="infected_a">Infected</option>
                <option value="infected_b">Hospitalized</option>
                <option value="infected_c">ICU</option>
                <option value="dead">Deaths</option>
              </select>
            </label>
            <label>
              Reduction in contacts
              <select onChange={e => setContactPlotType(e.target.value)}>
                <option value="pctChange">% reduction</option>
                <option value="R effective">Effective R Value</option>
              </select>
            </label>
          </div>
          <div className={styles.navigator}>
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
                  counterfactualSelected={counterfactualSelected}
                  setCounterfactualSelected={setCounterfactualSelected}
                  resetState={resetState}
                  dataDates={dataDates}
                  contactPlotType={contactPlotType}
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
