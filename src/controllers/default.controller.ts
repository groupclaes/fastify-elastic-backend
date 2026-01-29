import { FastifyInstance, FastifyRequest, FastifyReply, FastifyBaseLogger } from 'fastify'

import DefaultRepository from '../repositories/default.repository'
import { createSqlECSEvent } from '../index'
import { IECS, IECSEvent } from '../@types/fastify'

export default async function register(fastify: FastifyInstance) {
  const controller = new ItemsController(fastify)
  controller.registerRoutes()
}

class ItemsController {
  private logger: FastifyBaseLogger

  constructor(private fastify: FastifyInstance) {
    this.logger = this.getRequestLogger(fastify.log)
    fastify.log = this.logger
  }

  registerRoutes(): void {
    this.logger.debug('registerRoutes() -- start')

    try {
      this.fastify.get('', this.read.bind(this))
      this.logger.debug(`registerRoutes() -- GET ''`)
      this.fastify.get('', this.create.bind(this))
      this.logger.debug(`registerRoutes() -- POST ''`)
      this.fastify.get('/:id', this.update.bind(this))
      this.logger.debug(`registerRoutes() -- PUT '/:id'`)
      this.fastify.get('/:id', this.delete.bind(this))
      this.logger.debug(`registerRoutes() -- DELETE '/:id'`)
    } catch (error) {
      this.logger.error({ error }, 'Error while running registerRoutes()')
    }

    this.logger.debug('registerRoutes() -- end')
  }

  async read(request: FastifyRequest, reply: FastifyReply) {
    request.log = this.getRequestLogger(request.log)

    const start: number = performance.now()
    let response: FastifyReply

    let event: IECSEvent = createSqlECSEvent('access-default')
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await this.fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)
      const dbResult = await repo.list(request.jwt.sub)

      if (dbResult && dbResult.length > 0) {
        request.log.debug('procedure run success!')
        event.outcome = 'success'
        event.type.push('allowed')
        response = reply
          .success(dbResult, undefined, performance.now() - start)
      } else {
        request.log.warn('procedure run failure!')
        event.outcome = 'failure'
        event.type.push('denied')
        response = reply
          .fail(undefined, undefined, performance.now() - start)
      }
    } catch (err) {
      event.type.push('error')
      request.log.error({ err }, 'Error while processing request!')
      response = reply
        .error('failed to fetch defaults from database', undefined, performance.now() - start)
    } finally {
      request.log.info({ event } as IECS)
    }

    return response
  }

  async create(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    request.log = this.getRequestLogger(request.log)

    const start: number = performance.now()
    let response: FastifyReply

    let event: IECSEvent = createSqlECSEvent('create-default', ['creation'])
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await this.fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)
      const dbResult = await repo.create(request.body, request.jwt.sub)

      if (dbResult) {
        request.log.debug('procedure run success!')
        event.outcome = 'success'
        event.type.push('allowed')
        response = reply
          .success(dbResult, undefined, performance.now() - start)
      } else {
        request.log.warn('procedure run failure!')
        event.outcome = 'failure'
        event.type.push('denied')
        response = reply
          .fail(undefined, undefined, performance.now() - start)
      }
    } catch (err) {
      event.type.push('error')
      request.log.error({ err }, 'Error while processing request!')
      response = reply
        .error('failed to fetch defaults from database', undefined, performance.now() - start)
    } finally {
      request.log.info({ event } as IECS)
    }

    return response
  }

  async update(request: FastifyRequest<{ Params: { id: number }, Body: any }>, reply: FastifyReply) {
    request.log = this.getRequestLogger(request.log)

    const start: number = performance.now()
    let response: FastifyReply

    let event: IECSEvent = createSqlECSEvent('update-default', ['change'])
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await this.fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)
      const dbResult = await repo.update(+request.params.id, request.body, request.jwt.sub)

      if (dbResult) {
        request.log.debug('procedure run success!')
        event.outcome = 'success'
        event.type.push('allowed')
        response = reply
          .success(dbResult, undefined, performance.now() - start)
      } else {
        request.log.warn('procedure run failure!')
        event.outcome = 'failure'
        event.type.push('denied')
        response = reply
          .fail(undefined, undefined, performance.now() - start)
      }
    } catch (err) {
      event.type.push('error')
      request.log.error({ err }, 'Error while processing request!')
      response = reply
        .error('failed to fetch defaults from database', undefined, performance.now() - start)
    } finally {
      request.log.info({ event } as IECS)
    }

    return response
  }

  async delete(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    request.log = this.getRequestLogger(request.log)

    const start: number = performance.now()
    let response: FastifyReply

    let event: IECSEvent = createSqlECSEvent('delete-default', ['deletion'])
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await this.fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)
      const dbResult = await repo.delete(+request.params.id, request.jwt.sub)

      if (dbResult) {
        request.log.debug('procedure run success!')
        event.outcome = 'success'
        event.type.push('allowed')
        response = reply
          .success(dbResult, undefined, performance.now() - start)
      } else {
        request.log.warn('procedure run failure!')
        event.outcome = 'failure'
        event.type.push('denied')
        response = reply
          .fail(undefined, undefined, performance.now() - start)
      }
    } catch (err) {
      event.type.push('error')
      request.log.error({ err }, 'Error while processing request!')
      response = reply
        .error('failed to delete defaults from database', undefined, performance.now() - start)
    } finally {
      request.log.info({ event } as IECS)
    }

    return response
  }

  private getRequestLogger(logger: FastifyBaseLogger): FastifyBaseLogger {
    let options = { namespace: 'DefaultsController' }
    return logger.child(options)
  }
}
