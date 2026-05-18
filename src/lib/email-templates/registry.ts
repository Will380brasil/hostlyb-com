import type { ComponentType } from 'react'
import { template as inviteEmployee } from './invite-employee'
import { template as cleaningPhoto } from './cleaning-photo'
import { template as cleaningProblem } from './cleaning-problem'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'invite-employee': inviteEmployee,
  'cleaning-photo': cleaningPhoto,
  'cleaning-problem': cleaningProblem,
}
