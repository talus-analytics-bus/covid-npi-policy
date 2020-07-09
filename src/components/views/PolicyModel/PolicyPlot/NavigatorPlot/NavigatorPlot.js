import React from 'react'
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryBrushContainer,
  VictoryAxis,
} from 'victory'

import CustomBrush from '../CustomBrush/CustomBrush'
import styles from './NavigatorPlot.module.scss'

const plotColors = ['#49615F99', '#394C5B99', '#4D3F2D99', '#4B384A99']

const NavigatorPlot = props => {
  // The actuals lines of the plot
  const actualsLines = Object.entries(props.curves).map(
    ([curveName, data], index) => {
      if (curveName !== 'R effective') {
        return (
          <VictoryLine
            key={curveName}
            style={{
              data: { stroke: plotColors[index], strokeWidth: 1 },
            }}
            data={data.actuals}
            // interpolation={'monotoneX'}
          />
        )
      } else {
        return false
      }
    }
  )

  // WHY doesn't Victory let me return multiple lines from
  // the same map function? no reason that shouldn't work.
  // the model (dashed) lines of the plot
  const modelLines = Object.entries(props.curves).map(
    ([curveName, data], index) => {
      if (curveName !== 'R effective') {
        return (
          <VictoryLine
            key={curveName}
            style={{
              data: {
                stroke: plotColors[index],
                strokeWidth: 1,
                strokeDasharray: 2,
              },
            }}
            data={data.model}
            interpolation={'monotoneX'}
          />
        )
      } else {
        return false
      }
    }
  )

  return (
    <div className={styles.background}>
      <VictoryChart
        className={styles.navigator}
        // style={{ height: props.proportion * 100 + '%' }}
        width={500}
        height={60}
        // height={(window.innerHeight / window.innerWidth) * 500 * props.proportion}
        padding={{ top: 0, bottom: 25, left: 0, right: 0 }}
        domainPadding={10}
        responsive={true}
        scale={{ x: 'time' }}
        // padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
        containerComponent={
          <VictoryBrushContainer
            brushDimension="x"
            brushComponent={<CustomBrush />}
            brushDomain={{ x: props.zoomDateRange }}
            onBrushDomainChange={domain => {
              // props.setZoomDomain({ x: domain.x, y: props.zoomDomain.y });
              props.setZoomDateRange(domain.x)
            }}
          />
        }
      >
        <VictoryAxis
          // tickValues={props.curves['R effective'].actuals
          //   .concat(props.curves['R effective'].model)
          //   .map(day => day.x)
          //   .filter((date, index) => index % 30 === 0)}
          // tickFormat={x =>
          //   new Date(x).toLocaleString('default', { month: 'short' })
          // }
          style={{
            tickLabels: {
              fontFamily: 'Rawline',
              fontWeight: '500',
              fontSize: '5',
              fill: '#6d6d6d',
            },
          }}
        />

        {actualsLines}
        {modelLines}

        <VictoryArea
          style={{
            data: { fill: 'gray', opacity: 0.25 },
          }}
          data={[
            { x: props.domain[0], y: props.caseLoadAxis[1] },
            { x: props.zoomDateRange[0], y: props.caseLoadAxis[1] },
          ]}
        />
        <VictoryArea
          style={{
            data: { fill: 'gray', opacity: 0.25 },
          }}
          data={[
            { x: props.domain[1], y: props.caseLoadAxis[1] },
            { x: props.zoomDateRange[1], y: props.caseLoadAxis[1] },
          ]}
        />
        {
          // only show date line when date is outside the range
          (new Date() < props.zoomDateRange[0] ||
            new Date() > props.zoomDateRange[1]) && (
            <VictoryLine
              style={{ data: { stroke: 'skyblue', strokeWidth: 1 } }}
              data={[
                { x: new Date(), y: 0 },
                { x: new Date(), y: props.caseLoadAxis[1] },
              ]}
            />
          )
        }
      </VictoryChart>
    </div>
  )
}

export default NavigatorPlot
