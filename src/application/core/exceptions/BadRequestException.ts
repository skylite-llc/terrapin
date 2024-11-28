import BaseException from '@exceptions/BaseException'

export default class BadRequestException extends BaseException {
  /**
   * @constructs BadRequestException
   */
  constructor() {
    super()
    this.code = 400
    this.message = 'Bad request.'
  }
}
