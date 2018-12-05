import { Component, Input } from '@angular/core'

export class Mixin {
}

@Component({
  selector: 'app-hello',
  template: `<h1>Hello {{name}}!</h1>`,
  styles: [`h1 { font-family: Lato; }`],
})
export class HelloComponent extends Mixin {
  @Input() name: string = 'Foo'
}
