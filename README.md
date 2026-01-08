# Mosh - Hair Loss Tracking Application

A full-stack web application for tracking hair regrowth progress through photo snapshots. The application uses AI-powered face detection to ensure consistent photo positioning for accurate progress tracking.

## 🎯 Features

- **AI-Powered Photo Capture**: Uses MediaPipe Face Mesh for real-time face detection and validation
- **Smart Positioning Guides**: Visual oval guides help users position their face correctly
- **Lighting Validation**: Automatically checks lighting conditions before capturing photos
- **Snapshot Management**: View, save, and delete hair regrowth snapshots
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Persistence**: Snapshots are stored in JSON format on the backend

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool and dev server
- **MediaPipe Face Mesh** - Face detection and landmark tracking
- **Font Awesome** - Icons
- **Custom CSS** - Styling with custom fonts (Gelica, Area Inktrap)

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
