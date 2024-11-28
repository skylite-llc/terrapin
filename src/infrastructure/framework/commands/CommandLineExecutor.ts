import { BaseDirectory } from '@helpers'
import Log from '@logger/Log.ts'
import { spawn } from 'child_process'
import * as process from 'node:process'
import * as path from 'path'

export default class CommandLineExecutor {
  private readonly scriptPath: string
  private readonly args: Record<string, unknown>

  /**
   * @constructs CommandLineExecutor
   * @param scriptPath {string} The script to execute
   * @returns {void} Void
   */
  constructor(scriptPath: string) {
    this.scriptPath = scriptPath
    this.args = this.parseCommandLineArguments()
  }

  /**
   * Runs the script
   * @param scriptPath {string} The script to run
   * @returns {void} Void
   */
  public static run(scriptPath: string): void {
    const executor = new CommandLineExecutor(scriptPath)
    executor.executeScript()
  }

  /**
   * Parses command line arguments
   * @returns {Record<string, unknown>} Parsed command line args
   * @private
   */
  private parseCommandLineArguments(): Record<string, unknown> {
    const args: Record<string, unknown> = {}
    process.argv.slice(2).forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=')
        args[key] = value
      }
    })
    return args
  }

  /**
   * Executes the script
   * @returns {void} Void
   */
  public executeScript(): void {
    const resolvedPath = path.resolve(BaseDirectory, this.scriptPath)
    const scriptArgs = [JSON.stringify(this.args)]
    const scriptProcess = spawn('ts-node', [resolvedPath, ...scriptArgs], {
      stdio: 'inherit',
    })

    scriptProcess.on('error', error => {
      console.error(`Error executing script: ${error.message}`)
    })

    scriptProcess.on('exit', code => {
      Log.info(`Script exited with code: ${code}`)
    })
  }
}
