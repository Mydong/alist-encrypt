'use strict'

import { pathFindPasswd, convertRealName, convertShowName } from './utils/commonUtil.js'
import { cacheFileInfo, getFileInfo } from './dao/fileDao.js'
import { logger } from './common/logger.js'
import path from 'path'
import { httpClient } from './utils/httpClient.js'
import { XMLParser } from 'fast-xml-parser'
// import { escape } from 'querystring'

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time || 3000)
  })
}

// bodyparser解析body
const parser = new XMLParser({ removeNSPrefix: true })

function getFileNameForShow(fileInfo, passwdInfo) {
  let getcontentlength = -1
  const href = fileInfo.href
  const fileName = path.basename(href)
  if (fileInfo.propstat instanceof Array) {
    getcontentlength = fileInfo.propstat[0].prop.getcontentlength
  } else if (fileInfo.propstat.prop) {
    getcontentlength = fileInfo.propstat.prop.getcontentlength
  }
  // logger.debug('@@fileInfo_show', JSON.stringify(fileInfo))
  // is not dir
  if (getcontentlength !== undefined && getcontentlength > -1) {
    const showName = convertShowName(passwdInfo.password, passwdInfo.encType, href)
    return { fileName, showName }
  }
  // cache this folder info
  return {}
}

function cacheWebdavFileInfo(fileInfo) {
  let getcontentlength = -1
  const href = fileInfo.href
  const fileName = path.basename(href)
  if (fileInfo.propstat instanceof Array) {
    getcontentlength = fileInfo.propstat[0].prop.getcontentlength
  } else if (fileInfo.propstat.prop) {
    getcontentlength = fileInfo.propstat.prop.getcontentlength
  }
  // logger.debug('@@@cacheWebdavFileInfo', href, fileName)
  // it is a file
  if (getcontentlength !== undefined && getcontentlength > -1) {
    const fileDetail = { path: href, name: fileName, is_dir: false, size: getcontentlength }
    cacheFileInfo(fileDetail)
    return fileDetail
  }
  // cache this folder info
  const fileDetail = { path: href, name: fileName, is_dir: true, size: 0 }
  cacheFileInfo(fileDetail)
  return fileDetail
}

// 拦截全部
const handle = async (ctx, next) => {
  const request = ctx.req
  const { passwdList } = request.webdavConfig
  const { passwdInfo } = pathFindPasswd(passwdList, decodeURIComponent(request.url))
  if (ctx.method.toLocaleUpperCase() === 'PROPFIND') {
    // check dir, convert url
    const url = request.url
    if (passwdInfo && passwdInfo.encName) {
      // check dir, convert url
      const reqFileName = path.basename(url)
      // cache source file info, realName has execute encodeUrl()，this '(' '+' can't encodeUrl.
      const realName = convertRealName(passwdInfo.password, passwdInfo.encType, url)
      // when the name contain the + , ! ,
      const sourceUrl = path.dirname(url) + '/' + realName
      const sourceFileInfo = await getFileInfo(sourceUrl)
      logger.debug('@@@sourceFileInfo', sourceFileInfo, reqFileName, realName, url, sourceUrl)
      // it is file, convert file name
      if (sourceFileInfo && !sourceFileInfo.is_dir) {
        request.url = url.replace(reqFileName, realName)
        request.urlAddr = request.urlAddr.replace(reqFileName, realName)
      }
    }
    // decrypt file name
    let respBody = await httpClient(ctx.req, ctx.res)
    const respData = parser.parse(respBody)
    // convert file name for show
    if (respData.multistatus) {
      const respJson = respData.multistatus.response
      if (respJson instanceof Array) {
        // console.log('@@respJsonArray', respJson)
        respJson.forEach((fileInfo) => {
          // cache real file info，include forder name
          cacheWebdavFileInfo(fileInfo)
          if (passwdInfo && passwdInfo.encName) {
            const { fileName, showName } = getFileNameForShow(fileInfo, passwdInfo)
            // logger.debug('@@getFileNameForShow1 list', passwdInfo.password, fileName, decodeURI(fileName), showName)
            if (fileName) {
              const showXmlName = showName.replace(/&/g, '&amp;').replace(/</g, '&gt;')
              respBody = respBody.replace(`${fileName}</D:href>`, `${encodeURI(showXmlName)}</D:href>`)
              respBody = respBody.replace(`${decodeURI(fileName)}</D:displayname>`, `${decodeURI(showXmlName)}</D:displayname>`)
            }
          }
        })
        // waiting cacheWebdavFileInfo a moment
        await sleep(50)
      } else if (passwdInfo && passwdInfo.encName) {
        const fileInfo = respJson
        const { fileName, showName } = getFileNameForShow(fileInfo, passwdInfo)
        // logger.debug('@@getFileNameForShow2 file', fileName, showName, url, respJson.propstat)
        if (fileName) {
          const showXmlName = showName.replace(/&/g, '&amp;').replace(/</g, '&gt;')
          respBody = respBody.replace(`${fileName}</D:href>`, `${encodeURI(showXmlName)}</D:href>`)
          respBody = respBody.replace(`${decodeURI(fileName)}</D:displayname>`, `${decodeURI(showXmlName)}</D:displayname>`)
        }
      }
    }
    // 检查数据兼容的问题，优先XML对比。
    // logger.debug('@@respJsxml', respBody)
    // const resultBody = parser.parse(respBody)
    // logger.debug('@@respJSONData2', ctx.res.statusCode, JSON.stringify(resultBody))
    // fix webdav 401 bug
    ctx.status = ctx.res.statusCode
    ctx.body = respBody
    return
  }
  // upload file
  if (~'GET,PUT,DELETE'.indexOf(request.method.toLocaleUpperCase()) && passwdInfo && passwdInfo.encName) {
    const url = request.url
    // check dir, convert url
    const fileName = path.basename(url)
    const realName = convertRealName(passwdInfo.password, passwdInfo.encType, url)
    request.url = url.replace(fileName, realName)
    console.log('@@convert file name', fileName, realName)
    request.urlAddr = request.urlAddr.replace(fileName, realName)
  }
  await next()
  // fix rclone bug
  if (request.method.toLocaleUpperCase() === 'PUT' && passwdInfo && passwdInfo.encName) {
    const url = request.url
    const contentLength = request.headers['content-length'] || request.headers['x-expected-entity-length'] || 0
    const fileName = convertShowName(passwdInfo.password, passwdInfo.encType, url)
    const fileDetail = { path: url, name: fileName, is_dir: false, size: contentLength }
    await cacheFileInfo(fileDetail)
  }
}

export default handle
