# MeetNear Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Guide](#development-guide)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Architecture](#architecture)
7. [Components](#components)
8. [API Reference](#api-reference)
9. [Contributing](#contributing)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/meetnear.git
cd meetnear
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios
pod install
cd ..
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

5. Run the app:
```bash
# For iOS (macOS only)
npm run ios
# or
yarn ios

# For Android
npm run android
# or
yarn android
```

## Project Structure

```
meetnear/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API and other services
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── assets/         # Images, fonts, etc.
│   ├── constants/      # Constants and configuration
│   ├── theme/          # Theme configuration
│   └── types/          # TypeScript type definitions
├── android/            # Android specific files
├── ios/               # iOS specific files
├── docs/              # Documentation
├── tests/             # Test files
└── package.json       # Project dependencies and scripts
```

## Development Guide

### Code Style

We use ESLint and Prettier for code formatting. The configuration is in `.eslintrc.js` and `.prettierrc`.

### Git Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "feat: add your feature"
```

3. Push your branch and create a pull request:
```bash
git push origin feature/your-feature-name
```

### Best Practices

- Write clean, maintainable code
- Follow the component structure
- Use TypeScript for type safety
- Write tests for new features
- Update documentation as needed

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test/file.test.ts
```

### Writing Tests

- Use Jest and React Native Testing Library
- Write unit tests for utilities and hooks
- Write component tests for UI components
- Write integration tests for features

## Deployment

### Android

1. Generate a signed APK:
```bash
cd android
./gradlew assembleRelease
```

2. The APK will be in `android/app/build/outputs/apk/release/`

### iOS

1. Open the project in Xcode:
```bash
cd ios
open meetnear.xcworkspace
```

2. Select the target device and build the app

## Architecture

The app follows a component-based architecture with the following layers:

1. **Presentation Layer**
   - Components
   - Screens
   - Navigation

2. **Business Logic Layer**
   - Services
   - Hooks
   - Utils

3. **Data Layer**
   - API calls
   - Local storage
   - State management

## Components

### Common Components

- Button
- Input
- Card
- List
- Modal
- Loading
- Error
- Empty State

### Layout Components

- Container
- Grid
- Stack
- Section

### Form Components

- Form
- FormField
- Validation

## API Reference

### Authentication

```typescript
interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
```

### Location

```typescript
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

### Pull Request Process

1. Update the documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update the changelog
5. Get code review approval 