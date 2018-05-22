export function generate(): HTMLElement {
  const element = document.createElement('div')
  document.body.appendChild(element)
  const hr = document.createElement('hr')
  document.body.appendChild(hr)
  return element
}
