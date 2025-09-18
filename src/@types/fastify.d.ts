import sql from 'mssql'
import { JWTPayload } from 'jose'

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

export interface IECS {
  event?: IECSEvent
}

export interface IECSEvent {
  id?: string
  dataset?: string
  module?: string
  kind: ECSEventKind,
  category: ECSEventCategory[]
  type: ECSEventType[]
  outcome: ECSEventOutcome
  action: string
  severity: ECSEventSeverity
}

export type ECSEventKind = 'alert' | 'asset' | 'enrichment' | 'event' | 'metric' | 'state' | 'pipeline_error' | 'signal'
export type ECSEventCategory = 'api' | 'authentication' | 'configuration' | 'database' | 'driver' | 'email' | 'file' | 'host' | 'iam' | 'intrusion_detection' | 'library' | 'malware' | 'network' | 'package' | 'process' | 'registry' | 'session' | 'threat' | 'vulnerability' | 'web'
export type ECSEventType = 'access' | 'admin' | 'allowed' | 'change' | 'connection' | 'creation' | 'deletion' | 'denied' | 'end' | 'error' | 'group' | 'indicator' | 'info' | 'installation' | 'protocol' | 'start' | 'user'
export type ECSEventOutcome = 'failure' | 'success' | 'unknown'
export enum ECSEventSeverity {
  Emergency = 0,
  Alert = 1,
  Critical = 2,
  Error = 3,
  Warning = 4,
  Notice = 5,
  Informational = 6,
  Debug = 7
}
