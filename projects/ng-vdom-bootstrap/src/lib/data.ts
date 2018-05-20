import { ReactElement } from 'react'

export interface BootstrapOption {
  element: ReactElement<any>
  container: Element | null
}

export const optionQueue: BootstrapOption[] = []
