import pb from '@/lib/pocketbase/client'

export interface FBPdfTemplate {
  id: string
  name: string
  layout: 'layout1' | 'layout2' | 'layout3' | 'layout4'
  format: 'A4' | 'A5' | 'Letter'
  orientation: 'vertical' | 'horizontal'
  primary_color: string
  secondary_color: string
  font_family: string
  base_font_size: number
  show_logo: boolean
  show_images: boolean
  language: 'PT' | 'EN' | 'ES' | 'FR'
  mode: 'full' | 'room_service'
  created: string
  updated: string
}

export interface FBPdfVersion {
  id: string
  version: string
  status: 'draft' | 'pending_approval' | 'approved'
  file?: string
  template_id: string
  creator_id?: string
  approver_id?: string
  expand?: { template_id?: FBPdfTemplate; creator_id?: any; approver_id?: any }
  created: string
  updated: string
}

export interface FBPdfSchedule {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  day_value?: string
  template_id: string
  target_printers: string[]
  is_active: boolean
  expand?: { template_id?: FBPdfTemplate }
  created: string
  updated: string
}

export const getFBPdfTemplates = () =>
  pb.collection('fb_pdf_templates').getFullList<FBPdfTemplate>({ sort: '-created' })
export const createFBPdfTemplate = (data: Partial<FBPdfTemplate>) =>
  pb.collection('fb_pdf_templates').create<FBPdfTemplate>(data)
export const updateFBPdfTemplate = (id: string, data: Partial<FBPdfTemplate>) =>
  pb.collection('fb_pdf_templates').update<FBPdfTemplate>(id, data)
export const deleteFBPdfTemplate = (id: string) => pb.collection('fb_pdf_templates').delete(id)

export const getFBPdfVersions = () =>
  pb
    .collection('fb_pdf_versions')
    .getFullList<FBPdfVersion>({ expand: 'template_id,creator_id,approver_id', sort: '-created' })
export const updateFBPdfVersion = (id: string, data: Partial<FBPdfVersion>) =>
  pb.collection('fb_pdf_versions').update<FBPdfVersion>(id, data)
export const deleteFBPdfVersion = (id: string) => pb.collection('fb_pdf_versions').delete(id)

export const getFBPdfSchedules = () =>
  pb
    .collection('fb_pdf_schedules')
    .getFullList<FBPdfSchedule>({ expand: 'template_id', sort: '-created' })
export const createFBPdfSchedule = (data: Partial<FBPdfSchedule>) =>
  pb.collection('fb_pdf_schedules').create<FBPdfSchedule>(data)
export const updateFBPdfSchedule = (id: string, data: Partial<FBPdfSchedule>) =>
  pb.collection('fb_pdf_schedules').update<FBPdfSchedule>(id, data)
export const deleteFBPdfSchedule = (id: string) => pb.collection('fb_pdf_schedules').delete(id)
