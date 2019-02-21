import React, {Component} from 'react'
import * as V from 'victory'
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory';
//import axios from 'axios'
import moment from 'moment'

const BLUE_COLOR = '#00a3de';
const RED_COLOR = '#7c270b';
const ORANGES = ['#ed6930', '#e85c34', '#e15035', '#da4134', '#d53239', '#cf1339', '#c8003b', '#c8003b', '#bb003c', '#aa003c']
const LEGEND_FONT_SIZE = 12
const styles = {
  parent: {
    //background: '#ccdee8',
    boxSizing: 'border-box',

    display: 'inline',
    padding: 0,
    fontFamily: '"Fira Sans", sans-serif',
    maxWidth: '50%',
    height: 'auto'
  },
  title: {
    textAnchor: 'start',
    verticalAnchor: 'end',
    fill: '#727272',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  labelNumber: {
    textAnchor: 'middle',
    fill: '#727272',
    fontFamily: 'inherit',
    fontSize: '14px'
  },

  legend: {
    fill: 'white',
    fontSize: LEGEND_FONT_SIZE
  },

  // INDEPENDENT AXIS
  
  maxLine: {
    data: { stroke: RED_COLOR, strokeWidth: 50 }
  },
  dataLine: {
    data: { stroke: '#FFF', strokeWidth: 2 }
  },
  effortLine: {
    data: { stroke: '#000', strokeWidth: 1, strokeDasharray: 2 }
  },
  axisPrincipal: {
    axis: {
      fill: '#727272',
    },
    tickLabels: {
      fill: '#727272',
      fontSize: 12,
      fontWeight: 'bold'
    }

  }
}

const getHeartsByEffort = function(eff, max, min) {
  return (((max-min)*eff) / 100) + min
}
const getTimeTicks = function(data) {
  const size = 60*10//10 min
  const totalTicks = Math.ceil(data.length / size)
  const ticks = []
  for(let i = 0; i < totalTicks; i++) {
    ticks.push(i*size)
  }
  return ticks;
}

class SessionResult extends Component {

  constructor(props) {
    super(props)
  }

  getFormattedSession() {
    const { 
      dateSession,
      points,
      currentData,
      maxHeartbeat,
      minHeartbeat,
      nick,
      avatarUrl,
    } = this.props
    const y90 = getHeartsByEffort(90, maxHeartbeat, minHeartbeat);
    const y80 = getHeartsByEffort(80, maxHeartbeat, minHeartbeat);
    const y70 = getHeartsByEffort(70, maxHeartbeat, minHeartbeat);
    const y60 = getHeartsByEffort(60, maxHeartbeat, minHeartbeat);
    let lastValid = 0;
    const { data, e90, e80, e70, e60, time90toMore, time80to90, time70to80, time60to70, timeUnder60 } = currentData
      .reduce((all, curr, index) => {
        lastValid = curr > 40 ? curr : lastValid;
        all.data.push({
          x: index,
          y: !curr || curr < 40 ? lastValid : curr
        })
        if(index === currentData.length-1 || index === 0) {
          all.e90.push({ x: index, y: y90 })
          all.e80.push({ x: index, y: y80 })
          all.e70.push({ x: index, y: y70 })
          all.e60.push({ x: index, y: y60 })
        }
        if(curr < y60) {
          all.timeUnder60 += 1
        }else if(curr < y70) {
          all.time60to70 += 1
        }else if(curr < y80) {
          all.time70to80 += 1
        }else if(curr < y90) {
          all.time80to90 += 1
        }else {
          all.time90toMore += 1
        }
        return all 
      }, {
        data: [],
        e80: [],
        e90: [],
        e70: [],
        e60: [],
        time90toMore: 0,
        time80to90: 0,
        time70to80: 0,
        time60to70: 0,
        timeUnder60: 0,
      })
    return {
      dateSession,
      points,
      data,
      e90,
      e80,
      e70,
      e60,
      max: maxHeartbeat,
      basal: minHeartbeat,
      avatarUrl: avatarUrl,
      nick: nick,
      time90toMore, 
      time80to90, 
      time70to80, 
      time60to70, 
      timeUnder60,
    }
  }

  render() {
    const width = 600
    const marginWidth = 100
    const height = 300
    const marginHeight = 100
    const {
      dateSession,
      points,
      data,
      e90,
      e80,
      e70,
      e60,
      max,
      basal,
      avatarUrl,
      nick,
      time90toMore, 
      time80to90, 
      time70to80, 
      time60to70, 
      timeUnder60,
    } = this.getFormattedSession()
    const axisY = [basal - 8, max + 8]
    const ticksEffort = [60,70,80,90]
    const { id } = this.props;
    return (
      <div>
        <svg id={id} style={styles.parent} viewBox={`0 0 ${width+marginWidth} ${height+marginHeight}`}
          key={dateSession}
        >
          <rect x={width-marginWidth/2} y={marginHeight/4} width={marginHeight/2} height={marginHeight/4} fill="#727272"/>
          <rect x={0} y={marginHeight/4} width={marginHeight/2} height={marginHeight/4}  fill="#727272"/>
          <VictoryLabel x={marginWidth/2} y={25} style={styles.title}
            text={`${moment(dateSession).format('DD/MM/YYYY HH:mm')}. ${nick} DEP: ${points}`}
          />
          <VictoryLabel x={width-marginWidth/2 + 10} y={marginHeight/4 + LEGEND_FONT_SIZE} style={styles.legend}
            text="EFF%"
          />
          <VictoryLabel x={10} y={marginHeight/4 + LEGEND_FONT_SIZE} width={marginHeight/2} style={styles.legend}
            text="PPM"
          />
          
          {ORANGES.map((o, i) => (
            <rect 
              key={i}
              x={marginWidth/2} 
              y={marginHeight/2+(height/10)*(i)} 
              width={width-marginWidth} 
              height={height/10} 
              fill={o}/>
            ))
          }
          <VictoryAxis
            width={width}
            height={height}
            offsetY={-marginHeight/2}
            domain={[0, data.length]}
            standalone={false}
            tickValues={getTimeTicks(data)}
            tickFormat={(t) => `${Math.floor(t/60)}'`}
            style={styles.axisPrincipal}
          />
          
          <VictoryAxis dependentAxis
            width={width}
            //offsetX={marginWidth/2}
            orientation="left"
            height={height+marginHeight}
            domain={axisY}
            standalone={false}
            style={styles.axisPrincipal}
          />

          <VictoryAxis dependentAxis
            width={width}
            offsetX={marginWidth/2}
            orientation="right"
            height={height+marginHeight}
            domain={axisY}
            standalone={false}
            tickValues={[e60[0].y, e70[0].y, e80[0].y, e90[0].y]}
            tickFormat={(t, i) => `${ticksEffort[i]}%`}
            style={styles.axisPrincipal}
          />
          
          
          <VictoryLine
            data={data}
            width={width}
            height={height+marginHeight}
            domain={{ x: [0, data.length], y: axisY }}
            //scale={{x: "time", y: "linear"}}
            standalone={false}
            style={styles.dataLine}
          /> 
          


          <VictoryLine
            data={e90}
            width={width}
            height={height+marginHeight}
            domain={{ x: [0, data.length], y: axisY }}
            //scale={{x: "time", y: "linear"}}
            standalone={false}
            style={styles.effortLine}
          /> 
          <VictoryLine
            data={e80}
            width={width}
            height={height+marginHeight}
            domain={{ x: [0, data.length], y: axisY }}
            //scale={{x: "time", y: "linear"}}
            standalone={false}
            style={styles.effortLine}
          />
          <VictoryLine
            data={e70}
            width={width}
            height={height+marginHeight}
            domain={{ x: [0, data.length], y: axisY }}
            //scale={{x: "time", y: "linear"}}
            standalone={false}
            style={styles.effortLine}
          />
          <VictoryLine
            data={e60}
            width={width}
            height={height+marginHeight}
            domain={{ x: [0, data.length], y: axisY }}
            //scale={{x: "time", y: "linear"}}
            standalone={false}
            style={styles.effortLine}
          />
        </svg>
        <div>
          <p> <b>Segundos trabajados a más de 90% esfuerzo:</b> {time90toMore} (el {Math.round((time90toMore*10000)/data.length) / 100}% del entrenamiento)</p> 
          <p> <b>Segundos trabajados entre 80% y 90% de esfuerzo:</b> {time80to90} (el {Math.round((time80to90*10000)/data.length) / 100}% del entrenamiento)</p> 
          <p> <b>Segundos trabajados entre 70% y 80% de esfuerzo:</b> {time70to80} (el {Math.round((time70to80*10000)/data.length) / 100}% del entrenamiento)</p> 
          <p> <b>Segundos trabajados entre 60% y 70% de esfuerzo:</b> {time60to70} (el {Math.round((time60to70*10000)/data.length) / 100}% del entrenamiento)</p> 
          <p> <b>Segundos trabajados a menos de 60% esfuerzo:</b> {timeUnder60} (el {Math.round((timeUnder60*10000)/data.length) / 100}% del entrenamiento)</p> 
        </div>
      </div>
    )
  }
}


export default SessionResult
