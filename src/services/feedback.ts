import pb from '@/lib/pocketbase/client'
export const getFeedback = () => pb.collection('feedback_reviews').getFullList({ sort: '-created' })
export const createFeedback = (data: any) => pb.collection('feedback_reviews').create(data)
