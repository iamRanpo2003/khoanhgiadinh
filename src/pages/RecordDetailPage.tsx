import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Image as ImageIcon,
  Lock,
  RotateCcw,
  Sparkles,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ArchivalRecord, TranscribeResponse } from '../types/archive';
import {
  countMissingRequiredFields,
  createEmptyArchivalRecord,
  DUBLIN_CORE_FIELDS,
  getVerificationBadgeMeta,
  hasPublishPermission,
  SUPPLEMENTARY_ARCHIVAL_FIELDS,
} from '../utils/archiveLogic';

interface RecordDetailPageProps {
  record: ArchivalRecord | null;
  onBack: () => void;
  onUpdateRecord: (
    updated: ArchivalRecord
  ) => Promise<void>;
}

export function RecordDetailPage({
  record,
  onBack,
  onUpdateRecord,
}: RecordDetailPageProps) {
  const isTemplatePreview = record === null;
  const activeRecord = record ?? createEmptyArchivalRecord();

  const [frameMode, setFrameMode] = useState<'toan_trang' | 'can_canh'>('toan_trang');
  const [frameIndex, setFrameIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(100);

  // Local editable draft for human-reviewed transcription & translation (never auto-saved!)
  const [draftTranscription, setDraftTranscription] = useState(activeRecord.phien_am || '');
  const [draftTranslation, setDraftTranslation] = useState(activeRecord.dich_nghia || '');
  const [draftReviewer, setDraftReviewer] = useState(activeRecord.nguoi_kiem_chung || '');
  const [draftVerification, setDraftVerification] = useState(activeRecord.muc_kiem_chung);

  const [tempTestImageDataUrl, setTempTestImageDataUrl] = useState<string>('');
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeNote, setTranscribeNote] = useState('');
  const [transcribeError, setTranscribeError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const rec = record ?? createEmptyArchivalRecord();
    setDraftTranscription(rec.phien_am || '');
    setDraftTranslation(rec.dich_nghia || '');
    setDraftReviewer(rec.nguoi_kiem_chung || '');
    setDraftVerification(rec.muc_kiem_chung);
    setFrameMode('toan_trang');
    setFrameIndex(0);
    setZoomScale(100);
    setTempTestImageDataUrl('');
    setTranscribeNote('');
    setTranscribeError('');
    setSaveMessage('');
  }, [record]);

  const permitted = isTemplatePreview || hasPublishPermission(activeRecord);
  const fullPageImages = activeRecord.danh_sach_tep_anh.filter(
    (img) => img.loai_khung === 'toan_trang'
  );
  const closeUpImages = activeRecord.danh_sach_tep_anh.filter(
    (img) => img.loai_khung === 'can_canh'
  );
  const matchingImages = frameMode === 'toan_trang' ? fullPageImages : closeUpImages;
  const safeIndex = matchingImages.length > 0 ? Math.min(frameIndex, matchingImages.length - 1) : 0;
  const displayedImage = matchingImages[safeIndex] ?? activeRecord.danh_sach_tep_anh[0] ?? null;
  const completeness = countMissingRequiredFields(activeRecord);
  const badge = getVerificationBadgeMeta(draftVerification);

  const handleUploadTempImageForOCR = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTempTestImageDataUrl(String(reader.result));
      setTranscribeError('');
    };
    reader.readAsDataURL(file);
  };

  const handleGeminiProposeTranscription = async () => {
    setTranscribeError('');
    setTranscribeNote('');
    setSaveMessage('');

    if (!permitted && !tempTestImageDataUrl) {
      setTranscribeError(
        'Bản ghi đang chờ xác nhận quyền công bố nên ảnh bị ẩn và chưa thể phân tích bằng Gemini.'
      );
      return;
    }

    const imagePath = permitted ? displayedImage?.duong_dan : undefined;
    if (!imagePath && !tempTestImageDataUrl) {
      setTranscribeError(
        'Chưa có tệp ảnh tư liệu thật để đề xuất phiên âm. Hãy chọn một ảnh thật từ máy hoặc nạp ảnh vào bản ghi.'
      );
      return;
    }

    setTranscribing(true);
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: tempTestImageDataUrl ? undefined : imagePath,
          imageDataUrl: tempTestImageDataUrl || undefined,
          recordTitle: activeRecord.dc_title,
        }),
      });
      const data = (await response.json()) as TranscribeResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Không thể đề xuất phiên âm từ ảnh.');
      }

      // Strictly set verification status to 'Chưa kiểm' and DO NOT auto-save!
      setDraftTranscription(data.proposedTranscription);
      setDraftTranslation(data.proposedTranslation);
      setDraftVerification('Chưa kiểm');
      setTranscribeNote(data.note);
    } catch (err) {
      setTranscribeError(
        err instanceof Error ? err.message : 'Lỗi khi gọi Gemini đề xuất phiên âm.'
      );
    } finally {
      setTranscribing(false);
    }
  };

  const handleManualHumanSave = async () => {
    if (isTemplatePreview) {
      setSaveMessage(
        'Đang ở chế độ xem khung mẫu rỗng. Hãy thêm bản ghi thật tại Danh sách ảnh để lưu vào tulieu.json.'
      );
      return;
    }
    if (draftVerification === 'Đã có người kiểm' && !draftReviewer.trim()) {
      setTranscribeError('Vui lòng ghi rõ tên người kiểm chứng khi chọn mức "Đã có người kiểm".');
      return;
    }
    setTranscribeError('');
    await onUpdateRecord({
      ...activeRecord,
      phien_am: draftTranscription,
      dich_nghia: draftTranslation,
      muc_kiem_chung: draftVerification,
      nguoi_kiem_chung: draftReviewer.trim(),
    });
    setSaveMessage('Đã lưu phiên âm/dịch nghĩa đã hiệu đính vào tulieu.json.');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-base font-medium text-stone-800 hover:bg-stone-100"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Quay lại danh sách</span>
        </button>

        <div className="min-w-0 font-mono text-xs text-stone-600 tabular-nums break-words">
          {isTemplatePreview
            ? 'Khung mẫu cấu trúc chuẩn · Chưa nạp dữ liệu thật'
            : `Mã bản ghi: ${activeRecord.dc_identifier || 'Chưa cấp'} · Số đăng ký: ${activeRecord.so_dang_ky || 'Chưa cấp'}`}
        </div>
      </div>

      {isTemplatePreview && (
        <div className="mt-5 rounded-md border border-amber-300 bg-amber-50/70 p-4 text-base text-amber-950">
          Đây là trang xem trước cấu trúc chi tiết chuẩn bảo tàng (Màn hình 3) khi tệp <code className="font-mono text-sm">tulieu.json</code> còn trống. Không có dữ liệu giả hay ảnh máy sinh nào được chèn vào biểu mẫu này.
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* Cột trái: Trình xem ảnh toàn trang / cận cảnh + phóng to đọc chữ + chú thích & nguồn */}
        <div className="min-w-0 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex max-w-full flex-wrap rounded-md border border-stone-200 bg-[#F3EFE7] p-1" role="tablist" aria-label="Chế độ khung ảnh">
              <button
                type="button"
                role="tab"
                aria-selected={frameMode === 'toan_trang'}
                onClick={() => {
                  setFrameMode('toan_trang');
                  setFrameIndex(0);
                  setZoomScale(100);
                }}
                className={`min-h-[44px] cursor-pointer rounded px-3 py-2 text-sm font-medium transition-colors sm:whitespace-nowrap ${
                  frameMode === 'toan_trang'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Ảnh toàn trang ({fullPageImages.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={frameMode === 'can_canh'}
                onClick={() => {
                  setFrameMode('can_canh');
                  setFrameIndex(0);
                  setZoomScale(100);
                }}
                className={`min-h-[44px] cursor-pointer rounded px-3 py-2 text-sm font-medium transition-colors sm:whitespace-nowrap ${
                  frameMode === 'can_canh'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Ảnh cận cảnh ({closeUpImages.length})
              </button>
            </div>

            {((permitted && displayedImage?.duong_dan) || tempTestImageDataUrl) && (
              <div className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white p-1">
                <button
                  type="button"
                  aria-label="Thu nhỏ ảnh"
                  disabled={zoomScale <= 100}
                  onClick={() => setZoomScale((z) => Math.max(100, z - 50))}
                  className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-[48px] text-center font-mono text-sm font-medium text-stone-800 tabular-nums">
                  {zoomScale}%
                </span>
                <button
                  type="button"
                  aria-label="Phóng to ảnh để đọc chữ"
                  disabled={zoomScale >= 250}
                  onClick={() => setZoomScale((z) => Math.min(250, z + 50))}
                  className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                {zoomScale > 100 && (
                  <button
                    type="button"
                    aria-label="Đặt lại tỷ lệ 100%"
                    onClick={() => setZoomScale(100)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded px-3 text-sm text-stone-700 hover:bg-stone-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>100%</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {permitted && matchingImages.length > 1 && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-200 bg-[#FBF9F5] px-3 py-2 text-sm">
              <span className="font-mono text-stone-700 tabular-nums">
                {frameMode === 'toan_trang' ? 'Ảnh toàn trang' : 'Ảnh cận cảnh'} {safeIndex + 1} / {matchingImages.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFrameIndex((idx) => (idx - 1 + matchingImages.length) % matchingImages.length)
                  }
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded border border-stone-300 bg-white px-3 text-stone-800 hover:bg-stone-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFrameIndex((idx) => (idx + 1) % matchingImages.length)}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded border border-stone-300 bg-white px-3 text-stone-800 hover:bg-stone-100"
                >
                  <span>Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <figure className="mt-3 overflow-hidden rounded-md border border-stone-200 bg-white">
            <div className="max-h-[540px] overflow-auto bg-[#F3EFE7]">
              {!permitted ? (
                <div
                  role="alert"
                  className="flex min-h-[320px] flex-col items-center justify-center bg-amber-50/70 p-8 text-center"
                >
                  <Lock className="h-10 w-10 text-amber-800" aria-hidden="true" />
                  <p className="mt-3 text-base font-semibold text-amber-950">
                    Chờ xác nhận quyền công bố
                  </p>
                  <p className="mt-1.5 max-w-md text-base leading-relaxed text-amber-900">
                    Ảnh tư liệu hiện được ẩn vì bản ghi thiếu thông tin <strong>Người cho phép công bố</strong> (tuân thủ Điều 60 Luật Di sản văn hoá số 45/2024/QH15 và Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15).
                  </p>
                </div>
              ) : tempTestImageDataUrl ? (
                <img
                  src={tempTestImageDataUrl}
                  alt="Ảnh tư liệu thật vừa tải từ máy để đề xuất phiên âm"
                  onClick={() => setZoomScale((z) => (z === 100 ? 175 : 100))}
                  style={zoomScale > 100 ? { width: `${zoomScale}%`, maxWidth: 'none' } : undefined}
                  className={`mx-auto cursor-zoom-in transition-all ${zoomScale === 100 ? 'w-full object-contain max-h-[460px]' : 'cursor-zoom-out'}`}
                />
              ) : displayedImage?.duong_dan ? (
                <img
                  src={displayedImage.duong_dan}
                  alt={displayedImage.chu_thich || activeRecord.dc_title || 'Ảnh tư liệu gia đình'}
                  referrerPolicy="no-referrer"
                  onClick={() => setZoomScale((z) => (z === 100 ? 175 : 100))}
                  style={zoomScale > 100 ? { width: `${zoomScale}%`, maxWidth: 'none' } : undefined}
                  className={`mx-auto cursor-zoom-in transition-all ${zoomScale === 100 ? 'w-full object-contain max-h-[460px]' : 'cursor-zoom-out'}`}
                />
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                  <ImageIcon className="h-10 w-10 text-stone-400" aria-hidden="true" />
                  <p className="mt-3 text-base font-medium text-stone-800">
                    Khung hiển thị {frameMode === 'toan_trang' ? 'Ảnh toàn trang' : 'Ảnh cận cảnh'} (Chưa có ảnh thật)
                  </p>
                  <p className="mt-1 max-w-sm text-base leading-relaxed text-stone-600">
                    Đặt bản ảnh giảm kích thước vào thư mục <code className="font-mono text-sm">anh_tu_lieu/</code> và khai báo đường dẫn trong <code className="font-mono text-sm">tulieu.json</code>. Tuyệt đối không dùng ảnh do máy sinh.
                  </p>
                </div>
              )}
            </div>

            {permitted && (fullPageImages.length > 0 || closeUpImages.length > 0) && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                <span>Nhấp vào ảnh hoặc dùng nút + / - để phóng to đọc chữ</span>
                {frameMode === 'toan_trang' && closeUpImages.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFrameMode('can_canh');
                      setFrameIndex(0);
                      setZoomScale(100);
                    }}
                    className="inline-flex min-h-[44px] cursor-pointer items-center font-medium text-[#1E3A8A] underline-offset-4 hover:underline"
                  >
                    Chuyển sang ảnh cận cảnh ({closeUpImages.length})
                  </button>
                ) : frameMode === 'can_canh' && fullPageImages.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFrameMode('toan_trang');
                      setFrameIndex(0);
                      setZoomScale(100);
                    }}
                    className="inline-flex min-h-[44px] cursor-pointer items-center font-medium text-[#1E3A8A] underline-offset-4 hover:underline"
                  >
                    Quay lại ảnh toàn trang ({fullPageImages.length})
                  </button>
                ) : null}
              </div>
            )}

            {/* Chú thích và nguồn ngay dưới ảnh */}
            <figcaption className="border-t border-stone-200 bg-[#FBF9F5] p-4 text-base break-words">
              <p className="font-medium text-stone-900 break-words">
                Chú thích ảnh:{' '}
                <span className="font-normal text-stone-700">
                  {!permitted
                    ? 'Đang ẩn chờ xác nhận quyền công bố.'
                    : displayedImage?.chu_thich || 'Chưa có chú thích cho khung ảnh này.'}
                </span>
              </p>
              <p className="mt-1.5 text-base text-stone-700 break-words">
                Nguồn ảnh:{' '}
                <span className="font-medium text-stone-900">
                  {displayedImage?.nguon || activeRecord.dc_source || activeRecord.noi_luu_giu_hien_nay || 'Chưa ghi nguồn'}
                </span>
              </p>
              <p className="mt-1.5 text-base text-stone-700 break-words">
                Người cung cấp chú thích:{' '}
                <span className="text-stone-900">
                  {activeRecord.nguoi_cung_cap_chu_thich || activeRecord.dc_contributor || 'Chưa ghi nhận'}
                </span>
              </p>
            </figcaption>
          </figure>

          {/* Khu vực Phiên âm & Dịch nghĩa + Đề xuất từ Gemini có nhãn Chưa kiểm */}
          <section
            aria-labelledby="transcription-heading"
            className="mt-6 rounded-md border border-stone-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <h2 id="transcription-heading" className="font-editorial text-2xl font-semibold text-stone-900">
                Phiên âm & Dịch nghĩa
              </h2>

              <span
                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold ${badge.badgeClass}`}
              >
                {badge.tone === 'green' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : badge.tone === 'gray' ? (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  Mức kiểm chứng: {badge.shortLabel}
                  {draftVerification === 'Đã có người kiểm' && draftReviewer ? ` (${draftReviewer})` : ''}
                </span>
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleGeminiProposeTranscription()}
                disabled={transcribing}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E3A8A]/90 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {transcribing
                    ? 'Đang phân tích ảnh...'
                    : 'Nhờ Gemini đề xuất phiên âm từ ảnh'}
                </span>
              </button>

              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-[#FBF9F5] px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100">
                <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Chọn ảnh thật từ máy để thử đề xuất</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleUploadTempImageForOCR(e.target.files?.[0])}
                />
              </label>
            </div>

            {transcribeNote && (
              <p role="status" className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-base text-amber-950">
                {transcribeNote}
              </p>
            )}
            {transcribeError && (
              <p role="alert" className="mt-3 rounded border border-red-300 bg-red-50 p-3 text-base text-red-900">
                {transcribeError}
              </p>
            )}
            {saveMessage && (
              <p role="status" className="mt-3 rounded border border-emerald-300 bg-emerald-50 p-3 text-base text-emerald-900">
                {saveMessage}
              </p>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="detail-transcription" className="text-sm font-semibold text-stone-700">
                    Nội dung phiên âm (ô để người kiểm sửa — không tự lưu)
                  </label>
                  <span className="font-mono text-xs text-stone-500">Nhãn: {draftVerification}</span>
                </div>
                <textarea
                  id="detail-transcription"
                  rows={3}
                  value={draftTranscription}
                  onChange={(e) => setDraftTranscription(e.target.value)}
                  placeholder="Chưa có phiên âm. Nhập thủ công hoặc nhấn nút nhờ Gemini đề xuất từ ảnh..."
                  className="mt-1 w-full rounded-md border border-stone-300 bg-[#FBF9F5] p-3 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="detail-translation" className="block text-sm font-semibold text-stone-700">
                  Dịch nghĩa / Diễn giải
                </label>
                <textarea
                  id="detail-translation"
                  rows={3}
                  value={draftTranslation}
                  onChange={(e) => setDraftTranslation(e.target.value)}
                  placeholder="Chưa có bản dịch nghĩa..."
                  className="mt-1 w-full rounded-md border border-stone-300 bg-[#FBF9F5] p-3 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="detail-verify-status" className="block text-sm font-semibold text-stone-700">
                    Trạng thái kiểm chứng
                  </label>
                  <select
                    id="detail-verify-status"
                    value={draftVerification}
                    onChange={(e) =>
                      setDraftVerification(e.target.value as ArchivalRecord['muc_kiem_chung'])
                    }
                    className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-900"
                  >
                    <option value="Đã có người kiểm">Đã kiểm (Đã có người kiểm)</option>
                    <option value="Chưa kiểm">Chưa kiểm</option>
                    <option value="Chưa đọc được">Chưa đọc được</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="detail-reviewer" className="block text-sm font-semibold text-stone-700">
                    Tên người kiểm chứng
                  </label>
                  <input
                    id="detail-reviewer"
                    type="text"
                    value={draftReviewer}
                    onChange={(e) => setDraftReviewer(e.target.value)}
                    placeholder="Ghi họ tên người đã đối chiếu"
                    className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleManualHumanSave()}
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-md border border-stone-300 bg-stone-900 px-4 py-2 text-base font-medium text-white hover:bg-stone-800"
              >
                Xác nhận lưu bản hiệu đính thủ công
              </button>
            </div>
          </section>
        </div>

        {/* Cột phải: Bộ trường mô tả chuẩn Dublin Core (15 trường) + Các trường kiểm kê bổ sung */}
        <div className="min-w-0 lg:col-span-6 space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <p className="font-mono text-xs text-stone-600 tabular-nums break-words">
              Thập niên: {activeRecord.thap_nien || 'Chưa xác định'} · {activeRecord.loai_ban_dang_hien_thi || 'Chưa rõ loại bản'} · Hoàn thiện {completeness.filled}/{completeness.total} trường
            </p>
            <h1 className="font-editorial mt-2 text-3xl font-semibold text-stone-900 break-words">
              {activeRecord.dc_title || 'Khung mẫu bản ghi tư liệu gia đình'}
            </h1>
          </div>

          <section aria-labelledby="elder-note-heading" className="rounded-md border border-stone-200 bg-[#F3EFE7]/60 p-5">
            <h2 id="elder-note-heading" className="font-editorial text-xl font-semibold text-stone-900">
              Ghi chú cốt lõi: Ai · Ở đâu · Khi nào
            </h2>
            <dl className="mt-3 divide-y divide-stone-200/70 text-base">
              <div className="grid gap-1 py-2.5 sm:grid-cols-12 sm:gap-4">
                <dt className="font-medium text-stone-700 sm:col-span-4">Ai (Nhân vật / Tác giả)</dt>
                <dd className="min-w-0 break-words text-stone-900 sm:col-span-8">
                  {activeRecord.dc_creator || 'Chưa xác định nhân vật/tác giả'}
                </dd>
              </div>
              <div className="grid gap-1 py-2.5 sm:grid-cols-12 sm:gap-4">
                <dt className="font-medium text-stone-700 sm:col-span-4">Ở đâu &amp; Khi nào</dt>
                <dd className="min-w-0 break-words text-stone-900 sm:col-span-8">
                  {activeRecord.dc_coverage || activeRecord.dc_date || 'Chưa rõ địa điểm/thời gian'}
                </dd>
              </div>
              <div className="grid gap-1 py-2.5 sm:grid-cols-12 sm:gap-4">
                <dt className="font-medium text-stone-700 sm:col-span-4">Người cung cấp chú thích</dt>
                <dd className="min-w-0 break-words text-stone-900 sm:col-span-8">
                  {activeRecord.nguoi_cung_cap_chu_thich || activeRecord.dc_contributor || 'Chưa ghi nhận người cung cấp'}
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="supplementary-fields-heading" className="rounded-md border border-stone-200 bg-white p-5">
            <h2 id="supplementary-fields-heading" className="font-editorial text-xl font-semibold text-stone-900">
              Thông tin kiểm kê bảo tàng & Quyền công bố
            </h2>
            <dl className="mt-3 divide-y divide-stone-100 text-base">
              {SUPPLEMENTARY_ARCHIVAL_FIELDS.filter(
                (field) => field.key !== 'phan_chua_xac_dinh'
              ).map((field) => {
                const rawValue = activeRecord[field.key];
                let displayValue =
                  typeof rawValue === 'string' && rawValue.trim() ? rawValue : 'Chưa có thông tin';
                if (field.key === 'phan_khong_cong_bo') {
                  displayValue =
                    typeof rawValue === 'string' && rawValue.trim()
                      ? '[Đã ẩn thông tin riêng tư theo yêu cầu người giữ tư liệu]'
                      : 'Không có phần hạn chế riêng';
                }
                return (
                  <div key={String(field.key)} className="grid gap-1 py-2.5 sm:grid-cols-12 sm:gap-4">
                    <dt className="font-medium text-stone-700 sm:col-span-5">{field.label}</dt>
                    <dd className="min-w-0 break-words text-stone-900 sm:col-span-7">{displayValue}</dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section aria-labelledby="dublin-core-heading" className="rounded-md border border-stone-200 bg-white p-5">
            <h2 id="dublin-core-heading" className="font-editorial text-xl font-semibold text-stone-900">
              Bộ 15 trường mô tả chuẩn Dublin Core
            </h2>
            <dl className="mt-3 divide-y divide-stone-100 text-base">
              {DUBLIN_CORE_FIELDS.map((field) => {
                const rawValue = activeRecord[field.key];
                const displayValue =
                  typeof rawValue === 'string' && rawValue.trim() ? rawValue : 'Chưa có thông tin';
                return (
                  <div key={field.code} className="grid gap-1 py-2.5 sm:grid-cols-12 sm:gap-4">
                    <dt className="sm:col-span-5">
                      <span className="font-medium text-stone-700">{field.label}</span>
                      <span className="ml-1.5 font-mono text-xs text-stone-500">
                        ({field.code})
                      </span>
                    </dt>
                    <dd className="min-w-0 break-words text-stone-900 sm:col-span-7">{displayValue}</dd>
                  </div>
                );
              })}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
