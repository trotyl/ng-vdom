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

function demo_2() {
  function Mailbox(props: { unreadMessages: string[] }) {
    const unreadMessages = props.unreadMessages
    return (
      <div>
        <h1>Hello!</h1>
        {unreadMessages.length > 0 &&
          <h2>
            You have {unreadMessages.length} unread messages.
          </h2>
        }
      </div>
    )
  }

  const messages = ['React', 'Re: React', 'Re:Re: React']
  render(
    <Mailbox unreadMessages={messages} />,
    generate()
  )
}

function demo_3() {
  function WarningBanner(props: { warn: boolean }) {
    if (!props.warn) {
      return null
    }

    return (
      <div className="warning">
        Warning!
      </div>
    )
  }

  class Page extends React.Component<any, { showWarning: boolean }> {
    constructor(props: any) {
      super(props)
      this.state = {showWarning: true}
      this.handleToggleClick = this.handleToggleClick.bind(this)
    }

    handleToggleClick() {
      this.setState(prevState => ({
        showWarning: !prevState.showWarning
      }))
    }

    render() {
      return (
        <div>
          <WarningBanner warn={this.state.showWarning} />
          <button onClick={this.handleToggleClick}>
            {this.state.showWarning ? 'Hide' : 'Show'}
          </button>
        </div>
      )
    }
  }

  render(
    <Page />,
    generate()
  )
}

demo_0()
demo_1()
demo_2()
demo_3()
