migrate(
  (app) => {
    // Intentionally left blank to bypass the seed error: "rotation: cannot be blank".
    // The spatial layout features for F&B have been reverted in migration 0074.
  },
  (app) => {
    // No-op
  },
)
