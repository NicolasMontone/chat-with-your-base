#!/usr/bin/env node

const { exec } = require('child_process')
const path = require('path')
const chalk = require('chalk')

process.env.IS_CLI = 'true'

// Add argument parsing
const argv = require('yargs')
  .option('port', {
    alias: 'p',
    description: 'Port to run the server on',
    type: 'number',
    default: 5005,
  })
  .help().argv

const port = argv.port

// TODO review if this is needed
// const isWin = process.platform === 'win32'
// const nextBinary = isWin ? 'next.cmd' : 'next'
// const nextPath = path.resolve(__dirname, '../node_modules/.bin', nextBinary)
const appDir = path.join(__dirname, '..')

console.log(chalk.cyan(`Starting the app on port ${port}...`))

// Start the Next.js app
const child = exec(`npx next start -p ${port}`, {
  stdio: 'inherit',
  cwd: appDir,
})

child.stdout.on('data', (data) => {
  console.log(chalk.green(data.toString()))
  if (data.includes('started server on')) {
    console.log(chalk.blue.bold(`\n🚀 Server started successfully!`))
    console.log(
      chalk.green(
        `You can now optimize your queries at: ${chalk.underline(`http://localhost:${port}`)}`
      )
    )
  }
})

child.stderr.on('data', (data) => {
  console.error(chalk.yellow(data.toString()))
})

child.on('error', (error) => {
  console.error(chalk.red(`Error starting app: ${error.message}`))
})

child.on('close', (code) => {
  if (code !== 0) {
    console.log(chalk.red(`app process exited with code ${code}`))
  }
})
