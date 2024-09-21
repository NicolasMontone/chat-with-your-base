#!/usr/bin/env node

const { exec } = require('child_process')
const path = require('path')
const chalk = require('chalk')

process.env.IS_CLI = 'true'

const port = 5005
const isWin = process.platform === 'win32'
const nextBinary = isWin ? 'next.cmd' : 'next'
const nextPath = path.resolve(__dirname, '../node_modules/.bin', nextBinary)

console.log(chalk.cyan('Starting the app...'))

// Start the Next.js app
const child = exec(`"${nextPath}" start -p ${port}`, { stdio: 'inherit' })

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
