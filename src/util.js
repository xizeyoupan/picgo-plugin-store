const path = require('path')
const fs = require('fs')

const isUrl = (url) => (url.startsWith('http://') || url.startsWith('https://'))
const isUrlEncode = (url) => {
  url = url || ''
  try {
    return url !== decodeURI(url)
  } catch (e) {
    // if some error caught, try to let it go
    return true
  }
}
const handleUrlEncode = (url) => {
  if (!isUrlEncode(url)) {
    url = encodeURI(url)
  }
  return url
}

const downloadFile = async (url, filePath, fileName, ctx) => {
  const requestOptions = {
    method: 'GET',
    url: handleUrlEncode(url),
    resolveWithFullResponse: true,
    timeout: 10000,
    encoding: null
  }

  let extname = ''
  let response
  try {
    response = await ctx.Request.request(requestOptions)
  } catch (e) {
    throw new Error(e)
  }

  const contentType = response.headers['content-type']
  if (contentType.includes('image')) {
    extname = `.${contentType.split('image/')[1]}`
    fileName = fileName + extname
    const fullPath = path.join(filePath, fileName)
    fs.writeFileSync(fullPath, response.body)
    return fullPath
  } else {
    throw new Error('not a image')
  }
}

const copyFile = (item, filePath, fileName) => {
  const extname = path.extname(item)
  fileName += extname
  const fullPath = path.join(filePath, fileName)
  if (item !== fullPath) fs.writeFileSync(fullPath, fs.readFileSync(item))
  return item
}

module.exports = {isUrl, downloadFile, copyFile}
