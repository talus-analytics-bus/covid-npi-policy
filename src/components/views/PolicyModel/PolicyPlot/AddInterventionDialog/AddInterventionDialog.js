import React from 'react'

import styles from './AddInterventionDialog.module.scss'

const PastInterventionInfo = props => {
  const width = 300
  const arrowOffset = { x: 25, y: 41 }

  const xPos =
    props.position.x < window.innerWidth / 2
      ? props.position.x + arrowOffset.x
      : props.position.x - width - 6

  const yPos = props.position.y - arrowOffset.y

  const popupStyleName =
    props.position.x < window.innerWidth / 2
      ? styles.leftPopup
      : styles.rightPopup

  const [rVal, setRVal] = React.useState(0.15)
  const [interDate, setInterDate] = React.useState(props.position.date)

  const policyNames = {
    0.1: 'Lockdown',
    0.15: 'Stay at home',
    0.25: 'Safer at home',
    0.35: 'New normal',
  }

  return (
    <section
      display={props.position.show ? 'block' : 'none'}
      className={popupStyleName}
      style={{
        top: yPos,
        left: xPos,
        width: width,
        opacity: props.position.show ? 1 : 0,
        pointerEvents: props.position.show ? 'all' : 'none',
      }}
    >
      <form>
        <div className={styles.greySection}>
          <h1>Add Policies</h1>
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
                defaultValue={
                  props.position.date === ''
                    ? null
                    : new Date(props.position.date).toISOString().substr(0, 10)
                }
                selected={interDate}
                onChange={e => {
                  setInterDate(new Date(e.target.value))
                }}
              />
            </label>

            <fieldset>
              <legend>Add policies associated with</legend>
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.1"
                  checked={rVal === 0.1}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                Lockdown
              </label>
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.15"
                  checked={rVal === 0.15}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                Stay at home
              </label>
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.25"
                  checked={rVal === 0.25}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                Safer at home
              </label>
              <label>
                <input
                  type="radio"
                  name="phase"
                  value="0.35"
                  checked={rVal === 0.35}
                  onChange={e => setRVal(Number(e.target.value))}
                />
                New normal
              </label>
            </fieldset>

            <div className={styles.buttonRow}>
              <button
                onClick={e => {
                  e.preventDefault()
                  props.setPosition({ ...props.position, show: false })
                }}
              >
                cancel
              </button>
              <button
                onClick={e => {
                  e.preventDefault()
                  const startDate =
                    interDate === ''
                      ? new Date(props.position.date)
                          .toISOString()
                          .substr(0, 10)
                      : interDate.toISOString()

                  const intervention = {
                    name: policyNames[rVal] + '_' + startDate,
                    system_name: 'string',
                    description: 'string',
                    startdate: startDate,

                    params: { beta_mild: rVal, beta_asymp: rVal },
                    intervention_type: 'intervention',
                  }
                  props.addIntervention(props.selectedState, intervention)
                }}
              >
                Appy &amp; run
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
  )
}

export default PastInterventionInfo
