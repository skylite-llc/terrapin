import BaseException from './BaseException'

export default class ServerErrorException extends BaseException {
  /**
   * @constructs ContentExistsException
   */
  constructor() {
    super()
    this.code = 500
    this.message = 'Server error.'
  }
}
