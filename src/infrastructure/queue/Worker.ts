import 'reflect-metadata'
import '../config'
import Log from '@logger/Log'

const { parentPort } = require('worker_threads')

/**
 * Boot parent port listener
 */
parentPort.on('message', async jobData => {
  try {
    const result = await processJob(jobData)
    parentPort.postMessage(result)
  } catch (error) {
    parentPort.postMessage({ error: error.message })
  }
})

/**
 * Default job processing given valid Job Data
 * @param jobData
 */
async function processJob(jobData) {
  try {
    const jobModuleNamespace = await import(jobData.job)
    const JobModule = jobModuleNamespace.default
    if (typeof JobModule !== 'function') {
      throw new Error('Imported module is not a constructor')
    }
    return await new JobModule().run(jobData.data)
  } catch (e) {
    Log.error(e)
    throw e
  }
}
