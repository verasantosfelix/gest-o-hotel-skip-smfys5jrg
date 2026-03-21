import pb from '@/lib/pocketbase/client'

export const logAuditAction = async (actionType: string, module: string, details: any) => {
  try {
    await pb.collection('action_audit_logs').create({
      user_id: pb.authStore.record?.id,
      action_type: actionType,
      module: module,
      details: details,
    })
  } catch (error) {
    console.error('Failed to save audit log', error)
  }
}
