import React from 'react'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

function Welcome(props: { name: string }) {
  return <h1>Hello, {props.name}</h1>
}

const element = <Welcome name="Sara" />
render(
  element,
  generate()
)
