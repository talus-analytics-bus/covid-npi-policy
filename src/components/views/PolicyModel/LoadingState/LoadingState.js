import React from "react";

import styles from "./LoadingState.module.scss";

import PolicyPlot from "../PolicyPlot/PolicyPlot";

import states from "../PolicyModel/states.js";

import loadingSvg from "./loading.svg";

const LoadingState = props => {
  return (
    <section className={styles.state}>
      <header>
        <div className={styles.stateName}>
          {/* <h2>Loading model for</h2> */}
          {/* <h1> */}
          {/*   {states.find(state => state.abbr === props.selectedState).name} */}
          {/* </h1> */}
          <label>
            Loading state...
            <select
              value={props.selectedState}
              onChange={e => {
                const newSelectedStates = [...props.selectedStates];
                newSelectedStates[props.index] = e.target.value;
                props.setSelectedStates(newSelectedStates);
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
        </div>
      </header>
      <div className={styles.policyPlot}>
        <div className={styles.fader}></div>
        <div className={styles.spinner}>
          <img src={loadingSvg} alt="loading spinner" />
        </div>
        <div className={styles.blur}>
          <PolicyPlot
            selectedState={props.selectedState}
            zoomDateRange={props.zoomDateRange}
            setZoomDateRange={props.setZoomDateRange}
            caseLoadAxis={props.caseLoadAxis}
            data={{
              dateRange: props.domain,
              yMax: 1000,
              curves: {
                infected_c: {
                  model: [{ x: new Date("2020-01-01"), y: 0 }],
                  actuals: [{ x: new Date("2020-01-01"), y: 0 }],
                },
                "R effective": {
                  model: [{ x: new Date("2020-01-01"), y: 0 }],
                  actuals: [{ x: new Date("2020-01-01"), y: 0 }],
                },
                pctChange: {
                  model: [{ x: new Date("2020-01-01"), y: 0 }],
                  actuals: [{ x: new Date("2020-01-01"), y: 0 }],
                },
              },
              interventions: [],
              deaths: 0,
              cases: 0,
              date: "2020-01-01",
            }}
            domain={props.domain}
            activeTab={props.activeTab}
            counterfactualSelected={props.counterfactualSelected}
            contactPlotType={props.contactPlotType}
          />
        </div>
      </div>
    </section>
  );
};

export default LoadingState;
