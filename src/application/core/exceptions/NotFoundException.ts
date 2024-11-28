import BaseException from './BaseException'

export default class NotFoundException extends BaseException {
  /**
   * @constructs NotFoundEception
   */
  constructor() {
    super()
    this.code = 404
    this.message = 'Not Found'
  }
}
