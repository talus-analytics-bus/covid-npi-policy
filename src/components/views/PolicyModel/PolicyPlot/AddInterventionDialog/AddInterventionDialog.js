import React from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import infoIcon from "../../../../../assets/icons/info-blue.svg";
import { getDisplayNameFromPolicyName } from "../PolicyPlot";

import styles from "./AddInterventionDialog.module.scss";

import closeButtonIconSVG from "../../../../../assets/icons/addInterventionCloseButton.svg";

import { metricMeta } from "../../../../common/MapboxMap/plugins/data";
import localLogo from "../../../../common/MapboxMap/plugins/assets/icons/logo-local-pill.png";

const PastInterventionInfo = props => {
  const width = 300;
  const arrowOffset = { x: 24, y: 42 };

  const xPos =
    props.position.x < window.innerWidth / 2
      ? props.position.x + arrowOffset.x
      : props.position.x - width - arrowOffset.x;

  const yPos = props.position.y - arrowOffset.y;

  const popupStyleName =
    props.position.x < window.innerWidth / 2
      ? styles.leftPopup
      : styles.rightPopup;

  const [rVal, setRVal] = React.useState(0.285);
  const [interDate, setInterDate] = React.useState(props.position.date);

  const policyNames = {
    0.4: "Open", // TODO update
    0.285: "Partially open", // TODO confirm
    // 0.285: "New normal",
    0.19: "Safer-at-home",
    0.1375: "Stay-at-home",
    0.12: "Lockdown",
    // 0.4: "No restrictions",
  };

  let latestIntervention = props.data.interventions
    .sort((inter1, inter2) => {
      if (
        Date.parse(inter1.intervention_start_date) >
        Date.parse(inter2.intervention_start_date)
      )
        return 1;
      if (
        Date.parse(inter1.intervention_start_date) <
        Date.parse(inter2.intervention_start_date)
      )
        return -1;
      return 0;
    })
    .filter(
      inter =>
        Date.parse(inter.intervention_start_date) <
        Date.parse(props.position.date)
    )
    .slice(-1)[0] || { name: "Unclear lockdown level" };
  const policyOptions = Object.entries(policyNames).map(
    ([optionRVal, dataName]) => {
      const name = getDisplayNameFromPolicyName({
        policyName: dataName,
      }).replace("policies", "");
      return (
        <label
          key={dataName}
          className={
            latestIntervention.name.split("_")[0] === dataName
              ? styles.disabled
              : ""
          }

          // style={{ color: props.interventionColors[name] }}
        >
          <input
            type="radio"
            name={dataName}
            value={optionRVal}
            checked={Number(rVal) === Number(optionRVal)}
            onChange={e => setRVal(Number(e.target.value))}
            disabled={latestIntervention.name.split("_")[0] === dataName}
          />
          {name}
          <span
            className={styles.policyDot}
            style={{ background: props.interventionColors[dataName] }}
          />
          <Tippy
            // interactive={true}
            allowHTML={true}
            content={
              <section className={styles.policyExplanation}>
                <div className={styles.row}>
                  <h1>{name}</h1>
                  <h2>
                    (
                    {
                      metricMeta.lockdown_level.valueStyling[
                        dataName.replace(/-/g, " ")
                      ].phase
                    }
                    )
                  </h2>
                </div>
                {
                  metricMeta.lockdown_level.valueStyling[
                    dataName.replace(/-/g, " ")
                  ].def
                }
              </section>
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
        </label>
      );
    }
  );

  return (
    <section
      display={props.position.show ? "block" : "none"}
      className={popupStyleName}
      style={{
        top: yPos ? yPos : 0,
        left: xPos ? xPos : 0,
        width: width,
        opacity: props.position.show ? 1 : 0,
        pointerEvents: props.position.show ? "all" : "none",
      }}
    >
      <form>
        <div className={styles.greySection}>
          <h1>Add policies</h1>
          <button
            className={styles.closeButton}
            onClick={e => {
              e.preventDefault();
              props.setPosition({ ...props.position, show: false });
            }}
          >
            <img src={closeButtonIconSVG} alt="Close add policy popup" />
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.col}>
            {/* <label> */}
            {/*   Name of intervention */}
            {/*   <input type="text" /> */}
            {/* </label> */}
            <label>
              Effective date
              <input
                type="date"
                min={new Date().toISOString().substr(0, 10)}
                defaultValue={
                  props.position.date === ""
                    ? null
                    : new Date(props.position.date).toISOString().substr(0, 10)
                }
                selected={interDate}
                onChange={e => {
                  setInterDate(new Date(e.target.value));
                }}
              />
            </label>

            <fieldset>
              <legend>Add policies associated with</legend>
              {policyOptions}
            </fieldset>

            <a
              href="https://covid-local.org/metrics/"
              className={styles.COVIDLocalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={localLogo} alt="COVID Local" />
              View phases in COVID-Local
            </a>

            <div className={styles.buttonRow}>
              <button
                onClick={e => {
                  e.preventDefault();
                  const startDate =
                    interDate === ""
                      ? new Date(props.position.date)
                          .toISOString()
                          .substr(0, 10)
                      : interDate.toISOString();

                  const intervention = {
                    name: policyNames[rVal] + "_" + startDate,
                    system_name: "string",
                    description: "string",
                    startdate: startDate,

                    params: { beta_mild: rVal, beta_asymp: rVal },
                    intervention_type: "intervention",
                  };
                  props.addIntervention(props.selectedState, intervention);
                }}
              >
                Apply &amp; run
              </button>
            </div>
          </div>
          {/* <div className={styles.col}> */}
          {/*   <label> */}
          {/*     Use slider to adjust impact of policy on relative tranmission */}
          {/*     <input */}
          {/*       type="range" */}
          {/*       className={styles.verticalSlider} */}
          {/*       min="0" */}
          {/*       max="100" */}
          {/*       value={rVal} */}
          {/*       onChange={e => { */}
          {/*         setRVal(Number(e.target.value)) */}
          {/*       }} */}
          {/*     /> */}
          {/*   </label> */}
          {/* </div> */}
        </div>
      </form>
    </section>
  );
};

export default PastInterventionInfo;
