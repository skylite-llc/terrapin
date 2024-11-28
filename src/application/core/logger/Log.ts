import { TextOutputOptions } from '@framework/types/TextOutputOptions'
import chalk from 'chalk'

const log = console.log

export default class Log {
  static logger = log

  /**
   * Logs success
   * @param {string} msg A message to log
   * @param {string?} icon A corresponding icon
   * @returns {void} Void
   */
  static success = (msg: string, icon?: string): void =>
    log(Log.renderSuccessText((icon ?? '✅  ') + msg))

  /**
   * Logs a warning
   * @param {string} msg A message to log
   * @param {string?} icon A corresponding icon
   * @returns {void} Void
   */
  static warn = (msg: string, icon?: string): void =>
    log(Log.renderWarningText((icon ?? '⚠️   ') + msg))
  /**
   * Logs an error
   * @param {string} msg A message to log
   * @param {string?} icon A corresponding icon
   * @returns {void} Void
   */
  static error = (msg: string, icon?: string): void =>
    log(Log.renderDangerText((icon ?? '❌  ') + msg))

  /**
   * Log General info
   * @param {string} msg A message to log
   * @param {string?} icon A corresponding icon
   * @returns {void} Void
   */
  static info = (msg: string, icon?: string): void =>
    log(Log.renderInfoText((icon ?? 'ℹ️   ') + msg))

  /**
   * Stringifies a JSON object
   * @param json {object} The object to stringify
   * @return {string} The stringified object
   */
  static string = (json: object): string => JSON.stringify(json)

  /**
   * Renders danger text
   * @param {string} text Input
   * @param {boolean} bold Bold text
   * @param {boolean} italic Italic text
   * @returns {string} Output
   */
  static renderDangerText = (
    text: string,
    bold?: boolean,
    italic?: boolean,
  ): string =>
    Log._renderText(text, {
      bold,
      italic,
      color: 'redBright',
    } as TextOutputOptions)

  /**
   * Renders muted text
   * @param {string} text Input
   * @param {boolean} bold Bold text
   * @param {boolean} italic Italic text
   * @returns {string} Output
   */
  static renderMutedText = (
    text: string,
    bold?: boolean,
    italic?: boolean,
  ): string =>
    Log._renderText(text, {
      bold,
      italic,
      color: 'grey',
    } as TextOutputOptions)

  /**
   * Renders info text
   * @param {string} text Input
   * @param {boolean} bold Bold text
   * @param {boolean} italic Italic text
   * @returns {string} Output
   */
  static renderInfoText = (
    text: string,
    bold?: boolean,
    italic?: boolean,
  ): string =>
    Log._renderText(text, {
      bold,
      italic,
      color: 'blueBright',
    } as TextOutputOptions)

  /**
   * Renders success text
   * @param {string} text Input
   * @param {boolean} bold Bold text
   * @param {boolean} italic Italic text
   * @returns {string} Output
   */
  static renderSuccessText = (
    text: string,
    bold?: boolean,
    italic?: boolean,
  ): string =>
    Log._renderText(text, {
      bold,
      italic,
      color: 'greenBright',
    } as TextOutputOptions)

  /**
   * Renders warning text
   * @param {string} text Input
   * @param {boolean} bold Bold text
   * @param {boolean} italic Italic text
   * @returns {string} Output
   */
  static renderWarningText = (
    text: string,
    bold?: boolean,
    italic?: boolean,
  ): string =>
    Log._renderText(text, {
      bold,
      italic,
      color: 'yellowBright',
    } as TextOutputOptions)

  /**
   * Renders white text
   * @param {string} text Input
   * @param {boolean} bold Bold text
   * @param {boolean} italic Italic text
   * @returns {string} Output
   */
  static renderWhiteText = (
    text: string,
    bold?: boolean,
    italic?: boolean,
  ): string =>
    Log._renderText(text, {
      bold,
      italic,
      color: 'white',
    } as TextOutputOptions)

  /**
   * Renders text
   * @param {string} text The text to output
   * @param {TextOutputOptions} options Text options
   * @returns {string} Output
   */
  private static _renderText = (
    text: string,
    options: TextOutputOptions,
  ): string =>
    options.bold
      ? chalk.bold[options.color](text)
      : options.italic
        ? chalk.italic[options.color](text)
        : chalk[options.color](text)
}
