# 🏃‍♂️ Running Tracker App

A cross-platform React Native app to track your runs, visualize routes, monitor pace, maintain streaks, and stay motivated with daily quotes. Built using Expo, Firebase, and modern mobile development practices.

## 📱 Features

- **Run Tracking:** Records time, distance, pace, and route using GPS.
- **Pace Zones:** Visual path segmentation with customizable pace thresholds and colors.
- **Map & Metrics:** Live map with user location and key metrics.
- **Photo Capture:** Take and save photos during runs (limit: 10 per run).
- **Run Summary:** Post-run screen with stats, notes, route image, and photos.
- **Activity Journal:** View expandable cards for all past runs.
- **User Streaks:** Earn streaks for meeting daily distance goals.
- **Profile Management:** Edit profile, view weekly heatmap, and check goal progress.
- **Settings:** Toggle distance unit (km/miles), sound, and vibration.
- **Motivational Quotes:** Fetches random quotes to keep users inspired.
- **Firebase Integration:** Authentication, Firestore for user data and history.

## ⚙️ Tech Stack

- **React Native + Expo**
- **Firebase Authentication & Firestore**
- **react-native-maps**
- **react-native-view-shot**
- **AsyncStorage**
- **Expo Camera**
- **Quotable API (via proxy)**

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/running-tracker-app.git
cd running-tracker-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

- Create a project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Authentication** (Email/Password) and **Firestore**.
- Add your Firebase config in `src/config/firebaseConfig.js`.

### 4. Run the app

```bash
npx expo start
```

Scan the QR code using Expo Go on Android/iOS.

## 🗂 Project Structure

```
src/
├── components/          # Reusable UI components (MapDisplay, MetricsPanel, etc.)
├── screens/             # Main screen files (Home, Journal, Profile, Settings, etc.)
├── services/            # Firebase CRUD, settings helpers, utils
├── hooks/               # Custom hooks like useRunTracker
├── config/              # Firebase config and navigation setup
assets/                  # Icons, images, sounds
```

## 🔒 Permissions

Ensure you grant the following permissions:

- Location (for tracking)
- Camera (for capturing photos)
- Media Library (optional, for photo access)

## 🧪 Testing

Manual testing is done using:

- Android and iOS (via Expo Go)
- Real-world runs with GPS and camera usage

## 📝 Future Improvements

- Step tracking via HealthKit/Google Fit
- Social features and friend leaderboards
- Cloud storage for run photos
- Weekly/Monthly run challenges

## 💬 Credits

- Icons: [Ionicons](https://ionic.io/ionicons)
- Quotes API: [ZenQuotes.io](https://zenquotes.io)
- Map Provider: [react-native-maps](https://github.com/react-native-maps/react-native-maps)
