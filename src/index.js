const {isUrl, downloadFile, copyFile} = require('./util')
const path = require('path')
const fs = require('fs')

const storeHandle = async (ctx) => {
  const config = ctx.getConfig('picgo-plugin-store')

  ctx.input = await Promise.all(ctx.input.map(async (item, index) => {
    let fileName = ''
    let filePath = config.storePath

    if (!filePath) throw new Error('请配置默认保存的文件夹')
    // 获取原来名字,不包括后缀
    if (isUrl(item)) {
      const urlPath = new URL(item).pathname
      fileName = path.basename(urlPath, path.extname(urlPath))
    } else {
      fileName = path.basename(item, path.extname(item))
    }

    /* if (config.setEachImgName) {
      fileName = await guiApi.showInputBox({
        title: '输入文件名',
        placeholder: '不用加后缀'
      })
    }

    if (config.setEachImgPath) {
      filePath = await guiApi.showFileExplorer({
        properties: ['openDirectory '], 'defaultPath ': filePath
      })
    } */

    /*    ctx.emit('notification', {
      title: 'name',
      body: fileName
    }) */

    if (isUrl(item)) {
      item = await downloadFile(item, filePath, fileName, ctx)
    } else {
      item = copyFile(item, filePath, fileName)
    }

    return item
  }))
}

const config = (ctx) => {
  let userConfig = ctx.getConfig('picgo-plugin-store')
  if (!userConfig) {
    userConfig = {}
  }
  return [
    {
      name: 'storePath',
      type: 'input',
      default: userConfig.storePath || '',
      message: '存储路径不能为空',
      required: true
    },
    {
      // 自动重命名storePath下的图片为上传时(output)的名字
      name: 'autoRename',
      type: 'confirm',
      default: userConfig.autoRename || false,
      required: true
    }
    /* {
      // 每张图片自定义文件名
      name: 'setEachImgName',
      type: 'confirm',
      default: userConfig.setEachImg || false,
      required: true
    },
    {
      // 每张图片自定义路径
      name: 'setEachImgPath',
      type: 'confirm',
      default: userConfig.setEachImgPath || false,
      required: true
    } */
  ]
}

const renameHandle = ctx => {
  const config = ctx.getConfig('picgo-plugin-store')
  if (!config.autoRename) return
  if (ctx.input.length !== ctx.output.length) return

  let filePath = config.storePath

  for (let i = 0; i < ctx.input.length; i++) {
    const fileName = path.basename(ctx.input[i])
    fs.renameSync(path.join(filePath, fileName), path.join(filePath, ctx.output[i].fileName))
  }
}

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.beforeTransformPlugins.register('store', {handle: storeHandle})
    ctx.helper.afterUploadPlugins.register('store', {handle: renameHandle})
  }
  return {
    register,
    config: config
  }
}
