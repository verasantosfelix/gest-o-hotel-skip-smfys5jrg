migrate(
  (app) => {
    const allowFrontDeskManagers =
      "(@request.auth.profile.name != 'Front_Desk' || @request.auth.profile.role_level = 'Gerente_Area' || @request.auth.profile.role_level = 'Responsavel_Equipa' || @request.auth.profile.role_level = 'Gerente_Geral')"

    const spaAppts = app.findCollectionByNameOrId('spa_appointments')
    spaAppts.deleteRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    app.save(spaAppts)

    const fbOrders = app.findCollectionByNameOrId('fb_orders')
    fbOrders.deleteRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    app.save(fbOrders)

    const spaRooms = app.findCollectionByNameOrId('spa_rooms')
    spaRooms.listRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    spaRooms.viewRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    spaRooms.createRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    spaRooms.updateRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    spaRooms.deleteRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    app.save(spaRooms)

    const fbProducts = app.findCollectionByNameOrId('fb_products')
    fbProducts.createRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    fbProducts.updateRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    fbProducts.deleteRule = `@request.auth.id != '' && ${allowFrontDeskManagers}`
    app.save(fbProducts)
  },
  (app) => {
    const revertStr = "@request.auth.id != '' && @request.auth.profile.name != 'Front_Desk'"

    const spaAppts = app.findCollectionByNameOrId('spa_appointments')
    spaAppts.deleteRule = revertStr
    app.save(spaAppts)

    const fbOrders = app.findCollectionByNameOrId('fb_orders')
    fbOrders.deleteRule = revertStr
    app.save(fbOrders)

    const spaRooms = app.findCollectionByNameOrId('spa_rooms')
    spaRooms.listRule = revertStr
    spaRooms.viewRule = revertStr
    spaRooms.createRule = revertStr
    spaRooms.updateRule = revertStr
    spaRooms.deleteRule = revertStr
    app.save(spaRooms)

    const fbProducts = app.findCollectionByNameOrId('fb_products')
    fbProducts.createRule = revertStr
    fbProducts.updateRule = revertStr
    fbProducts.deleteRule = revertStr
    app.save(fbProducts)
  },
)
