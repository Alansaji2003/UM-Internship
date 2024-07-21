# Web Music Player

This project is a simple web music player that allows users to create playlists, add songs, and play music from Firebase Storage.

## Features

- **Firebase Integration**: Utilizes Firebase Firestore for storing playlists and Firebase Storage for storing music files.
- **Playlist Management**: Create new playlists, add songs to playlists, and switch between playlists.
- **Responsive Design**: Designed to be responsive for various screen sizes.
- **Play Controls**: Play, pause, skip to next/previous song functionality.
- **Search Functionality**: Search for songs within playlists.

## Firebase Configuration

Make sure to replace the Firebase configuration placeholders in `index.js` with your actual Firebase project credentials.

## Usage

1. **Adding Playlists**: Click the "+" button to add a new playlist. Provide a name, and an image will be fetched from Lorem Picsum.
2. **Managing Songs**: Click on a playlist to view and play its songs. Upload songs using the "Add Song" button.
3. **Playing Songs**: Click on a song to start playing it. Use the play/pause button and navigate through songs using next/previous buttons.
4. **Volume Control**: Adjust volume using the slider.

## Dependencies

- Firebase SDK (9.6.6)
  - `firebase-app.js`
  - `firebase-firestore-lite.js`
  - `firebase-storage.js`

## Setup

1. Clone the repository.
2. Replace Firebase configuration placeholders in `index.js` with your Firebase project credentials.
3. Open `index.html` in a web browser.

## Credits

- This project uses Lorem Picsum for placeholder images.