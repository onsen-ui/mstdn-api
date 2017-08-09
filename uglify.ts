import { readFileSync, createWriteStream } from 'fs'
import { minify } from 'uglify-js'

const inFile = readFileSync('./dist/mastodon.js')
const outputFile = createWriteStream('./dist/mastodon.min.js')

const code = inFile.toString()
const result = minify(code, {
  mangle: {
    reserved: ['Mastodon', 'StreamListener']
  }
})

outputFile.write(result.code)
