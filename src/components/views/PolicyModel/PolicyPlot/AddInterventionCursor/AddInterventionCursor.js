import React from 'react'

import styles from './AddInterventionCursor.module.scss'

const AddInterventionCursor = props => {
  const dateString = new Date(props.datum.x).toLocaleString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const today = new Date()

  // Only display the cursor if the date is in the future
  if ((props.datum.x > today) & (props.y > 3)) {
    // if there's space, display normal tooltip
    if (props.x < 400) {
      // offset the SVG so the cursor is at the
      // middle of the "+" symbol
      const [xOffset, yOffset] = [-7, 0]
      return (
        <g transform={`translate(${props.x + xOffset} ,${props.y + yOffset})`}>
          <g transform="scale(.33)">
            <path
              className={styles.st0}
              d="M9.9,20.4c-5.5,0-9.9,4.4-9.9,9.9s4.4,9.9,9.9,9.9c5.5,0,9.9-4.4,9.9-9.9S15.3,20.4,9.9,20.4z M14.5,31.1h-3.4
  v3.4c0,0.7-0.5,1.2-1.2,1.2c-0.7,0-1.2-0.5-1.2-1.2v-3.4H5.4c-0.7,0-1.2-0.5-1.2-1.2c0-0.7,0.5-1.2,1.2-1.2h3.4v-3.4
  c0-0.7,0.5-1.2,1.2-1.2c0.7,0,1.2,0.5,1.2,1.2v3.4h3.4c0.7,0,1.2,0.5,1.2,1.2C15.7,30.6,15.2,31.1,14.5,31.1z"
            />
            {props.showLabel && (
              <>
                <path
                  className={styles.st1}
                  d="M30.2,68.8V37.4l-11.5-7.4l11.5-8.1V8.7c0-4.4,2.4-7.9,7.7-7.9l158.7,0c5.3,0,7.7,3.6,7.7,7.9v60.1
  c0,4.4-2.4,7.9-7.7,7.9H37.9C32.5,76.8,30.2,73.2,30.2,68.8z"
                />
                <text
                  transform="matrix(0.9626 0 0 1 45.4868 32.6299)"
                  className={styles.st6 + ' ' + styles.st7 + ' ' + styles.st8}
                >
                  {dateString}
                </text>
                <text
                  transform="matrix(1 0 0 1 45.9296 59.5132)"
                  className={styles.st3 + ' ' + styles.st4 + ' ' + styles.st5}
                >
                  Add intervention
                </text>
              </>
            )}
          </g>
        </g>
      )
      // else display reflected tooltip
    } else {
      // offset the SVG so the cursor is at the
      // middle of the "+" symbol
      const [xOffset, yOffset] = [-70, 0]
      return (
        <g transform={`translate(${props.x + xOffset} ,${props.y + yOffset})`}>
          <g transform="scale(.33)">
            <path
              className={styles.st0}
              d="M195,20.4c-5.5,0-9.9,4.4-9.9,9.9s4.4,9.9,9.9,9.9c5.5,0,9.9-4.4,9.9-9.9S200.4,20.4,195,20.4z M199.6,31.1
  h-3.4v3.4c0,0.7-0.5,1.2-1.2,1.2c-0.7,0-1.2-0.5-1.2-1.2v-3.4h-3.4c-0.7,0-1.2-0.5-1.2-1.2c0-0.7,0.5-1.2,1.2-1.2h3.4v-3.4
  c0-0.7,0.5-1.2,1.2-1.2c0.7,0,1.2,0.5,1.2,1.2v3.4h3.4c0.7,0,1.2,0.5,1.2,1.2C200.8,30.6,200.2,31.1,199.6,31.1z"
            />
            {props.showLabel && (
              <>
                <path
                  className={styles.st1}
                  d="M174.8,68.8V37.4l11.5-7.4l-11.5-8.1V8.7c0-4.4-2.4-7.9-7.7-7.9L8.4,0.8c-5.3,0-7.7,3.6-7.7,7.9l0,60.1
  c0,4.4,2.4,7.9,7.7,7.9h158.7C172.5,76.8,174.8,73.2,174.8,68.8z"
                />
                <text
                  x="160"
                  y="32"
                  textAnchor="end"
                  className={styles.st6 + ' ' + styles.st7 + ' ' + styles.st8}
                >
                  {dateString}
                </text>
                <text
                  // Illustrator got it wrong so need to
                  // align this one manually unfortunately
                  x="160"
                  y="58"
                  textAnchor="end"
                  className={styles.st3 + ' ' + styles.st4 + ' ' + styles.st5}
                >
                  Add intervention
                </text>
              </>
            )}
          </g>
        </g>
      )
    }
  } else {
    return false
  }
}

export default AddInterventionCursor
