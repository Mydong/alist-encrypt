'use strict'

import MixEnc from './mixEnc.js'
import Rc4 from './rc4.js'
import Rc4back from './rc4back.js'

class FlowEnc {
  constructor(password, encryptType = 'mix', fileSize = 0) {
    // 貌似就是这个字母慢
    fileSize *= 1
    let encryptFlow = null
    if (encryptType === 'mix') {
      console.log('@@mix', encryptType)
      encryptFlow = new MixEnc(password)
    }
    if (encryptType === 'rc4') {
      console.log('@@rc4', encryptType, fileSize)
      encryptFlow = new Rc4(password, fileSize)
    }
    if (encryptType === 'rc4back') {
      console.log('@@Rc4back', encryptType, fileSize)
      encryptFlow = new Rc4back(password, fileSize)
    }
    if (encryptType === null) {
      throw new Error('FlowEnc error')
    }
    this.encryptFlow = encryptFlow
    this.encryptType = encryptType
  }

  // 设置文件开始加密的位置
  async setPosition(position) {
    if (this.encryptType === 'rc4') {
      await this.encryptFlow.setPositionAsync(position)
    }
    if (this.encryptType === 'rc4back') {
      await this.encryptFlow.setPositionAsync(position)
    }
  }

  // 加密流转换
  encryptTransform() {
    return this.encryptFlow.encryptTransform()
  }

  decryptTransform() {
    return this.encryptFlow.decryptTransform()
  }
}

// const flowEnc = new FlowEnc('abc1234')
// const encode = flowEnc.encodeData('测试的明文加密1234￥%#')
// const decode = flowEnc.decodeData(encode)
// console.log('@@@decode', encode, decode.toString())
// console.log(new FlowEnc('e10adc3949ba56abbe5be95ff90a8636'))

export default FlowEnc
