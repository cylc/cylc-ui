/* eslint-disable no-console */
const concurrently = require('concurrently')

const args = process.argv.slice(2)
const { VITE_OPTIONS } = process.env

const allCommands = {
  'serve:jupyterhub': {
    command: 'yarn run serve:jupyterhub',
    name: 'SERVER',
    prefixColor: 'yellow',
  },
  'serve:vue': {
    command: `yarn run serve:vue ${VITE_OPTIONS ?? ''}`,
    name: 'VITE',
    prefixColor: 'blue',
  },
  preview: {
    command: `yarn run -B vite preview --mode offline ${VITE_OPTIONS ?? ''}`,
    name: 'VITE',
    prefixColor: 'blue',
  },
  'e2e:open': {
    command: 'yarn run -B cypress open --e2e',
    name: 'TESTS',
    prefixColor: 'magenta',
  },
  'cy:run': {
    command: 'yarn run -B cypress run',
    name: 'TESTS',
    prefixColor: 'cyan',
  },
}

concurrently(
  args.map((arg) => allCommands[arg]),
  {
    successCondition: 'first',
    killOthers: ['success', 'failure'],
  }
)
