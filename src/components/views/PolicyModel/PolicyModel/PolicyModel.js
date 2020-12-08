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

const PolicyModel = ({ setLoading, setPage }) => {
  const [activeTab, setActiveTab] = useState("interventions");

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

    // console.log(modelCurves)

    const caseloadData = await Caseload({
      // countryIso3: "BRA",
      stateName: "Alabama",
      windowSizeDays: 7,
    });

    const caseloadPoints = caseloadData.map(day => ({
      x: new Date(day.date_time),
      y: day.value,
    }));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    modelCurves["AL"].curves["caseload"] = {
      actuals: caseloadPoints,
      modeled: [
        { x: yesterday, y: 2000 },
        { x: new Date(), y: 2000 },
      ],
      actuals_yMax: 43986.25,
      model_yMax: 235394.403108779,
    };

    console.log(modelCurves);

    setCurves(modelCurves);

    // set up axes
    const dates = Object.values(modelCurves)
      .map(state => state.dateRange)
      .flat()
      .sort((date1, date2) => {
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
      });

    const zoomStartDate = new Date(dates[0].toISOString());
    const zoomEndDate = new Date(dates.slice(-1)[0].toISOString());

    zoomStartDate.setDate(zoomStartDate.getDate() - 10);

    // Initialize the zoom range as all dates
    // using new Date() to create a separate date object
    setZoomDateRange([zoomStartDate, zoomEndDate]);

    const domainStartDate = new Date(dates[0].toISOString());
    const domainEndDate = new Date(dates.slice(-1)[0].toISOString());

    domainStartDate.setMonth(domainStartDate.getMonth() - 1);
    domainEndDate.setMonth(domainEndDate.getMonth() + 1);

    setDomain([domainStartDate, domainEndDate]);

    const defaultScaleTo = modelCurves
      ? Object.values(modelCurves)
          .map(state =>
            state.interventions.map(inter => {
              // console.log(inter.intervention_type);
              return inter.intervention_type === "intervention";
            })
          )
          .flat()
          .some(el => el === true)
        ? "model"
        : "actuals"
      : "actuals";

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
