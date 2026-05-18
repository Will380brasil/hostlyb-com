import type { ComponentType } from 'react'
import { template as inviteEmployee } from './invite-employee'
import { template as inviteAccepted } from './invite-accepted'
import { template as cleaningPhoto } from './cleaning-photo'
import { template as cleaningProblem } from './cleaning-problem'
import { template as welcome } from './welcome'
import { template as inactivity3d } from './inactivity-3d'
import { template as inactivity7d } from './inactivity-7d'
import { template as productUpdate } from './product-update'

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
  'invite-accepted': inviteAccepted,
  'cleaning-photo': cleaningPhoto,
  'cleaning-problem': cleaningProblem,
  'welcome': welcome,
  'inactivity-3d': inactivity3d,
  'inactivity-7d': inactivity7d,
  'product-update': productUpdate,
}
