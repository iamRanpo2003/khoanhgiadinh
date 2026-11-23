import { useState, type FormEvent } from 'react';
import { ExternalLink, Send } from 'lucide-react';
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
        <p className="text-base font-medium text-stone-600">
          Tra cứu giới hạn trong dữ liệu tulieu.json
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-semibold text-stone-900 sm:text-4xl">
          Hỏi đáp tư liệu gia đình
        </h1>
        <p className="mt-2 text-base leading-relaxed text-stone-600">
          Gemini chỉ trả lời dựa trên <span className="font-mono font-semibold tabular-nums">{records.length}</span> bản ghi hiện có trong <code className="font-mono text-sm">tulieu.json</code> và danh mục nguồn chính thống của ứng dụng. Khi dữ liệu chưa có thông tin, hệ thống trả lời rõ <strong>&ldquo;Ứng dụng chưa có thông tin này&rdquo;</strong> và gợi ý nguồn chính thống để tra cứu; mỗi câu trả lời đều kèm tên nguồn đã dùng.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <label htmlFor="qa-input" className="block text-base font-medium text-stone-800">
          Đặt câu hỏi tra cứu tư liệu
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="qa-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ví dụ: Bản nhạc Quảng Bình quê ta ơi! đang lưu giữ ở đâu?"
            className="min-h-[46px] flex-1 rounded-md border border-stone-300 bg-white px-4 text-base text-stone-900 placeholder:text-stone-400 focus:border-[#9A3412] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#9A3412] px-5 py-2 text-base font-medium text-white hover:bg-[#7C2D12] disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
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
            className="min-h-[44px] cursor-pointer rounded-md border border-stone-200 bg-white px-3.5 py-2 text-left text-sm text-stone-700 hover:bg-stone-100"
          >
            {sample}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div role="alert" className="mt-5 rounded-md border border-red-300 bg-red-50 p-4 text-base text-red-900">
          {errorMsg}
        </div>
      )}

      <section aria-label="Kết quả hỏi đáp" className="mt-8 space-y-5">
        {history.length === 0 ? (
          <div className="rounded-md border border-stone-200 bg-white p-6 text-base text-stone-600">
            Chưa có lượt hỏi đáp nào trong phiên làm việc này. Hãy nhập câu hỏi hoặc chọn một câu hỏi gợi ý ở trên để kiểm tra khả năng truy xuất trực tiếp từ <code className="font-mono text-sm">tulieu.json</code>.
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
              <h2 className="mt-1 text-lg font-semibold text-stone-900">
                {entry.question}
              </h2>

              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Trả lời từ kho dữ liệu ({entry.response.totalRecordsChecked} bản ghi)
                </p>
                <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-stone-800">
                  {entry.response.answer}
                </p>

                <p className="mt-3 text-sm text-stone-500">
                  Lưu ý: Nội dung do Gemini tổng hợp từ dữ liệu hiện có trong ứng dụng — vui lòng đối chiếu lại bản ghi gốc bên dưới khi trích dẫn.
                </p>

                {entry.response.usedSources && entry.response.usedSources.length > 0 && (
                  <div className="mt-4 rounded border border-stone-200 bg-[#FBF9F5] p-3.5">
                    <p className="text-sm font-semibold text-stone-800">
                      Tên nguồn đã dùng:
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-base text-stone-700">
                      {entry.response.usedSources.map((sourceName, idx) => (
                        <li key={`${sourceName}-${idx}`} className="break-words">
                          {sourceName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.response.citations.length > 0 && (
                  <div className="mt-4 border-t border-stone-100 pt-3">
                    <p className="text-sm font-semibold text-stone-700">
                      Trích dẫn bản ghi liên quan:
                    </p>
                    <ul className="mt-2 space-y-2 text-base text-stone-700">
                      {entry.response.citations.map((cite, idx) => (
                        <li
                          key={`${cite.ma_ban_ghi}-${idx}`}
                          className="flex flex-col gap-2 rounded border border-stone-200 bg-[#FBF9F5] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0 break-words">
                            <span className="font-mono font-semibold text-stone-900">
                              {cite.ma_ban_ghi}
                            </span>{' '}
                            · Nơi lưu giữ: {cite.noi_luu_giu} · Loại bản: {cite.loai_ban}
                            {cite.ten_nguon ? ` · Nguồn: ${cite.ten_nguon}` : ''}
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenRecordById(cite.ma_ban_ghi)}
                            className="inline-flex min-h-[44px] cursor-pointer items-center font-medium text-[#1E3A8A] underline-offset-4 hover:underline shrink-0"
                          >
                            Mở bản ghi
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!entry.response.hasMatch &&
                  entry.response.suggestedSources &&
                  entry.response.suggestedSources.length > 0 && (
                    <div className="mt-4 rounded border border-amber-300 bg-amber-50/70 p-4">
                      <p className="text-sm font-semibold text-amber-950">
                        Gợi ý nguồn chính thống để tra cứu thêm:
                      </p>
                      <ul className="mt-2 space-y-2 text-base text-stone-800">
                        {entry.response.suggestedSources.map((src, idx) => (
                          <li key={`${src.url}-${idx}`} className="min-w-0 break-words">
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-[#1E3A8A] underline-offset-4 hover:underline"
                            >
                              <span>
                                {src.title} ({src.issuer}
                                {src.year ? ` · ${src.year}` : ''})
                              </span>
                              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                            </a>
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
