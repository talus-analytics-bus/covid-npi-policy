import React from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import PolicyPlot from "../PolicyPlot/PolicyPlot";
import states from "../PolicyModel/states.js";

import styles from "./State.module.scss";

import infoIcon from "../../../../assets/icons/info-blue.svg";
import stateCloseButtonIcon from "../../../../assets/icons/stateCloseButton.svg";

// round to nearest hundred and add commas
const formatModeled = number => {
  const integer = parseInt(number);
  if (integer <= 10) {
    return integer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else if (integer <= 100) {
    return (Math.round(integer / 10) * 10)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else {
    return (Math.round(integer / 100) * 100)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }
};

const formatActuals = number =>
  number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

const formatDate = date =>
  new Date(date).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const State = props => {
  // console.log(cumulativeCases);
  // const dateString = new Date(props.curves.date).toLocaleString('default', {
  //   month: 'short',
  //   day: 'numeric',
  //   year: 'numeric',
  // })

  return (
    <section className={styles.state}>
      {props.selectedStates.length > 1 && (
        <button
          className={styles.removeState}
          onClick={e => {
            e.preventDefault();
            const newSelectedStates = [...props.selectedStates];
            newSelectedStates.splice(props.index, 1);
            props.setSelectedStates(newSelectedStates);
          }}
        >
          <img src={stateCloseButtonIcon} alt="Remove state from comparison" />
        </button>
      )}

      <header>
        <div className={styles.stateHeader}>
          <div className={styles.stateName}>
            {states.find(state => state.abbr === props.selectedState).name}
          </div>
          <div className={styles.explanation}>
            Case Count with Existing Policies
          </div>
          <div className={styles.checkbox}></div>
          <div className={styles.cases}>
            {formatActuals(props.curves.cases)}
          </div>
          <div className={styles.casesLabel}>
            <p className={styles.label}>Cumulative Cases</p>
            <p className={styles.date}>
              as of{" "}
              {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "}
              (actual)
            </p>
            <p className={styles.popPercent}>
              {((props.curves.cases / props.curves.population) * 100).toFixed(
                2
              )}
              % of total population
            </p>
          </div>
          <div className={styles.cases}>
            {formatActuals(props.curves.deaths)}
          </div>
          <div className={styles.casesLabel}>
            <p className={styles.label}>Cumulative Deaths</p>
            <p className={styles.date}>
              as of{" "}
              {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "}
              (actual)
            </p>
          </div>
          <div className={styles.explanation}>What if we had done nothing?</div>
          <div className={styles.checkbox}>
            <label>
              View on graph
              <input
                type="checkbox"
                checked={props.counterfactualSelected}
                onChange={() =>
                  props.setCounterfactualSelected(!props.counterfactualSelected)
                }
              />
            </label>
          </div>
          <div className={styles.cases}>
            {formatModeled(props.curves.counterfactual_cases)}
          </div>
          <div className={styles.casesLabel}>
            <p className={styles.label}>Cumulative Cases</p>
            <p className={styles.date}>
              as of{" "}
              {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "}
              (modeled)
            </p>
            <p className={styles.popPercent}>
              {(
                (props.curves.counterfactual_cases / props.curves.population) *
                100
              ).toFixed(2)}
              % of total population
            </p>
          </div>
          <div className={styles.cases}>
            {formatModeled(props.curves.counterfactual_deaths)}
          </div>
          <div className={styles.casesLabel}>
            <p className={styles.label}>Cumulative Deaths</p>
            <p className={styles.date}>
              as of{" "}
              {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "}
              (modeled)
            </p>
          </div>
        </div>
        {/* <div className={styles.stateName}> */}
        {/*   <h1> */}
        {/*     {states.find(state => state.abbr === props.selectedState).name} */}
        {/*   </h1> */}
        {/* <label> */}
        {/*   Change state */}
        {/*   <select */}
        {/*     value={props.selectedState} */}
        {/*     onChange={e => { */}
        {/*       const newSelectedStates = [...props.selectedStates]; */}
        {/*       newSelectedStates[props.index] = e.target.value; */}
        {/*       props.setSelectedStates(newSelectedStates); */}
        {/*     }} */}
        {/*     aria-label={"Select a state to display"} */}
        {/*   > */}
        {/*     {states.map(state => ( */}
        {/*       <option key={state.abbr} value={state.abbr}> */}
        {/*         {state.name} */}
        {/*       </option> */}
        {/*     ))} */}
        {/*   </select> */}
        {/* </label> */}

        {/* <h1> */}
        {/*   {states.find(state => state.abbr === props.selectedState).name} */}
        {/* </h1> */}
        {/* <h2>{dateString}</h2> */}
        {/* </div> */}
        {/* <div className={styles.overviewStats}> */}
        {/*   <div className={styles.existing}> */}
        {/*     <h3>Case count with existing policies</h3> */}
        {/*     <div> */}
        {/*       <h4> */}
        {/*         {formatNumber(props.curves.cases)}{" "} */}
        {/*         <Tippy */}
        {/*           interactive={true} */}
        {/*           allowHTML={true} */}
        {/*           content={ */}
        {/*             <p> */}
        {/*               Total number of cumulative confirmed and probable cases as */}
        {/*               of {props.dataDates && props.dataDates.last_data_update}. */}
        {/*               Source:{" "} */}
        {/*               <a href={"https://github.com/nytimes/covid-19-data"}> */}
        {/*                 New York Times{" "} */}
        {/*               </a> */}
        {/*             </p> */}
        {/*           } */}
        {/*           maxWidth={"30rem"} */}
        {/*           theme={"light"} */}
        {/*           placement={"bottom"} */}
        {/*           offset={[-30, 10]} */}
        {/*         > */}
        {/*           <img */}
        {/*             className={styles.infoIcon} */}
        {/*             src={infoIcon} */}
        {/*             alt="More information" */}
        {/*           /> */}
        {/*         </Tippy> */}
        {/*       </h4> */}
        {/*       <h5> */}
        {/*         Cumulative cases as of{" "} */}
        {/*         {props.dataDates && props.dataDates.last_data_update} (actual) */}
        {/*       </h5> */}
        {/*     </div> */}
        {/*     <div> */}
        {/*       <h4>{formatNumber(props.curves.deaths)}</h4> */}
        {/*       <h5> */}
        {/*         Cumulative deaths as of{" "} */}
        {/*         {props.dataDates && props.dataDates.last_data_update} (actual) */}
        {/*       </h5> */}
        {/*     </div> */}
        {/*   </div> */}
        {/*   <div className={styles.noAction}> */}
        {/*     <label> */}
        {/*       <input */}
        {/*         type="checkbox" */}
        {/*         checked={props.counterfactualSelected} */}
        {/*         onChange={() => */}
        {/*           props.setCounterfactualSelected(!props.counterfactualSelected) */}
        {/*         } */}
        {/*       /> */}
        {/*       What if we had done nothing? */}
        {/*     </label> */}
        {/*     <div> */}
        {/*       <h4> */}
        {/*         {formatNumber(props.curves.counterfactual_cases)}{" "} */}
        {/*         <Tippy */}
        {/*           content={"Total cumulative cases (modeled)"} */}
        {/*           allowHTML={true} */}
        {/*           maxWidth={"30rem"} */}
        {/*           theme={"light"} */}
        {/*           placement={"bottom"} */}
        {/*           offset={[-30, 10]} */}
        {/*         > */}
        {/*           <img */}
        {/*             className={styles.infoIcon} */}
        {/*             src={infoIcon} */}
        {/*             alt="More information" */}
        {/*           /> */}
        {/*         </Tippy> */}
        {/*       </h4> */}
        {/*       <h5> */}
        {/*         Cumulative Cases as of{" "} */}
        {/*         {props.dataDates && props.dataDates.last_data_update} (modeled){" "} */}
        {/*       </h5> */}
        {/*     </div> */}
        {/*     <div> */}
        {/*       <h4>{formatNumber(props.curves.counterfactual_deaths)}</h4> */}
        {/*       <h5> */}
        {/*         Cumulative deaths as of{" "} */}
        {/*         {props.dataDates && props.dataDates.last_data_update} (modeled) */}
        {/*       </h5> */}
        {/*     </div> */}
        {/*   </div> */}
        {/* </div> */}
      </header>
      <div className={styles.policyPlot}>
        {/* <div className={styles.inputRow}> */}
        {/*   <button onClick={e => e.preventDefault()}>reset</button> */}
        {/*   <select> */}
        {/*     <option value="percent">Interventions</option> */}
        {/*   </select> */}
        {/* </div> */}
        <PolicyPlot
          selectedState={props.selectedState}
          zoomDateRange={props.zoomDateRange}
          setZoomDateRange={props.setZoomDateRange}
          caseLoadAxis={props.caseLoadAxis}
          data={props.curves}
          domain={props.domain}
          activeTab={props.activeTab}
          counterfactualSelected={props.counterfactualSelected}
          addIntervention={props.addIntervention}
          contactPlotType={props.contactPlotType}
        />
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.miniLegend}>
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
        <button
          className={styles.resetState}
          onClick={e => {
            e.preventDefault();
            props.resetState(props.selectedState);
          }}
        >
          Reset Policies
        </button>
      </div>
    </section>
  );
};

export default State;
