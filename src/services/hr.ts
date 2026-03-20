import pb from '@/lib/pocketbase/client'

export const getTrainings = () => pb.collection('hr_trainings').getFullList()
export const createEnrollment = (data: {
  staff_name: string
  training_id: string
  status: string
  certificate_issued: boolean
}) => pb.collection('hr_enrollments').create(data)

export const createCandidate = (data: {
  name: string
  cargo: string
  cv_data: string
  match_score: number
  status: string
}) => pb.collection('hr_candidates').create(data)

export const createShift = (data: {
  staff_name: string
  sector: string
  start_time: string
  end_time: string
  total_hours: number
}) => pb.collection('hr_shifts').create(data)
