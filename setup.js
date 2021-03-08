const replace = require('replace-in-file')

const moduleName = require('./package.json').name
const boilerplateName = 'npm-boilerplate'

if (moduleName === boilerplateName) {
  throw new Error('You first need to change your module\'s name in package.json')
}

console.log(`Replacing references on ${boilerplateName} with ${moduleName}`)

replace.sync({
  files: [
    './CONTRIBUTING.md',
    './package.json',
  ],
  from: new RegExp(boilerplateName, 'g'),
  to: moduleName,
})
