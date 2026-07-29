import { getTenantSql, json, error, corsPreflight, parseBody } from '../_lib/db';
import { requireAuth, type AuthUser } from '../_lib/auth';
import { resolveEmployeeIdByLoginEmail } from '../_lib/employee-auth';
import {
  getHrPolicy,
  listLeaveTypes,
  mockHrAnswer,
  searchHrPolicies,
  type HrPolicyDoc,
  type LeaveTypeDoc,
} from '../_lib/hr-policy-chat';

export const config = { runtime: 'edge' };

/** Free-tier Flash model (override with GEMINI_MODEL). */
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function resolveEmployeeId(auth: AuthUser): Promise<string | null> {
  const sql = await getTenantSql(auth.tenantId!);

  if (auth.employeeId && isUuid(auth.employeeId)) {
    return auth.employeeId;
  }

  try {
    return await resolveEmployeeIdByLoginEmail(sql, auth.tenantId!, auth.email);
  } catch {
    return null;
  }
}

// Database Tool Helpers
async function listMyRequests(employeeId: string, tenantId: string) {
  const sql = await getTenantSql(tenantId);
  const rows = await sql`
    SELECT id, request_type as "requestType", category, description, needed_by as "neededBy", status, created_at as "createdAt"
    FROM asset_requests
    WHERE tenant_id = ${tenantId} AND employee_id = ${employeeId}
    ORDER BY created_at DESC
  `;
  return { requests: rows };
}

async function listMyAssets(employeeId: string, tenantId: string) {
  const sql = await getTenantSql(tenantId);
  const rows = await sql`
    SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
    FROM assets
    WHERE tenant_id = ${tenantId} AND assigned_employee_id = ${employeeId}
  `;
  return { assets: rows };
}

async function submitDeviceRequest(employeeId: string, tenantId: string, args: { requestType: string; category: string; description: string; neededBy?: string }) {
  const sql = await getTenantSql(tenantId);
  const neededBy = args.neededBy || null;
  const rows = (await sql`
    INSERT INTO asset_requests (
      tenant_id, employee_id, request_type, category, description, needed_by, status
    ) VALUES (
      ${tenantId}, ${employeeId}, ${args.requestType}, ${args.category}, ${args.description}, ${neededBy}, 'submitted'
    )
    RETURNING id, request_type as "requestType", category, description, needed_by as "neededBy", status, created_at as "createdAt"
  `) as any[];
  return { success: true, request: rows[0] };
}

async function listAllRequests(tenantId: string) {
  const sql = await getTenantSql(tenantId);
  const rows = await sql`
    SELECT r.id, r.request_type as "requestType", r.category, r.description, r.needed_by as "neededBy", r.status, r.created_at as "createdAt",
           e.first_name || ' ' || e.last_name as "employeeName", e.email as "employeeEmail"
    FROM asset_requests r
    JOIN employees e ON e.id = r.employee_id
    WHERE r.tenant_id = ${tenantId}
    ORDER BY r.created_at DESC
    LIMIT 20
  `;
  return { requests: rows };
}

async function searchAssets(tenantId: string, args: { query?: string; category?: string; status?: string }) {
  const sql = await getTenantSql(tenantId);
  let rows;
  const category = args.category || null;
  const status = args.status || null;
  const textQuery = args.query ? `%${args.query}%` : null;

  if (textQuery && category && status) {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${tenantId} AND category = ${category} AND status = ${status}
        AND (name ILIKE ${textQuery} OR asset_tag ILIKE ${textQuery} OR serial_number ILIKE ${textQuery})
      LIMIT 15
    `;
  } else if (category && status) {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${tenantId} AND category = ${category} AND status = ${status}
      LIMIT 15
    `;
  } else if (textQuery) {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${tenantId} 
        AND (name ILIKE ${textQuery} OR asset_tag ILIKE ${textQuery} OR serial_number ILIKE ${textQuery})
      LIMIT 15
    `;
  } else {
    rows = await sql`
      SELECT id, name, asset_tag as "assetTag", category, status, serial_number as "serialNumber"
      FROM assets
      WHERE tenant_id = ${tenantId}
      LIMIT 15
    `;
  }
  return { assets: rows };
}

async function executeTool(
  name: string,
  args: any,
  role: string,
  employeeId: string | null,
  tenantId: string,
  hrPolicies: HrPolicyDoc[] | undefined,
  leavePolicies: LeaveTypeDoc[] | undefined,
) {
  try {
    if (name === 'list_my_requests') {
      if (!employeeId) return { error: 'No employee record found.' };
      return await listMyRequests(employeeId, tenantId);
    }
    if (name === 'list_my_assets') {
      if (!employeeId) return { error: 'No employee record found.' };
      return await listMyAssets(employeeId, tenantId);
    }
    if (name === 'submit_device_request') {
      if (!employeeId) return { error: 'No employee record found.' };
      return await submitDeviceRequest(employeeId, tenantId, args);
    }
    if (name === 'list_all_requests') {
      if (role === 'employee') return { error: 'Unauthorized' };
      return await listAllRequests(tenantId);
    }
    if (name === 'search_assets') {
      if (role === 'employee') return { error: 'Unauthorized' };
      return await searchAssets(tenantId, args);
    }
    if (name === 'search_hr_policies') {
      return searchHrPolicies(hrPolicies, args?.query || '', 3);
    }
    if (name === 'get_hr_policy') {
      return getHrPolicy(hrPolicies, args?.idOrTitle || '');
    }
    if (name === 'list_leave_types') {
      return listLeaveTypes(leavePolicies);
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
  if (!auth.tenantId! && auth.role !== 'platform_admin') return error('Tenant ID is required', 400);
  if (auth instanceof Response) return auth;

  const employeeId = await resolveEmployeeId(auth);
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const body = await parseBody<{
      message: string;
      history?: any[];
      currentPath?: string;
      hrPolicies?: HrPolicyDoc[];
      leavePolicies?: LeaveTypeDoc[];
    }>(req);
    const userMessage = body.message;
    const history = body.history || [];
    const currentPath = body.currentPath || '/';
    const hrPolicies = body.hrPolicies;
    const leavePolicies = body.leavePolicies;
    const isHrContext = currentPath.startsWith('/hr');

    if (!userMessage) return error('message is required', 400);

    // Fallback: If no Gemini API Key is configured, return mock responses
    if (!apiKey) {
      return handleMockMode(userMessage, auth, employeeId, currentPath, hrPolicies, leavePolicies);
    }

    // Construct history for Gemini API
    // Gemini API history expects format: { role: 'user'|'model', parts: [{ text: string }] }
    const contents = history.map((h: any) => ({
      role: h.role === 'ai' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const hrPolicyInstructions = `
HR POLICY & LEAVE Q&A (use free-tier tools — do not invent rules):
- For questions about company policy, leave, WFH, expenses, conduct, safety, or harassment, you MUST call search_hr_policies and/or get_hr_policy / list_leave_types.
- Answer ONLY from tool results (documents published in the HR portal). If tools return nothing relevant, say you don't know and point to /hr/policies.
- Always cite policy title and version. Mention employees can open [HR Policies](/hr/policies).
- Chatting is NOT policy acknowledgement. Do not approve leave requests; guide users to /hr/leaves to apply.
- Keep answers concise to stay within free-tier token limits.`;

    const systemInstructionText = auth.role === 'employee'
      ? `You are Assetly AI, a virtual assistant for employee self-service.
You are helping the employee who is currently viewing the page: ${currentPath}.
You can help employees query their assigned hardware/assets or view their submitted device requests.
You can also submit new requests on their behalf.
When they request a device, replacement, or accessory, use the 'submit_device_request' tool.
${hrPolicyInstructions}
Provide clear, conversational answers. Keep formatting clean.

CRITICAL JSON FORMATTING RULES:
If you are displaying a list of assets or requests (either retrieved from a tool or query), you MUST append a JSON block at the end of your response, wrapped in a single \`\`\`json ... \`\`\` code block, representing the raw data in this schema:
For assets: {"type": "assets", "items": [{"id": "...", "name": "...", "assetTag": "...", "category": "...", "status": "...", "serialNumber": "..."}]}
For requests: {"type": "requests", "items": [{"id": "...", "category": "...", "requestType": "...", "description": "...", "status": "...", "createdAt": "..."}]}`
      : `You are Assetly Copilot for IT Administrators and HR.
You are helping the user who is currently viewing the page: ${currentPath}.
You can search assets in the inventory or review submitted device requests.
When queried about requests, list them. If asked about assets, use search_assets.
${hrPolicyInstructions}
${isHrContext ? 'The user is in the HR module — prefer HR policy / leave tools when relevant.' : ''}

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
          },
          {
            name: 'search_hr_policies',
            description: 'Search active company HR policies published in the portal (leave, WFH, conduct, expenses, safety, etc.). Use for any HR policy or leave-rules question.',
            parameters: {
              type: 'OBJECT',
              properties: {
                query: {
                  type: 'STRING',
                  description: 'Keywords from the employee question, e.g. "sick leave medical certificate", "WFH days", "expense limits".',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_hr_policy',
            description: 'Fetch the full text of one active HR policy by id or title.',
            parameters: {
              type: 'OBJECT',
              properties: {
                idOrTitle: {
                  type: 'STRING',
                  description: 'Policy id (e.g. cpol-005) or title fragment (e.g. Leave & Time-Off).',
                },
              },
              required: ['idOrTitle'],
            },
          },
          {
            name: 'list_leave_types',
            description: 'List leave type allowances (Annual, Sick, Casual, Maternity, Paternity) with max days from the HR leave policies tab.',
          },
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

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: ${errText}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = (await res.json()) as any;
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
        const toolResult = await executeTool(
          name,
          args,
          auth.role,
          employeeId,
          auth.tenantId!,
          hrPolicies,
          leavePolicies,
        );

        currentContents.push({
          role: 'function',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parts: [{
            functionResponse: {
              name,
              response: toolResult
            }
          }] as any,
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
async function handleMockMode(
  message: string,
  auth: AuthUser,
  employeeId: string | null,
  currentPath: string,
  hrPolicies?: HrPolicyDoc[],
  leavePolicies?: LeaveTypeDoc[],
) {
  const text = message.toLowerCase();

  const hrAnswer = mockHrAnswer(message, hrPolicies, leavePolicies);
  if (hrAnswer) {
    return json({ text: hrAnswer });
  }

  let textResponse = '';
  
  if (text.includes('status') || text.includes('request')) {
    if (auth.role === 'employee' && employeeId) {
      const data = await listMyRequests(employeeId, auth.tenantId!);
      if ((data.requests as any[]).length === 0) {
        textResponse = `You don't have any submitted device requests at the moment. You can submit one in the Request form above!`;
      } else {
        textResponse = `Here are your recent device requests:\n\n\`\`\`json\n${JSON.stringify({ type: 'requests', items: data.requests })}\n\`\`\``;
      }
    } else {
      const data = await listAllRequests(auth.tenantId!);
      textResponse = `Here are the organization's device requests (IT Admin view):\n\n\`\`\`json\n${JSON.stringify({ type: 'requests', items: data.requests })}\n\`\`\``;
    }
  } else if (text.includes('asset') || text.includes('device') || text.includes('laptop') || text.includes('hardware')) {
    if (auth.role === 'employee' && employeeId) {
      const data = await listMyAssets(employeeId, auth.tenantId!);
      if ((data.assets as any[]).length === 0) {
        textResponse = `You don't have any corporate hardware assets assigned to you at the moment.`;
      } else {
        textResponse = `Here are the corporate assets assigned to you:\n\n\`\`\`json\n${JSON.stringify({ type: 'assets', items: data.assets })}\n\`\`\``;
      }
    } else {
      textResponse = `As an Administrator, you can view the Asset inventory in the [Assets list](/assets) or search devices using standard dashboard tools. Configure the \`GEMINI_API_KEY\` in your \`.env\` file to enable natural language AI search!`;
    }
  } else if (text.includes('page') || text.includes('where am i')) {
    textResponse = `You are currently viewing the **${currentPath}** route of the Assetly application. Let me know if you need help navigating or finding information related to this page!`;
  } else {
    textResponse = `Hello **${auth.firstName}**! I'm the **Assetly AI Assistant**.\n\n` +
      `To activate full natural language capabilities, please add a \`GEMINI_API_KEY\` to your \`.env\` file (free Gemini tier works).\n\n` +
      `Currently, I am operating in **mock responder mode**. Try asking me:\n` +
      `- *"How many sick leave days do I get?"*\n` +
      `- *"What is the remote work policy?"*\n` +
      `- *"Show my active requests"*`;
  }

  return json({ text: textResponse });
}
