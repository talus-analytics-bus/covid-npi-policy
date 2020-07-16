import React from "react";

import styles from "./AddInterventionDialog.module.scss";

import closeButtonIconSVG from "../../../../../assets/icons/addInterventionCloseButton.svg";

const PastInterventionInfo = props => {
  const width = 300;
  const arrowOffset = { x: 25, y: 51 };

  const xPos =
    props.position.x < window.innerWidth / 2
      ? props.position.x + arrowOffset.x
      : props.position.x - width - 6;

  const yPos = props.position.y - arrowOffset.y;

  const popupStyleName =
    props.position.x < window.innerWidth / 2
      ? styles.leftPopup
      : styles.rightPopup;

  const [rVal, setRVal] = React.useState(0.15);
  const [interDate, setInterDate] = React.useState(props.position.date);

  const policyNames = {
    0.12: "Lockdown",
    0.1375: "Stay at home",
    0.19: "Safer at home",
    0.285: "New normal",
  };

  return (
    <section
      display={props.position.show ? "block" : "none"}
      className={popupStyleName}
      style={{
        top: yPos,
        left: xPos,
        width: width,
        opacity: props.position.show ? 1 : 0,
        pointerEvents: props.position.show ? "all" : "none",
      }}
    >
      <form>
        <div className={styles.greySection}>
          <h1>Add Policies</h1>
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
              Effective Date
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
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.12"
                  checked={rVal === 0.12}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                Lockdown
              </label>
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.1375"
                  checked={rVal === 0.1375}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                Stay at home
              </label>
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.19"
                  checked={rVal === 0.19}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                Safer at home
              </label>
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.285"
                  checked={rVal === 0.285}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                New normal
              </label>
            </fieldset>

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
