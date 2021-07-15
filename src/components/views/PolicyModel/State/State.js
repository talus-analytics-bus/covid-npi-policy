import React from "react";
import { Link } from "react-router-dom";

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

      <header>
        <div className={styles.stateHeaderRow}>
          <div className={styles.state}>
            <h1>
              {states.find(state => state.abbr === props.selectedState).name}
            </h1>
            <h2>Case count with existing policies</h2>
          </div>
          <div className={styles.cases}>
            <h3>{formatActuals(props.curves.cases)} cases</h3>
            <p className={styles.date}>
              Cumulative cases as of <br />
              {props.dataDates &&
                formatDate(props.dataDates.last_data_update)}{" "}
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
          <div className={styles.deaths}>
            <h3>
              {props.curves.actual_deaths &&
                formatActuals(props.curves.actual_deaths)}
            </h3>
            <p className={styles.date}>
              Cumulative deaths as of <br />
              {props.dataDates &&
                formatDate(props.dataDates.last_data_update)}{" "}
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
          <div className={styles.viewAll}>
            <Link
              target="_blank"
              // to={`/data?type=policy&filters_policy=%7B"country_name"%3A%5B"United+States+of+America+%28USA%29"%5D%2C"area1"%3A%5B"${
              //   states.find(state => state.abbr === props.selectedState).name
              // }"%5D%7D`}
              to={`/policies/USA/${
                states.find(state => state.abbr === props.selectedState).name
              }`}
            >
              View all{" "}
              {states.find(state => state.abbr === props.selectedState).name}{" "}
              policies
            </Link>
          </div>
        </div>
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
      {/* <div className={styles.bottomRow}> */}
      {/*   <div className={styles.miniLegend}> */}
      {/*     {props.activeTab === "caseload" && ( */}
      {/*       <div className={styles.daily}> */}
      {/*         <span /> */}
      {/*         <p> */}
      {/*           Daily new{" "} */}
      {/*           {props.selectedCurves[0] === "infected_a" ? "cases" : "deaths"} */}
      {/*         </p> */}
      {/*       </div> */}
      {/*     )} */}
      {/*     {props.activeTab === "caseload" && ( */}
      {/*       <div className={styles.actuals}> */}
      {/*         <span /> */}
      {/*         <p>7-day average</p> */}
      {/*       </div> */}
      {/*     )} */}
      {/*     {props.activeTab === "interventions" && ( */}
      {/*       <div className={styles.modeled}> */}
      {/*         <span /> */}
      {/*         <p> */}
      {/*           Modeled{" "} */}
      {/*           {props.selectedCurves[0] === "infected_a" */}
      {/*             ? "active cases" */}
      {/*             : "cumulative deaths"} */}
      {/*         </p> */}
      {/*       </div> */}
      {/*     )} */}
      {/*   </div> */}
      {/*   {props.activeTab === "caseload" ? ( */}
      {/*     <a */}
      {/*       href="https://github.com/nytimes/covid-19-data" */}
      {/*       target="_blank" */}
      {/*       className={styles.source} */}
      {/*     > */}
      {/*       Source for daily new{" "} */}
      {/*       {props.selectedCurves[0] === "infected_a" ? "cases" : "deaths"}: New */}
      {/*       York Times */}
      {/*     </a> */}
      {/*   ) : ( */}
      {/*     <a href="/about/doc" className={styles.source}> */}
      {/*       View documentation for sources */}
      {/*     </a> */}
      {/*   )} */}
      {/*   {props.activeTab === "interventions" && ( */}
      {/*     <button */}
      {/*       className={styles.resetState} */}
      {/*       onClick={e => { */}
      {/*         e.preventDefault(); */}
      {/*         props.resetState(props.selectedState); */}
      {/*       }} */}
      {/*     > */}
      {/*       Reset policies */}
      {/*     </button> */}
      {/*   )} */}
      {/* </div> */}
    </section>
  );
};

export default State;
