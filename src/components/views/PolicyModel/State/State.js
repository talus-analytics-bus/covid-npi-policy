import React from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import PolicyPlot from "../PolicyPlot/PolicyPlot";
import states from "../PolicyModel/states.js";

import styles from "./State.module.scss";

import infoIcon from "../../../../assets/icons/info-blue.svg";
import greenInfoIcon from "../../../../assets/icons/info-green.svg";
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
    timeZone: "UTC",
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

      <a href="/about/doc/" className={styles.documentationLink}>
        <svg x="0px" y="0px" viewBox="0 0 10.5 11.1">
          <path
            d="M9.4,0H1C0.5,0,0,0.5,0,1v9c0,0.6,0.5,1,1,1h8.4c0.6,0,1-0.5,1-1V1C10.5,0.5,10,0,9.4,0z M6.8,7.9
          H2.1v-1h4.7V7.9z M8.4,5.8H2.1v-1h6.3V5.8z M8.4,3.7H2.1v-1h6.3V3.7z"
          />
        </svg>
        Documentation
      </a>

      <header>
        <div className={styles.stateHeader}>
          <div className={styles.stateName}>
            {states.find(state => state.abbr === props.selectedState).name}
          </div>
          <div className={styles.explanation}>
            Case count with
            <br /> existing policies
          </div>
          <div className={styles.cases}>
            {formatActuals(props.curves.cases)}
          </div>
          <div className={styles.casesLabel}>
            <p className={styles.label}>cumulative cases</p>
            <p className={styles.date}>
              as of{" "}
              {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "}
              (actual){" "}
              <Tippy
                interactive={true}
                allowHTML={true}
                content={
                  <p className={styles.ipopup}>
                    Total number of cumulative confirmed and probable cases as
                    of{" "}
                    {props.dataDates &&
                      formatDate(props.dataDates.last_data_update)}
                    . Source:{" "}
                    <a href={"https://github.com/nytimes/covid-19-data"}>
                      New York Times{" "}
                    </a>
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
                />
              </Tippy>
            </p>
            <p className={styles.popPercent}>
              {(props.curves.cases / props.curves.population) * 100 >= 0.5
                ? (
                    (props.curves.cases / props.curves.population) *
                    100
                  ).toFixed(0)
                : (
                    (props.curves.cases / props.curves.population) *
                    100
                  ).toFixed(1)}
              % of total population
            </p>
          </div>
          <div className={styles.cases}>
            {formatActuals(props.curves.deaths)}
          </div>
          <div className={styles.casesLabel}>
            <p className={styles.label}>cumulative deaths</p>
            <p className={styles.date}>
              as of{" "}
              {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "}
              <Tippy
                interactive={true}
                allowHTML={true}
                content={
                  <p className={styles.ipopup}>
                    Total number of cumulative confirmed and probable deaths as
                    of{" "}
                    {props.dataDates &&
                      formatDate(props.dataDates.last_data_update)}
                    . Source:{" "}
                    <a href={"https://github.com/nytimes/covid-19-data"}>
                      New York Times{" "}
                    </a>
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
                />
              </Tippy>
            </p>
          </div>
          {/* <div className={styles.explanation}> */}
          {/*   What if we had <br /> done nothing? */}
          {/*   <label> */}
          {/*     <input */}
          {/*       type="checkbox" */}
          {/*       checked={props.counterfactualSelected} */}
          {/*       onChange={() => */}
          {/*         props.setCounterfactualSelected(!props.counterfactualSelected) */}
          {/*       } */}
          {/*     /> */}
          {/*     View the "What if" scenario on the graph */}
          {/*   </label> */}
          {/* </div> */}
          {/* <div className={styles.cases}> */}
          {/*   {formatModeled(props.curves.counterfactual_cases)} */}
          {/* </div> */}
          {/* <div className={styles.casesLabel}> */}
          {/*   <p className={styles.label}>cumulative cases</p> */}
          {/*   <p className={styles.date}> */}
          {/*     as of{" "} */}
          {/*     {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "} */}
          {/*     (modeled){" "} */}
          {/*     <Tippy */}
          {/*       interactive={true} */}
          {/*       allowHTML={true} */}
          {/*       content={ */}
          {/*         <p className={styles.ipopup}> */}
          {/*           Total number of cumulative cases modeled on the assumption */}
          {/*           no policies had been put in to effect, rounded to indicate */}
          {/*           confidence. */}
          {/*         </p> */}
          {/*       } */}
          {/*       maxWidth={"30rem"} */}
          {/*       theme={"light"} */}
          {/*       placement={"bottom"} */}
          {/*       offset={[-30, 10]} */}
          {/*     > */}
          {/*       <img */}
          {/*         className={styles.infoIcon} */}
          {/*         src={greenInfoIcon} */}
          {/*         alt="More information" */}
          {/*       /> */}
          {/*     </Tippy> */}
          {/*   </p> */}
          {/*   <p className={styles.popPercent}> */}
          {/*     {(props.curves.counterfactual_cases / props.curves.population) * */}
          {/*       100 >= */}
          {/*     0.5 */}
          {/*       ? ( */}
          {/*           (props.curves.counterfactual_cases / */}
          {/*             props.curves.population) * */}
          {/*           100 */}
          {/*         ).toFixed(0) */}
          {/*       : ( */}
          {/*           (props.curves.counterfactual_cases / */}
          {/*             props.curves.population) * */}
          {/*           100 */}
          {/*         ).toFixed(1)} */}
          {/*     % of total population */}
          {/*   </p> */}
          {/* </div> */}
          {/* <div className={styles.cases}> */}
          {/*   {formatModeled(props.curves.counterfactual_deaths)} */}
          {/* </div> */}
          {/* <div className={styles.casesLabel}> */}
          {/*   <p className={styles.label}>cumulative deaths</p> */}
          {/*   <p className={styles.date}> */}
          {/*     as of {props.dataDates && formatDate(props.curves.death_date)}{" "} */}
          {/*     (modeled){" "} */}
          {/*     <Tippy */}
          {/*       interactive={true} */}
          {/*       allowHTML={true} */}
          {/*       content={ */}
          {/*         <p className={styles.ipopup}> */}
          {/*           Research indicates that COVID patients will die within */}
          {/*           approximately 30 days of initial infection. Therefore, to */}
          {/*           align these deaths with the caseload, we report the number */}
          {/*           of cases as of today’s date and the anticipated deaths */}
          {/*           associated with those cases as of 30 days from today. */}
          {/*         </p> */}
          {/*       } */}
          {/*       maxWidth={"30rem"} */}
          {/*       theme={"light"} */}
          {/*       placement={"bottom"} */}
          {/*       offset={[-30, 10]} */}
          {/*     > */}
          {/*       <img */}
          {/*         className={styles.infoIcon} */}
          {/*         src={greenInfoIcon} */}
          {/*         alt="More information" */}
          {/*       /> */}
          {/*     </Tippy> */}
          {/*   </p> */}
          {/* </div> */}
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
        {/*         Cumulative cases as of{" "} */}
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
          setActiveTab={props.setActiveTab}
          counterfactualSelected={props.counterfactualSelected}
          addIntervention={props.addIntervention}
          contactPlotType={props.contactPlotType}
          selectedCurves={props.selectedCurves}
          scaleTo={props.scaleTo}
        />
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.miniLegend}>
          {props.activeTab === "caseload" && (
            <div className={styles.daily}>
              <span />
              <p>
                Daily new{" "}
                {props.selectedCurves[0] === "infected_a" ? "cases" : "deaths"}
              </p>
            </div>
          )}
          {props.activeTab === "caseload" && (
            <div className={styles.actuals}>
              <span />
              <p>7-day average</p>
            </div>
          )}
          {props.activeTab === "interventions" && (
            <div className={styles.modeled}>
              <span />
              <p>Modeled</p>
            </div>
          )}
          {/* <div className={styles.noPolicies}> */}
          {/* <span /> */}
          {/* <p>"What if we had done nothing" scenario</p> */}
          {/* </div> */}
        </div>
        {/* <select */}
        {/*   style={{ width: "13rem" }} */}
        {/*   value={props.scaleTo} */}
        {/*   onChange={e => { */}
        {/*     props.setScaleTo(e.target.value); */}
        {/*   }} */}
        {/* > */}
        {/*   <option value="model">Scale to fit model</option> */}
        {/*   <option value="actuals">Scale to fit actuals</option> */}
        {/* </select> */}
        {props.activeTab === "caseload" ? (
          <p className={styles.source}>
            Source for daily new{" "}
            {props.selectedCurves[0] === "infected_a" ? "cases" : "deaths"}: New
            York Times
          </p>
        ) : (
          <a href="/about/doc" className={styles.source}>
            View documentation for sources
          </a>
        )}
        {props.activeTab === "interventions" && (
          <button
            className={styles.resetState}
            onClick={e => {
              e.preventDefault();
              props.resetState(props.selectedState);
            }}
          >
            Reset policies
          </button>
        )}
      </div>
    </section>
  );
};

export default State;
