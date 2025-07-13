#!/bin/bash

# Start backend
echo "Starting Go backend..."
cd backend
go mod tidy
go run main.go &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting React frontend..."
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "Backend running on http://localhost:8080"
echo "Frontend running on http://localhost:3000"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
