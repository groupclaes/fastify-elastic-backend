import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { env } from 'process'

// Sync Controllers
import { ECSEventCategory, ECSEventType, IECSEvent } from './@types/fastify'
import oe from '@groupclaes/oe-connector'
import defaultController from './controllers/default.controller'

const LOGLEVEL = 'debug'

export default async function(config: any): Promise<FastifyInstance | undefined> {
  let fastify: FastifyInstance = undefined

  if (config && config.wrapper) {
    try {
      if (!config.wrapper.mssql && config.mssql) {
        config.wrapper.mssql = config.mssql
      }
      // force enable ecs format
      // config.wrapper.ecs = true
      config.wrapper.fastify.requestLogging = true
      config.wrapper.cors = { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }
      config.wrapper.jwt = {}

      fastify = await Fastify(config.wrapper)

      // prefix used; default used to be /service
      // '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '') +
      const version_prefix = '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '') + '/' + config.wrapper.serviceName
      // registration of controllers
      await registerControllers(fastify, version_prefix)

      fastify.addHook('onRequest', async function childLogger(req: FastifyRequest, reply: FastifyReply) {
        if (req.query['user']) {
          if (config.wrapper.ecs) {
            req.log = req.log.child({ 'user.id': req.query['user'] })
          } else {
            req.log = req.log.child({ user: { id: req.query['user'] } })
          }
        }
      })

      let configuration = { c: false, tw: -1, simpleParameters: true }
      fastify.log.debug({ openedge: { configuration } }, 'configured default oe-connector options')
      oe.configure(configuration)

      await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })
    } catch (err) {
      console.error({ err }, 'Fastify has returned an error at runtime')
    }
  }
  return fastify
}

async function registerControllers(fastify: FastifyInstance, prefix: string): Promise<void> {
  const controllers = {
    'default': defaultController,
  }

  for (let controller of Object.keys(controllers)) {
    try {
      fastify.log.debug(`Registering '${controller}' controller!`)
      await fastify.register(controllers[controller], { prefix: `${prefix}/${controller}`, logLevel: LOGLEVEL })
      fastify.log.info(`Controller '${controller}' successfully initialized!`)
    } catch (err) {
      fastify.log.error('Error while running register on controller ' + controller)
    }
  }
}

export function createECSEvent(category: ECSEventCategory[], action: string, dataset: string, type: ECSEventType[] = ['access']): IECSEvent {
  return {
    kind: 'event',
    action,
    category,
    type,
    dataset,
    severity: 5,
    outcome: 'unknown'
  }
}

export function createSqlECSEvent(action: string, type: ECSEventType[] = ['access']): IECSEvent {
  return createECSEvent(['database'], action, 'mssql.client', type)
}
