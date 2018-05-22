import React from 'react'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

function demo_0() {
  function Welcome(props: { name: string }) {
    return <h1>Hello, {props.name}</h1>
  }

  const element = <Welcome name="Sara" />
  render(
    element,
    generate()
  )
}

function demo_1() {
  function Welcome(props: { name: string }) {
    return <h1>Hello, {props.name}</h1>
  }

  function App() {
    return (
      <div>
        <Welcome name="Sara" />
        <Welcome name="Cahal" />
        <Welcome name="Edite" />
      </div>
    )
  }

  render(
    <App />,
    generate()
  )
}

demo_0()
demo_1()
