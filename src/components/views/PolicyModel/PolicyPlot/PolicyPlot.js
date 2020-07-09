import React from 'react'
import {
  VictoryChart,
  VictoryZoomContainer,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryScatter,
  VictoryLabel,
  createContainer,
  LineSegment,
  VictoryPortal,
} from 'victory'

import AddInterventionCursor from './AddInterventionCursor/AddInterventionCursor'
import PastInterventionInfo from './PastInterventionInfo/PastInterventionInfo'
import AddInterventionDialog from './AddInterventionDialog/AddInterventionDialog'
import TodayLabel from './TodayLabel/TodayLabel'

import styles from './PolicyPlot.module.scss'

const plotColors = [
  // '#00a79d',
  '#173244',
  '#6C92AB',
  '#aeaeae',
  '#00447c',
  '#aeaeae',
  '#7a4500',
  '#aeaeae',
  '#774573',
]

const interventionColors = {
  Lockdown: '#661B3C',
  'Unclear lockdown level': '#7F7F7F',
  'Mixed distancing levels': '#7F7F7F',
  'Stay at home': '#C1272D',
  'Safer at home': '#D66B3E',
  'New open': '#ECBD62',
  'New normal': '#ECBD62',
}

const VictoryZoomCursorContainer = createContainer('zoom', 'cursor')

const PolicyModel = props => {
  const [pastInterventionProps, setPastInterventionProps] = React.useState({
    x: 0,
    y: 0,
    policyName: '',
    effectiveDate: '',
  })

  const [addIntDialogState, setAddIntDialogState] = React.useState({
    show: false,
    x: 0,
    y: 0,
    date: '',
  })

  const [windowSize, setWindowSize] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })

  const updateWindowSize = e => {
    setWindowSize({
      height: window.innerHeight,
      width: window.innerWidth,
    })
  }

  React.useEffect(() => {
    window.addEventListener('resize', updateWindowSize)
    return () => {
      window.removeEventListener('resize', updateWindowSize)
    }
  }, [])

  const percentProportion = 0.1
  const chartProportion = 0.45
  // const navigatorProportion = 0.125

  // The actuals lines of the plot
  const actualsLines = Object.entries(props.data.curves).map(
    ([curveName, data], index) => {
      if (curveName !== 'R effective') {
        return (
          <VictoryLine
            key={curveName}
            style={{
              data: { stroke: plotColors[index], strokeWidth: 0.75 },
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
  const modelLines = Object.entries(props.data.curves).map(
    ([curveName, data], index) => {
      if (curveName !== 'R effective') {
        return (
          <VictoryLine
            key={curveName}
            style={{
              data: {
                stroke: plotColors[index],
                strokeWidth: 0.75,
                strokeDasharray: 2,
              },
            }}
            data={data.model}
            interpolation={'natural'}
          />
        )
      } else {
        return false
      }
    }
  )

  const interventionLines = props.data.interventions.map(intervention => (
    <VictoryLine
      key={intervention.name + intervention.intervention_start_date}
      style={{
        data: {
          stroke: interventionColors[intervention.name.split('_')[0]],
          strokeWidth: 1,
        },
      }}
      data={[
        {
          x: Date.parse(intervention.intervention_start_date),
          // extend the lines slightly below zero so the circles can
          // sit on the date axis without getting chopped off.
          // this is a hack, the proper approach would be a custom
          // label component that sits within a <VictoryPortal>.
          // not going to take the time because I expect this request to change.
          // y: -(props.caseLoadAxis[1] * (window.innerWidth / 40000)),
          // ...and it changed.
          y: 0,
        },
        {
          x: Date.parse(intervention.intervention_start_date),
          y: props.caseLoadAxis[1],
        },
      ]}
    />
  ))

  const interventionPoints = props.data.interventions.map(intervention => (
    <VictoryScatter
      key={intervention.name + intervention.intervention_start_date}
      labelComponent={<VictoryLabel style={{ display: 'none' }} />}
      size={
        new Date(intervention.intervention_start_date) > new Date() ? 3.5 : 4
      }
      style={{
        data: {
          fill:
            new Date(intervention.intervention_start_date) > new Date()
              ? 'white'
              : interventionColors[intervention.name.split('_')[0]],
          stroke:
            new Date(intervention.intervention_start_date) > new Date()
              ? interventionColors[intervention.name.split('_')[0]]
              : 'white',
          strokeWidth: 1,
        },
      }}
      events={[
        {
          childName: 'all',
          target: 'data',

          eventHandlers: {
            onMouseEnter: (event, eventKey) => {
              setPastInterventionProps({
                state: props.selectedState,
                policyName: intervention.name.split('_')[0],
                effectiveDate: intervention.intervention_start_date,
                x:
                  window.pageXOffset +
                  event.target.getBoundingClientRect().left,
                y:
                  new Date(intervention.intervention_start_date) < new Date()
                    ? window.pageYOffset +
                      event.target.getBoundingClientRect().top
                    : // need to adjust for the different size circle
                      window.pageYOffset +
                      event.target.getBoundingClientRect().top -
                      2,
              })
            },
          },
        },
      ]}
      data={[
        {
          x: Date.parse(intervention.intervention_start_date),
          y:
            // new Date(intervention.intervention_start_date) > new Date()
            // ? -(props.caseLoadAxis[1] * 0.004)
            // :
            props.caseLoadAxis[1] * 0.8,
          label: intervention.name,
        },
      ]}
    />
  ))

  return (
    <section className={styles.main}>
      <PastInterventionInfo
        {...{ pastInterventionProps, setPastInterventionProps }}
      />
      <AddInterventionDialog
        position={addIntDialogState}
        setPosition={setAddIntDialogState}
        addIntervention={props.addIntervention}
        selectedState={props.selectedState}
      />
      {/* <svg style={{ height: 0 }}> */}
      {/*   <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%"> */}
      {/*     <stop offset="0%" style={{ stopColor: '#00447c', stopOpacity: 1 }} /> */}
      {/*     <stop */}
      {/*       offset="100%" */}
      {/*       style={{ stopColor: '#00447c', stopOpacity: 0 }} */}
      {/*     /> */}
      {/*   </linearGradient> */}
      {/*   <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"> */}
      {/*     <stop */}
      {/*       offset="0%" */}
      {/*       style={{ stopColor: '#00447c', stopOpacity: 0.5 }} */}
      {/*     /> */}
      {/*     <stop */}
      {/*       offset="100%" */}
      {/*       style={{ stopColor: '#00447c', stopOpacity: 0 }} */}
      {/*     /> */}
      {/*   </linearGradient> */}
      {/* </svg> */}
      <VictoryChart
        padding={{ top: 11, bottom: 0, left: 30, right: 10 }}
        domainPadding={0}
        responsive={true}
        width={500}
        // height={80}
        height={
          (windowSize.height / windowSize.width) * 500 * percentProportion > 25
            ? (windowSize.height / windowSize.width) * 500 * percentProportion
            : 25
        }
        style={{ height: percentProportion * 100 + '%' }}
        scale={{ x: 'time' }}
        containerComponent={
          <VictoryZoomContainer
            className={styles.pct}
            allowZoom={false}
            zoomDimension="x"
            zoomDomain={{ x: props.zoomDateRange }}
            onZoomDomainChange={domain => {
              props.setZoomDateRange(domain.x)
            }}
          />
        }
      >
        <VictoryLabel
          text="R Effective"
          x={4.5}
          y={4}
          style={{
            fontSize: 6,
            fontWeight: 700,
            fontFamily: 'Rawline',
            fill: '#6d6d6d',
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={tick => (tick === parseInt(tick) ? parseInt(tick) : null)}
          offsetX={30}
          style={{
            grid: {
              stroke: '#aaaaaa',
              strokeWidth: 0,
            },
            axis: { stroke: '#fff', strokeWidth: 0 },
            ticks: { strokeWidth: 0 },
            tickLabels: {
              fill: '#6d6d6d',
              fontFamily: 'Rawline',
              fontWeight: '500',
              fontSize: 5,
              textAnchor: 'middle',
            },
          }}
        />
        <VictoryArea
          style={{
            data: { stroke: 'grey', strokeWidth: 0.5, fill: '#3F9385' },
          }}
          data={props.data.curves['R effective'].actuals}
          interpolation={'stepAfter'}
        />
        <VictoryArea
          style={{
            data: { stroke: 'grey', strokeWidth: 0.5, fill: '#C9E0DC' },
          }}
          data={props.data.curves['R effective'].model}
          interpolation={'stepAfter'}
        />
        <VictoryLine
          labelComponent={
            <VictoryPortal>
              <TodayLabel />
            </VictoryPortal>
          }
          labels={[`TODAY`]}
          style={{ data: { stroke: '#7FC6FA', strokeWidth: 1.5 } }}
          data={[
            { x: new Date(), y: 0 },
            { x: new Date(), y: 3 },
          ]}
        />
      </VictoryChart>
      <VictoryChart
        // animate={{ duration: 1000 }}
        padding={{ top: 12, bottom: 20, left: 30, right: 10 }}
        domainPadding={0}
        responsive={true}
        width={500}
        // height={300}
        events={
          props.activeTab === 'interventions'
            ? [
                {
                  target: 'parent',
                  eventHandlers: {
                    onClick: (event, eventKey) => {
                      const today = new Date()
                      if (
                        eventKey.cursorValue !== null &&
                        eventKey.cursorValue.x > today
                      ) {
                        setAddIntDialogState({
                          show: true,
                          x: event.clientX,
                          y: window.pageYOffset + event.clientY,
                          date: eventKey.cursorValue.x,
                        })
                      }
                    },
                  },
                },
              ]
            : []
        }
        height={
          (windowSize.height / windowSize.width) * 500 * chartProportion > 100
            ? (windowSize.height / windowSize.width) * 500 * chartProportion
            : 100
        }
        style={{ height: chartProportion * 100 + '%' }}
        scale={{ x: 'time' }}
        containerComponent={
          <VictoryZoomCursorContainer
            className={styles.chart}
            cursorLabelComponent={
              (props.activeTab === 'interventions') &
              (pastInterventionProps.policyName === '') ? (
                <AddInterventionCursor showLabel={!addIntDialogState.show} />
              ) : (
                <LineSegment />
              )
            }
            cursorComponent={<LineSegment style={{ display: 'none' }} />}
            cursorLabel={({ datum }) => `add intervention`}
            allowZoom={false}
            // If we want to re-enable panning, there will
            // need to be better event handling to separate
            // panning and clicking to add interventions.
            allowPan={false}
            zoomDimension="x"
            zoomDomain={{ x: props.zoomDateRange }}
            onZoomDomainChange={domain => {
              props.setZoomDateRange(domain.x)
            }}
          />
        }
      >
        <VictoryLabel
          text="CASELOAD"
          x={4.5}
          y={6}
          style={{
            fontSize: 6,
            fontWeight: 700,
            fontFamily: 'Rawline',
            fill: '#6d6d6d',
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={tick => (tick >= 1000 ? tick / 1000 + 'K' : tick)}
          offsetX={35}
          style={{
            grid: {
              stroke: '#aaaaaa',
              strokeWidth: 1,
            },
            axis: { stroke: '#fff', strokeWidth: 0 },
            ticks: { strokeWidth: 0 },
            tickLabels: {
              fill: '#6d6d6d',
              fontFamily: 'Rawline',
              fontWeight: '500',
              fontSize: 6,
            },
          }}
        />
        <VictoryAxis
          orientation="bottom"
          style={{
            tickLabels: {
              fontFamily: 'Rawline',
              fontWeight: '500',
              fontSize: 7,
              fill: '#6d6d6d',
            },
          }}
        />
        {/* Today marker */}
        <VictoryLine
          style={{ data: { stroke: '#7FC6FA', strokeWidth: 1.5 } }}
          data={[
            { x: new Date(), y: 0 },
            { x: new Date(), y: props.caseLoadAxis[1] },
          ]}
        />

        {actualsLines}
        {modelLines}
        {interventionLines}
        {interventionPoints}
      </VictoryChart>

      {/* <NavigatorPlot */}
      {/*   curves={props.data.curves} */}
      {/*   zoomDateRange={props.zoomDateRange} */}
      {/*   setZoomDateRange={props.setZoomDateRange} */}
      {/*   domain={props.domain} */}
      {/*   caseLoadAxis={props.caseLoadAxis} */}
      {/* /> */}
    </section>
  )
}

export default PolicyModel
