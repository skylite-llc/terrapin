import { Color } from 'chalk'

/**
 * @type TextOutputOptions
 * @property {boolean} bold Bold text
 * @property {boolean} italic Italic text
 * @property {typeof Color}
 */
export type TextOutputOptions = {
  bold?: boolean
  italic?: boolean
  color: typeof Color
}
