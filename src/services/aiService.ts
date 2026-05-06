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

async function fetchWithFallback(endpoints: string[], options: RequestInit, isImage = false): Promise<{ res: Response, url: string }> {
  let lastError = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return { res, url };
      console.warn(`[AI] Endpoint ${url} failed with status ${res.status}`);
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn(`[AI] Endpoint ${url} failed routing:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error("All endpoints failed");
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

  if (config.useGoogleAI && config.googleApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: systemPrompt,
        config: { 
          responseMimeType: "application/json",
          temperature: 0.9
        }
      });
      const text = response.text || "{}";
      return { profile: JSON.parse(text), source: 'Google Gemini 3.1 Flash Lite' };
    } catch (e) {
      console.error("[Cine-Tech AI] Google AI failed auto-scout...", e);
    }
  }

  const endpoints = [
    `${PROXY_BASE}/openai`,
    `${DIRECT_TEXT_BASE}/openai`
  ];

  try {
    const { res, url } = await fetchWithFallback(endpoints, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: systemPrompt }],
        model: 'openai',
        jsonMode: true,
        temperature: 0.8
      })
    });
    
    const data = await res.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const apiSource = url.includes(PROXY_BASE) ? 'Pollinations.ai (Proxy)' : 'Pollinations.ai (Direct)';
    return { profile: JSON.parse(jsonMatch ? jsonMatch[0] : content), source: apiSource };
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
Yêu cầu đầu ra chỉ chứa JSON với cấu trúc chính xác như sau, không có markdown hoặc text thừa:
{ 
  "name": "Tên nhân vật", 
  "bio": "Tiểu sử/Phong cách chi tiết, mạch lạc, mang tính điện ảnh/thời trang", 
  "bodyStats": "Thông tin hình thể như chiều cao, cân nặng, số đo 3 vòng, nhóm máu, đặc điểm cơ thể nổi bật",
  "visualPrompt": "Prompt tiếng Anh ngắn gọn, cực kì chi tiết về khuôn mặt, màu da, biểu cảm, trang phục, bố cục và ánh sáng mang tính điện ảnh. Không quá 50 từ." 
}

Yêu cầu người dùng (nếu trống hãy tự do sáng tạo một người mẫu ngẫu nhiên độc đáo):
${prompt || "Một siêu mẫu ngẫu nhiên mang vẻ đẹp điện ảnh và phong cách độc nhất."}`;

  if (config.useGoogleAI && config.googleApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: systemPrompt,
        config: { 
          responseMimeType: "application/json",
          temperature: 0.9
        }
      });
      const text = response.text || "{}";
      return { profile: JSON.parse(text), source: 'Google Gemini 3.1 Flash Lite' };
    } catch (e) {
      console.error("[Cine-Tech AI] Google AI failed, falling back...", e);
    }
  }

  // Fallback to Pollinations Text via Proxy, then Direct
  const endpoints = [
    `${PROXY_BASE}/openai`,
    `${DIRECT_TEXT_BASE}/openai`
  ];

  try {
    const { res, url } = await fetchWithFallback(endpoints, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: systemPrompt }],
        model: 'openai',
        jsonMode: true,
        temperature: 0.8
      })
    });
    
    const data = await res.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const apiSource = url.includes(PROXY_BASE) ? 'Pollinations.ai (Proxy)' : 'Pollinations.ai (Direct)';
    return { profile: JSON.parse(jsonMatch ? jsonMatch[0] : content), source: apiSource };
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
  
  // Try proxy first, then direct
  const endpoints = [
    `${PROXY_BASE}/prompt/${encoded}?width=768&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`,
    `${DIRECT_IMAGE_BASE}/prompt/${encoded}?width=768&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`
  ];

  const { res, url } = await fetchWithFallback(endpoints, { method: 'GET' }, true);
  const blob = await res.blob();
  const apiSource = url.includes(PROXY_BASE) ? 'Pollinations.ai (Proxy)' : 'Pollinations.ai (Direct)';
  return { url: URL.createObjectURL(blob), source: apiSource };
}

export async function chatWithCharacter(
  message: string, 
  history: { role: string, content: string }[], 
  character: CharacterProfile,
  config: AIConfig
): Promise<{ text: string, action?: string, locationId?: string, source: string }> {
  const { CITY_LOCATIONS } = await import('../store');
  const locInfo = CITY_LOCATIONS.map(l => `- ${l.name} (mã: ${l.id})`).join('\n');

  const systemPrompt = `Bạn là ${character.name}, người mẫu/diễn viên tại Cine-Tech Studio.
Tiểu sử/Ngữ cảnh: ${character.bio}
Thông tin hình thể: ${character.bodyStats}

Bạn đang nhắn tin với Sếp (Giám đốc Casting).
Danh sách địa điểm sếp có thể phân công bạn đến làm việc:
${locInfo}

QUY TẮC BẮT BUỘC (QUAN TRỌNG NHẤT): 
Lần này bạn KHÔNG trả lời bằng văn bản thường. Bạn PHẢI trả về ĐÚNG 1 ĐỐI TƯỢNG JSON DUY NHẤT.

CẤU TRÚC JSON cần trả về:
{
  "reply": "Lời nhắn tự nhiên, đúng cá tính nhân vật (ngắn gọn).",
  "action": "assign_job" (nếu sếp bảo đi làm) HOẶC "none" (nếu sếp chỉ tán gẫu/hỏi thăm),
  "locationId": "mã_địa_điểm" (chỉ ghi mã địa điểm nếu có hành động assign_job, ví dụ "quán bar thì ghi neon_bar", "studio thì ghi cine_studio")
}
`;

  const userHistory = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'assistant',
    content: h.content
  }));

  if (config.useGoogleAI && config.googleApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: '{"reply": "Vâng sếp, em sẽ trả về JSON.", "action": "none"}' }] },
          ...userHistory.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: message }]}
        ],
        config: { 
          responseMimeType: "application/json",
          temperature: 0.8
        }
      });
      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return { text: parsed.reply || "...", action: parsed.action, locationId: parsed.locationId, source: 'Google Gemini 3.1 Flash Lite' };
    } catch (e) {
      console.error("[Cine-Tech AI] Google AI Chat failed, falling back...", e);
    }
  }

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
    { role: 'user', content: message }
  ];

  const endpoints = [
    `${PROXY_BASE}/openai`,
    `${DIRECT_TEXT_BASE}/openai`
  ];

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
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    
    const apiSource = url.includes(PROXY_BASE) ? 'Pollinations.ai (Proxy)' : 'Pollinations.ai (Direct)';
    return { text: parsed.reply || "...", action: parsed.action, locationId: parsed.locationId, source: apiSource };
  } catch (e) {
    console.error("[Cine-Tech AI] Chat failed:", e);
    return { text: "*Mỉm cười khó xử* Xin lỗi sếp, tín hiệu truyền thông của em đang hơi chập chờn...", source: 'Error Fallback' };
  }
}
