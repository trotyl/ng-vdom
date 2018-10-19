import { Component } from '@angular/core'
import { createElement as h, Renderable } from 'ng-vdom'

@Component({
  selector: 'app-root',
  template: '',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends Renderable {
  title = 'app'

  render() {
    return (
      h('div', null,
        h('div', { style: 'text-align: center' },
          h('h1', null, 'Welcome to ', this.title, '!'),
          h('img', { width: 300, alt: 'Angular Logo', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==' }),
        ),
        h('h2', null, 'Here are some links to help you start: '),
        h('ul', null,
          h('li', null,
            h('h2', null,
              h('a', { target: '_blank', rel: 'noopener', href: 'https://angular.io/tutorial' }, 'Tour of Heroes'),
            ),
          ),
          h('li', null,
            h('h2', null,
              h('a', { target: '_blank', rel: 'noopener', href: 'https://github.com/angular/angular-cli/wiki' }, 'CLI Documentation'),
            ),
          ),
          h('li', null,
            h('h2', null,
              h('a', { target: '_blank', rel: 'noopener', href: 'https://blog.angular.io/' }, 'Angular blog'),
            ),
          ),
        ),
      )
    )
  }
}
