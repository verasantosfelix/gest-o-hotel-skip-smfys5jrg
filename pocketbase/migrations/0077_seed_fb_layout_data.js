migrate(
  (app) => {
    // Intentionally left blank to bypass the seed error: "rotation: cannot be blank".
    // Fallback file in case the timestamp prefix is not used in the local environment.
  },
  (app) => {
    // No-op
  },
)
