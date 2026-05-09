// ADEVeil UI Strings — i18n-ready structure
// All user-facing text lives here. Replace values per language.

export const STRINGS = {
  // App
  appName: 'ADEVeil',
  tagline: 'Keep your private words protected.',

  // Welcome
  welcome: {
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    subtitle: 'Your private messages, protected.\nShare safely anywhere.',
  },

  // Home
  home: {
    greeting: 'What would you like to do?',
    protectTitle: 'Protect Message',
    protectDesc: 'Turn your words into protected text.',
    openTitle: 'Open Message',
    openDesc: 'Restore hidden text using your password.',
    tip: 'Protected messages can be shared on any platform.',
  },

  // Protect Screen
  protect: {
    title: 'Protect Message',
    messagePlaceholder: 'Type your private message here…',
    passwordPlaceholder: 'Create a password',
    confirmPlaceholder: 'Confirm password',
    button: 'Protect Message',
    clear: 'Clear',
    successTitle: 'Message Protected!',
    successSub: 'Your message is now protected. Copy and share it safely.',
    copy: 'Copy',
    share: 'Share',
    copied: 'Copied!',
  },

  // Open Screen
  open: {
    title: 'Open Message',
    textPlaceholder: 'Paste protected text here…',
    protectedPlaceholder: 'Paste protected text here…',
    passwordPlaceholder: 'Enter the password',
    button: 'Open Message',
    clear: 'Clear',
    successTitle: 'Message Unlocked',
    successSub: 'Here is the original message:',
    errorTitle: 'Unable to open this message',
    errorSub: 'Wrong password, or the text was damaged.',
    copyResult: 'Copy Message',
    copied: 'Copied!',
  },

  // Settings
  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark theme across the app',
    autoClear: 'Auto-Clear Clipboard',
    autoClearDesc: 'Clear clipboard 60 seconds after copying',
    security: 'Security',
    biometric: 'Biometric Lock',
    biometricDesc: 'Coming soon',
    reset: 'Reset App',
    resetDesc: 'Clear all settings and stored data',
    resetConfirm: 'Reset',
    resetCancel: 'Cancel',
    resetMessage: 'This will clear all settings. Are you sure?',
  },

  // About
  about: {
    title: 'About ADEVeil',
    version: 'Version 1.0.0',
    mission: 'ADEVeil helps people protect private text using offline security tools — no cloud, no accounts, no tracking.',
    privacy: 'Privacy-First',
    privacyDesc: 'We never see, store, or transmit your messages.',
    offline: 'Offline-Only',
    offlineDesc: 'Everything happens on your device.',
    noTracking: 'Zero Tracking',
    noTrackingDesc: 'No analytics. No data collection. Ever.',
    openSource: 'Built with ❤️ for digital privacy.',
  },

  // Navigation
  nav: {
    home: 'Home',
    settings: 'Settings',
    about: 'About',
  },

  // Errors
  errors: {
    emptyMessage: 'Please enter your message.',
    emptyPassword: 'Please enter a password.',
    emptyProtectedText: 'Please paste the protected text.',
    passwordMismatch: 'Passwords do not match.',
    protectFailed: 'Something went wrong. Please try again.',
    openFailed: 'Wrong password or damaged text.',
    wrongPassword: 'Wrong password — please try again.',
    invalidFormat: 'This does not look like a protected message.',
    shortPassword: 'Password must be at least 4 characters.',
  },
} as const;
