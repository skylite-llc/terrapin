import { createHash } from 'crypto'
import fs from 'fs'
import path, { dirname } from 'path'
import { ZodString } from 'zod'

export const __filename = path.basename('./')
export const BaseDirectory = dirname(__filename)

/**
 * JSON stringify
 */
export const json = object => JSON.stringify(object)

/**
 * Compare and return uniques in lists
 * @param map
 * @param compare
 */
export function findDifferences(map: string[], compare: string[]) {
  const set = new Set(map)
  const compareSet = new Set(compare)
  const uniqueInSet = map.filter(
    id => !compareSet.has(id),
  ) as unknown as string[]
  const uniqueInCompareSet = compare.filter(
    id => !set.has(id),
  ) as unknown as string[]
  return {
    uniqueInSet,
    uniqueInCompareSet,
  }
}

/**
 * Marshals a string to an enum type
 * @param str
 * @param enumType
 */
export function marshalStringToEnum<T>(
  str: string,
  enumType: { [s: string]: T },
): T | null {
  if (str in enumType) {
    return enumType[str as keyof typeof enumType]
  }
  return null
}

/**
 * Find swaps in an array
 * @param array1
 * @param array2
 */
export function findSwaps(
  array1: string[],
  array2: string[],
): { new: number; old: number }[] {
  const finalPositions = new Map(array2.map((item, index) => [item, index]))
  const swaps = []

  for (let i = 0; i < array1.length; i++) {
    while (finalPositions.get(array1[i]) !== i) {
      const correctIndex = finalPositions.get(array1[i])
      if (correctIndex !== undefined) {
        swaps.push({ new: correctIndex, old: i })
        ;[array1[i], array1[correctIndex]] = [array1[correctIndex], array1[i]]
      }
    }
  }

  return swaps
}

/**
 * Create an MD5 hash of concated strings
 * @param strings {string[]} Strings to encrypt
 * @returns {string} The encrypted hash
 */
export function md5HashStrings(strings: string[]): string {
  return createHash('md5').update(strings.join(',')).digest('hex')
}

/**
 * Creates a SH256 Hash of concated strings
 * @param strings {string[]}
 * @returns {string} The encrypted hash
 */
export function sha256HashStrings(strings: string[]): string {
  return createHash('sha256').update(strings.join(',')).digest('hex')
}

/**
 * Chunk array
 */
export function chunkArray(array, chunkSize) {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Returns recursive file keys in an array or object
 * @param dir
 * @param extension
 * @param array
 */
export function findRecursiveInDirectory(
  dir: string,
  extension: 'ts' | 'js',
  array: unknown[] | object,
) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      findRecursiveInDirectory(fullPath, extension, array)
    } else if (file.endsWith(`.${extension}`)) {
      const jobName = path.basename(file, `.${extension}`)
      array[jobName] = fullPath
    }
  })
}

/**
 * Traverses the filesystem to find the root directory
 * @param currentDir
 */
export function findRootDirectory(currentDir: string) {
  if (fs.existsSync(path.join(currentDir, 'package.json'))) {
    return currentDir
  }
  const parentDir = path.dirname(currentDir)
  if (parentDir === currentDir) {
    return null
  }
  return findRootDirectory(parentDir)
}

/**
 * Validates a number from a Zod string
 * @param z
 * @param field
 * @param message
 */
export function validateNumberFromQuery(
  z: ZodString,
  field: string,
  message?: string,
) {
  return z
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val), {
      message: message ?? `${field} must be a number`,
    })
}

/**
 * Shuffles an array
 * @param array {string[]} An array to shuffle
 * @returns {string[]} the shuffled array
 */
export function shuffleArray(array: string[]): string[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}
