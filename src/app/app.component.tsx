import { Component, OnDestroy, OnInit } from '@angular/core'
import { createElement as h, Renderable } from 'ng-vdom'
import { HelloComponent } from './hello.component'

@Component({
  selector: 'app-root',
  template: '',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends Renderable implements OnInit, OnDestroy {
  title = 'app'
  name = 'Angular'
  timerID!: number
  date: Date = new Date()

  ngOnInit(): void {
    this.timerID = setInterval(() => this.tick(), 1000) as any
  }

  ngOnDestroy(): void {
    clearInterval(this.timerID)
  }

  tick() {
    this.date = new Date()
  }

  render() {
    return (
      <div>
        <div style="text-align: center">
          <h1>Welcome to {this.title}!</h1>
          <img width="300" alt="Angular Logo" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==" />
        </div>
        <HelloComponent name={this.name}>
          <div>
            <h2>It is {this.date.toLocaleTimeString()}.</h2>
          </div>
        </HelloComponent>
      </div>
    )
  }
}
