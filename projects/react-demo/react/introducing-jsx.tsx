import * as React from 'ng-vdom'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

interface User {
  firstName: string
  lastName: string
}

function formatName(user: User) {
  return user.firstName + ' ' + user.lastName
}

const sampleUser = {
  firstName: 'Harper',
  lastName: 'Perez'
}

render(
  <h1>
    Hello, {formatName(sampleUser)}!
  </h1>,
  generate()
)
