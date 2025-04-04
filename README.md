# Drill Calibration App

A mobile application built with React Native and Expo to help farmers calibrate their seed drills accurately and efficiently.

## Features

- **Drill Configuration**
  - Set drill width (in feet)
  - Configure row spacing (in inches)
  - Set distance per turn (in inches)
  - Modern, intuitive interface with real-time validation

- **Calibration Calculator**
  - Select number of turns (1, 10, 20, or 30)
  - Input number of rows caught
  - Enter seed weight collected
  - Automatic pounds per acre calculation
  - Custom modal dropdown for row selection
  - Clear visual feedback for selected values

- **Real-time Validation**
  - Prevents invalid row counts based on drill configuration
  - Validates all numeric inputs
  - Shows maximum possible rows based on current settings
  - User-friendly error messages

- **Settings Preview**
  - Quick view of current drill configuration
  - Display of total available rows
  - All measurements clearly labeled with units
  - Semi-transparent overlay for better readability

- **Modern UI/UX**
  - Clean, professional design
  - Consistent color scheme throughout
  - Responsive layout that works on all screen sizes
  - Smooth animations and transitions
  - Background image support for better visual appeal

## Installation

1. Make sure you have Node.js installed
2. Install Expo CLI:
   ```bash
   npm install -g expo-cli
   ```
3. Clone the repository
4. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

- **iOS/Android**
  ```bash
  npx expo start
  ```
  Then scan the QR code with the Expo Go app

- **Web Browser**
  ```bash
  npx expo start --web
  ```

## Development

This app is built with:
- React Native
- Expo
- TypeScript
- AsyncStorage for persistent settings
- Custom modal components
- Platform-specific optimizations

## Usage

1. **Initial Setup**
   - Enter your drill width
   - Set your row spacing
   - Configure distance per turn
   - All inputs are validated in real-time

2. **Calibration Process**
   - Choose number of turns to test
   - Use the custom dropdown to select rows caught
   - Weigh and enter the seed caught
   - View the calculated pounds per acre
   - Results are displayed in a clear, easy-to-read format

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License
