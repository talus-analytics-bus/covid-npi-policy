import React, { useEffect, useState } from 'react';
import {
  VictoryChart,
  VictoryZoomContainer,
  VictoryLine,
  VictoryArea,
  VictoryBrushContainer,
  VictoryAxis,
  VictoryCursorContainer,
  createContainer,
  VictoryScatter,
} from 'victory';
import axios from 'axios';

import NavigatorPlot from './NavigatorPlot/NavigatorPlot';

import styles from './PolicyPlot.module.scss';

const PolicyModel = (props) => {
  const [modelData, setModelData] = useState();

  const [infected_a, setInfected_a] = useState();
  const [infected_b, setInfected_b] = useState();
  const [infected_c, setInfected_c] = useState();
  const [exposed, setExposed] = useState();
  const [dead, setDead] = useState();
  const [pct, setPct] = useState();
  const [modelDate, setModelDate] = useState();

  const [policies, setPolicies] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'http://192.168.1.33:8000/state_base_model/' + props.selectedState
      );
      const runData = JSON.parse(result.data.results[0].run);
      const trimmedData = runData
        .filter((day) => day.exposed >= 10)
        .filter((x, index) => index % 4 === 0);

      console.log(trimmedData.length * 4);

      setModelDate(result.data.date);

      setModelData(trimmedData);
      setInfected_a(
        trimmedData.map((day) => ({ x: new Date(day.date), y: day.infected_a }))
      );
      setInfected_b(
        trimmedData.map((day) => ({ x: new Date(day.date), y: day.infected_b }))
      );
      setInfected_c(
        trimmedData.map((day) => ({ x: new Date(day.date), y: day.infected_c }))
      );
      setExposed(
        trimmedData.map((day) => ({ x: new Date(day.date), y: day.exposed }))
      );
      setDead(
        trimmedData.map((day) => ({ x: new Date(day.date), y: day.dead }))
      );

      setPct(
        trimmedData.map((day) => ({
          x: new Date(day.date),
          y: day['R effective'],
        }))
      );
    };

    setPolicies(
      Array(4)
        .fill()
        .map((date) =>
          new Date().setDate(
            new Date().getDate() - Math.floor(Math.random() * 60)
          )
        )
    );

    fetchData();
  }, [props.selectedState]);

  if (
    (modelData !== undefined) &
    (infected_b !== undefined) &
    (infected_c !== undefined)
  ) {
    // console.log(infected_c);
    // alert(trimmedData.length * 4)

    //     const duration = trimmedData.length
    //     const chartMax = Math.max(...trimmedData.map(day => day.infected_b)) + 3000
    //
    //     const createPathString = (attr) => {
    //       let pathString = 'M ' + trimmedData[0][attr] + ' ' + parseInt(chartMax)
    //       let count = 0;
    //       trimmedData.forEach(day => {pathString += ' L ' + count + ' ' + parseInt(chartMax - day[attr]); count ++})
    //       pathString += ' L ' + duration + 1 + ' ' + parseInt(chartMax)
    //
    //       return (pathString)
    //     }

    // const exposed = trimmedData.map(day => ({x: new Date(day.date), y: day.exposed}))
    // const recovered = trimmedData.map(day => ({x: new Date(day.date), y: day.recovered}))
    // const infected_a = trimmedData.map(day => ({x: new Date(day.date), y: day.infected_a}))
    // const infected_b = modelData.map(day => ({x: new Date(day.date), y: day.infected_b}))
    // const infected_c = modelData.map(day => ({x: new Date(day.date), y: day.infected_c}))
    // const dead = modelData.map(day => ({x: new Date(day.date), y: day.dead}))

    const percentProportion = 0.15;
    const chartProportion = 0.6;
    const navigatorProportion = 0.2;

    return (
      <section className={styles.main}>
        <svg>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: '#00447c', stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: '#00447c', stopOpacity: 0 }}
            />
          </linearGradient>
        </svg>
        <VictoryChart
          padding={{ top: 5, bottom: 0, left: 30, right: 10 }}
          domainPadding={10}
          responsive={true}
          width={500}
          height={
            (window.innerHeight / window.innerWidth) * 500 * percentProportion
          }
          scale={{ x: 'time' }}
          style={{ height: percentProportion * 100 + '%' }}
          containerComponent={
            <VictoryZoomContainer
              className={styles.pct}
              allowZoom={false}
              zoomDimension="x"
              zoomDomain={{ x: props.dateRange }}
              onZoomDomainChange={(domain) => {
                props.setDateRange(domain.x);
              }}
            />
          }
        >
          <VictoryAxis
            dependentAxis
            // tickFormat={(tick) => tick / 1000 + 'K'}
            style={{
              grid: {
                stroke: '#aaaaaa',
                strokeWidth: 2,
              },
              axis: { stroke: '#fff', strokeWidth: 0 },
              ticks: { strokeWidth: 0 },
              tickLabels: {
                fill: '#aaa',
                fontFamily: 'Rawline',
                fontWeight: '500',
                fontSize: 4,
              },
            }}
          />
          <VictoryArea
            style={{
              data: { stroke: 'grey', strokeWidth: 0.5, fill: 'url(#grad1)' },
            }}
            data={pct}
            // interpolation={'monotoneX'}
          />
        </VictoryChart>
        <VictoryChart
          padding={{ top: 0, bottom: 15, left: 30, right: 10 }}
          domainPadding={10}
          responsive={true}
          width={500}
          height={
            (window.innerHeight / window.innerWidth) * 500 * chartProportion
          }
          scale={{ x: 'time' }}
          style={{ height: chartProportion * 100 + '%' }}
          containerComponent={
            <VictoryZoomContainer
              className={styles.chart}
              cursorLabel={({ datum }) => `${datum.x}`}
              // />
              // <VictoryZoomContainer
              allowZoom={false}
              zoomDimension="x"
              zoomDomain={{ x: props.dateRange }}
              onZoomDomainChange={(domain) => {
                props.setDateRange(domain.x);
              }}
            />
          }
        >
          {/* {console.log(zoomDomain)} */}
          {/* <VictoryLine */}
          {/*   style={{ data: { stroke: 'orange' } }} */}
          {/*   data={infected_a} */}
          {/* /> */}
          {/* <VictoryLine */}
          {/*   style={{ data: { stroke: 'skyblue' } }} */}
          {/*   data={exposed} */}
          {/* /> */}

          <VictoryAxis
            dependentAxis
            tickFormat={(tick) => tick / 1000 + 'K'}
            style={{
              grid: {
                stroke: '#aaaaaa',
                strokeWidth: 2,
              },
              axis: { stroke: '#fff', strokeWidth: 0 },
              ticks: { strokeWidth: 0 },
              tickLabels: {
                fill: '#aaa',
                fontFamily: 'Rawline',
                fontWeight: '500',
                fontSize: 4,
              },
            }}
          />
          <VictoryAxis
            orientation="bottom"
            style={{
              tickLabels: {
                fontFamily: 'Rawline',
                fontWeight: '500',
                fontSize: '4',
              },
            }}
          />
          <VictoryLine
            style={{ data: { stroke: 'skyblue', strokeWidth: 1 } }}
            data={[
              { x: new Date(), y: 0 },
              { x: new Date(), y: 80000 },
            ]}
          />
          {policies.map((policyDate) => (
            <VictoryLine
              key={policyDate}
              style={{ data: { stroke: 'firebrick', strokeWidth: 1 } }}
              data={[
                { x: policyDate, y: 0 },
                {
                  x: policyDate,
                  y: 60000,
                  // y: zoomDomain ? zoomDomain.y[1] * 1 : 80000,
                },
              ]}
            />
          ))}
          {policies.map((policyDate) => (
            <VictoryScatter
              key={policyDate}
              style={{
                data: { fill: 'firebrick', stroke: 'white', strokeWidth: 1 },
              }}
              data={[
                {
                  x: policyDate,
                  y: 60000,
                  // y: zoomDomain ? zoomDomain.y[1] * 0.8 : 60000,
                },
              ]}
            />
          ))}
          <VictoryLine
            style={{ data: { stroke: 'firebrick', strokeWidth: 1 } }}
            data={infected_b}
            interpolation={'monotoneX'}
          />
          <VictoryLine
            style={{ data: { stroke: 'pink', strokeWidth: 1 } }}
            data={infected_c}
            interpolation={'monotoneX'}
          />
          <VictoryLine
            style={{ data: { stroke: 'red', strokeWidth: 1 } }}
            data={dead}
            interpolation={'monotoneX'}
          />
        </VictoryChart>
        {/* </div> */}
        {/* <div className={styles.navigator}> */}
        <NavigatorPlot
          data={infected_b}
          proportion={navigatorProportion}
          // selectedDomain={selectedDomain}

          dateRange={props.dateRange}
          setDateRange={props.setDateRange}
          // zoomDomain={zoomDomain}
          // setZoomDomain={setZoomDomain}
        />

        {/* </div> */}
      </section>
    );
  } else {
    return <h1>Loading</h1>;
  }
};

export default PolicyModel;
