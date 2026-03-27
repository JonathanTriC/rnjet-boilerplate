# 🚀 RNJet Boilerplate

> Production-grade CLI tool and boilerplate system for React Native.
> RNJet helps you bootstrap a scalable, clean, and production-ready mobile app with modern architecture and best practices — right out of the box.

---

## 📸 Preview

Example generated app:
<img width="330" height="717" alt="Light Mode" src="https://github.com/user-attachments/assets/bf05fd5e-71f8-473c-a0ca-489c91a15029" />
<img width="330" height="717" alt="Dark Mode" src="https://github.com/user-attachments/assets/ca8be6e2-60df-4ded-8b42-1bd494774914" />


```
🌗 Theme Toggle
🌐 Language Switch (EN / ID)
📦 Environment Info
```

> You can customize this easily via `src/modules`

---

## ✨ Features

- ⚡ CLI-based project generator
- 🧠 Clean & scalable architecture
- 🌍 Multi-language (i18n ready)
- 🎨 Light / Dark theme support
- 🔐 Persistent storage (MMKV)
- 🌐 API layer with logging & retry
- 🧭 React Navigation setup
- ⚙️ Environment config (Dev & Prod)
- 📱 Android flavors & iOS schemes
- 🖼️ Splash screen & app icon ready

---

## 📦 Tech Stack (Core)

> ✅ Supports **React Native New Architecture** (Fabric + JSI)

| Package                 | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| React Native            | Core framework                                                      |
| TypeScript              | Strongly typed JavaScript — better DX, safer code, full IDE support |
| React Navigation        | Navigation                                                          |
| @tanstack/react-query   | Server state management                                             |
| Axios                   | HTTP client                                                         |
| react-native-mmkv       | Persistent storage                                                  |
| i18next / react-i18next | Internationalization                                                |
| react-native-config     | Environment config                                                  |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Initialize project

```bash
npx rnjet init
```

---

## 🧱 Project Structure

```
src/
├── api/            # API layer (axios + wrapper)
├── assets/         # Images, icons, fonts
├── components/     # Reusable UI components
├── constants/      # Global helpers & config
├── hooks/          # Custom hooks
├── i18n/           # Localization
├── modules/        # Feature modules
├── navigation/     # Navigation setup
├── theme/          # Light / dark theme
└── types/          # Global types
```

---

## ▶️ Run App

Use the interactive menu to run, build, or set up the project — no need to remember commands:

```bash
make menu
```

You'll be prompted with:

```
Choose an option:
1. Start Metro with cache reset
2. Run pod install (iOS)
3. Run Android Development Debug
4. Run Android Production Debug
5. Build Android Development APK
6. Build Android Production APK

Enter number:
```

Just type a number and hit enter. 🚀

---

Or run manually:

### Android

```bash
yarn android:dev   # Development
yarn android:prod  # Production
```

### iOS

iOS uses Xcode schemes instead of CLI scripts.

**Steps:**

1. Open `ios/YourProject.xcworkspace` in Xcode
2. Select scheme:
   - `Dev App`
   - `App`
3. Run (**⌘ + R**)

---

## 🌍 Environment

Generated automatically:

```
.env.development
.env.production
```

---

## 🧠 iOS Notes (IMPORTANT)

RNJet generates additional plist files:

- `Info-Dev.plist`
- `Info-Prod.plist`

**Setup:**

1. Open project in Xcode
2. Add the files:
   - Right click project → **Add Files to [Project]**
   - Select `Info-Dev.plist` and `Info-Prod.plist`
   - ✅ Check **"Copy items if needed"**
3. Apply changes to both files whenever you edit `Info.plist`

> ⚠️ If you skip this, Dev / Prod behavior may be inconsistent.

---

## 🔥 Why RNJet?

- ✅ No setup fatigue
- ✅ Production-ready architecture
- ✅ Clean separation of concerns
- ✅ Built for real-world apps (not demos)

---

## 🤝 Contributing

PRs are welcome! Feel free to open issues or suggest improvements.

---

## 👨‍💻 Author

[JonathanTri](https://jonathantri.com/)
