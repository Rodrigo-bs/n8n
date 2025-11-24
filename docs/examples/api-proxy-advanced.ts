/**
 * Advanced Next.js API Integration Example
 * 
 * This example shows how to create an API route in Next.js that
 * can communicate with the n8n backend while adding custom logic,
 * authentication, or other middleware.
 * 
 * IMPORTANT: Choose ONE approach based on your Next.js version:
 * - Pages Router (Next.js 12.x): Use the default handler below
 * - App Router (Next.js 13+): See the separate route handler examples at the bottom
 * 
 * Location for Pages Router: pages/api/n8n/[...path].ts
 * Location for App Router: app/api/n8n/[...path]/route.ts (in a separate file)
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const N8N_BACKEND_URL = process.env.N8N_BACKEND_URL || 'http://localhost:5678';

/**
 * Proxy API handler for n8n backend
 * 
 * This allows you to:
 * 1. Add custom authentication
 * 2. Transform requests/responses
 * 3. Add logging
 * 4. Implement rate limiting
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // Example: Add custom authentication check
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // You could verify the token against your auth system here
  // const isValid = await verifyToken(authToken);
  // if (!isValid) {
  //   return res.status(403).json({ error: 'Forbidden' });
  // }
  
  try {
    // Forward the request to n8n backend
    const backendUrl = `${N8N_BACKEND_URL}/${pathString}`;
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers
        ...(authToken && { Authorization: authToken }),
        // Add any other headers you need
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' && {
        body: JSON.stringify(req.body),
      }),
    });
    
    const data = await response.json();
    
    // Example: Transform response or add custom data
    // const transformedData = {
    //   ...data,
    //   customField: 'value',
    // };
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying to n8n backend:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * ============================================================================
 * App Router (Next.js 13+) Implementation
 * ============================================================================
 * 
 * Save the following code in a SEPARATE file:
 * app/api/n8n/[...path]/route.ts
 * 
 * DO NOT mix Pages Router and App Router code in the same file.
 */

/*
// File: app/api/n8n/[...path]/route.ts

const N8N_BACKEND_URL = process.env.N8N_BACKEND_URL || 'http://localhost:5678';

/**
 * For App Router (Next.js 13+), use this pattern:
 */
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const pathString = params.path.join('/');
  
  try {
    const backendUrl = `${N8N_BACKEND_URL}/${pathString}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward relevant headers from the request
      },
    });
    
    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const pathString = params.path.join('/');
  const body = await request.json();
  
  try {
    const backendUrl = `${N8N_BACKEND_URL}/${pathString}`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add other HTTP methods as needed (PUT, PATCH, DELETE, etc.)

*/
