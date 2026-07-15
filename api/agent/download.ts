import { requireAuth } from '../_lib/auth';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const tenantId = auth.tenantId;
    if (!tenantId) {
      return new Response('User must belong to a tenant', { status: 400 });
    }

    const exePath = resolve(process.cwd(), 'apps/client/EndpointSecurityClient_Prod.exe');
    if (!existsSync(exePath)) {
      return new Response('Base agent executable not found', { status: 404 });
    }

    const baseExeBuffer = readFileSync(exePath);
    
    // Create the signature buffer: ___TENANT_ID___:{tenantId}
    const signature = `___TENANT_ID___:${tenantId}`;
    const signatureBuffer = Buffer.from(signature, 'utf8');

    // Combine base exe and signature
    const finalBuffer = Buffer.concat([baseExeBuffer, signatureBuffer]);

    return new Response(finalBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="AssetManager_Agent.exe"',
        'Content-Length': finalBuffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
