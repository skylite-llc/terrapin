import BaseException from './BaseException'

export default class UnauthorizedException extends BaseException {
  /**
   * @constructs UnauthorizedException
   */
  constructor() {
    super()
    this.code = 403
    this.message = 'Unauthorized'
  }
}
