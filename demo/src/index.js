import React, {Component} from 'react'
import {render} from 'react-dom'
import clientes1 from './clientes1.json'
import SessionResult from '../../src'

class Demo extends Component {
  render() {
    const cliente = clientes1.clientes[0];
    const session = cliente.historial[0]
    return <div>
      <h1>react-session-result Demo</h1>
      <SessionResult
        dateSession={session.fecha}
        points={session.currentPoints}
        currentData={session.currentData}
        maxHeartbeat={session.datosDoma.maxPulsaciones}
        minHeartbeat={session.datosDoma.basalPulsaciones}
        nick={cliente.nick}
        avatarUrl={cliente.avatarUrl}
      />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
