#!/bin/bash

echo "🚀 MERN Agent Management System Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas."
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Copy backend/env.example to backend/.env and configure your MongoDB URI"
echo "2. Copy frontend/env.example to frontend/.env"
echo "3. Start MongoDB (if using local installation)"
echo "4. Run 'npm run dev' in both backend and frontend directories"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""
echo "📊 Sample CSV file available at: sample-data.csv"
