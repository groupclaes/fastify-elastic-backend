import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'
import sql from 'mssql'

import DefaultRepository from '../repositories/default.repository'

declare module 'fastify' {
  export interface FastifyInstance {
    getSqlPool: (name?: string) => Promise<sql.ConnectionPool>
  }

  export interface FastifyRequest {
    jwt: JWTPayload
    hasRole: (role: string) => boolean
    hasPermission: (permission: string, scope?: string) => boolean
  }

  export interface FastifyReply {
    success: (data?: any, code?: number, executionTime?: number) => FastifyReply
    fail: (data?: any, code?: number, executionTime?: number) => FastifyReply
    error: (message?: string, code?: number, executionTime?: number) => FastifyReply
  }
}

export default async function (fastify: FastifyInstance) {
  /**
   * Get all default for current user
   * @route GET /api/{APP_VERSION}/{serviceName}/default
   */
  fastify.get('', async (request: FastifyRequest<{}>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)

      request.log.debug({}, 'fetching default')
      const data = await repo.list(request.jwt.sub)

      request.log.debug({ default_length: data?.length }, 'fetched default')
      return reply.success(data)
    } catch (err) {
      request.log.error({ err }, 'Failed to fetch default from database')
      return reply.error('failed to fetch default from database')
    }
  })

  /**
   * Create a new default for user
   * @route GET /api/{APP_VERSION}/{serviceName}/default
   */
  fastify.get('', async (request: FastifyRequest<{}>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)

      request.log.debug({}, 'creating default')
      const data = await repo.create(request.jwt.sub, request.body)

      request.log.debug({ success: data }, 'created default')
      return reply.success(data)
    } catch (err) {
      request.log.error({ err }, 'Failed to create default from database')
      return reply.error('failed to create default from database')
    }
  })

  /**
   * Update a specific user default
   * @route put /api/{APP_VERSION}/{serviceName}/default/:id
   */
  fastify.put('/:id', async (request: FastifyRequest<{}>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)

      request.log.debug({}, 'updating default')
      const data = await repo.update(+request.params.id, request.jwt.sub, request.body)

      request.log.debug({ success: data }, 'updated default')
      return reply.success(data)
    } catch (err) {
      request.log.error({ err }, 'Failed to update default in database')
      return reply.error('failed to update default in database')
    }
  })

  /**
   * Delete a specific user default
   * @route DELETE /api/{APP_VERSION}/{serviceName}/default/:id
   */
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: number }}>, reply: FastifyReply) => {
    try {
      if (!request.jwt)
        return reply.error('missing jwt!', 401)

      const pool = await fastify.getSqlPool()
      const repo = new DefaultRepository(request.log, pool)

      request.log.debug({}, 'deleting default')
      const data = await repo.delete(+request.params.id, request.jwt.sub)

      request.log.debug({ success: data }, 'removed default')
      return reply.success(data)
    } catch (err) {
      request.log.error({ err }, 'Failed to delete default from database')
      return reply.error('failed to delete default from database')
    }
  })
}