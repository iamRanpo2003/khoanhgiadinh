import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, FileUp, FolderPlus, ImageOff, Lock, Search } from 'lucide-react';
import type { ArchivalRecord } from '../types/archive';
import {
  filterArchivalRecords,
  getNonEmptyDecades,
  getVerificationBadgeMeta,
  hasPublishPermission,
  ORIGINAL_CONDITION_OPTIONS,
} from '../utils/archiveLogic';

interface ArchiveListPageProps {
  records: ArchivalRecord[];
  initialQuery: string;
  initialDecade: string;
  onSelectRecord: (record: ArchivalRecord | null) => void;
  onOpenIntake: () => void;
  onImportJsonFile: (file: File) => Promise<void>;
}

export function ArchiveListPage({
  records,
  initialQuery,
  initialDecade,
  onSelectRecord,
  onOpenIntake,
  onImportJsonFile,
}: ArchiveListPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [decade, setDecade] = useState(initialDecade || 'Tất cả');
  const [verification, setVerification] = useState('Tất cả');
  const [copyType, setCopyType] = useState('Tất cả');
  const [originalCondition, setOriginalCondition] = useState('Tất cả');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setDecade(initialDecade || 'Tất cả');
  }, [initialDecade]);

  const visibleDecades = getNonEmptyDecades(records);
  const decadeFilterOptions: Array<{ decade: string; count: number }> = [
    { decade: 'Tất cả', count: records.length },
    ...visibleDecades,
  ];
  const filtered = filterArchivalRecords(records, {
    query,
    decade,
    verification,
    copyType,
    originalCondition,
  });

  const handleFileImport = async (file: File | undefined) => {
    if (!file) return;
    setImportError('');
    setImportSuccess('');
    try {
      await onImportJsonFile(file);
      setImportSuccess(`Đã nạp dữ liệu từ tệp "${file.name}" vào tulieu.json.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Không thể đọc tệp tulieu.json.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-base font-medium text-stone-600">
            Mục lục tư liệu số hoá · Dublin Core
          </p>
          <h1 className="font-editorial mt-1 text-3xl font-semibold text-stone-900 sm:text-4xl">
            Thư viện ảnh gia đình theo thập niên
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-stone-700">
            Số hoá ảnh &amp; tư liệu cũ qua các thập niên, ghi chú ai, ở đâu, khi nào theo lời kể người cung cấp và ghi rõ phần chưa xác định được.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onOpenIntake}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md bg-[#9A3412] px-4 py-2 text-base font-medium text-white hover:bg-[#7C2D12] sm:whitespace-nowrap"
          >
            <FolderPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Thêm bản ghi thật</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-base font-medium text-stone-800 hover:bg-stone-100 sm:whitespace-nowrap"
          >
            <FileUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Nhập tệp tulieu.json</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              void handleFileImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {importError && (
        <div role="alert" className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-base text-red-900">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div role="status" className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-base text-emerald-900">
          {importSuccess}
        </div>
      )}

      <section aria-label="Bộ lọc danh sách tư liệu" className="mt-6 rounded-md border border-stone-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <label htmlFor="list-search" className="block text-sm font-medium text-stone-700">
              Tìm kiếm toàn văn bản
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                id="list-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo nhan đề, mô tả, người cho phép công bố..."
                className="min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] pr-3 pl-9 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="list-copy-type" className="block text-sm font-medium text-stone-700">
              Loại bản đang hiển thị
            </label>
            <select
              id="list-copy-type"
              value={copyType}
              onChange={(e) => setCopyType(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
            >
              <option value="Tất cả">Tất cả loại bản</option>
              <option value="Bản gốc">Bản gốc</option>
              <option value="Bản sao">Bản sao</option>
              <option value="Bản số">Bản số</option>
            </select>
          </div>

          <div>
            <label htmlFor="list-original-condition" className="block text-sm font-medium text-stone-700">
              Tình trạng bản gốc
            </label>
            <select
              id="list-original-condition"
              value={originalCondition}
              onChange={(e) => setOriginalCondition(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
            >
              {ORIGINAL_CONDITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'Tất cả' ? 'Tất cả tình trạng' : opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="list-verification" className="block text-sm font-medium text-stone-700">
              Mức kiểm chứng
            </label>
            <select
              id="list-verification"
              value={verification}
              onChange={(e) => setVerification(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-md border border-stone-300 bg-[#FBF9F5] px-3 text-base text-stone-900 focus:border-[#9A3412] focus:outline-none"
            >
              <option value="Tất cả">Tất cả mức kiểm chứng</option>
              <option value="Đã có người kiểm">Đã kiểm (Đã có người kiểm)</option>
              <option value="Chưa kiểm">Chưa kiểm</option>
              <option value="Chưa đọc được">Chưa đọc được</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
          {decadeFilterOptions.map(({ decade: dec, count }) => (
            <button
              key={dec}
              type="button"
              onClick={() => setDecade(dec)}
              className={`min-h-[44px] cursor-pointer rounded-md px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                decade === dec
                  ? 'bg-stone-900 text-white'
                  : 'bg-[#F3EFE7] text-stone-800 hover:bg-stone-200'
              }`}
            >
              {dec} <span className="font-mono opacity-80">({count})</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
        <span className="font-mono tabular-nums break-words">
          Hiển thị {filtered.length} / {records.length} bản ghi trong tulieu.json
          {query.trim() ? ` · Đang tìm: "${query.trim()}"` : ''}
        </span>
        {(query ||
          decade !== 'Tất cả' ||
          verification !== 'Tất cả' ||
          copyType !== 'Tất cả' ||
          originalCondition !== 'Tất cả') && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDecade('Tất cả');
              setVerification('Tất cả');
              setCopyType('Tất cả');
              setOriginalCondition('Tất cả');
            }}
            className="inline-flex min-h-[44px] cursor-pointer items-center px-2 font-medium text-[#9A3412] hover:underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <section
          aria-label="Trạng thái kho dữ liệu rỗng"
          className="mt-6 rounded-md border border-stone-200 bg-white p-8"
        >
          <div className="max-w-2xl">
            <h2 className="font-editorial text-2xl font-semibold text-stone-900">
              Kho đang để sẵn cấu trúc rỗng chờ nạp dữ liệu thật
            </h2>
            <p className="mt-3 text-base leading-relaxed text-stone-700">
              Hiện tại tệp <code className="font-mono text-sm">tulieu.json</code> có <span className="font-mono font-semibold tabular-nums">0</span> bản ghi vì hệ thống không tạo dữ liệu giả và tuyệt đối không dùng ảnh do máy sinh thay cho ảnh gia đình thật.
            </p>
            <p className="mt-2 text-base leading-relaxed text-stone-700">
              Bạn có thể nạp tệp <code className="font-mono text-sm">tulieu.json</code> đã biên soạn, thêm trực tiếp bản ghi mới kèm ảnh thật, hoặc mở xem trước khung chi tiết chuẩn kiểm kê bảo tàng (15 trường Dublin Core + phiên âm/dịch nghĩa có nhãn mức kiểm chứng).
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSelectRecord(null)}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-[#F3EFE7] px-4 py-2 text-base font-medium text-stone-900 hover:bg-stone-200/70"
              >
                <Eye className="h-4 w-4 shrink-0 text-[#9A3412]" aria-hidden="true" />
                <span>Xem khung mẫu chi tiết chuẩn (Màn hình 3)</span>
              </button>
              <button
                type="button"
                onClick={onOpenIntake}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md bg-[#9A3412] px-4 py-2 text-base font-medium text-white hover:bg-[#7C2D12]"
              >
                <FolderPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Thêm bản ghi đầu tiên</span>
              </button>
            </div>
          </div>
        </section>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-md border border-stone-200 bg-white p-8 text-center">
          <p className="text-base font-medium text-stone-800">
            Không tìm thấy bản ghi nào khớp với bộ lọc hiện tại.
          </p>
          <p className="mt-1 text-base text-stone-600">
            Hãy thử từ khoá khác hoặc đặt lại bộ lọc thập niên.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rec, index) => {
            const firstImage = rec.danh_sach_tep_anh[0];
            const permitted = hasPublishPermission(rec);
            const badge = getVerificationBadgeMeta(rec.muc_kiem_chung);

            return (
              <article
                key={rec.dc_identifier || `rec-${index}`}
                className="flex min-w-0 flex-col overflow-hidden rounded-md border border-stone-200 bg-white"
              >
                <div className="aspect-[4/3] w-full border-b border-stone-200 bg-[#F3EFE7]">
                  {!permitted ? (
                    <div
                      role="status"
                      className="flex h-full w-full flex-col items-center justify-center bg-amber-50/70 p-5 text-center"
                    >
                      <Lock className="h-6 w-6 text-amber-800" aria-hidden="true" />
                      <p className="mt-2 text-base font-semibold text-amber-950">
                        Chờ xác nhận quyền công bố
                      </p>
                      <p className="mt-1 text-base leading-relaxed text-amber-900">
                        Ảnh được ẩn vì bản ghi thiếu thông tin người cho phép công bố.
                      </p>
                    </div>
                  ) : firstImage?.duong_dan ? (
                    <img
                      src={firstImage.duong_dan}
                      alt={firstImage.chu_thich || rec.dc_title || 'Ảnh tư liệu gia đình'}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-stone-500">
                      <ImageOff className="h-6 w-6" aria-hidden="true" />
                      <span className="mt-2 text-sm">Chưa gắn tệp ảnh trong anh_tu_lieu</span>
                    </div>
                  )}
                </div>

                {firstImage && (
                  <p className="border-b border-stone-100 bg-[#FBF9F5] px-4 py-2.5 text-base leading-relaxed text-stone-700 break-words">
                    {permitted
                      ? `${firstImage.chu_thich || 'Chưa có chú thích ảnh'} · Nguồn: ${firstImage.nguon || rec.dc_source || 'Gia đình lưu giữ'}`
                      : 'Chờ xác nhận quyền công bố từ người giữ tư liệu trước khi hiển thị ảnh.'}
                  </p>
                )}

                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-stone-600 tabular-nums break-words">
                        {rec.dc_identifier || rec.so_dang_ky || 'Chưa cấp mã'} · {rec.thap_nien || 'Chưa rõ thập niên'} · {rec.loai_ban_dang_hien_thi || 'Chưa rõ loại bản'}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${badge.badgeClass}`}
                      >
                        {badge.tone === 'green' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : badge.tone === 'gray' ? (
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{badge.shortLabel}</span>
                      </span>
                    </div>

                    <h2 className="font-editorial mt-2 text-xl font-semibold text-stone-900 break-words">
                      {rec.dc_title || 'Bản ghi chưa đặt nhan đề'}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-base leading-relaxed text-stone-700 break-words">
                      {rec.dc_description || 'Chưa có mô tả nội dung.'}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-base text-stone-700">
                    <p className="break-words">
                      <span className="font-medium text-stone-800">Tình trạng bản gốc:</span>{' '}
                      <span>{rec.tinh_trang_ban_goc || 'Chưa ghi tình trạng'}</span>
                    </p>
                    <p className="break-words">
                      <span className="font-medium text-stone-800">Ở đâu · Khi nào:</span>{' '}
                      <span>{rec.dc_coverage || rec.dc_date || 'Chưa rõ địa điểm/thời gian'}</span>
                    </p>
                    <p className="break-words">
                      <span className="font-medium text-stone-800">Người cung cấp chú thích:</span>{' '}
                      <span className="text-stone-900">{rec.nguoi_cung_cap_chu_thich || rec.dc_contributor || 'Chưa ghi nhận'}</span>
                    </p>
                    <p className="break-words">
                      <span className="font-medium text-stone-800">Lưu giữ:</span>{' '}
                      <span>{rec.noi_luu_giu_hien_nay || 'Chưa ghi'}</span>
                    </p>
                    <p className="break-words">
                      <span className="font-medium text-stone-800">Người cho phép công bố:</span>{' '}
                      <span className={permitted ? 'text-stone-900' : 'text-amber-900 font-medium'}>
                        {rec.nguoi_cho_phep_cong_bo || 'Chờ xác nhận quyền'}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectRecord(rec)}
                      className="mt-3 inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-md border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-base font-medium text-stone-900 hover:bg-stone-100"
                    >
                      Xem chi tiết bản ghi
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
