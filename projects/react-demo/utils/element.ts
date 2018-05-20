export function generate(): HTMLElement {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return element
}
