import * as React from 'ng-vdom'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

function demo_0() {
  class Toggle extends React.Component<any, { isToggleOn: boolean }> {
    constructor(props: any) {
      super(props)
      this.state = {isToggleOn: true}

      // This binding is necessary to make `this` work in the callback
      this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
      this.setState(prevState => ({
        isToggleOn: !prevState.isToggleOn,
      }))
    }

    render() {
      return (
        <button onClick={this.handleClick}>
          {this.state.isToggleOn ? 'ON' : 'OFF'}
        </button>
      )
    }
  }

  render(
    <Toggle />,
    generate(),
  )
}

demo_0()
