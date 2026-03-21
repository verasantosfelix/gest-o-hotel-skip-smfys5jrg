migrate(
  (app) => {
    // The 'status' field in 'financial_docs' is already a plain text field.
    // This migration serves as an explicit marker that "pending_transfer"
    // is now an expected valid value for this field in the application logic
    // for Accounts Receivable (A/R) corporate check-outs.
    console.log(
      "Migration 0046 applied: financial_docs.status now expects 'pending_transfer' for corporate A/R checkouts.",
    )
  },
  (app) => {
    // Revert logic not necessary as no schema changes were strictly required for plain text field
  },
)
