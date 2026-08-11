# Virtual Tour Web Application - Specification

## Project Overview
- **Project Name**: Virtual Tour Web Application
- **Type**: Fullstack Web Application
- **Core Functionality**: Interactive 360° virtual tour with admin hotspot management
- **Target Users**: School/organization visitors (user side), Administrators (admin side)

## Tech Stack
- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Panorama Viewer**: Pannellum
- **File Upload**: Multer

## UI/UX Specification

### Color Palette
- **Primary**: #1e3a5f (Deep Blue)
- **Secondary**: #2d5a87 (Medium Blue)
- **Accent**: #4ecdc4 (Teal)
- **Background**: #f5f7fa (Light Gray)
- **Text Primary**: #2c3e50 (Dark Gray)
- **Text Secondary**: #7f8c8d (Gray)
- **Success**: #27ae60 (Green)
- **Danger**: #e74c3c (Red)
- **White**: #ffffff

### Typography
- **Headings**: 'Poppins', sans-serif (bold)
- **Body**: 'Roboto', sans-serif (regular)
- **Sizes**: H1: 32px, H2: 24px, H3: 20px, Body: 16px, Small: 14px

### Layout Structure
- **Responsive Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Navigation**: Fixed top navbar with brand and menu items
- **Admin Layout**: Sidebar navigation with main content area
- **Viewer**: Full-screen panorama with overlay controls

### Pages & Components

#### Landing Page
- Hero section with school image and welcome text
- School History section with text content
- School Image gallery section
- Principal section with photo and bio
- Floating "Ayo Tour Virtual" button (blue box, fixed bottom)
- Smooth scroll to tour section

#### Virtual Tour Viewer (User Side)
- Full-screen Pannellum panorama viewer
- Scene name overlay at top
- Navigation hotspots (clickable markers)
- Auto-load scenes
- Scene-to-scene navigation
- Drag to look around, click to interact
- Back to home button

#### Admin Panel

**Layout**
- Sidebar with navigation: Scenes, Hotspots, Panorama Editor
- Main content area with cards/tables
- Responsive design

**Scene Management Page**
- Upload form: file input for panorama image, name input
- Scene list table: ID, Name, Image preview, Actions (Delete)
- Upload button with loading state

**Hotspot Management Page**
- Hotspots table: ID, Scene, Pitch, Yaw, Text, Target, Actions (Edit/Delete)
- Filter by scene dropdown

**Panorama Editor Page**
- Scene selector dropdown
- Panorama preview using Pannellum (non-auto-load for editing)
- Click-to-add hotspot mode
- Click on panorama shows pitch/yaw in form
- Form: pitch (auto-filled), yaw (auto-filled), text input, target scene dropdown
- Save hotspot button
- List of existing hotspots for that scene

### Interactive Behaviors
- Hotspot hover: cursor pointer, slight scale
- Button hover: darken background, smooth transition
- Form focus: blue border highlight
- Loading states: spinner animation
- Toast notifications for success/error actions
- Prevent hotspot creation during drag (distinguish click vs drag)

## Database Design

### Table: scenes
```sql
CREATE TABLE scenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: hotspots
```sql
CREATE TABLE hotspots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scene_id INT NOT NULL,
  pitch FLOAT NOT NULL,
  yaw FLOAT NOT NULL,
  text VARCHAR(255),
  target_scene_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_scene_id) REFERENCES scenes(id) ON DELETE SET NULL
);
```

## API Specification

### GET /api/scenes
Returns Pannellum-compatible JSON format

### POST /api/scenes
- Body: form-data with image (file) and name (string)
- Returns: created scene object

### GET /api/scenes/list
Returns array of all scenes

### DELETE /api/scenes/:id
Delete scene and associated hotspots

### GET /api/hotspots
Returns array of all hotspots (with scene names)

### GET /api/hotspots/:sceneId
Returns hotspots for specific scene

### POST /api/hotspots
- Body: JSON { scene_id, pitch, yaw, text, target_scene_id }
- Returns: created hotspot

### PUT /api/hotspots/:id
- Body: JSON { pitch, yaw, text, target_scene_id }
- Returns: updated hotspot

### DELETE /api/hotspots/:id
Returns success message

## Functionality Specification

### Core Features

1. **Scene Upload**
   - Accept .jpg, .jpeg, .png, .webp images
   - Save to /uploads directory
   - Store path in database
   - Generate thumbnail for list view

2. **Hotspot Creation**
   - Click on panorama to get coordinates
   - Prevent drag from creating hotspot
   - Form with auto-filled pitch/yaw
   - Select target scene from dropdown
   - Optional text label

3. **Hotspot Navigation**
   - Scene-to-scene navigation
   - Smooth transition between panoramas
   - Hotspot markers visible in viewer

4. **Admin Management**
   - CRUD operations for scenes
   - CRUD operations for hotspots
   - Visual hotspot editor

### User Interactions
- Drag to rotate view
- Click hotspot to navigate
- Click on editor panorama to add hotspot
- Form submission for hotspot data

### Edge Cases
- No scenes: Show message to admin to create scenes
- No hotspots: Show empty state message
- Missing target scene: Allow orphan hotspots
- Large images: Client-side resize or server-side compression
- Database errors: Show user-friendly error messages

## Acceptance Criteria

### Landing Page
- [ ] School history section displays properly
- [ ] School images section displays
- [ ] Principal section with photo and bio
- [ ] Blue "Ayo Tour Virtual" button at bottom scrolls to tour
- [ ] Responsive on all devices

### Virtual Tour Viewer
- [ ] 360° panorama loads and renders correctly
- [ ] Drag to look around works smoothly
- [ ] Hotspots appear at correct positions
- [ ] Clicking hotspot navigates to target scene
- [ ] Scene name displays at top
- [ ] Back button returns to landing page

### Admin Panel
- [ ] Scene upload works with image preview
- [ ] Scenes list displays all uploaded scenes
- [ ] Can delete scenes
- [ ] Click on panorama shows pitch/yaw coordinates
- [ ] Hotspot form pre-fills coordinates
- [ ] Can select target scene from dropdown
- [ ] Hotspots save to database
- [ ] Hotspot list shows all hotspots
- [ ] Can edit and delete hotspots
- [ ] Drag does not create hotspot (only click)

### API
- [ ] GET /api/scenes returns Pannellum format
- [ ] POST /api/scenes uploads image and saves to DB
- [ ] GET /api/hotspots returns all hotspots
- [ ] POST/PUT/DELETE /api/hotspots work correctly
- [ ] Images served from /uploads directory
