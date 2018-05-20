import 'zone.js'
import { enableProdMode } from '@angular/core'
import { render } from 'ng-vdom/bootstrap'
import {
  HelloWorld_0,
  IntroducingJSX_0,
} from './react'

enableProdMode()

render(HelloWorld_0, document.querySelector('#react-demo-hello-world-0'))
render(IntroducingJSX_0, document.querySelector('#react-demo-introducing-jsx-0'))
