/**
 * Copy for Module 03 — Memories. Stitch screens 7b08f9eb, b1a46956, b5e4bef3,
 * 510bd9c6, 17b6f431.
 *
 * The designs show a populated library — "186 little pieces of us", collections
 * of 86 / 32 / 24 / 12 items, a Rome trip. None of that is reproduced: the
 * counts are computed, and a couple with no memories sees the empty state,
 * which is what the "Empty Memories State" frame draws anyway.
 */
export const MEMORIES_COPY = {
  home: {
    heading: 'Our memories',
    /** Interpolated with the real count. */
    count: (n: number) => (n === 1 ? '1 little piece of us.' : `${n} little pieces of us.`),
    search: 'Search memories',
    add: 'Add Memory',
    /**
     * The design says "Your albums", so the app does too. Was
     * `collectionsLabel: 'Collections'` — two names for one concept, and the
     * frame's name wins.
     */
    albumsLabel: 'Your albums',
    viewAll: 'View all',
    onThisDayLabel: 'On this day',
    favoritesLabel: 'Favorites',
    recentlyAddedLabel: 'Recently added',
    yesterday: 'Yesterday',
    voiceNote: 'Voice note',
  },
  empty: {
    heading: 'Your memories are waiting. ❤️',
    lede: 'Everything you keep here belongs to both of you.',
    addFirst: 'Add Your First Memory',
  },
  detail: {
    title: 'Memory Detail',
    favorite: 'Favorite',
    unfavorite: 'Remove from favorites',
    noteLabel: 'Our Note',
    addedBy: (name: string) => `Added by ${name}`,
    missing: 'That memory could not be found.',
    back: 'Back to memories',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: {
      title: 'Delete this memory?',
      body: 'This cannot be undone.',
      confirm: 'Delete',
      cancel: 'Keep it',
    },
    errors: {
      NOT_FOUND: 'That memory could not be found.',
      NETWORK: 'No connection. Check your network and try again.',
      UNKNOWN: 'Something went wrong. Try again.',
    },
    /** The kebab menu's own accessible name and its rows. */
    moreOptions: 'More options',
    menu: {
      edit: 'Edit memory',
      editDetail: 'Title, photo, story & date',
      setCover: 'Set as cover photo',
      setCoverDetail: 'Use for your current trip cover',
      privateNote: 'Our private note',
      privateNoteDetail: 'Reveals once you both write one',
      remove: 'Remove memory',
      removeDetail: "This can't be undone",
    },
  },
  privateNote: {
    heading: 'Our private note',
    lede: "Write yours — it stays hidden until you've both written one.",
    placeholder: 'Only the two of you will ever see this…',
    save: 'Save note',
    saving: 'Waiting for your partner to write theirs.',
    yourNote: 'Your note',
    partnerNote: 'Their note',
    edit: 'Edit your note',
    withdraw: 'Withdraw note',
    withdrawConfirm: {
      title: 'Withdraw your note?',
      body: "They won't be able to see it, and you'll both need to write again for it to reveal.",
      confirm: 'Withdraw',
      cancel: 'Keep it',
    },
    close: 'Close',
    errors: {
      NOT_FOUND: 'That memory could not be found.',
      UNKNOWN: 'Something went wrong. Try again.',
    },
  },
  edit: {
    heading: 'Edit this memory',
    submit: 'Save Changes',
  },
  favorites: {
    heading: 'Favorites',
    empty: 'Nothing favorited yet.',
  },
  add: {
    heading: 'Add a memory',
    photoLabel: 'Tap to add photo',
    titleLabel: 'Title',
    titlePlaceholder: 'Give it a name',
    titleRequired: 'Give this memory a name',
    dateLabel: 'When was it?',
    captionLabel: 'Caption',
    captionPlaceholder: 'Write a caption…',
    locationLabel: 'Location (Optional)',
    locationPlaceholder: 'Add location',
    noteLabel: 'Our Note (Optional)',
    notePlaceholder: 'Only the two of you will see this',
    submit: 'Save Memory',
    cancel: 'Cancel',
    errors: {
      NOT_FOUND: 'Something went wrong. Try again.',
      NETWORK: 'No connection. Check your network and try again.',
      UNKNOWN: 'Something went wrong. Try again.',
    },
  },
  search: {
    label: 'Search your memories',
    placeholder: 'Search your memories',
    resultsLabel: (n: number) => (n === 1 ? '1 memory' : `${n} memories`),
    none: 'Nothing matched that.',
    prompt: 'Type to search your memories.',
    emptyLibrary: 'There is nothing to search yet.',
  },
} as const
