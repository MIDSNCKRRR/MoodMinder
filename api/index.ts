import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes
let server: any;
const initializeServer = async () => {
  if (!server) {
    server = await registerRoutes(app);
  }
  return server;
};

// Vercel handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initializeServer();
    
    // Convert Vercel request to Express format
    const expressReq = req as any;
    const expressRes = res as any;
    
    // Handle the request with Express
    app(expressReq, expressRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}