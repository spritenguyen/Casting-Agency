import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Check, Info } from 'lucide-react';
import { Dialog } from './Dialog';
import { AIConfig } from '../services/aiService';

interface SettingsProps {
  config: AIConfig;
  updateConfig: (config: Partial<AIConfig>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ config, updateConfig, isOpen, onClose }: SettingsProps) {
  const [localKey, setLocalKey] = useState(config.googleApiKey);
  const [useGoogle, setUseGoogle] = useState(config.useGoogleAI);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    updateConfig({ useGoogleAI: useGoogle, googleApiKey: localKey });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Cài đặt Hệ thống AI">
      <div className="space-y-6">
        {/* API Settings Section */}
        <section className="space-y-4">
          <h3 className="text-amber-500 font-medium flex items-center gap-2">
            <Shield size={18} /> API Google GenAI (Tùy chọn)
          </h3>
          <p className="text-sm text-neutral-400">
            Trò chơi sử dụng Pollinations.ai (qua proxy) làm mặc định để nội suy hồ sơ (miễn phí). 
            Nếu bạn muốn độ chính xác nội suy cao hơn, hãy nhập Google Gemini API Key của bạn (sử dụng model gemini-3.1-flash-lite-preview).
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseGoogle(!useGoogle)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useGoogle ? 'bg-amber-500' : 'bg-neutral-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useGoogle ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium">Bật/Tắt Google AI nội suy</span>
          </div>

          <div className={`space-y-2 transition-all ${useGoogle ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold">Gemini API Key</label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors flex justify-center items-center gap-2"
          >
            {showSaved ? <><Check size={16} className="text-green-400" /> Đã lưu</> : 'Lưu cấu hình'}
          </button>
        </section>

        <hr className="border-neutral-800" />

        {/* Instructions Section */}
        <section className="space-y-4">
          <h3 className="text-amber-500 font-medium flex items-center gap-2">
            <Info size={18} /> Hướng dẫn & Phiên bản
          </h3>
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto thin-scrollbar">
            <div>
              <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded inline-block mb-1 font-mono">v1.1 (Mới nhất)</span>
              <p className="text-sm text-neutral-300">- Cơ chế tự động chuyển đổi API hình ảnh/văn bản khi Proxy gặp lỗi.</p>
              <p className="text-sm text-neutral-300">- Tích hợp lựa chọn Gemini 3.1 Flash Lite thay thế.</p>
            </div>
            <div>
              <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded inline-block mb-1 font-mono">v1.0</span>
              <p className="text-sm text-neutral-300">- Khởi tạo studio nhiếp ảnh điện ảnh Cine-Tech.</p>
              <p className="text-sm text-neutral-300">- Tính năng tạo nhân vật dựa trên mô tả ngắn.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <h4 className="font-semibold text-sm mb-2 text-neutral-200">Cách chơi:</h4>
              <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                <li>Nhập mô tả về ngoại hình/phong cách của người mẫu bạn muốn tìm kiếm (vd: "Nam người mẫu 25 tuổi, lai Việt-Pháp, phong cách đường phố").</li>
                <li>AI sẽ nội suy dữ liệu thực tế để tạo ra một hồ sơ hoàn chỉnh.</li>
                <li>Hệ thống vẽ hình ảnh siêu thực (Photorealistic) tương ứng với hồ sơ.</li>
                <li>Lưu người mẫu vào danh sách Casting Roster của bạn.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
