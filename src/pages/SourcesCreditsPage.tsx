import { useState } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { ARCHIVAL_SOURCES } from '../data/sources';
import type { ArchivalRecord } from '../types/archive';

interface SourcesCreditsPageProps {
  records: ArchivalRecord[];
}

export function SourcesCreditsPage({ records }: SourcesCreditsPageProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('Tất cả');

  const filteredSources = ARCHIVAL_SOURCES.filter(
    (src) => categoryFilter === 'Tất cả' || src.category === categoryFilter
  );

  const officialCount = ARCHIVAL_SOURCES.filter((s) =>
    s.category.startsWith('Chính thống')
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium text-stone-500">
          Căn cứ pháp lý, chuẩn quốc tế & quyền công bố
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-semibold text-stone-900 sm:text-4xl">
          Nguồn tư liệu & Ghi nhận người cho phép
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
          Tổng hợp {ARCHIVAL_SOURCES.length} nguồn tham khảo (gồm 8 nguồn tư liệu trực tiếp về Bộ sưu tập nhạc sĩ Hoàng Vân và {officialCount} văn bản pháp lý, chuẩn quốc tế của Nhà nước Việt Nam, UNESCO / DCMI), cùng mục ghi nhận người giữ tư liệu cho phép công bố và phạm vi được phép.
        </p>
      </div>

      {/* Phần 1: Nguồn tư liệu */}
      <section aria-labelledby="sources-list-heading" className="py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="sources-list-heading" className="font-editorial text-2xl font-semibold text-stone-900">
            1. Danh mục nguồn tư liệu và văn bản quy chuẩn
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Tất cả',
              'Nguồn tư liệu Hoàng Vân',
              'Chính thống (Việt Nam)',
              'Chính thống (Quốc tế)',
              'Chuẩn & Tham khảo',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[36px] cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-[#F3EFE7] text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredSources.map((src, index) => (
            <article
              key={src.id}
              className="flex flex-col justify-between rounded-md border border-stone-200 bg-white p-5"
            >
              <div>
                <p className="text-xs text-stone-500">
                  <span className="font-mono tabular-nums">{String(index + 1).padStart(2, '0')}.</span> {src.category}
                  {src.effectiveDate ? ` · ${src.effectiveDate}` : ''}
                </p>
                <h3 className="font-editorial mt-1.5 text-xl font-semibold text-stone-900">
                  {src.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-stone-600">
                  Cơ quan ban hành / Chủ quản: {src.issuer}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-stone-700">
                  {src.summary}
                </p>
              </div>

              <div className="mt-4 border-t border-stone-100 pt-3">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-medium text-[#1E3A8A] underline-offset-4 hover:underline"
                >
                  <span>Mở nguồn gốc</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Phần 2: Ghi nhận người cho phép công bố và phạm vi được phép */}
      <section aria-labelledby="consent-credits-heading" className="border-t border-stone-200 pt-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#9A3412]" aria-hidden="true" />
          <h2 id="consent-credits-heading" className="font-editorial text-2xl font-semibold text-stone-900">
            2. Ghi nhận người cho phép công bố và phạm vi được phép
          </h2>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
          Thực hiện Điều 60 và Điều 63 Luật Di sản văn hoá số 45/2024/QH15 cùng Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15: tư liệu thuộc gia đình nào do chính chủ sở hữu hoặc người giữ hợp pháp quyết định việc công bố, phạm vi sử dụng và phần thông tin riêng tư cần giữ kín.
        </p>

        {records.length === 0 ? (
          <div className="mt-5 rounded-md border border-stone-200 bg-white p-6 text-sm text-stone-700">
            <p className="font-medium text-stone-900">
              Bảng ghi nhận quyền công bố sẽ tự động tổng hợp từ các bản ghi trong tulieu.json.
            </p>
            <p className="mt-1.5 text-stone-600">
              Hiện tại kho đang ở cấu trúc rỗng (0 bản ghi). Khi nạp từng bản ghi ảnh gia đình thật, bảng này sẽ liệt kê đầy đủ: Mã bản ghi, Nơi lưu giữ hiện nay, Người cho phép công bố, Phạm vi được phép và Trạng thái ẩn phần riêng tư.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-md border border-stone-200 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-[#F3EFE7] text-xs font-semibold uppercase tracking-wider text-stone-600">
                  <th className="px-4 py-3">Mã bản ghi</th>
                  <th className="px-4 py-3">Nhan đề tư liệu</th>
                  <th className="px-4 py-3">Nơi lưu giữ hiện nay</th>
                  <th className="px-4 py-3">Người cho phép công bố</th>
                  <th className="px-4 py-3">Phạm vi được phép</th>
                  <th className="px-4 py-3">Phần không công bố</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {records.map((rec, idx) => (
                  <tr key={rec.dc_identifier || idx}>
                    <td className="px-4 py-3 font-mono text-xs text-stone-700 tabular-nums">
                      {rec.dc_identifier || rec.so_dang_ky || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {rec.dc_title || 'Chưa đặt nhan đề'}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {rec.noi_luu_giu_hien_nay || 'Chưa ghi'}
                    </td>
                    <td className="px-4 py-3 text-stone-900">
                      {rec.nguoi_cho_phep_cong_bo || 'Chưa ghi nhận'}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {rec.pham_vi_duoc_phep || 'Chưa ghi rõ'}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600">
                      {rec.phan_khong_cong_bo
                        ? 'Có phần riêng tư được giữ kín'
                        : 'Không có'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
