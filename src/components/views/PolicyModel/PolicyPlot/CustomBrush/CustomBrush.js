import React from 'react'

import styles from './CustomBrush.module.scss'

const CustomBrush = props => {
  // overall width of main vertical part of thumb
  const width = 3.5

  // padding between inner and outer portions
  const pad = 0.75

  // corner radius of main vertical part
  const cornerRad = 1.25

  // width of rotated rectangle which forms the arrows
  const arrowWidth = 5.25

  const start = props.x
  const end = props.x + props.width

  const top = props.y + 6
  const height = props.height - 6

  return (
    <g>
      {/* Left side thumb */}
      {/* Arrows */}
      <rect
        className={styles.arrows}
        x={start - arrowWidth / 2}
        y={top + height / 2 - arrowWidth / 2}
        height={arrowWidth}
        width={arrowWidth}
        style={{
          strokeWidth: pad,
        }}
      />
      {/* outer rect */}
      <rect
        className={styles.outer}
        x={start - width / 2}
        y={top}
        width={width}
        height={height}
        rx={cornerRad}
        style={{
          strokeWidth: pad,
        }}
      />
      {/* inner rect */}
      <rect
        className={styles.inner}
        x={start - (width / 2 - pad)}
        y={top + pad}
        width={width - 2 * pad}
        height={height - 2 * pad}
        rx={cornerRad - pad}
      />

      {/* Right Side Thumb */}
      {/* Arrows */}
      <rect
        className={styles.arrows}
        x={end - arrowWidth / 2}
        y={top + height / 2 - arrowWidth / 2}
        height={arrowWidth}
        width={arrowWidth}
        style={{
          strokeWidth: pad,
        }}
      />
      {/* outer rect */}
      <rect
        className={styles.outer}
        x={end - width / 2}
        y={top}
        width={width}
        height={height}
        rx={cornerRad}
        style={{
          strokeWidth: pad,
        }}
      />
      {/* inner rect */}
      <rect
        className={styles.inner}
        x={end - (width / 2 - pad)}
        y={top + pad}
        width={width - 2 * pad}
        height={height - 2 * pad}
        rx={cornerRad - pad}
      />
    </g>
  )
}

export default CustomBrush
