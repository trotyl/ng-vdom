import React from 'react'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

function demo_0() {
  function UserGreeting(props: any) {
    return <h1>Welcome back!</h1>
  }

  function GuestGreeting(props: any) {
    return <h1>Please sign up.</h1>
  }

  function Greeting(props: { isLoggedIn: boolean }) {
    const isLoggedIn = props.isLoggedIn
    if (isLoggedIn) {
      return <UserGreeting />
    }
    return <GuestGreeting />
  }

  render(
    // Try changing to isLoggedIn={true}:
    <Greeting isLoggedIn={false} />,
    generate()
  )
}

function demo_1() {
  class LoginControl extends React.Component<any, { isLoggedIn: boolean }> {
    constructor(props: any) {
      super(props)
      this.handleLoginClick = this.handleLoginClick.bind(this)
      this.handleLogoutClick = this.handleLogoutClick.bind(this)
      this.state = {isLoggedIn: false}
    }

    handleLoginClick() {
      this.setState({isLoggedIn: true})
    }

    handleLogoutClick() {
      this.setState({isLoggedIn: false})
    }

    render() {
      const isLoggedIn = this.state.isLoggedIn

      let button = null
      if (isLoggedIn) {
        button = <LogoutButton onClick={this.handleLogoutClick} />
      } else {
        button = <LoginButton onClick={this.handleLoginClick} />
      }

      return (
        <div>
          <Greeting isLoggedIn={isLoggedIn} />
          {button}
        </div>
      )
    }
  }

  function UserGreeting(props: any) {
    return <h1>Welcome back!</h1>
  }

  function GuestGreeting(props: any) {
    return <h1>Please sign up.</h1>
  }

  function Greeting(props: { isLoggedIn: boolean }) {
    const isLoggedIn = props.isLoggedIn
    if (isLoggedIn) {
      return <UserGreeting />
    }
    return <GuestGreeting />
  }

  function LoginButton(props: { onClick: () => void }) {
    return (
      <button onClick={props.onClick}>
        Login
      </button>
    )
  }

  function LogoutButton(props: { onClick: () => void }) {
    return (
      <button onClick={props.onClick}>
        Logout
      </button>
    )
  }

  render(
    <LoginControl />,
    generate()
  )
}

demo_0()
demo_1()
