import { useState, type FormEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { ArchivalRecord, DisplayCopyType, VerificationLevel } from '../types/archive';
import { createEmptyArchivalRecord, DECADE_OPTIONS } from '../utils/archiveLogic';

interface RecordIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (
    record: ArchivalRecord,
    uploadedImages: Array<{
      filename: string;
      dataUrl: string;
      loai_khung: 'toan_trang' | 'can_canh';
      chu_thich: string;
      nguon: string;
    }>
  ) => Promise<void>;
}

async function downscaleImageForWeb(file: File, maxDimension = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được tệp ảnh.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Tệp không phải ảnh hợp lệ.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function RecordIntakeModal({ isOpen, onClose, onSaveRecord }: RecordIntakeModalProps) {
  const [form, setForm] = useState<ArchivalRecord>(createEmptyArchivalRecord);
  const [pendingImages, setPendingImages] = useState<
    Array<{
      filename: string;
      dataUrl: string;
      loai_khung: 'toan_trang' | 'can_canh';
      chu_thich: string;
      nguon: string;
    }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const updateField = <K extends keyof ArchivalRecord>(key: K, value: ArchivalRecord[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (
    fileList: FileList | null,
    frameType: 'toan_trang' | 'can_canh'
  ) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg('');
    try {
      const file = fileList[0];
      const compressedDataUrl = await downscaleImageForWeb(file);
      setPendingImages((prev) => [
        ...prev,
        {
          filename: file.name,
          dataUrl: compressedDataUrl,
          loai_khung: frameType,
          chu_thich: '',
          nguon: form.dc_source || form.noi_luu_giu_hien_nay || '',
        },
      ]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi xử lý tệp ảnh.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.dc_title.trim() || !form.noi_luu_giu_hien_nay.trim()) {
      setErrorMsg(
        'Vui lòng điền tối thiểu: Nhan đề (dc:title) và Nơi lưu giữ hiện nay.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSaveRecord(form, pendingImages);
      setForm(createEmptyArchivalRecord());
      setPendingImages([]);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể lưu bản ghi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-intake-title"
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-stone-200 bg-[#FBF9F5] p-4 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="min-w-0">
            <h2 id="modal-intake-title" className="font-editorial text-2xl font-semibold text-stone-900">
              Nạp bản ghi tư liệu thật vào tulieu.json
            </h2>
            <p className="mt-1 text-base text-stone-700">
              Ảnh tải lên sẽ tự động giảm kích thước để hiển thị web và lưu vào thư mục anh_tu_lieu. Bản quét gốc độ phân giải cao cần được sao lưu riêng ngoại tuyến.
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng biểu mẫu nhập tư liệu"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {errorMsg && (
            <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-base text-red-900">
              {errorMsg}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="intake-title" className="block text-sm font-medium text-stone-800">
                Nhan đề tư liệu (dc:title) *
              </label>
              <input
                id="intake-title"
                type="text"
                required
                value={form.dc_title}
                onChange={(e) => updateField('dc_title', e.target.value)}
                placeholder="Ví dụ: Ảnh đại gia đình Tết Bính Thìn 1976"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-decade" className="block text-sm font-medium text-stone-800">
                Thập niên
              </label>
              <select
                id="intake-decade"
                value={form.thap_nien}
                onChange={(e) => updateField('thap_nien', e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              >
                <option value="">Chọn thập niên</option>
                {DECADE_OPTIONS.filter((d) => d !== 'Tất cả').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="intake-identifier" className="block text-sm font-medium text-stone-800">
                Mã định danh / Số đăng ký (dc:identifier)
              </label>
              <input
                id="intake-identifier"
                type="text"
                value={form.dc_identifier}
                onChange={(e) => updateField('dc_identifier', e.target.value)}
                placeholder="Ví dụ: GD-1976-001"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-date" className="block text-sm font-medium text-stone-800">
                Niên đại / Thời gian chụp (dc:date)
              </label>
              <input
                id="intake-date"
                type="text"
                value={form.dc_date}
                onChange={(e) => updateField('dc_date', e.target.value)}
                placeholder="Ví dụ: Khoảng năm 1976 (chưa rõ ngày)"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-storage-now" className="block text-sm font-medium text-stone-800">
                Nơi lưu giữ hiện nay *
              </label>
              <input
                id="intake-storage-now"
                type="text"
                required
                value={form.noi_luu_giu_hien_nay}
                onChange={(e) => updateField('noi_luu_giu_hien_nay', e.target.value)}
                placeholder="Ví dụ: Album gia đình tại nhà ông/bà..."
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-storage-then" className="block text-sm font-medium text-stone-800">
                Nơi lưu giữ tại thời điểm tư liệu
              </label>
              <input
                id="intake-storage-then"
                type="text"
                value={form.noi_luu_giu_thoi_diem_tu_lieu}
                onChange={(e) => updateField('noi_luu_giu_thoi_diem_tu_lieu', e.target.value)}
                placeholder="Địa chỉ / gia đình giữ ảnh khi mới chụp"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-copy-type" className="block text-sm font-medium text-stone-800">
                Loại bản đang hiển thị
              </label>
              <select
                id="intake-copy-type"
                value={form.loai_ban_dang_hien_thi}
                onChange={(e) => updateField('loai_ban_dang_hien_thi', e.target.value as DisplayCopyType)}
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              >
                <option value="">Chọn loại bản</option>
                <option value="Bản số">Bản số (số hoá từ bản gốc gia đình)</option>
                <option value="Bản sao">Bản sao (chụp lại từ bản in lại)</option>
                <option value="Bản gốc">Bản gốc</option>
              </select>
            </div>

            <div>
              <label htmlFor="intake-original-cond" className="block text-sm font-medium text-stone-800">
                Tình trạng bản gốc
              </label>
              <input
                id="intake-original-cond"
                type="text"
                value={form.tinh_trang_ban_goc}
                onChange={(e) => updateField('tinh_trang_ban_goc', e.target.value)}
                placeholder="Ví dụ: Ảnh giấy đen trắng, ố vàng nhẹ ở mép"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-authorizer" className="block text-sm font-medium text-stone-800">
                Người cho phép công bố
              </label>
              <input
                id="intake-authorizer"
                type="text"
                value={form.nguoi_cho_phep_cong_bo}
                onChange={(e) => updateField('nguoi_cho_phep_cong_bo', e.target.value)}
                placeholder="Để trống nếu đang chờ xác nhận quyền công bố"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
              <p className="mt-1 text-xs text-stone-500">
                Nếu để trống trường này, hệ thống sẽ ẩn ảnh và hiện thông báo chờ xác nhận quyền.
              </p>
            </div>

            <div>
              <label htmlFor="intake-scope" className="block text-sm font-medium text-stone-800">
                Phạm vi được phép công bố
              </label>
              <input
                id="intake-scope"
                type="text"
                value={form.pham_vi_duoc_phep}
                onChange={(e) => updateField('pham_vi_duoc_phep', e.target.value)}
                placeholder="Ví dụ: Trưng bày học tập, phi thương mại"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-md border border-stone-200 bg-white p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Ghi chú ảnh theo lời người lớn tuổi (Ai · Ở đâu · Khi nào · Phần chưa xác định)
              </h3>
              <p className="mt-0.5 text-xs text-stone-600">
                Ghi trung thực những gì người cung cấp chú thích nhớ được và tách bạch rõ chi tiết chưa xác định được.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="intake-creator" className="block text-sm font-medium text-stone-800">
                  Ai trong ảnh / Người chụp / Tác giả (dc:creator)
                </label>
                <input
                  id="intake-creator"
                  type="text"
                  value={form.dc_creator}
                  onChange={(e) => updateField('dc_creator', e.target.value)}
                  placeholder="Ví dụ: Ông bà nội cùng các cô chú (người chụp: Bác Ba)"
                  className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="intake-elder" className="block text-sm font-medium text-stone-800">
                  Người lớn tuổi cung cấp chú thích (dc:contributor)
                </label>
                <input
                  id="intake-elder"
                  type="text"
                  value={form.nguoi_cung_cap_chu_thich}
                  onChange={(e) => {
                    updateField('nguoi_cung_cap_chu_thich', e.target.value);
                    updateField('dc_contributor', e.target.value);
                  }}
                  placeholder="Ví dụ: Bà Nguyễn Thị Lan kể lại ngày..."
                  className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="intake-unknown" className="block text-sm font-medium text-stone-800">
                  Phần chưa xác định được
                </label>
                <input
                  id="intake-unknown"
                  type="text"
                  value={form.phan_chua_xac_dinh}
                  onChange={(e) => updateField('phan_chua_xac_dinh', e.target.value)}
                  placeholder="Ví dụ: Chưa rõ tên hai người đứng hàng sau bên trái và ngày chụp"
                  className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="intake-coverage-quick" className="block text-sm font-medium text-stone-800">
                  Ở đâu &amp; Khi nào (dc:coverage)
                </label>
                <input
                  id="intake-coverage-quick"
                  type="text"
                  value={form.dc_coverage}
                  onChange={(e) => updateField('dc_coverage', e.target.value)}
                  placeholder="Ví dụ: Sân nhà cũ ở Hà Nội · Tết 1976"
                  className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="intake-description" className="block text-sm font-medium text-stone-800">
                Lời kể chi tiết &amp; bối cảnh bức ảnh (dc:description)
              </label>
              <textarea
                id="intake-description"
                rows={3}
                value={form.dc_description}
                onChange={(e) => updateField('dc_description', e.target.value)}
                placeholder="Ghi rõ ai đứng ở vị trí nào, chụp ở đâu, vào dịp nào theo lời kể của người lớn tuổi..."
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="intake-source" className="block text-sm font-medium text-stone-800">
                Nguồn gốc / Xuất xứ tư liệu (dc:source)
              </label>
              <input
                id="intake-source"
                type="text"
                value={form.dc_source}
                onChange={(e) => updateField('dc_source', e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-subject" className="block text-sm font-medium text-stone-800">
                Chủ đề / Từ khoá (dc:subject)
              </label>
              <input
                id="intake-subject"
                type="text"
                value={form.dc_subject}
                onChange={(e) => updateField('dc_subject', e.target.value)}
                placeholder="Ví dụ: Ảnh gia đình; Hà Nội; Di sản tư liệu"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-private" className="block text-sm font-medium text-stone-800">
                Phần không công bố (thông tin riêng tư cần che)
              </label>
              <input
                id="intake-private"
                type="text"
                value={form.phan_khong_cong_bo}
                onChange={(e) => updateField('phan_khong_cong_bo', e.target.value)}
                placeholder="Ghi chú phần người giữ dặn không công bố"
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="intake-verify" className="block text-sm font-medium text-stone-800">
                Mức kiểm chứng
              </label>
              <select
                id="intake-verify"
                value={form.muc_kiem_chung}
                onChange={(e) => updateField('muc_kiem_chung', e.target.value as VerificationLevel)}
                className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              >
                <option value="Chưa kiểm">Chưa kiểm</option>
                <option value="Đã có người kiểm">Đã kiểm (Đã có người kiểm)</option>
                <option value="Chưa đọc được">Chưa đọc được</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Đính kèm ảnh tư liệu thật (tự động nén bản hiển thị web)
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-[#FBF9F5] px-4 py-2 text-base font-medium text-stone-800 hover:bg-stone-100">
                <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Chọn ảnh toàn trang</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => void handleFileChange(e.target.files, 'toan_trang')}
                />
              </label>

              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-[#FBF9F5] px-4 py-2 text-base font-medium text-stone-800 hover:bg-stone-100">
                <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Chọn ảnh cận cảnh / mặt sau</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => void handleFileChange(e.target.files, 'can_canh')}
                />
              </label>
            </div>

            {pendingImages.length > 0 && (
              <div className="mt-4 space-y-3">
                {pendingImages.map((img, idx) => (
                  <div
                    key={`${img.filename}-${idx}`}
                    className="grid gap-3 rounded-md border border-stone-200 bg-[#FBF9F5] p-3 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-3">
                      <img
                        src={img.dataUrl}
                        alt={img.filename}
                        className="h-24 w-full rounded object-cover"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-9">
                      <p className="font-mono text-xs text-stone-600 break-words">
                        {img.loai_khung === 'toan_trang' ? 'Ảnh toàn trang' : 'Ảnh cận cảnh'} · {img.filename}
                      </p>
                      <input
                        type="text"
                        placeholder="Chú thích ngay dưới ảnh..."
                        value={img.chu_thich}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPendingImages((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, chu_thich: val } : item))
                          );
                        }}
                        className="min-h-[44px] w-full rounded border border-stone-300 bg-white px-3 py-2 text-base"
                      />
                      <input
                        type="text"
                        placeholder="Nguồn ảnh..."
                        value={img.nguon}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPendingImages((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, nguon: val } : item))
                          );
                        }}
                        className="min-h-[44px] w-full rounded border border-stone-300 bg-white px-3 py-2 text-base"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] cursor-pointer rounded-md border border-stone-300 bg-white px-4 py-2 text-base font-medium text-stone-700 hover:bg-stone-100"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] cursor-pointer rounded-md bg-[#9A3412] px-5 py-2 text-base font-medium text-white hover:bg-[#7C2D12] disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Lưu vào tulieu.json'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
