/**
 * Copy for Settings → Billing & Subscription.
 *
 * HONESTY IS THE WHOLE DESIGN OF THIS SCREEN. There is no paid tier, no
 * payment integration and no pricing decision. So the paid plan is labelled a
 * preview, its price is labelled illustrative, and its button is unavailable
 * rather than pressable — the "honestly unavailable" rule `IconButton` and
 * `BottomNav` already follow, applied to the one screen where pretending would
 * cost a user money.
 */
export const SETTINGS_BILLING_COPY = {
  title: 'Billing & Subscription',
  lede: 'What you are on, and what is coming.',

  currentGroup: 'Your plan',
  currentLabel: 'Current plan',
  free: 'Free',
  freeForever: 'Free, always',

  previewGroup: 'Coming later',
  previewNote: 'A preview. This plan is not available yet, and the price shown is illustrative.',
  unavailable: 'Not available yet',
  upgrade: 'Upgrade',
  perYear: 'per year',
  perMonth: 'per month',

  paymentGroup: 'Payment',
  paymentMethod: 'Payment method',
  paymentNone: 'None added',
  restore: 'Restore purchases',
  restoreNothing: 'There are no purchases to restore.',

  invoicesGroup: 'Invoices',
  invoicesEmpty: 'You have never been charged, so there is nothing here.',
} as const
