<div align="center">

<br />

# 🔒 ADEVeil

### Your Privacy. Your Device. Your Control.

*Encrypt. Share. Protect. Offline. Always.*

<br />

[![React Native](https://img.shields.io/badge/React_Native-0.76+-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo_SDK-52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![End-to-End Encrypted](https://img.shields.io/badge/Encryption-End--to--End-6D28D9?style=for-the-badge&logoColor=white)](#security)
[![No Data Collected](https://img.shields.io/badge/Data_Collected-ZERO-22C55E?style=for-the-badge&logoColor=white)](#privacy-promise)
[![Platform](https://img.shields.io/badge/Platform-Android_%7C_iOS-2563EB?style=for-the-badge&logo=android&logoColor=white)](#)

<br />

> **ADEVeil** is a zero-knowledge, offline-first privacy app for Android & iOS.  
> Protect sensitive messages, store encrypted notes, and manage a secure vault —  
> all with **zero network requests, zero telemetry, and zero data collection.**

<br />

---

</div>

## 📋 Table of Contents

- [What It Does](#-what-it-does)
- [Core Features](#-core-features)
- [Security](#-security)
- [Getting Started](#-getting-started)
- [Themes](#-themes)
- [Screen Flow](#-screen-flow)
- [Build for Production](#-build-for-production)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Privacy Promise](#-privacy-promise)

---

## 🛡️ What It Does

ADEVeil gives you a **complete, self-contained privacy vault** on your phone.

| Action | Description |
|---|---|
| 🔐 **Protect** | Encrypt any text with a password — military-grade encryption |
| 📖 **Open** | Decrypt messages instantly, works 100% offline |
| 📝 **Notes** | Create encrypted notes with optional self-destruct timers |
| 🏦 **Vault** | Store sensitive credentials behind your PIN lock |
| 📤 **Share** | Send protected text via QR code, clipboard, or native share |
| 👁️ **View-Once** | Burn-after-read — content is destroyed after viewing |

The protected output is a **portable, safe string** that can be pasted into WhatsApp, Telegram, SMS, Email, or anywhere — and only decrypted by someone with the correct password.

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 🔒 Encryption
- Military-grade end-to-end encryption
- Strong key derivation with many iterations
- Unique random values per message (no reuse)
- Self-destruct messages with countdown timers

</td>
<td width="50%">

### 🛡️ Runtime Protection
- Screenshot & screen-recording block
- App Switcher privacy screen
- PIN lock with configurable auto-lock timeout
- Shake-to-lock gesture
- Hidden second-vault system

</td>
</tr>
<tr>
<td width="50%">

### 👁️ Privacy Controls
- Auto-hide: blurs content after inactivity
- Clipboard auto-clear (configurable timer)
- View-Once mode (burn after read)
- Zero network requests, ever
- Zero analytics, telemetry, or tracking

</td>
<td width="50%">

### 🎨 Experience
- 6 built-in themes (Midnight, AMOLED, Ocean, Rose, Forest, Light)
- Cinematic animated onboarding
- QR code share & scan
- Haptic feedback throughout
- Full Privacy Center with 9 explainer sections

</td>
</tr>
</table>

---

## 🔐 Security

ADEVeil uses **industry-standard, peer-reviewed cryptographic algorithms** for all encryption operations. All cryptographic processing happens exclusively on your device using the operating system's native secure primitives.

- ✅ All encryption and decryption is **on-device only** — no servers involved
- ✅ Passwords are **never stored** anywhere in the app
- ✅ PINs are protected by the **OS secure enclave** (iOS Keychain / Android Keystore)
- ✅ Screenshot and screen recording are **blocked at the OS level** on sensitive screens
- ✅ Zero network connections are made — verified by independent network inspection
- ✅ The app works **fully offline** with no degradation in security

> The specific cryptographic algorithms, parameters, and internal implementation details are kept private intentionally. Security through obscurity is not our primary protection — but there is no benefit to publicly documenting implementation specifics.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/client) installed on your Android/iOS device

### Installation

```bash
# Clone the repository
git clone https://github.com/tameratgebeyehu/adeveil.git
cd ADEVeil

# Install dependencies
npm install

# Start the development server
npx expo start -c
```

### Run on Device

```bash
# Scan the QR code shown in terminal using Expo Go
# — or — run directly on a connected device:

npx expo run:android
npx expo run:ios
```

---

## 🎨 Themes

ADEVeil ships with **6 hand-crafted themes**, selectable from Settings:

| Theme | Best For |
|---|---|
| 🌙 **Midnight** | Default — deep navy, balanced dark |
| ⚫ **AMOLED** | True black — zero battery drain on OLED screens |
| 🌊 **Ocean** | Cool teal / cyan aesthetic |
| 🌹 **Rose** | Warm dark rose / pink |
| 🌲 **Forest** | Earthy, calm dark green |
| ☀️ **Light** | Full light mode |

---

## 🗺️ Screen Flow

```
First Launch
└── Onboarding → Set PIN → Home

Returning User
└── App Launch → Lock Screen → Home

Home (Tab Bar)
├── 🔐 Protect Message → Encrypt → Copy / Share / QR
├── 📖 Open Message   → Decrypt → Auto-Hide → Clipboard Guard
├── 📝 Secret Notes   → Encrypted notes with self-destruct
├── ⚙️  Settings       → Appearance, Security, Privacy
└── 🛡️  Privacy Center → 9 explainer sections
```

---

## 📦 Build for Production

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS (first time only)
eas build:configure

# Build for both platforms
eas build --platform all
```

---

## 🔧 Troubleshooting

<details>
<summary><strong>Font load fails on first launch</strong></summary>

```bash
npx expo install @expo-google-fonts/inter
```
Then restart the dev server with `npx expo start -c`.
</details>

<details>
<summary><strong>Share sheet doesn't open</strong></summary>

Run `npm install` to ensure all dependencies are present, then restart Expo.
</details>

<details>
<summary><strong>Screenshot protection not working</strong></summary>

Screenshot protection only works fully in **production builds** (`eas build`). In Expo Go development mode it may be limited — this is an Expo Go sandbox restriction, not a bug in the app.
</details>

<details>
<summary><strong>App lock doesn't activate</strong></summary>

The lock screen only activates after a PIN has been set. Go to **Settings → Security → Set PIN** to create one.
</details>

---

## 📍 Roadmap

### ✅ Completed
- [x] End-to-end encryption engine
- [x] QR code share & scan
- [x] Secret notes with self-destruct timers
- [x] PIN lock with OS secure storage
- [x] Hidden second-vault system
- [x] Shake-to-lock gesture
- [x] Auto-lock on background
- [x] Screenshot & screen recording protection
- [x] App Switcher privacy screen
- [x] Clipboard auto-clear with visual countdown
- [x] View-Once (burn-after-read) mode
- [x] Auto-hide inactive messages with blur overlay
- [x] Multi-theme engine (6 themes)
- [x] Privacy Center (9 sections)
- [x] Cinematic animated onboarding
- [x] Local-only usage analytics
- [x] Accessibility: font scale, reduce motion, high contrast

### 🔜 Planned
- [ ] Biometric lock (Face ID / Fingerprint)
- [ ] File protection (images, PDFs, documents)
- [ ] Backup / Restore encrypted vault
- [ ] Amharic / Oromo / Tigrinya localization
- [ ] Passphrase generator
- [ ] Cloud backup (opt-in, zero-knowledge)

---

## 🔏 Privacy Promise

<div align="center">

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│      ADEVeil does not collect, transmit, or sell your data.   │
│                                                                │
│              Your secrets stay on your device.                │
│                           Always.                             │
│                                                                │
│   ✅ Zero network requests        ✅ Zero analytics            │
│   ✅ Zero accounts required       ✅ Zero cloud storage        │
│   ✅ Zero tracking or telemetry   ✅ Zero data collected       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

</div>

---

<div align="center">

**Built by [Tamerat Gebeyehu](mailto:adeveil.et@gmail.com)**

[![Email](https://img.shields.io/badge/Email-adeveil.et%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:adeveil.et@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-tameratgebeyehu-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/tameratgebeyehu)

<br />

*If ADEVeil protects someone's privacy, it has done its job.*

</div>
