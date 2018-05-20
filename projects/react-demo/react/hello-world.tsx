import React from 'react'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

render(
  <h1>Hello, world!</h1>,
  generate()
)
