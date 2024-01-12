import sql from 'mssql'
import { FastifyBaseLogger } from 'fastify'

export default class DefaultRepository {
  schema: string = 'dbo.'
  _logger: FastifyBaseLogger
  _pool: sql.ConnectionPool

  constructor(logger: FastifyBaseLogger, pool: sql.ConnectionPool) {
    this._logger = logger
    this._pool = pool
  }

  async list(user_id?: string): Promise<any[]> {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    const result = await r.execute(this.schema + 'procedure_name').catch(err => {
      this._logger.error({ err }, 'error while executing sql procedure')
    })

    if (!result)
      return []

    this._logger.debug({ result }, `Exeecuting procedure ${this.schema}procedure_name result`)

    return result.recordset.length > 0 ? result.recordset[0] : []
  }

  async create(data: any, user_id?: string): Promise<boolean> {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    r.input('data_name', sql.VarChar, data.name)
    const result = await r.execute(this.schema + 'procedure_name').catch(err => {
      this._logger.error({ err }, 'error while executing sql procedure')
    })

    if (!result)
      return false

    this._logger.debug({ result }, `Exeecuting procedure ${this.schema}procedure_name result`)

    return result.rowsAffected[0] > 0
  }

  async update(id: number, data: any, user_id?: string): Promise<boolean> {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    r.input('id', sql.Int, id)
    r.input('data_name', sql.VarChar, data.name)
    const result = await r.execute(this.schema + 'procedure_name').catch(err => {
      this._logger.error({ err }, 'error while executing sql procedure')
    })

    if (!result)
      return false

    this._logger.debug({ result }, `Exeecuting procedure ${this.schema}procedure_name result`)

    return result.rowsAffected[0] > 0
  }

  async delete(id: number, user_id?: string): Promise<boolean> {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    r.input('id', sql.Int, id)
    const result = await r.execute(this.schema + 'procedure_name').catch(err => {
      this._logger.error({ err }, 'error while executing sql procedure')
    })

    if (!result)
      return false

    this._logger.debug({ result }, `Exeecuting procedure ${this.schema}procedure_name result`)

    return result.rowsAffected[0] > 0
  }
}