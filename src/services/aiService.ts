import { GoogleGenAI } from '@google/genai';

const PROXY_BASE = 'https://pollinations-proxy.spritenguyen.workers.dev';
const DIRECT_TEXT_BASE = 'https://text.pollinations.ai';
const DIRECT_IMAGE_BASE = 'https://image.pollinations.ai';

export interface AIConfig {
  useGoogleAI: boolean;
  googleApiKey: string;
}

export interface CharacterProfile {
  name: string;
  bio: string;
  bodyStats: string;
  visualPrompt: string;
}

export interface AutoScoutProfile extends CharacterProfile {
  initialMessage: string;
}

export interface ProfileResult {
  profile: CharacterProfile;
  source: string;
}

export interface AutoScoutResult {
  profile: AutoScoutProfile;
  source: string;
}

async function fetchWithFallback(endpoints: string[], options: RequestInit): Promise<{ res: Response, url: string }> {
  let lastError = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return { res, url };
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("All endpoints failed");
}

/**
 * Generic content generation with Google AI and Pollinations fallback
 */
async function callLLM(systemPrompt: string, userMessage: string, config: AIConfig, history: any[] = []): Promise<{ text: string, source: string }> {
  if (config.useGoogleAI && config.googleApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
      const modelName = 'gemini-3.1-flash-lite-preview';
      
      let contents;
      if (history.length > 0) {
        contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'OK.' }] },
          ...history.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }]}
        ];
      } else {
        contents = `${systemPrompt}\n\nUser: ${userMessage}`;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: { 
          responseMimeType: "application/json",
          temperature: 0.9
        }
      });
      return { text: response.text || "{}", source: 'Google Gemini 3.1 Flash Lite' };
    } catch (e) {
      console.error("[Cine-Tech AI] Google AI failed falling back...", e);
    }
  }

  const messagesPayload = history.length > 0 
    ? [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: userMessage }]
    : [{ role: 'user', content: `${systemPrompt}\n\n${userMessage}` }];

  const endpoints = [`${PROXY_BASE}/openai`, `${DIRECT_TEXT_BASE}/openai` ];

  try {
    const { res, url } = await fetchWithFallback(endpoints, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messagesPayload,
        model: 'openai',
        jsonMode: true,
        temperature: 0.8
      })
    });
    
    const data = await res.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const source = url.includes(PROXY_BASE) ? 'Pollinations.ai (Proxy)' : 'Pollinations.ai (Direct)';
    return { text: jsonMatch ? jsonMatch[0] : content, source };
  } catch (e) {
    throw e;
  }
}

export async function autoScoutCharacter(gameContext: { fame: number, rosterCount: number }, config: AIConfig): Promise<AutoScoutResult> {
  const systemPrompt = `Bạn là hệ thống AI phản ứng theo ngữ cảnh của game Cine-Tech. Giám đốc Casting đang dùng Tính Năng 'Tuyển Trạch Viên Tự Động'. 
Ngữ cảnh Game hiện tại: Danh tiếng Studio: ${gameContext.fame} điểm. Số người mẫu hiện có: ${gameContext.rosterCount}.

Hãy TỰ ĐỘNG nội suy và nghĩ ra MỘT nhân vật (diễn viên/người mẫu có thật hoặc giả tưởng pha trộn thực tế) đang chủ động xin việc tại Studio. Ngữ cảnh của họ phải phù hợp với danh tiếng hiện tại.

Yêu cầu xuất ra JSON chính xác:
{ 
  "name": "Tên nhân vật", 
  "bio": "Tiểu sử/Phong cách chi tiết, mạch lạc", 
  "bodyStats": "Chiều cao, cân nặng, số đo, đặc điểm ngoại hình...",
  "visualPrompt": "Prompt tiếng Anh ngắn gọn, cực kì chi tiết về khuôn mặt, màu da, biểu cảm, ánh sáng mang tính điện ảnh.",
  "initialMessage": "Lời nhắn đầu tiên đầy cá tính mà người này gửi cho Giám đốc Casting qua tin nhắn xin việc."
}`;

  try {
    const { text, source } = await callLLM(systemPrompt, "Hãy tạo ứng viên tự động cho tôi.", config);
    return { profile: JSON.parse(text), source };
  } catch (e) {
    console.error("[Cine-Tech AI] AutoScout failed:", e);
    return {
      profile: {
        name: "Lỗi Kết Nối",
        bio: "Không thể nhận diện danh tính...",
        bodyStats: "Không rõ",
        visualPrompt: "cinematic portrait, error glitch effect, cyberpunk fashion",
        initialMessage: "Tín hiệu bị nhiễu. Tôi không thể kết nối đến studio lúc này..."
      },
      source: 'Error Fallback'
    };
  }
}

export async function generateProfile(prompt: string, config: AIConfig): Promise<ProfileResult> {
  const systemPrompt = `Bạn là một Giám đốc Casting chuyên nghiệp cấp cao. Dựa trên yêu cầu của người chơi, hãy nội suy, tìm kiếm và hòa trộn thông tin từ những người mẫu/diễn viên có thật trên thế giới để tạo ra tiểu sử cho MỘT nhân vật mới siêu thực tế.
Yêu cầu đầu ra chỉ chứa JSON cấu trúc:
{ 
  "name": "Tên nhân vật", 
  "bio": "Tiểu sử/Phong cách chi tiết, mạch lạc, mang tính điện ảnh/thời trang", 
  "bodyStats": "Chiều cao, cân nặng, số đo 3 vòng, nhóm máu, đặc điểm cơ thể",
  "visualPrompt": "Prompt tiếng Anh chi tiết khuôn mặt, biểu cảm, ánh sáng. Không quá 50 từ." 
}`;

  try {
    const userReq = prompt || "Một siêu mẫu ngẫu nhiên mang vẻ đẹp điện ảnh và phong cách độc nhất.";
    const { text, source } = await callLLM(systemPrompt, userReq, config);
    return { profile: JSON.parse(text), source };
  } catch (e) {
    console.error("[Cine-Tech AI] Text Generation failed:", e);
    return {
      profile: {
        name: "Dự án Không Tên",
        bio: "Một gương mặt bí ẩn chưa được khai phá...",
        bodyStats: "Không rõ",
        visualPrompt: "cinematic portrait, mysterious fashion model, dramatic lighting, highly detailed face"
      },
      source: 'Error Fallback'
    };
  }
}

export async function generateImageBlobUrl(visualPrompt: string): Promise<{ url: string, source: string }> {
  const enhancedPrompt = `${visualPrompt}, high-end fashion photography, vogue editorial, hasselblad, 8k resolution, cinematic dramatic lighting, photorealistic, ultra detailed skin texture`;
  const encoded = encodeURIComponent(enhancedPrompt);
  
  const endpoints = [
    `${PROXY_BASE}/prompt/${encoded}?width=768&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`,
    `${DIRECT_IMAGE_BASE}/prompt/${encoded}?width=768&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`
  ];

  const { res, url } = await fetchWithFallback(endpoints, { method: 'GET' });
  const blob = await res.blob();
  const source = url.includes(PROXY_BASE) ? 'Pollinations.ai (Proxy)' : 'Pollinations.ai (Direct)';
  return { url: URL.createObjectURL(blob), source };
}

export async function chatWithCharacter(
  message: string, 
  history: { role: string, content: string }[], 
  character: CharacterProfile,
  config: AIConfig
): Promise<{ text: string, action?: string, locationId?: string, source: string }> {
  const { CITY_LOCATIONS } = await import('../store');
  const locInfo = CITY_LOCATIONS.map(l => `- ${l.name} (id: ${l.id})`).join('\n');

  const systemPrompt = `Bạn tên là ${character.name}.
Tiểu sử: ${character.bio}
Thông tin hình thể: ${character.bodyStats}

Bạn đang trò chuyện với Sếp.
Địa điểm sếp có thể phân công bạn đi làm:
${locInfo}

QUY TẮC: Giao tiếp tự nhiên, cá tính. Trả về JSON:
{
  "reply": "Lời nhắn.",
  "action": "assign_job" hoặc "none",
  "locationId": "id_địa_điểm (nếu có)"
}`;

  try {
    const formattedHistory = history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content }));
    const { text, source } = await callLLM(systemPrompt, message, config, formattedHistory);
    const parsed = JSON.parse(text);
    return { text: parsed.reply || "...", action: parsed.action, locationId: parsed.locationId, source };
  } catch (e) {
    console.error("[Cine-Tech AI] Chat failed:", e);
    return { text: "Xin lỗi sếp, tín hiệu truyền thông của em đang hơi chập chờn...", source: 'Error Fallback' };
  }
}
