import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import { env } from 'process'

import defaultController from './controllers/default.controller'

const LOGLEVEL = 'debug'

export default async function (config: any): Promise<FastifyInstance | undefined> {
  if (!config || !config.wrapper) return

  const fastify = await Fastify(config.wrapper)
  // prefix used; default to /api/test
  const version_prefix = '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '')
  // registration of controllers
  await fastify.register(defaultController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/default`, logLevel: LOGLEVEL })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })

  return fastify
}