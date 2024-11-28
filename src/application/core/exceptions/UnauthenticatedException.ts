import BaseException from './BaseException'

export default class UnauthenticatedException extends BaseException {
  /**
   * @constructs UnauthenticatedException
   */
  constructor() {
    super()
    this.code = 401
    this.message = 'Unauthenticated'
  }
}
