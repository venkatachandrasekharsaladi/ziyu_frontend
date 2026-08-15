/**
 * Copy for M01-S17 Days That Matter. Stitch screen c40a53a1.
 *
 * Five recurring dates, every one optional. The design draws them as tappable
 * cards reading "Tap to set date"; here each is a `DateField` on a `Card`, so a
 * date is typed in place rather than behind a picker the app does not have.
 */
export const DAYS_THAT_MATTER_COPY = {
  heading: 'Some days deserve a place here.',
  lede: "We'll remember them with you.",
  fields: [
    { key: 'anniversary' as const, label: 'Anniversary', icon: 'heart' as const },
    { key: 'yourBirthday' as const, label: 'Your Birthday', icon: 'gift' as const },
    { key: 'partnerBirthday' as const, label: "Partner's Birthday", icon: 'gift' as const },
    { key: 'firstDate' as const, label: 'First Date', icon: 'coffee' as const },
    { key: 'firstMeeting' as const, label: 'First Meeting', icon: 'users' as const },
  ],
  invalid: 'Enter a real date',
  submit: 'Continue',
  skip: "I'll add these later",
} as const
