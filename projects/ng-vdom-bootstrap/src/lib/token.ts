import { InjectionToken } from '@angular/core'
import { ReactElement } from 'react'

export const ROOT_ELEMENT = new InjectionToken<ReactElement<any>>('RootElement')
export const ROOT_CONTAINER = new InjectionToken<Element>('RootContainer')
