/**
 * Copy for M01-S17 Days That Matter. Stitch screen c40a53a1.
 *
 * Five recurring dates, every one optional. The design draws them as tappable
 * cards reading "Tap to set date"; here each is a `DateField`, so a date is
 * typed in place rather than behind a picker the app does not have.
 */
export const DAYS_THAT_MATTER_COPY = {
  heading: 'Some days deserve a place here.',
  lede: "We'll remember them with you.",
  fields: [
    { key: 'anniversary' as const, label: 'Anniversary' },
    { key: 'yourBirthday' as const, label: 'Your Birthday' },
    { key: 'partnerBirthday' as const, label: "Partner's Birthday" },
    { key: 'firstDate' as const, label: 'First Date' },
    { key: 'firstMeeting' as const, label: 'First Meeting' },
  ],
  invalid: 'Enter a real date',
  submit: 'Continue',
  skip: "I'll add these later",
} as const
