import { useState, type FormEvent } from 'react';
import { Send, ShieldAlert } from 'lucide-react';
import type { ArchivalRecord, QAResponse } from '../types/archive';

interface QAPageProps {
  records: ArchivalRecord[];
  onOpenRecordById: (identifier: string) => void;
}

interface ChatEntry {
  id: string;
  question: string;
  response: QAResponse;
}

const SAMPLE_QUESTIONS = [
  'Bản nhạc Hò kéo pháo (1953) hiện đang lưu giữ ở đâu và thuộc loại bản nào?',
  'Những tác phẩm nào của nhạc sĩ Hoàng Vân thuộc thập niên 1970 có trong kho?',
  'Ai là người cho phép công bố và phạm vi được phép của Bộ sưu tập nhạc sĩ Hoàng Vân?',
];

export function QAPage({ records, onOpenRecordById }: QAPageProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<ChatEntry[]>([]);

  const submitQuestion = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = (await res.json()) as QAResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Không thể truy vấn câu hỏi.');
      }
      setHistory((prev) => [
        { id: String(Date.now()), question: trimmed, response: data },
        ...prev,
      ]);
      setQuestion('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi gọi Gemini hỏi đáp.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitQuestion(question);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium text-stone-500">
          Tra cứu dựa trên dữ liệu tulieu.json
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-semibold text-stone-900 sm:text-4xl">
          Hỏi đáp tư liệu gia đình
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Hệ thống chỉ trả lời hoàn toàn dựa trên các bản ghi hiện có trong <code className="font-mono text-xs">tulieu.json</code> (hiện có <span className="font-mono font-semibold tabular-nums">{records.length}</span> bản ghi). Mọi câu trả lời đều bắt buộc dẫn mã bản ghi, nơi lưu giữ và loại bản; nếu không có trong dữ liệu sẽ báo rõ là chưa có tư liệu.
        </p>
      </div>

      <div className="mt-6 rounded-md border border-stone-200 bg-[#F3EFE7]/60 p-4 text-xs leading-relaxed text-stone-700">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#9A3412]" aria-hidden="true" />
          <div>
            <p className="font-semibold text-stone-900">Nguyên tắc không suy đoán & bảo vệ dữ liệu riêng tư</p>
            <p className="mt-0.5">
              Thông tin nằm trong trường <em>Phần không công bố</em> và nội dung phiên âm <em>Chưa kiểm</em> không được đưa vào câu trả lời công khai. Mô hình Gemini xử lý ở phía máy chủ và không lộ khoá API trên trình duyệt.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <label htmlFor="qa-input" className="block text-sm font-medium text-stone-800">
          Đặt câu hỏi tra cứu tư liệu
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="qa-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ví dụ: Bản nhạc Quảng Bình quê ta ơi! đang lưu giữ ở đâu và thuộc loại bản nào?"
            className="min-h-[46px] flex-1 rounded-md border border-stone-300 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#9A3412] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#9A3412] px-5 py-2 text-sm font-medium text-white hover:bg-[#7C2D12] disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>{loading ? 'Đang tra cứu...' : 'Gửi câu hỏi'}</span>
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SAMPLE_QUESTIONS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => void submitQuestion(sample)}
            disabled={loading}
            className="cursor-pointer rounded-md border border-stone-200 bg-white px-3 py-1.5 text-left text-xs text-stone-700 hover:bg-stone-100"
          >
            {sample}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div role="alert" className="mt-5 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {errorMsg}
        </div>
      )}

      <section aria-label="Kết quả hỏi đáp" className="mt-8 space-y-5">
        {history.length === 0 ? (
          <div className="rounded-md border border-stone-200 bg-white p-6 text-sm text-stone-600">
            Chưa có lượt hỏi đáp nào trong phiên làm việc này. Hãy nhập câu hỏi hoặc chọn một câu hỏi gợi ý ở trên để kiểm tra khả năng truy xuất trực tiếp từ <code className="font-mono text-xs">tulieu.json</code>.
          </div>
        ) : (
          history.map((entry) => (
            <article
              key={entry.id}
              className="rounded-md border border-stone-200 bg-white p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Câu hỏi
              </p>
              <h2 className="mt-1 text-base font-semibold text-stone-900">
                {entry.question}
              </h2>

              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Trả lời từ kho dữ liệu ({entry.response.totalRecordsChecked} bản ghi)
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-800">
                  {entry.response.answer}
                </p>

                {entry.response.citations.length > 0 && (
                  <div className="mt-4 border-t border-stone-100 pt-3">
                    <p className="text-xs font-semibold text-stone-700">
                      Trích dẫn bản ghi liên quan:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-stone-600">
                      {entry.response.citations.map((cite, idx) => (
                        <li
                          key={`${cite.ma_ban_ghi}-${idx}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded border border-stone-200 bg-[#FBF9F5] px-3 py-2"
                        >
                          <span>
                            <span className="font-mono font-semibold text-stone-900">
                              {cite.ma_ban_ghi}
                            </span>{' '}
                            · Nơi lưu giữ: {cite.noi_luu_giu} · Loại bản: {cite.loai_ban}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenRecordById(cite.ma_ban_ghi)}
                            className="cursor-pointer font-medium text-[#1E3A8A] underline-offset-4 hover:underline"
                          >
                            Mở bản ghi
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
