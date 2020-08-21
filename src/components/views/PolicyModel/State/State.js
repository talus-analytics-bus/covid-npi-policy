import React, { useState } from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import PolicyPlot from "../PolicyPlot/PolicyPlot";
import states from "../PolicyModel/states.js";

import styles from "./State.module.scss";
import classNames from 'classnames'

import infoIcon from "../../../../assets/icons/info-blue.svg";
import greenInfoIcon from "../../../../assets/icons/info-green.svg";
import stateCloseButtonIcon from "../../../../assets/icons/stateCloseButton.svg";
import whiteMaskIcon from '../../../../assets/icons/mask-white.png'
import blueMaskIcon from '../../../../assets/icons/mask-blue.png'

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
  const [maskControlActivated, setMaskControlActivated] = useState(false)

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
          <div className={styles.rows}>
            <div className={styles.headerRow}>
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
                  as of {props.dataDates && formatDate(props.curves.death_date)}{" "}
                  (modeled){" "}
                  <Tippy
                    interactive={true}
                    allowHTML={true}
                    content={
                      <p className={styles.ipopup}>
                        Research indicates that COVID patients will die within
                        approximately 30 days of initial infection. Therefore, to
                        align these deaths with the caseload, we report the number
                        of cases as of today’s date and the anticipated deaths
                        associated with those cases as of 30 days from today.
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
            </div>
            <div className={classNames(
              styles.headerRow,
              styles.counterfactualRow
            )}>
              {props.masksSelected &&
                <div className={styles.disabled}> </div>
              }
              <div className={classNames(
                styles.explanation,
                props.masksSelected ? styles.disabledControl : null
              )}>
                What if we had <br /> done nothing?
                <label>
                  <input
                    type="checkbox"
                    checked={props.counterfactualSelected}
                    onChange={() => {
                      if(!props.masksSelected){
                        props.setCounterfactualSelected(!props.counterfactualSelected)
                      }
                    }}
                  />
                  {/* View cases without policies on graph */}
                  View the "What if" scenario on the graph
                </label>
              </div>
              <div className={styles.cases}>
                {formatModeled(props.curves.counterfactual_cases)}
              </div>
              <div className={styles.casesLabel}>
                <p className={styles.label}>cumulative cases</p>
                <p className={styles.date}>
                  as of{" "}
                  {props.dataDates && formatDate(props.dataDates.last_data_update)}{" "}
                  (modeled){" "}
                  <Tippy
                    interactive={true}
                    allowHTML={true}
                    content={
                      <p className={styles.ipopup}>
                        Total number of cumulative cases modeled on the assumption
                        no policies had been put in to effect, rounded to indicate
                        confidence.
                      </p>
                    }
                    maxWidth={"30rem"}
                    theme={"light"}
                    placement={"bottom"}
                    offset={[-30, 10]}
                  >
                    <img
                      className={styles.infoIcon}
                      src={greenInfoIcon}
                      alt="More information"
                    />
                  </Tippy>
                </p>
                <p className={styles.popPercent}>
                  {(props.curves.counterfactual_cases / props.curves.population) *
                    100 >=
                  0.5
                    ? (
                        (props.curves.counterfactual_cases /
                          props.curves.population) *
                        100
                      ).toFixed(0)
                    : (
                        (props.curves.counterfactual_cases /
                          props.curves.population) *
                        100
                      ).toFixed(1)}
                  % of total population
                </p>
              </div>
              <div className={styles.cases}>
                {formatModeled(props.curves.counterfactual_deaths)}
              </div>
              <div className={styles.casesLabel}>
                <p className={styles.label}>cumulative deaths</p>
                <p className={styles.date}>
                  as of {props.dataDates && formatDate(props.curves.death_date)}{" "}
                  (modeled){" "}
                  <Tippy
                    interactive={true}
                    allowHTML={true}
                    content={
                      <p className={styles.ipopup}>
                        Research indicates that COVID patients will die within
                        approximately 30 days of initial infection. Therefore, to
                        align these deaths with the caseload, we report the number
                        of cases as of today’s date and the anticipated deaths
                        associated with those cases as of 30 days from today.
                      </p>
                    }
                    maxWidth={"30rem"}
                    theme={"light"}
                    placement={"bottom"}
                    offset={[-30, 10]}
                  >
                    <img
                      className={styles.infoIcon}
                      src={greenInfoIcon}
                      alt="More information"
                    />
                  </Tippy>
                </p>
              </div>
            </div>
            <div className={styles.coveringRow}>
              {props.counterfactualSelected && maskControlActivated &&
                <div className={styles.disabled}></div>
              }
              <div 
                className={classNames(
                  styles.coveringContainer,
                  maskControlActivated ? styles.expanded : null
                )}
                onClick={() => {
                  if(!maskControlActivated){
                    if(props.counterfactualSelected){
                      props.setCounterfactualSelected(false)
                    }
                    setMaskControlActivated(true)
                  }
                }}
              >
                <div>
                  <div className={styles.coveringTitle}>
                    <img 
                      src={maskControlActivated ? blueMaskIcon : whiteMaskIcon}
                      alt={'Mask icon'}
                      className={styles.maskIcon}
                    />
                    <div className={styles.title}>
                      Face coverings
                    </div>
                  </div>
                  {maskControlActivated && 
                    <div className={classNames(
                      styles.maskControl,
                      props.counterfactualSelected ? styles.disabledControl : null
                    )}>
                      <label>
                        <input
                          type="checkbox"
                          checked={props.masksSelected}
                          onChange={() => {
                            if(!props.counterfactualSelected){
                              props.setMasksSelected(!props.masksSelected)
                            }
                          }}
                        />
                        {/* View impact of masking on graph */}
                        View impact of face coverings on graph
                      </label>
                    </div>
                  }
                </div>
                {maskControlActivated && 
                <div className={styles.complianceContainer}>
                  <div className={styles.complianceLabel}>Compliance rate</div>
                  <div className={classNames(
                      styles.radioButtons, 
                      props.counterfactualSelected ? styles.disabledControl : null
                    )}>
                    <div className={styles.radioButton}>
                      <input type="radio" id="25" name="compliance" value="25" />
                      <label for="25">25%</label>
                    </div>
                    <div className={styles.radioButton}>
                      <input type="radio" id="50" name="compliance" value="50" />
                      <label for="50">50%</label>
                    </div>
                    <div className={styles.radioButton}>
                      <input type="radio" id="75" name="compliance" value="75" />
                      <label for="75">75%</label>
                    </div>
                  </div>
                </div>
                }
              </div>
            </div>
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
          counterfactualSelected={props.counterfactualSelected}
          addIntervention={props.addIntervention}
          contactPlotType={props.contactPlotType}
          selectedCurves={props.selectedCurves}
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
            <p>"What if we had done nothing" scenario</p>
          </div>
        </div>
        <button
          className={styles.resetState}
          onClick={e => {
            e.preventDefault();
            props.resetState(props.selectedState);
          }}
        >
          Reset policies
        </button>
      </div>
    </section>
  );
};

export default State;
