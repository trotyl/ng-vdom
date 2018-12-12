# NG-VDOM

Virtual DOM extension for Angular, heavily inspired by [Inferno](https://github.com/infernojs/inferno/).

## Installation

Install from NPM or Yarn:

```bash
npm install ng-vdom --save
```

Add to NgModule imports:

```typescript
import { VDomModule } from 'ng-vdom';

@NgModule({
  imports: [
    VDomModule
  ]
})
export class SomeModule {}
```

## Usage

[Online Demo](https://stackblitz.com/edit/angular-vjj9vt?file=src%2Fapp%2Fclock.component.ts).

Make an Angular Component extends `Renderable` with a `render` method:

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

## What can be rendered?

+ Native component (DOM element in browser);
+ Class component (not fully react compatible);
+ Function component;
+ Angular component (need to be in `entryComponents`);

## Roadmap

+ Global boostrap without Angular code;
+ Fragment render support;
+ Array render support;
+ React-compatible class component support;
+ HTML Attribute support;
