import * as React from 'ng-vdom'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

const container = generate()

function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  )
  render(element, container)
}

setInterval(tick, 1000)
