import server from './src'
import { FastifyInstance } from 'fastify'

const cfg = require('./config')
const SIGNALS = ['SIGTERM', 'SIGINT']

const main = async function(): Promise<void> {
  let fastify: FastifyInstance = undefined
  SIGNALS.forEach((signal: string): void => {
    process.on(signal, async (err): Promise<void> => {
      console.error({ signal, err }, 'exiting because of an unhandled exception')
      await fastify?.close()
      // process.exit()
      process.exitCode = 411
    })
  })

  try {
    fastify = await server(cfg)
  } catch (err) {
    console.error('error in main', err)
  }
}

main()
