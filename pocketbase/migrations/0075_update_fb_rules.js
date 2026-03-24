migrate(
  (app) => {
    const collections = ['fb_orders', 'fb_order_items', 'fb_tables', 'fb_reservations_fnb']

    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        col.listRule = "@request.auth.id != ''"
        col.viewRule = "@request.auth.id != ''"
        col.createRule = "@request.auth.id != ''"
        col.updateRule = "@request.auth.id != ''"

        // Explicitly add role_level checks for delete to ensure Gerente_Area has full access
        if (name === 'fb_orders' || name === 'fb_order_items') {
          col.deleteRule =
            "@request.auth.id != '' && (@request.auth.profile.name != 'Front_Desk' || @request.auth.profile.role_level = 'Gerente_Area' || @request.auth.profile.role_level = 'Responsavel_Equipa' || @request.auth.profile.role_level = 'Gerente_Geral')"
        } else {
          col.deleteRule = "@request.auth.id != ''"
        }

        app.save(col)
      } catch (e) {
        console.log('Error updating rules for', name, e)
      }
    }
  },
  (app) => {
    // Safe to leave as-is on revert for these collections
  },
)
