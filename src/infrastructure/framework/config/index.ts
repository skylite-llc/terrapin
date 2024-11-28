import process from 'process'

/**
 * Universal Date Format
 */
export const DATE_FORMAT = 'MM/DD/YYYY hh:mm:ss a'

export const ACCEPTED_CONTENT_TYPE_HEADERS = ['application/json']
export const ACCEPTED_ACCEPT_HEADERS = ['application/json']
export const APPLICATION_NAME = process.env.APPLICATION_NAME || 'terrapin'
