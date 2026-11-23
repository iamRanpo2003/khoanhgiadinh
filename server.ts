import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import type { ArchivalRecord, QAResponse, TranscribeResponse, TuLieuDataset } from './src/types/archive.ts';
import { ARCHIVAL_SOURCES } from './src/data/sources.ts';
import {
  finalizeQAResponse,
  getOfficialSuggestedSources,
  sanitizeRecordForPublicContext,
  sanitizeSecretPatterns,
  validateImportedDataset,
} from './src/utils/archiveLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const TULIEU_PATH = path.join(ROOT_DIR, 'tulieu.json');
const IMAGE_DIR = path.join(ROOT_DIR, 'anh_tu_lieu');
const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isServiceUnavailableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  return msg.includes('"code":503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');
}

async function generateWithFallback(
  ai: GoogleGenAI,
  request: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>
) {
  try {
    return await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      ...request,
    });
  } catch (err) {
    if (isServiceUnavailableError(err)) {
      return await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        ...request,
      });
    }
    throw err;
  }
}

async function readTuLieuFile(): Promise<TuLieuDataset> {
  const raw = await fs.readFile(TULIEU_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  const validation = validateImportedDataset(parsed);
  if (!validation.valid || !validation.dataset) {
    throw new Error(validation.error || 'Tệp tulieu.json không hợp lệ.');
  }
  return validation.dataset;
}

async function writeTuLieuFile(dataset: TuLieuDataset): Promise<void> {
  const serialized = JSON.stringify(dataset, null, 2) + '\n';
  await fs.writeFile(TULIEU_PATH, serialized, 'utf-8');
}

function sanitizeImageFilename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || `tu_lieu_${Date.now()}.jpg`;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  await fs.mkdir(IMAGE_DIR, { recursive: true });
  app.use('/anh_tu_lieu', express.static(IMAGE_DIR));

  app.get('/api/tulieu', async (_req, res) => {
    try {
      const dataset = await readTuLieuFile();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json(dataset);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Không thể đọc tệp tulieu.json.',
      });
    }
  });

  app.get('/api/tulieu/export', async (_req, res) => {
    try {
      const raw = await fs.readFile(TULIEU_PATH, 'utf-8');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="tulieu.json"');
      res.send(raw);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Không thể xuất tệp tulieu.json.',
      });
    }
  });

  app.post('/api/tulieu/import', async (req, res) => {
    try {
      const validation = validateImportedDataset(req.body);
      if (!validation.valid || !validation.dataset) {
        return res.status(400).json({ error: validation.error });
      }
      validation.dataset.metadata_chuan.trang_thai_du_lieu =
        validation.dataset.ban_ghi.length > 0
          ? `Đã nạp ${validation.dataset.ban_ghi.length} bản ghi tư liệu thật`
          : 'Cấu trúc rỗng sẵn sàng nạp dữ liệu thật';
      await writeTuLieuFile(validation.dataset);
      return res.json(validation.dataset);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Lỗi khi nhập dữ liệu tulieu.json.',
      });
    }
  });

  app.post('/api/tulieu/records', async (req, res) => {
    try {
      const { record, uploadedImages } = req.body as {
        record?: ArchivalRecord;
        uploadedImages?: Array<{
          filename: string;
          dataUrl: string;
          loai_khung: 'toan_trang' | 'can_canh';
          chu_thich: string;
          nguon: string;
        }>;
      };

      if (!record || !record.dc_title?.trim() || !record.noi_luu_giu_hien_nay?.trim()) {
        return res.status(400).json({
          error: 'Vui lòng điền tối thiểu Nhan đề tư liệu (dc:title) và Nơi lưu giữ hiện nay.',
        });
      }

      const dataset = await readTuLieuFile();
      const savedImages = Array.isArray(record.danh_sach_tep_anh) ? [...record.danh_sach_tep_anh] : [];

      if (Array.isArray(uploadedImages)) {
        for (const img of uploadedImages) {
          const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/.exec(img.dataUrl || '');
          if (!match) continue;
          const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
          const safeName = `${Date.now()}_${sanitizeImageFilename(img.filename.replace(/\.[^.]+$/, ''))}.${ext}`;
          const targetPath = path.join(IMAGE_DIR, safeName);
          await fs.writeFile(targetPath, Buffer.from(match[2], 'base64'));
          savedImages.push({
            duong_dan: `/anh_tu_lieu/${safeName}`,
            loai_khung: img.loai_khung === 'can_canh' ? 'can_canh' : 'toan_trang',
            chu_thich: img.chu_thich || '',
            nguon: img.nguon || record.dc_source || record.noi_luu_giu_hien_nay,
          });
        }
      }

      const identifier = record.dc_identifier?.trim() || record.so_dang_ky?.trim() || `GD-${Date.now()}`;
      const normalizedRecord: ArchivalRecord = {
        ...dataset.mau_ban_ghi_rong,
        ...record,
        dc_identifier: identifier,
        so_dang_ky: record.so_dang_ky?.trim() || identifier,
        danh_sach_tep_anh: savedImages,
      };

      const existingIdx = dataset.ban_ghi.findIndex(
        (item) => item.dc_identifier === normalizedRecord.dc_identifier
      );
      if (existingIdx >= 0) {
        dataset.ban_ghi[existingIdx] = normalizedRecord;
      } else {
        dataset.ban_ghi.unshift(normalizedRecord);
      }

      dataset.metadata_chuan.trang_thai_du_lieu = `Đã nạp ${dataset.ban_ghi.length} bản ghi tư liệu thật`;
      await writeTuLieuFile(dataset);

      return res.json({ record: normalizedRecord, dataset });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Không thể lưu bản ghi mới.',
      });
    }
  });

  app.post('/api/qa', async (req, res) => {
    try {
      const { question } = req.body as { question?: string };
      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi cần tra cứu.' });
      }

      const dataset = await readTuLieuFile();
      if (dataset.ban_ghi.length === 0) {
        const emptyResponse: QAResponse = {
          answer:
            'Ứng dụng chưa có thông tin này vì tệp tulieu.json hiện chưa có bản ghi nào. Bạn có thể tra cứu trước tại các nguồn chính thống được gợi ý bên dưới.',
          hasMatch: false,
          citations: [],
          usedSources: ['Kho dữ liệu tulieu.json (0 bản ghi)'],
          suggestedSources: getOfficialSuggestedSources(ARCHIVAL_SOURCES, 4),
          totalRecordsChecked: 0,
        };
        return res.json(emptyResponse);
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Chưa cấu hình biến môi trường GEMINI_API_KEY trên máy chủ để thực hiện hỏi đáp.',
        });
      }

      const groundedContext = dataset.ban_ghi.map((rec) => sanitizeRecordForPublicContext(rec));
      const officialLookupCatalog = ARCHIVAL_SOURCES.map((src) => ({
        title: src.title,
        issuer: src.issuer,
        year: src.year,
        category: src.category,
        url: src.url,
      }));

      const response = await generateWithFallback(ai, {
        contents: `DỮ LIỆU TƯ LIỆU TRONG ỨNG DỤNG (tulieu.json - đã ẩn phần không công bố):\n${JSON.stringify(
          groundedContext,
          null,
          2
        )}\n\nDANH MỤC NGUỒN CHÍNH THỐNG TRONG ỨNG DỤNG:\n${JSON.stringify(
          officialLookupCatalog,
          null,
          2
        )}\n\nCÂU HỎI CỦA NGƯỜI DÙNG:\n${question.trim()}`,
        config: {
          systemInstruction:
            'Bạn là trợ lý lưu trữ bảo tàng trả lời câu hỏi bằng tiếng Việt có dấu chuẩn UTF-8. ' +
            'QUY TẮC BẮT BUỘC: ' +
            '1) CHỈ được trả lời dựa trên dữ liệu có sẵn trong tulieu.json và danh mục nguồn chính thống được cung cấp. Tuyệt đối KHÔNG sử dụng kiến thức ngoài dữ liệu này và KHÔNG suy đoán. ' +
            '2) Nếu dữ liệu trong ứng dụng KHÔNG có thông tin để trả lời câu hỏi, bắt buộc bắt đầu câu trả lời đúng cụm từ: "Ứng dụng chưa có thông tin này", đặt hasMatch = false, citations = [], và chọn từ 2 đến 4 nguồn phù hợp nhất từ DANH MỤC NGUỒN CHÍNH THỐNG TRONG ỨNG DỤNG đưa vào mảng suggestedSources (không tự bịa URL ngoài danh mục). ' +
            '3) Nếu tìm thấy thông tin trong tulieu.json, đặt hasMatch = true, bắt buộc nêu rõ mã bản ghi (ma_ban_ghi), nơi lưu giữ hiện nay (noi_luu_giu_hien_nay), loại bản đang hiển thị (loai_ban_dang_hien_thi) và TÊN NGUỒN ĐÃ DÙNG (ten_nguon) cả trong nội dung answer, trong từng phần tử citations, lẫn trong mảng usedSources. ' +
            '4) Không bao giờ tiết lộ hay suy diễn nội dung thuộc phần không công bố hoặc phiên âm chưa kiểm chứng.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description:
                  'Câu trả lời tiếng Việt chuẩn. Nếu không có trong dữ liệu, bắt đầu bằng "Ứng dụng chưa có thông tin này" và gợi ý nguồn chính thống.',
              },
              hasMatch: {
                type: Type.BOOLEAN,
                description: 'true nếu dữ liệu trong ứng dụng có thông tin trả lời, false nếu không có.',
              },
              citations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ma_ban_ghi: { type: Type.STRING },
                    noi_luu_giu: { type: Type.STRING },
                    loai_ban: { type: Type.STRING },
                    ten_nguon: { type: Type.STRING },
                  },
                },
              },
              usedSources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách tên các nguồn đã sử dụng để tạo câu trả lời.',
              },
              suggestedSources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    issuer: { type: Type.STRING },
                    year: { type: Type.STRING },
                    url: { type: Type.STRING },
                  },
                },
                description: 'Gợi ý nguồn chính thống để tra cứu khi hasMatch = false.',
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim()) as Partial<QAResponse>;
      const result = finalizeQAResponse(parsed, dataset.ban_ghi, ARCHIVAL_SOURCES);
      return res.json(result);
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        return res.status(503).json({
          error: 'Dịch vụ Gemini đang quá tải tạm thời. Vui lòng thử lại sau ít giây.',
        });
      }
      const safeMsg = sanitizeSecretPatterns(
        error instanceof Error ? error.message : 'Lỗi máy chủ khi gọi Gemini hỏi đáp.'
      );
      return res.status(500).json({ error: safeMsg });
    }
  });

  app.post('/api/transcribe', async (req, res) => {
    try {
      const { imagePath, imageDataUrl, recordTitle } = req.body as {
        imagePath?: string;
        imageDataUrl?: string;
        recordTitle?: string;
      };

      let mimeType = 'image/jpeg';
      let base64Data = '';

      if (imageDataUrl) {
        const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(imageDataUrl);
        if (!match) {
          return res.status(400).json({ error: 'Dữ liệu ảnh tải lên không đúng định dạng base64 hợp lệ.' });
        }
        mimeType = match[1];
        base64Data = match[2];
      } else if (imagePath && imagePath.startsWith('/anh_tu_lieu/')) {
        const rel = path.basename(imagePath);
        const fullPath = path.join(IMAGE_DIR, rel);
        try {
          const fileBuf = await fs.readFile(fullPath);
          base64Data = fileBuf.toString('base64');
          if (rel.toLowerCase().endsWith('.png')) mimeType = 'image/png';
          else if (rel.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
        } catch {
          return res.status(404).json({ error: 'Không tìm thấy tệp ảnh thật trong thư mục anh_tu_lieu.' });
        }
      } else {
        return res.status(400).json({
          error: 'Chưa có tệp ảnh tư liệu thật để đề xuất phiên âm. Vui lòng chọn hoặc tải ảnh thật lên trước.',
        });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để đề xuất phiên âm.',
        });
      }

      const response = await generateWithFallback(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text:
                `Hãy quan sát kỹ ảnh tư liệu${recordTitle ? ` ("${recordTitle}")` : ''} và thực hiện:\n` +
                '1) Đọc và phiên âm nguyên văn chữ viết tay, chữ đánh máy, con dấu hoặc ghi chú xuất hiện trong ảnh (giữ nguyên dấu/chính tả gốc nếu thấy, phần nào mờ hoặc không đọc được phải ghi rõ "[chưa đọc rõ]"). Tuyệt đối không bịa thêm nội dung không nhìn thấy.\n' +
                '2) Diễn giải / dịch nghĩa ngắn gọn sang tiếng Việt hiện đại (nếu có chữ Hán-Nôm, tiếng Pháp hoặc chữ cũ); nếu chỉ là tiếng Việt rõ nghĩa thì tóm tắt trung thực nội dung chữ đọc được.',
            },
          ],
        },
        config: {
          systemInstruction:
            'Bạn là trợ lý hỗ trợ phiên âm tư liệu bảo tàng. Mọi kết quả chỉ là đề xuất nháp để người kiểm chứng hiệu đính. Không suy đoán hoặc bịa chữ không xuất hiện trong ảnh.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              proposedTranscription: {
                type: Type.STRING,
                description: 'Bản đề xuất phiên âm chữ xuất hiện trên ảnh (ghi [chưa đọc rõ] nếu mờ).',
              },
              proposedTranslation: {
                type: Type.STRING,
                description: 'Bản đề xuất dịch nghĩa hoặc diễn giải trung thực.',
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim()) as {
        proposedTranscription?: string;
        proposedTranslation?: string;
      };

      const payload: TranscribeResponse = {
        proposedTranscription:
          parsed.proposedTranscription || '[Không phát hiện chữ viết rõ ràng trong ảnh]',
        proposedTranslation:
          parsed.proposedTranslation || '[Chưa có nội dung cần dịch nghĩa hoặc cần người kiểm bổ sung]',
        verificationLabel: 'Chưa kiểm',
        autoSaved: false,
        note: 'Kết quả do Gemini đề xuất, gắn nhãn "Chưa kiểm" và không tự động lưu vào tulieu.json. Người kiểm chứng cần rà soát và chỉnh sửa trước khi xác nhận.',
      };

      return res.json(payload);
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        return res.status(503).json({
          error: 'Dịch vụ Gemini đang quá tải tạm thời. Vui lòng thử lại sau ít giây.',
        });
      }
      const safeMsg = sanitizeSecretPatterns(
        error instanceof Error ? error.message : 'Lỗi máy chủ khi đề xuất phiên âm.'
      );
      return res.status(500).json({ error: safeMsg });
    }
  });

  const distDir = path.join(ROOT_DIR, 'dist');
  const distIndexPath = path.join(distDir, 'index.html');
  const useStaticProd =
    process.env.NODE_ENV === 'production' ||
    (process.env.npm_lifecycle_event === 'start' && existsSync(distIndexPath));

  if (useStaticProd) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexPath);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  const safeErr = sanitizeSecretPatterns(err instanceof Error ? err.message : 'Unknown error');
  console.error('Failed to start server:', safeErr);
  process.exit(1);
});
