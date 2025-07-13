# GoDaddy Repository Viewer

A full-stack application to browse and view details of GoDaddy's open source repositories.

## Features

- **Repository List**: Display all GoDaddy repositories with key information
- **Repository Details**: Click on any repo to view detailed information including:
  - Title and description
  - Link to GitHub repository
  - Primary programming language
  - Number of forks
  - Number of open issues
  - Number of watchers
  - Star count

## Tech Stack

- **Frontend**: React with React Router for navigation
- **Backend**: Go with Gorilla Mux for routing
- **API**: GitHub API for fetching repository data

## Project Structure



## Setup and Installation

### Prerequisites

- Go 1.21 or higher
- Node.js 16 or higher
- npm

### Quick Start

#### Windows
```bash
# Run the startup script
start.bat
```

#### Unix/Linux/macOS
```bash
# Make script executable
chmod +x start.sh
# Run the startup script
./start.sh
```

### Manual Setup

#### Backend Setup
```bash
cd backend
go mod tidy
go run main.go
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Usage

1. Start both the backend and frontend servers (using scripts above)
2. Open your browser to `http://localhost:3000`
3. Browse the list of GoDaddy repositories
4. Click on any repository card to view detailed information
5. Use the "Back to Repositories" button to return to the main list

## API Endpoints

- `GET /api/repositories` - Fetch all GoDaddy repositories
- `GET /api/repositories/{id}` - Fetch specific repository by ID

## Features Implemented

✅ Display list of GoDaddy repositories  
✅ Repository cards showing title, description, language, and stats  
✅ Click to view repository details  
✅ Repository detail page with all requested information  
✅ Responsive design for mobile and desktop  
✅ Error handling and loading states  
✅ Modern, clean UI with hover effects  

## Development

The application fetches data from the GitHub API to get GoDaddy's public repositories. The backend serves as a proxy to handle CORS and provide a clean API interface for the frontend.

### Backend (Go)
- Uses Gorilla Mux for routing
- CORS enabled for frontend communication
- Fetches data from GitHub API
- Serves JSON responses

### Frontend (React)
- Modern React with hooks (useState, useEffect)
- React Router for navigation
- Responsive CSS Grid layout
- Clean, modern UI design
- Error boundaries and loading states