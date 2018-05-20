import React from 'react'

interface User {
  firstName: string
  lastName: string
}

function formatName(user: User) {
  return user.firstName + ' ' + user.lastName
}

const sampleUser = {
  firstName: 'Harper',
  lastName: 'Perez'
}

export const introducing_jsx_0 = (
  <h1>
    Hello, {formatName(sampleUser)}!
  </h1>
)
