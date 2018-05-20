# NgVdom

Major rewrite in progress.

## Usage

Global bootstrap without Angular API:

```tsx
// Any react-compatible jsxFactory would be fine
import * as React from 'react'
import { render } from 'ng-vdom/bootstrap'

render(
  <h1>Hello World</h1>,
  document.querySelector('root')
)
```
