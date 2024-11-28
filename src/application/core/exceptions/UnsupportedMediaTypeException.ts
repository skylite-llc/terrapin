import BaseException from '@exceptions/BaseException'

export default class UnsupportedMediaTypeException extends BaseException {
  /**
   * @constructs UnsupportedMediaTypeException
   */
  constructor() {
    super()
    this.code = 419
    this.message = 'Unsupported Media Type'
  }
}
