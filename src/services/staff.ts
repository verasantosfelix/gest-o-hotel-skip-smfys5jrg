import pb from '@/lib/pocketbase/client'

export const getUsers = async () => {
  return await pb.collection('users').getFullList({
    sort: 'name',
    expand: 'profile',
  })
}

export const updateUser = async (id: string, data: any, avatarFile?: File | null) => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })

  if (avatarFile) {
    formData.append('avatar', avatarFile)
  }

  return await pb.collection('users').update(id, formData)
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

export const createUser = async (data: any, avatarFile?: File | null) => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })

  if (avatarFile) {
    formData.append('avatar', avatarFile)
  }

  formData.append('emailVisibility', 'true')

  return await pb.collection('users').create(formData)
}

// Staff Documents Services
export const getStaffDocuments = async (staffId: string) => {
  return await pb.collection('staff_documents').getFullList({
    filter: `staff_id = "${staffId}"`,
    sort: '-created',
  })
}

export const uploadStaffDocument = async (
  data: { staff_id: string; title: string; category: string },
  file: File,
) => {
  const formData = new FormData()
  formData.append('staff_id', data.staff_id)
  formData.append('title', data.title)
  formData.append('category', data.category)
  formData.append('document_file', file)

  return await pb.collection('staff_documents').create(formData)
}

export const deleteStaffDocument = async (id: string) => {
  return await pb.collection('staff_documents').delete(id)
}
