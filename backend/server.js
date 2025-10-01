/**
 * MERN Agent Management System - Server Entry Point
 * 
 * This file sets up the Express server with all necessary middleware,
 * routes, and error handling for the Agent Management System.
 * 
 * Features:
 * - JWT Authentication
 * - Agent CRUD Operations
 * - CSV/XLSX File Upload and Distribution
 * - MongoDB Integration
 * - Automatic Port Conflict Resolution
 * 
 * @author MERN Agent Management Team
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Security and CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '2mb' })); // JSON parsing with size limit

// Connect to MongoDB database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);      // Authentication routes
app.use('/api/agents', agentRoutes);   // Agent management routes
app.use('/api/upload', uploadRoutes);   // File upload and distribution routes

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({ 
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      path: req.originalUrl 
    })
  });
});

/**
 * Function to find an available port starting from the specified port
 * This prevents port conflicts with other services (like macOS ControlCenter)
 * 
 * @param {number} startPort - The port to start checking from
 * @returns {Promise<number>} - The first available port
 */
const findAvailablePort = async (startPort) => {
  const net = await import('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is busy, try next port
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

/**
 * Start the server with automatic port detection
 * This ensures the server always finds an available port
 */
const startServer = async () => {
  try {
    const startPort = parseInt(process.env.PORT) || 5001;
    const port = await findAvailablePort(startPort);
    
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api`);
      
      if (port !== startPort) {
        console.log(`ℹ️  Port ${startPort} was busy, using port ${port} instead`);
      }
      
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
