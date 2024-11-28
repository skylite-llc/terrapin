import BaseException from './BaseException'

export default class ContentExistsException extends BaseException {
  /**
   * @constructs ContentExistsException
   */
  constructor(data?: { [key: string]: string }) {
    super()
    this.code = 409
    this.data = data ?? {}
    this.message = 'Duplicate record.'
  }
}
