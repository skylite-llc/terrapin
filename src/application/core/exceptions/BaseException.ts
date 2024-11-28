/**
 * BaseException
 */
export default abstract class BaseException extends Error {
  public code: number
  public message: string
  public data: {
    [key: string]: string
  }

  /**
   * Report an error
   * @param _
   */
  public report(_?: string) {}
}
