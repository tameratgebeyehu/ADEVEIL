// ADEVeil Trust & Transparency — Content Data
// All user-facing text for the Trust Center lives here.
// Language rules: No crypto jargon. Human-first. Calm. Honest.

export const TRUST_PRINCIPLES = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Your data stays on your device',
    body: 'Everything you create in ADEVeil — your notes, your vault, your settings — is stored only on your phone. Nothing is sent to a server.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'We cannot read your messages',
    body: 'ADEVeil does not have access to your messages. Only someone with your password can open your protected text.',
  },
  {
    icon: 'cloud-offline-outline' as const,
    title: 'No automatic uploads',
    body: 'Your text is never uploaded automatically. Files are only shared when you choose to share them — and only to the person you choose.',
  },
  {
    icon: 'wifi-outline' as const,
    title: 'Works without internet',
    body: 'ADEVeil is designed to work completely offline. You do not need an internet connection to protect or open your messages.',
  },
  {
    icon: 'key-outline' as const,
    title: 'Your passwords are not stored',
    body: 'ADEVeil does not save or record the passwords you use to protect messages. If you forget a password, no one can recover the content.',
  },
  {
    icon: 'hand-left-outline' as const,
    title: 'You are in control',
    body: 'You can delete all of your data at any time. ADEVeil gives you clear controls over everything the app stores.',
  },
];

export const DATA_STORED = [
  { label: 'App settings & preferences' },
  { label: 'Vault notes and saved content' },
  { label: 'PIN (stored securely on device, never transmitted)' },
  { label: 'Theme and accessibility preferences' },
  { label: 'Local usage statistics (never uploaded)' },
];

export const DATA_NEVER_COLLECTED = [
  { label: 'Your message content' },
  { label: 'Your passwords' },
  { label: 'Your name or identity' },
  { label: 'Your contacts or location' },
  { label: 'Any data sent to remote servers' },
  { label: 'Advertising identifiers' },
  { label: 'Device tracking information' },
];

export const OFFLINE_FEATURES = [
  {
    icon: 'wifi-outline' as const,
    title: 'No internet required',
    body: 'Every feature in ADEVeil works without a network connection.',
  },
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Processing happens on your phone',
    body: 'Messages are protected and opened directly on your device — not on a remote computer.',
  },
  {
    icon: 'server-outline' as const,
    title: 'No remote servers',
    body: 'ADEVeil does not send your data to any server. There is no backend that holds your information.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Reduced risk',
    body: 'Because your data never travels over a network, there is no risk of it being intercepted in transit.',
  },
];

export const PERMISSIONS = [
  {
    icon: 'camera-outline' as const,
    name: 'Camera',
    why: 'Used only for QR code scanning.',
    when: 'When you tap "Scan QR Code" to receive a protected message.',
    notUsed: 'ADEVeil never takes photos, records video, or accesses your camera roll.',
    required: false,
  },
  {
    icon: 'finger-print-outline' as const,
    name: 'Biometrics',
    why: 'Lets you unlock the app with fingerprint or face recognition instead of your PIN.',
    when: 'Only on the lock screen, if you have enabled biometric unlock in Settings.',
    notUsed: 'Biometric data is managed entirely by your device. ADEVeil never sees or stores it.',
    required: false,
  },
  {
    icon: 'folder-outline' as const,
    name: 'Storage',
    why: 'Used to save and load exported backup files.',
    when: 'When you export or import your vault backup.',
    notUsed: 'ADEVeil only reads files you explicitly select. It does not scan your storage.',
    required: false,
  },
  {
    icon: 'clipboard-outline' as const,
    name: 'Clipboard',
    why: 'Lets you paste text into message fields and copy protected text.',
    when: 'When you tap paste or copy buttons inside the app.',
    notUsed: 'ADEVeil clears the clipboard after a short delay to protect your data.',
    required: false,
  },
];

export const SECURITY_TIPS = [
  {
    category: 'Passwords',
    icon: 'key-outline' as const,
    tips: [
      'Use a unique password for each message — reusing passwords is risky.',
      'Longer passwords are harder to guess. A phrase works well.',
      'Do not share your password in the same message as the protected text.',
      'ADEVeil cannot recover forgotten passwords — store them somewhere safe.',
    ],
  },
  {
    category: 'Device',
    icon: 'phone-portrait-outline' as const,
    tips: [
      'Keep your device screen lock enabled.',
      'Use ADEVeil\'s PIN or biometric lock for extra protection.',
      'Keep your operating system updated.',
      'Avoid unlocking your device in public places.',
    ],
  },
  {
    category: 'Sharing',
    icon: 'share-outline' as const,
    tips: [
      'Share protected text through a different channel than the password.',
      'For example: send the protected text by email, and the password by text message.',
      'Verify who you are sharing with before sending sensitive content.',
    ],
  },
  {
    category: 'Clipboard',
    icon: 'clipboard-outline' as const,
    tips: [
      'ADEVeil automatically clears the clipboard after you copy protected text.',
      'Avoid pasting sensitive content into apps you do not trust.',
      'Be aware that some keyboards can read clipboard content.',
    ],
  },
  {
    category: 'Backups',
    icon: 'archive-outline' as const,
    tips: [
      'Export your vault backup regularly to avoid losing your saved notes.',
      'Store the backup file somewhere secure — it is protected with your backup password.',
      'Do not upload backup files to untrusted cloud services.',
    ],
  },
];

export const FAQ_ITEMS = [
  {
    q: 'Can ADEVeil read my messages?',
    a: 'No. ADEVeil does not have access to your messages. All processing happens on your device. The app cannot see your content, and neither can we.',
  },
  {
    q: 'Does ADEVeil use the internet?',
    a: 'ADEVeil is designed to work completely offline. The app does not make network requests. No data is sent to any server.',
  },
  {
    q: 'What happens if I forget my password?',
    a: 'Your content cannot be recovered without the password. This is intentional — it means no one else can access it either. Always keep your passwords in a safe place.',
  },
  {
    q: 'Can someone recover my protected text without the password?',
    a: 'Not through ADEVeil. The protection used is strong enough that guessing is not practical. However, a weak or reused password makes any protection less effective.',
  },
  {
    q: 'Does ADEVeil track users?',
    a: 'No. ADEVeil does not collect analytics, does not use advertising trackers, and does not send any data off your device.',
  },
  {
    q: 'Are my files uploaded anywhere?',
    a: 'No. Your files stay on your device unless you explicitly choose to share or export them.',
  },
  {
    q: 'Is my PIN stored securely?',
    a: 'Yes. Your PIN is stored using your device\'s secure storage — the same system used by banking apps. It is never stored as plain text and never transmitted.',
  },
  {
    q: 'What data does ADEVeil store?',
    a: 'ADEVeil stores your settings, vault notes, and PIN on your device only. It does not store your message passwords, your identity, or any content you have shared.',
  },
  {
    q: 'Can I delete all my data?',
    a: 'Yes. You can delete all vault content and reset the app from Settings. This permanently removes everything stored by ADEVeil on your device.',
  },
  {
    q: 'Is ADEVeil open source?',
    a: 'Not yet. We are committed to transparency and are working toward open-sourcing the core codebase so it can be reviewed independently.',
  },
  {
    q: 'Does the Decoy Vault actually hide my real vault?',
    a: 'Yes. When you enter your Decoy PIN, ADEVeil shows a completely empty vault. Your real vault remains inaccessible until you enter your real PIN.',
  },
  {
    q: 'What is the Panic Button for?',
    a: 'The Panic Button instantly locks the app and clears the clipboard. It is designed for situations where you need to quickly secure the app without navigating menus.',
  },
];

export const TRANSPARENCY_STATUS = [
  { label: 'Network tracking', status: 'Disabled', positive: true },
  { label: 'Cloud sync', status: 'Disabled', positive: true },
  { label: 'Remote servers', status: 'None', positive: true },
  { label: 'Advertising', status: 'None', positive: true },
  { label: 'Third-party analytics', status: 'None', positive: true },
  { label: 'Local processing', status: 'Active', positive: true },
  { label: 'Local usage stats', status: 'Optional', positive: true },
  { label: 'Internet access during normal use', status: 'Not required', positive: true },
];

export const ONBOARDING_SLIDES = [
  {
    icon: 'lock-closed' as const,
    title: 'Your data stays on your device',
    body: 'Everything you create in ADEVeil is stored only on your phone. Nothing is sent to a server or stored in the cloud.',
    accent: '#A855F7',
  },
  {
    icon: 'cellular' as const,
    title: 'Works without internet',
    body: 'ADEVeil is fully offline. You can protect and open messages anywhere — no Wi-Fi or data required.',
    accent: '#22D3EE',
  },
  {
    icon: 'options' as const,
    title: 'You control everything',
    body: 'You decide what gets protected, who gets access, and when to delete it. ADEVeil just gives you the tools.',
    accent: '#34D399',
  },
  {
    icon: 'eye-off' as const,
    title: 'No tracking. No ads. No surprises.',
    body: 'ADEVeil does not monitor your activity, collect personal data, or show advertisements. Ever.',
    accent: '#F59E0B',
  },
];
