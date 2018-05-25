import React from 'react'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

function demo_0() {
  const container = generate()

  function Clock(props: { date: Date }) {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {props.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }

  function tick() {
    render(
      <Clock date={new Date()} />,
      container
    )
  }

  setInterval(tick, 1000)
}

function demo_1() {
  const container = generate()

  class Clock extends React.Component<{ date: Date }> {
    render() {
      return (
        <div>
          <h1>Hello, world!</h1>
          <h2>It is {this.props.date.toLocaleTimeString()}.</h2>
        </div>
      )
    }
  }

  function tick() {
    render(
      <Clock date={new Date()} />,
      container
    )
  }

  setInterval(tick, 1000)
}

function demo_2() {
  const container = generate()

  class Clock extends React.Component<any, { date: Date }> {
    constructor(props: any) {
      super(props)
      this.state = {date: new Date()}
    }

    render() {
      return (
        <div>
          <h1>Hello, world!</h1>
          <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
        </div>
      )
    }
  }

  render(
    <Clock />,
    container
  )
}

demo_0()
demo_1()
demo_2()
