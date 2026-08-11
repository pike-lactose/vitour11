# Virtual Tour Web Application

A fullstack Virtual Tour application with React.js frontend and Node.js/Express backend using MySQL database.

## Features

### User Side
- **Landing Page**: School history, gallery, principal info, and virtual tour button
- **Virtual Tour Viewer**: 360° panorama viewing with Pannellum
- **Hotspot Navigation**: Click hotspots to navigate between scenes

### Admin Panel
- **Scene Management**: Upload 360° panorama images
- **Hotspot Creator**: Click on panorama to create hotspots with pitch/yaw coordinates
- **Hotspot Management**: Edit and delete hotspots

## Tech Stack
- **Frontend**: React.js 18
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Panorama Viewer**: Pannellum
- **File Upload**: Multer

## Prerequisites
- Node.js (v14+)
- MySQL Server (v5.7+)

## Setup Instructions

### 1. Database Setup
Make sure MySQL server is running. The application will automatically create the `vitour` database and tables on first run.

Default connection settings (in server.js):
- Host: localhost
- User: root
- Password: (empty)
- Database: vitour

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Application runs on http://localhost:3000

## API Endpoints

### Scenes
- `GET /api/scenes` - Get Pannellum-compatible scene data
- `GET /api/scenes/list` - Get all scenes
- `POST /api/scenes` - Upload new scene (multipart/form-data)
- `DELETE /api/scenes/:id` - Delete scene

### Hotspots
- `GET /api/hotspots` - Get all hotspots
- `GET /api/hotspots?sceneId=<id>` - Get hotspots for a scene
- `POST /api/hotspots` - Create hotspot
- `PUT /api/hotspots/:id` - Update hotspot
- `DELETE /api/hotspots/:id` - Delete hotspot

## Usage

### Creating a Virtual Tour

1. Go to Admin Panel: http://localhost:3000/admin
2. Click "Kelola Scene" to upload 360° panorama images
3. Click "Panorama Editor" to create hotspots:
   - Select a scene from the dropdown
   - Click on the panorama where you want a hotspot
   - Fill in the hotspot details (text, target scene)
   - Click "Simpan Hotspot"
4. Go to http://localhost:3000/tour to view the virtual tour
5. Click the "Ayo Tour Virtual" button on the landing page to start

## Project Structure
```
vitour/
├── backend/
│   ├── server.js       # Express server with API endpoints
│   ├── uploads/        # Uploaded panorama images
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.js       # Landing page
│   │   │   ├── TourViewer.js     # 360° viewer
│   │   │   ├── Admin.js         # Admin dashboard
│   │   │   └── admin/
│   │   │       ├── SceneManager.js
│   │   │       ├── HotspotManager.js
│   │   │       └── PanoramaEditor.js
│   │   ├── components/
│   │   │   └── admin/
│   │   │       └── AdminLayout.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── SPEC.md
└── README.md
```

## Notes
- Images are stored in `backend/uploads/`
- Scene-to-scene navigation works by clicking on hotspots
- The drag-to-look feature is separate from click-to-create-hotspot
- Make sure 360° panorama images are equirectangular format
