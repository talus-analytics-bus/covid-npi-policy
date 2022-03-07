import React from 'react'
import classNames from 'classnames'
import styles from './MobileDisclaimer.module.scss'

const MobileDisclaimer = props => {
  return (
    <div
      className={classNames(styles.mobile)}
    >
      <div className={styles.disclaimer}>
        <p>
          Welcome to the COVID Analysis and Mapping of Policies (AMP) visualization
          tool, a comprehensive database of policies and plans to address
          the COVID-19 pandemic.
        </p>
        <p>
          This content is currently only viewable on larger screens. Please
          return using a desktop browser, or maximize your browser window, and
          content will appear.
        </p>
      </div>
    </div>
  )
}

export default MobileDisclaimer
