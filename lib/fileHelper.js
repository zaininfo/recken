import fs from 'fs'

export function fileExists (filename) {
  try {
    return fs.statSync(filename)
  } catch (e) {
    throw new Error(`File ${filename} is not accessible.`, e)
  }
}
