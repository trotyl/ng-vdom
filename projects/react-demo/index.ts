import 'zone.js'
import { enableProdMode } from '@angular/core'
import { render } from 'ng-vdom/bootstrap'
import {
  hello_world_0,
  introducing_jsx_0,
  rendering_elements_$0,
} from './react'

enableProdMode()

render(hello_world_0, document.querySelector('#react-demo-hello-world-0'))
render(introducing_jsx_0, document.querySelector('#react-demo-introducing-jsx-0'))

function tick() {
  render(rendering_elements_$0(), document.querySelector('#react-demo-rendering-elements-0'))
}

setInterval(tick, 1000)
