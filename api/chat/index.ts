import { getSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { requireAuth, type AuthUser } from '../_lib/auth';

export const config = { runtime: 'edge' };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function resolveEmployeeId(auth: AuthUser): Promise<string | null> {
  const sql = getSql();

  if (auth.employeeId && isUuid(auth.employeeId)) {
    return auth.employeeId;
  }

  try {
    const rows = (await sql`
      SELECT id FROM employees
      WHERE tenant_id = ${DEMO_TENANT_ID} AND lower(email) = ${auth.email.toLowerCase()}
      LIMIT 1
    `) as { id: string }[];

    if (rows.length > 0) return rows[0].id;
  } catch {
    return null;
  }

  return null;
}

// Database Tool Helpers
async function listMyRequests(employeeId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT id, request_type as "requestType", category, description, needed_by as "neededBy", status, created_at as "createdAt"
    FROM asset_requests
    WHERE tenant_id = ${DEMO_TENANT_ID} AND employee_id = ${employeeId}
    ORDER BY created_at DESC
  `;
  return { requests: rows };
}

async function listMyAssets(employeeId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
    FROM assets
    WHERE tenant_id = ${DEMO_TENANT_ID} AND assigned_employee_id = ${employeeId}
  `;
  return { assets: rows };
}

async function submitDeviceRequest(employeeId: string, args: { requestType: string; category: string; description: string; neededBy?: string }) {
  const sql = getSql();
  const neededBy = args.neededBy || null;
  const rows = (await sql`
    INSERT INTO asset_requests (
      tenant_id, employee_id, request_type, category, description, needed_by, status
    ) VALUES (
      ${DEMO_TENANT_ID}, ${employeeId}, ${args.requestType}, ${args.category}, ${args.description}, ${neededBy}, 'submitted'
    )
    RETURNING id, request_type as "requestType", category, description, needed_by as "neededBy", status, created_at as "createdAt"
  `) as any[];
  return { success: true, request: rows[0] };
}

async function listAllRequests() {
  const sql = getSql();
  const rows = await sql`
    SELECT r.id, r.request_type as "requestType", r.category, r.description, r.needed_by as "neededBy", r.status, r.created_at as "createdAt",
           e.first_name || ' ' || e.last_name as "employeeName", e.email as "employeeEmail"
    FROM asset_requests r
    JOIN employees e ON e.id = r.employee_id
    WHERE r.tenant_id = ${DEMO_TENANT_ID}
    ORDER BY r.created_at DESC
    LIMIT 20
  `;
  return { requests: rows };
}

async function searchAssets(args: { query?: string; category?: string; status?: string }) {
  const sql = getSql();
  let rows;
  const category = args.category || null;
  const status = args.status || null;
  const textQuery = args.query ? `%${args.query}%` : null;

  if (textQuery && category && status) {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${DEMO_TENANT_ID} AND category = ${category} AND status = ${status}
        AND (name ILIKE ${textQuery} OR asset_tag ILIKE ${textQuery} OR serial_number ILIKE ${textQuery})
      LIMIT 15
    `;
  } else if (category && status) {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${DEMO_TENANT_ID} AND category = ${category} AND status = ${status}
      LIMIT 15
    `;
  } else if (textQuery) {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${DEMO_TENANT_ID} 
        AND (name ILIKE ${textQuery} OR asset_tag ILIKE ${textQuery} OR serial_number ILIKE ${textQuery})
      LIMIT 15
    `;
  } else {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${DEMO_TENANT_ID}
      LIMIT 15
    `;
  }
  return { assets: rows };
}

async function executeTool(name: string, args: any, role: string, employeeId: string | null) {
  try {
    if (name === 'list_my_requests') {
      if (!employeeId) return { error: 'No employee record found.' };
      return await listMyRequests(employeeId);
    }
    if (name === 'list_my_assets') {
      if (!employeeId) return { error: 'No employee record found.' };
      return await listMyAssets(employeeId);
    }
    if (name === 'submit_device_request') {
      if (!employeeId) return { error: 'No employee record found.' };
      return await submitDeviceRequest(employeeId, args);
    }
    if (name === 'list_all_requests') {
      if (role === 'employee') return { error: 'Unauthorized' };
      return await listAllRequests();
    }
    if (name === 'search_assets') {
      if (role === 'employee') return { error: 'Unauthorized' };
      return await searchAssets(args);
    }
    return { error: `Tool ${name} not found.` };
  } catch (err: any) {
    return { error: err.message || 'Tool execution failed' };
  }
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'POST') return error('Method not allowed', 405);

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const employeeId = await resolveEmployeeId(auth);
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const body = await parseBody<{ message: string; history?: any[]; currentPath?: string }>(req);
    const userMessage = body.message;
    const history = body.history || [];
    const currentPath = body.currentPath || '/';

    if (!userMessage) return error('message is required', 400);

    // Fallback: If no Gemini API Key is configured, return mock responses
    if (!apiKey) {
      return handleMockMode(userMessage, auth, employeeId, currentPath);
    }

    // Construct history for Gemini API
    // Gemini API history expects format: { role: 'user'|'model', parts: [{ text: string }] }
    const contents = history.map((h: any) => ({
      role: h.role === 'ai' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const systemInstructionText = auth.role === 'employee'
      ? `You are Assetly AI, a virtual assistant for employee self-service.
You are helping the employee who is currently viewing the page: ${currentPath}.
You can help employees query their assigned hardware/assets or view their submitted device requests.
You can also submit new requests on their behalf.
When they request a device, replacement, or accessory, use the 'submit_device_request' tool.
Provide clear, conversational answers. Keep formatting clean.

CRITICAL JSON FORMATTING RULES:
If you are displaying a list of assets or requests (either retrieved from a tool or query), you MUST append a JSON block at the end of your response, wrapped in a single \`\`\`json ... \`\`\` code block, representing the raw data in this schema:
For assets: {"type": "assets", "items": [{"id": "...", "name": "...", "assetTag": "...", "category": "...", "status": "...", "serialNumber": "..."}]}
For requests: {"type": "requests", "items": [{"id": "...", "category": "...", "requestType": "...", "description": "...", "status": "...", "createdAt": "..."}]}`
      : `You are Assetly Copilot for IT Administrators. 
You are helping the administrator who is currently viewing the page: ${currentPath}.
You can search assets in the inventory or review submitted device requests.
When queried about requests, list them. If asked about assets, use search_assets.

CRITICAL JSON FORMATTING RULES:
If you are displaying a list of assets or requests (either retrieved from a tool or query), you MUST append a JSON block at the end of your response, wrapped in a single \`\`\`json ... \`\`\` code block, representing the raw data in this schema:
For assets: {"type": "assets", "items": [{"id": "...", "name": "...", "assetTag": "...", "category": "...", "status": "...", "serialNumber": "..."}]}
For requests: {"type": "requests", "items": [{"id": "...", "category": "...", "requestType": "...", "description": "...", "status": "...", "createdAt": "...", "employeeName": "..."}]}`;

    const systemInstruction = {
      parts: [{ text: systemInstructionText }]
    };

    const tools = [
      {
        functionDeclarations: [
          {
            name: 'list_my_requests',
            description: 'Get a list of the active and historical device requests submitted by the logged in employee.'
          },
          {
            name: 'list_my_assets',
            description: 'Get a list of the hardware assets currently assigned to the logged in employee.'
          },
          {
            name: 'submit_device_request',
            description: 'Submit a new request for hardware, replacements, or accessories for the employee.',
            parameters: {
              type: 'OBJECT',
              properties: {
                requestType: {
                  type: 'STRING',
                  description: 'The type of request: must be one of "new", "replacement", or "accessory".',
                },
                category: {
                  type: 'STRING',
                  description: 'The category of device: e.g. "laptop", "monitor", "mouse", "keyboard", "mobile", "other".',
                },
                description: {
                  type: 'STRING',
                  description: 'The justification or explanation of what is needed and why.',
                },
                neededBy: {
                  type: 'STRING',
                  description: 'Optional. The date needed by in YYYY-MM-DD format.',
                }
              },
              required: ['requestType', 'category', 'description']
            }
          },
          {
            name: 'list_all_requests',
            description: 'IT Admins only: Retrieve a list of all submitted device requests across the organization.'
          },
          {
            name: 'search_assets',
            description: 'IT Admins only: Search for hardware assets in the system database.',
            parameters: {
              type: 'OBJECT',
              properties: {
                query: { type: 'STRING', description: 'Search keywords (asset tag, name, or serial number).' },
                category: { type: 'STRING', description: 'Filter by category (e.g. laptop, desktop, mobile).' },
                status: { type: 'STRING', description: 'Filter by status (e.g. deployed, in_stock, in_repair).' }
              }
            }
          }
        ]
      }
    ];

    let finalResponseText = '';
    let currentContents = [...contents];
    const maxLoops = 3;

    for (let loop = 0; loop < maxLoops; loop++) {
      const payload = {
        contents: currentContents,
        systemInstruction,
        tools
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: ${errText}`);
      }

      const responseData = await res.json();
      const candidate = responseData.candidates?.[0];
      const modelContent = candidate?.content;

      if (!modelContent) {
        finalResponseText = "I encountered an error trying to process that request.";
        break;
      }

      currentContents.push(modelContent);

      const partWithFunctionCall = modelContent.parts?.find((p: any) => p.functionCall);
      if (partWithFunctionCall && partWithFunctionCall.functionCall) {
        const { name, args } = partWithFunctionCall.functionCall;
        const toolResult = await executeTool(name, args, auth.role, employeeId);

        currentContents.push({
          role: 'function',
          parts: [{
            functionResponse: {
              name,
              response: toolResult
            }
          }]
        });
      } else {
        const textPart = modelContent.parts?.find((p: any) => p.text);
        finalResponseText = textPart?.text || '';
        break;
      }
    }

    return json({ text: finalResponseText });
  } catch (err: any) {
    return json({ text: `AI integration error: ${err.message || 'Unknown error'}` });
  }
}

// Mock-mode fallback for when no GEMINI_API_KEY is configured
async function handleMockMode(message: string, auth: AuthUser, employeeId: string | null, currentPath: string) {
  const text = message.toLowerCase();

  let textResponse = '';
  
  if (text.includes('status') || text.includes('request')) {
    if (auth.role === 'employee' && employeeId) {
      const data = await listMyRequests(employeeId);
      if (data.requests.length === 0) {
        textResponse = `You don't have any submitted device requests at the moment. You can submit one in the Request form above!`;
      } else {
        textResponse = `Here are your recent device requests:\n\n\`\`\`json\n${JSON.stringify({ type: 'requests', items: data.requests })}\n\`\`\``;
      }
    } else {
      const data = await listAllRequests();
      textResponse = `Here are the organization's device requests (IT Admin view):\n\n\`\`\`json\n${JSON.stringify({ type: 'requests', items: data.requests })}\n\`\`\``;
    }
  } else if (text.includes('asset') || text.includes('device') || text.includes('laptop') || text.includes('hardware')) {
    if (auth.role === 'employee' && employeeId) {
      const data = await listMyAssets(employeeId);
      if (data.assets.length === 0) {
        textResponse = `You don't have any corporate hardware assets assigned to you at the moment.`;
      } else {
        textResponse = `Here are the corporate assets assigned to you:\n\n\`\`\`json\n${JSON.stringify({ type: 'assets', items: data.assets })}\n\`\`\ lock`;
      }
    } else {
      textResponse = `As an Administrator, you can view the Asset inventory in the [Assets list](/assets) or search devices using standard dashboard tools. Configure the \`GEMINI_API_KEY\` in your \`.env\` file to enable natural language AI search!`;
    }
  } else if (text.includes('page') || text.includes('where am i')) {
    textResponse = `You are currently viewing the **${currentPath}** route of the Assetly application. Let me know if you need help navigating or finding information related to this page!`;
  } else {
    textResponse = `Hello **${auth.firstName}**! I'm the **Assetly AI Assistant**.\n\n` +
      `To activate full natural language capabilities, please add a \`GEMINI_API_KEY\` to your \`.env\` file.\n\n` +
      `Currently, I am operating in **mock responder mode**. I can still read live database records. Try asking me:\n` +
      `- *"Show my active requests"* (to fetch device requests)\n` +
      `- *"List my assigned assets"* (to fetch assigned devices)`;
  }

  return json({ text: textResponse });
}
