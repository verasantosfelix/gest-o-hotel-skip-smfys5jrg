onRecordAfterCreateSuccess((e) => {
  const record = e.record

  if (record.get('type') === 'minibar') {
    const desc = record.get('description')
    try {
      const inv = $app.findFirstRecordByData('consumables_inventory', 'item_name', desc)
      const currentQty = inv.get('stock_quantity') || 0
      inv.set('stock_quantity', Math.max(0, currentQty - 1))
      $app.save(inv)
    } catch (err) {
      console.log('Inventory item not found for auto-deduction:', desc)
    }
  }

  e.next()
}, 'consumptions')
