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

  const uniqueContributors = Array.from(
    new Set(
      records
        .map((r) => r.nguoi_cung_cap_chu_thich || r.dc_contributor)
        .filter((v) => typeof v === 'string' && v.trim().length > 0)
    )
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-base font-medium text-stone-600">
          Căn cứ pháp lý, chuẩn quốc tế &amp; quyền công bố
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-semibold text-stone-900 sm:text-4xl">
          Nguồn và Ghi nhận người đóng góp tư liệu
        </h1>
      </div>

      {/* Phần 1: Nguồn dữ liệu */}
      <section aria-labelledby="sources-list-heading" className="py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="sources-list-heading" className="font-editorial text-2xl font-semibold text-stone-900">
            1. Danh mục nguồn dữ liệu đang dùng
          </h2>

          <div className="flex flex-wrap gap-2">
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
                className={`min-h-[44px] cursor-pointer rounded-md px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
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
              className="flex min-w-0 flex-col justify-between rounded-md border border-stone-200 bg-white p-5"
            >
              <div className="min-w-0">
                <p className="text-sm text-stone-500">
                  <span className="font-mono tabular-nums">{String(index + 1).padStart(2, '0')}.</span> {src.category}
                  {src.effectiveDate ? ` · ${src.effectiveDate}` : ''}
                </p>
                <h3 className="font-editorial mt-1.5 text-xl font-semibold text-stone-900">
                  {src.title}
                </h3>

                <dl className="mt-3 space-y-1.5 border-t border-stone-100 pt-3 text-base">
                  {src.issuer && (
                    <div>
                      <dt className="inline font-semibold text-stone-700">Đơn vị phát hành: </dt>
                      <dd className="inline text-stone-800">{src.issuer}</dd>
                    </div>
                  )}
                  {src.year && (
                    <div>
                      <dt className="inline font-semibold text-stone-700">Năm: </dt>
                      <dd className="inline font-mono tabular-nums text-stone-900">
                        {src.year}
                      </dd>
                    </div>
                  )}
                  {src.url && (
                    <div className="min-w-0">
                      <dt className="inline font-semibold text-stone-700">Đường dẫn: </dt>
                      <dd className="inline break-all font-mono text-sm text-stone-600">
                        {src.url}
                      </dd>
                    </div>
                  )}
                </dl>

                <p className="mt-3 text-base leading-relaxed text-stone-700">
                  {src.summary}
                </p>
              </div>

              {src.url && (
                <div className="mt-4 border-t border-stone-100 pt-3">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-base font-medium text-[#1E3A8A] underline-offset-4 hover:underline"
                  >
                    <span>Mở đường dẫn nguồn gốc</span>
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Phần 2: Ghi nhận người đóng góp và cho phép công bố tư liệu */}
      <section aria-labelledby="consent-credits-heading" className="border-t border-stone-200 pt-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[#9A3412]" aria-hidden="true" />
          <h2 id="consent-credits-heading" className="font-editorial text-2xl font-semibold text-stone-900">
            2. Ghi nhận người đóng góp &amp; cho phép công bố tư liệu
          </h2>
        </div>

        <p className="mt-2 max-w-3xl text-base leading-relaxed text-stone-600">
          Thực hiện Điều 60 và Điều 63 Luật Di sản văn hoá số 45/2024/QH15 cùng Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15: trân trọng ghi nhận chủ sở hữu, người cung cấp lời kể chú thích và phạm vi được phép công bố cho từng tư liệu.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-md border border-stone-200 bg-[#F3EFE7]/60 p-5">
            <h3 className="text-base font-semibold text-stone-900">
              Gia đình &amp; đơn vị đóng góp tư liệu trong kho hiện tại
            </h3>
            <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-base text-stone-700">
              <li>
                <strong className="font-medium text-stone-900">Gia đình nhạc sĩ Hoàng Vân (Hà Nội)</strong> — TS. Lê Y Linh &amp; Nhạc trưởng Lê Phi Phi: lưu giữ, số hoá, chú thích và cho phép công bố qua <code className="font-mono text-sm">hoangvan.org</code>.
              </li>
              <li>
                <strong className="font-medium text-stone-900">Trung tâm Lưu trữ Quốc gia III (Hà Nội)</strong>: tiếp nhận, bảo quản phông tài liệu cá nhân nhạc sĩ Hoàng Vân.
              </li>
              {uniqueContributors.length > 0 && (
                <li>
                  <strong className="font-medium text-stone-900">Người cung cấp chú thích ghi nhận trong tulieu.json:</strong>{' '}
                  {uniqueContributors.join(' · ')}
                </li>
              )}
            </ul>
          </article>

          <article className="rounded-md border border-stone-200 bg-white p-5">
            <h3 className="text-base font-semibold text-stone-900">
              Biên mục, kiểm chứng &amp; vận hành kỹ thuật
            </h3>
            <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-base text-stone-700">
              <li>
                <strong className="font-medium text-stone-900">Nguyễn Viết Hải (PH63500 · Nhóm 01)</strong>: đối chiếu nguyên văn chữ trên ảnh bản nhạc đã công bố và biên mục chuẩn Dublin Core vào <code className="font-mono text-sm">tulieu.json</code>.
              </li>
              <li>
                <strong className="font-medium text-stone-900">Các bản ghi trạng thái Chưa kiểm:</strong> giữ nguyên nhãn cảnh báo vàng để người kiểm chứng gia đình hoặc chuyên môn rà soát bổ sung sau.
              </li>
            </ul>
          </article>
        </div>

        {records.length === 0 ? (
          <div className="mt-5 rounded-md border border-stone-200 bg-white p-6 text-base text-stone-700">
            <p className="font-medium text-stone-900">
              Bảng ghi nhận quyền công bố sẽ tự động tổng hợp từ các bản ghi trong tulieu.json.
            </p>
            <p className="mt-1.5 text-stone-600">
              Hiện tại kho đang ở cấu trúc rỗng (0 bản ghi). Khi nạp từng bản ghi ảnh gia đình thật, bảng này sẽ liệt kê đầy đủ: Mã bản ghi, Nơi lưu giữ hiện nay, Người cho phép công bố, Phạm vi được phép và Trạng thái ẩn phần riêng tư.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <p className="mb-2 text-sm text-stone-500">
              Bảng đối chiếu chi tiết {records.length} bản ghi (cuộn ngang trong khung bảng nếu màn hình hẹp):
            </p>
            <div className="overflow-x-auto rounded-md border border-stone-200 bg-white">
              <table className="w-full min-w-[720px] border-collapse text-left text-base">
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
                      <td className="px-4 py-3 font-mono text-sm text-stone-700 tabular-nums whitespace-nowrap">
                        {rec.dc_identifier || rec.so_dang_ky || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {rec.dc_title || '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {rec.noi_luu_giu_hien_nay || '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-900">
                        {rec.nguoi_cho_phep_cong_bo || '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {rec.pham_vi_duoc_phep || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {rec.phan_khong_cong_bo
                          ? 'Có phần riêng tư được giữ kín'
                          : 'Không có'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
