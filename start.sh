#!/bin/bash

echo "🚀 Starting MERN Agent Management System"
echo "========================================"

# Kill any existing processes on ports 5000-5010
echo "🧹 Cleaning up existing processes..."
for port in {5000..5010}; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid 2>/dev/null || true
  fi
done

# Wait a moment for ports to be released
sleep 2

# Start backend
echo "🔧 Starting backend server..."
cd backend
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp env.example .env
fi

# Start backend in background and capture output
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start and find the port
echo "⏳ Waiting for backend to start..."
sleep 5

# Extract port from log file
BACKEND_PORT=$(grep "Server running on port" ../backend.log | tail -1 | grep -o '[0-9]\+' | tail -1)

if [ -z "$BACKEND_PORT" ]; then
  echo "❌ Backend failed to start. Check backend.log for details"
  cat ../backend.log
  exit 1
fi

echo "✅ Backend started successfully on port $BACKEND_PORT"

# Update frontend .env with the actual port
cd ../frontend
if [ ! -f .env ]; then
  echo "📝 Creating frontend .env file..."
  cp env.example .env
fi

# Update the port in frontend .env
sed -i '' "s/localhost:5001/localhost:$BACKEND_PORT/g" .env
echo "📝 Updated frontend .env to use port $BACKEND_PORT"

# Start frontend
echo "🎨 Starting frontend..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "🎉 Application started successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:$BACKEND_PORT"
echo ""
echo "🔐 Demo credentials:"
echo "   Email: admin@example.com"
echo "   Password: password123"
echo ""
echo "📊 Sample data: sample-data.csv"
echo ""
echo "📋 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
