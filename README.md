# 🌱 NutriCalc - Precision Nutrient Calculator

A modern Progressive Web App (PWA) for calculating nutrient requirements for hydroponic and soil-based growing systems.

## ✨ Features

- **🌙 Dark Mode Support**: Full dark/light theme switching with system preference detection
- **📱 PWA Ready**: Install on home screen (iOS/Android) for app-like experience
- **🔄 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🌿 Multiple Growing Methods**: Support for soil, hydroponic, and coco coir growing
- **🏷️ Brand Support**: Multiple nutrient brand configurations
- **📈 Growth Stage Management**: Different nutrient requirements for each growth stage
- **⚡ Offline Support**: Works without internet connection
- **📊 Export Results**: PDF export and clipboard copy functionality

## 📱 PWA Features

### Installation
- **iOS**: Safari → Share → "Add to Home Screen"
- **Android**: Chrome → Menu → "Add to Home Screen"
- **Desktop**: Browser install prompt

### PWA Benefits
- **App-like Experience**: Full-screen mode without browser UI
- **Offline Functionality**: Works without internet connection
- **Fast Loading**: Cached resources for instant access
- **Native Feel**: Splash screen and smooth transitions

## 🎨 Dark Mode

The application includes a comprehensive dark mode system:

- **Theme Toggle**: Click the theme button in the top-right corner
- **System Preference**: Automatically detects your system's color scheme
- **Persistent Settings**: Your theme choice is saved across sessions
- **Mobile Support**: Works correctly on mobile devices

### Theme Options
- **Light**: Always use light theme
- **Dark**: Always use dark theme  
- **System**: Follow your system's color scheme preference

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### GitHub Pages (Automatic)
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Available at: `https://[username].github.io/NutriCalc_backup/`

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your web server
```

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **next-themes** for theme management
- **Radix UI** for accessible components
- **Lucide React** for icons
- **PWA** for mobile app experience

## 📁 Project Structure

```
src/
├── components/          # UI components
├── features/simplex/    # Main calculator
├── hooks/              # Custom hooks (PWA, etc.)
├── data/               # JSON data files
├── constants/          # App constants
└── utils/              # Utility functions

public/
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
└── icons/             # App icons
```

## 🔧 PWA Implementation

- **Service Worker**: Offline caching and background sync
- **Web App Manifest**: App metadata and installation settings
- **iOS Meta Tags**: Full-screen mode and splash screens
- **Install Prompt**: User-friendly installation flow

## 📄 License

MIT License - feel free to use this project for your own needs.