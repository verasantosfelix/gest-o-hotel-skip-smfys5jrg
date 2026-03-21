onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body
  const newStatus = body.status !== undefined ? body.status : e.record.get('status')
  const paymentMethod =
    body.payment_method !== undefined ? body.payment_method : e.record.get('payment_method')

  if (newStatus === 'closed' && (paymentMethod === 'room_charge' || paymentMethod === 'deferred')) {
    const hasNewSignature = e.findUploadedFiles('signature_file').length > 0
    const hasExistingSignature = e.record.get('signature_file') !== ''

    if (!hasNewSignature && !hasExistingSignature) {
      throw new BadRequestError('A digital signature is required for deferred payments.')
    }
  }
  e.next()
}, 'fb_orders')
