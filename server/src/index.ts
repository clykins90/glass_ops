import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import helmet from 'helmet';
import path from 'path';

// Load environment variables based on NODE_ENV
const environment = process.env.NODE_ENV || 'development';
const envFile = path.resolve(process.cwd(), `.env.${environment}`);

console.log(`Loading environment from: ${envFile}`);
dotenv.config({ path: envFile });

// Create Express app
const app = express();

// Get port from environment variables
const port = process.env.PORT || 3001;
const apiPrefix = process.env.API_PREFIX || '/api';

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS policy`);
      return callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// Routes
app.use(apiPrefix, routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
}); 