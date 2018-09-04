import * as React from 'ng-vdom'
import { render } from 'ng-vdom/bootstrap'
import { generate } from '../utils/element'

function demo_0() {
  function Welcome(props: { name: string }) {
    return <h1>Hello, {props.name}</h1>
  }

  const element = <Welcome name="Sara" />
  render(
    element,
    generate(),
  )
}

function demo_1() {
  function Welcome(props: { name: string }) {
    return <h1>Hello, {props.name}</h1>
  }

  function App() {
    return (
      <div>
        <Welcome name="Sara" />
        <Welcome name="Cahal" />
        <Welcome name="Edite" />
      </div>
    )
  }

  render(
    <App />,
    generate(),
  )
}

function demo_2() {
  function formatDate(date: Date) {
    return date.toLocaleDateString()
  }

  function Comment(props: any) {
    return (
      <div className="Comment">
        <div className="UserInfo">
          <img
            className="Avatar"
            src={props.author.avatarUrl}
            alt={props.author.name}
          />
          <div className="UserInfo-name">
            {props.author.name}
          </div>
        </div>
        <div className="Comment-text">{props.text}</div>
        <div className="Comment-date">
          {formatDate(props.date)}
        </div>
      </div>
    )
  }

  const comment = {
    date: new Date(),
    text: 'I hope you enjoy learning React!',
    author: {
      name: 'Hello Kitty',
      avatarUrl: 'http://placekitten.com/g/64/64',
    },
  }

  render(
    <Comment
      date={comment.date}
      text={comment.text}
      author={comment.author}
    />,
    generate(),
  )
}

function demo_3() {
  function formatDate(date: Date) {
    return date.toLocaleDateString()
  }

  function Avatar(props: any) {
    return (
      <img
        className="Avatar"
        src={props.user.avatarUrl}
        alt={props.user.name}
      />
    )
  }

  function UserInfo(props: any) {
    return (
      <div className="UserInfo">
        <Avatar user={props.user} />
        <div className="UserInfo-name">{props.user.name}</div>
      </div>
    )
  }

  function Comment(props: any) {
    return (
      <div className="Comment">
        <UserInfo user={props.author} />
        <div className="Comment-text">{props.text}</div>
        <div className="Comment-date">
          {formatDate(props.date)}
        </div>
      </div>
    )
  }

  const comment = {
    date: new Date(),
    text: 'I hope you enjoy learning React!',
    author: {
      name: 'Hello Kitty',
      avatarUrl: 'http://placekitten.com/g/64/64',
    },
  }

  render(
    <Comment
      date={comment.date}
      text={comment.text}
      author={comment.author}
    />,
    generate(),
  )
}

demo_0()
demo_1()
demo_2()
demo_3()
