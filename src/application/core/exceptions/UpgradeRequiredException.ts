import BaseException from '@exceptions/BaseException'

export default class UpgradeRequiredException extends BaseException {
  /**
   * @constructs UpgradeRequiredException
   */
  constructor() {
    super()
    this.code = 426
    this.message = 'Upgrade Required'
  }
}
