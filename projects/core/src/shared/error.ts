export function notAvailableError(name: string): never {
  throw new Error(`Unexpected execution context: ${name} is not available!`)
}

export function illegalStateError(message: string): never {
  throw new Error(`Illegal state: ${message}`)
}

export interface ErrorInfo {
  /**
   * Captures which component contained the exception, and its ancestors.
   */
  componentStack: string
}
