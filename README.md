# NG-VDOM

Virtual DOM extension for Angular, heavily inspired by [Inferno](https://github.com/infernojs/inferno/).

## Usage

Make an Angular Component with `render` function:

```tsx
import { Component } from '@angular/core'
import { Renderable } from 'ng-vdom'

@Component({
  template: ``
})
export class AppComponent extends Renderable {
  render() {
    return (
      <h1>Hello World!</h1>
    )
  }
}
```

Embedding Virtual DOM contents inside template

```tsx
import { Component, NgModule } from '@angular/core'
import { VDomModule } from 'ng-vdom'

@Component({
  template: `
    <v-outlet [def]="element"></v-outlet>
  `
})
export class AppComponent {
  element = <h1>Hello World</h1>
}

@NgModule({
  imports: [ VDomModule ],
})
export class AppModule { }
```

[Online Demo](https://stackblitz.com/edit/angular-vjj9vt?file=src%2Fapp%2Fclock.ts).
