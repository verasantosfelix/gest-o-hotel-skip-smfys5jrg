import pb from '@/lib/pocketbase/client'

export const getUsers = async () => {
  return await pb.collection('users').getFullList({
    sort: 'name',
    expand: 'profile',
  })
}

export const updateUser = async (id: string, data: any) => {
  return await pb.collection('users').update(id, data)
}

export const getProfiles = async () => {
  return await pb.collection('profiles').getFullList({
    sort: 'name',
    expand: 'manager_id',
  })
}

export const updateProfile = async (id: string, data: any) => {
  return await pb.collection('profiles').update(id, data)
}

export const createUser = async (data: any) => {
  return await pb.collection('users').create({
    ...data,
    emailVisibility: true,
  })
}
