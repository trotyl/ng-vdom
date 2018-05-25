import { Component } from '@angular/core'
import { createElement as h, Component as ReactComponent } from 'react'

class Clock extends ReactComponent<any, { date: Date }> {
  timerID!: any

  constructor(props: any) {
    super(props)
    this.state = {date: new Date()}
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    )
  }

  componentWillUnmount() {
    clearInterval(this.timerID)
  }

  tick() {
    this.setState({
      date: new Date()
    })
  }

  render() {
    return (
      h('div', null,
        h('h1', null, 'Hello, world!'),
        h('h2', null, `It is ${this.state.date.toLocaleTimeString()}.`),
      )
    )
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app'
  element = h(Clock)
}
