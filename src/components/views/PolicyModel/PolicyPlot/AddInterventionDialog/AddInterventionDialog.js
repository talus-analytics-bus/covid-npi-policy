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

  const [rVal, setRVal] = React.useState(0.285);
  const [interDate, setInterDate] = React.useState(props.position.date);

  const policyNames = {
    0.285: "New normal",
    0.19: "Safer-at-home",
    0.1375: "Stay-at-home",
    0.12: "Lockdown",
  };

  const policyOptions = Object.entries(policyNames).map(
    ([optionRVal, name]) => (
      <label key={name}>
        <input
          type="radio"
          name={name}
          value={optionRVal}
          checked={Number(rVal) === Number(optionRVal)}
          onChange={e => setRVal(Number(e.target.value))}
        />
        {name}
      </label>
    )
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
