/**
 * Copy for Settings → Delete Account.
 *
 * THE WARNING IS THE POINT OF THIS SCREEN. Most apps ask "are you sure?" and
 * call it a safeguard; a question is not information. What somebody needs
 * before they answer is the list of what actually goes, and — in a product
 * built for exactly two people — what their partner is left with. Both are
 * written out below, in the plainest words they can be written in.
 *
 * Three gates follow, and each one says what it is for. "Enter your password"
 * with no reason reads as an obstacle; "so we know it is you and not someone
 * holding your unlocked phone" reads as a reason.
 */
export const SETTINGS_DELETE_COPY = {
  title: 'Delete Account',

  warningHeading: 'This erases your space.',
  warningLede: 'Read what goes before you decide. None of it comes back.',

  goesGroup: 'What is erased',
  goesMemories: 'Every memory and every photograph',
  goesChat: 'Your whole conversation, including voice notes and video moments',
  goesSpace: 'Your shared space, its name and its story',
  goesDates: 'Every date you have been counting',
  goesAccount: 'Your account and your sign-in',

  partnerGroup: 'What your partner is left with',
  partnerLine:
    'They are told you left. The space you shared closes for them too, and what was in it is gone for both of you.',

  exportGroup: 'Before you go',
  exportAction: 'Download your data first',
  exportDetail: 'Every memory, message and date, as files you keep.',

  continue: 'Continue',
  keepAccount: 'Keep my account',

  reasonHeading: 'Why are you leaving?',
  reasonLede: 'Optional. It helps, and it changes nothing about what happens next.',
  reasonNotUsing: 'We are not using it',
  reasonBroke: 'Something did not work',
  reasonPrivacy: 'Privacy concerns',
  reasonBreakup: 'We are no longer together',
  reasonOther: 'Another reason',
  reasonSkip: 'Skip',

  passwordHeading: 'Confirm it is you',
  passwordLede: 'So this cannot be done by someone holding your unlocked phone.',
  passwordLabel: 'Your password',
  passwordRequired: 'Enter your password.',
  passwordWrong: 'That password is not right.',
  passwordLockedOut: 'Too many attempts. Go back and start again when you are ready.',

  phoneHeading: 'Check your phone',
  phoneLede: 'We sent a six-digit code to your number.',
  phoneNoNumber:
    'You have no phone number on file. Add one and verify it — deleting an account needs two ways to reach you.',
  phoneAddAction: 'Add a phone number',
  phoneCodeLabel: 'Code from your phone',
  phoneWrong: 'That code did not match the one we sent to your phone.',

  emailHeading: 'Check your email',
  emailLede: 'One more code, sent to your email address.',
  emailCodeLabel: 'Code from your email',
  emailWrong: 'That code did not match the one we sent to your email.',

  sentToPrefix: 'Sent to',
  resend: 'Send it again',
  resendIn: 'You can ask again in',
  verify: 'Continue',

  finalTitle: 'Delete your account?',
  finalBody:
    'Everything listed at the start of this is erased now, for you and for your partner. This cannot be undone.',
  finalCancel: 'Keep my account',
  finalConfirm: 'Delete everything',

  doneHeading: 'Your account is gone.',
  doneLede: 'Thank you for the time you spent here.',

  stepPrefix: 'Step',
  stepOf: 'of',
} as const
