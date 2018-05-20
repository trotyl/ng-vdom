import 'zone.js'
import { enableProdMode } from '@angular/core'
import { render } from 'ng-vdom/bootstrap'
import { HelloWorld } from './react'

enableProdMode()

render(
  HelloWorld,
  document.querySelector('#react-demo-hello-world')
)
