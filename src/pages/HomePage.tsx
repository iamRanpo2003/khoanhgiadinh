import type { ArchivalRecord } from '../types/archive';
import type { ScreenId } from '../components/Header';
import { getNonEmptyDecades } from '../utils/archiveLogic';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

interface HomePageProps {
  records: ArchivalRecord[];
  onSearchNavigate: (query: string, decade?: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export function HomePage({
  records,
  onSearchNavigate,
  onNavigate,
}: HomePageProps) {
  const visibleDecades = getNonEmptyDecades(records);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section aria-labelledby="hero-heading" className="border-b border-stone-200 pb-10 sm:pb-12">
        <h1
          id="hero-heading"
          className="font-editorial max-w-3xl text-3xl font-semibold leading-tight text-stone-900 sm:text-5xl"
          style={{ textWrap: 'balance' }}
        >
          Số hoá, chú thích và tra cứu kho ảnh tư liệu gia đình nhạc sĩ Hoàng Vân
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-700 sm:text-lg">
          Dành cho thành viên gia đình lưu giữ ký ức qua từng bức ảnh cũ, người nghiên cứu di sản âm nhạc và bạn đọc tra cứu {records.length} bản ghi tư liệu thật lưu giữ tại Hà Nội.
        </p>

        <div className="mt-7">
          <button
            type="button"
            onClick={() => onNavigate('list')}
            className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#9A3412] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#7C2D12]"
          >
            <span>Bắt đầu dùng ngay</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section aria-labelledby="provenance-heading" className="border-b border-stone-200 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="provenance-heading" className="font-editorial text-2xl font-semibold text-stone-900 sm:text-3xl">
            Khối tư liệu, Nơi lưu giữ &amp; Quyền cho phép công bố
          </h2>
          <span className="font-mono text-sm text-stone-500 tabular-nums">
            {records.length} bản ghi đã nạp
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <article className="rounded-md border border-stone-200 bg-white p-5">
            <h3 className="text-base font-semibold text-stone-900">1. Khối tư liệu số hoá</h3>
            <p className="mt-2 text-base leading-relaxed text-stone-600">
              Bộ sưu tập tài liệu của nhạc sĩ Hoàng Vân (được UNESCO ghi danh Ký ức Thế giới năm 2025): gồm bản nhạc, tư liệu giao hưởng, ảnh chân dung và tư liệu bối cảnh qua các thập niên 1950s–2010s.
            </p>
          </article>

          <article className="rounded-md border border-stone-200 bg-white p-5">
            <h3 className="text-base font-semibold text-stone-900">2. Nơi lưu giữ hiện nay</h3>
            <p className="mt-2 text-base leading-relaxed text-stone-600">
              Bản gốc vật lý lưu giữ tại <strong className="font-medium text-stone-900">Gia đình nhạc sĩ Hoàng Vân, Hà Nội</strong> (cùng phông chuyển giao tại Trung tâm Lưu trữ Quốc gia III). Web hiển thị bản số giảm kích thước tại <code className="font-mono text-sm">anh_tu_lieu</code>.
            </p>
          </article>

          <article className="rounded-md border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#9A3412]" aria-hidden="true" />
              <h3 className="text-base font-semibold text-stone-900">3. Người cho phép công bố</h3>
            </div>
            <p className="mt-2 text-base leading-relaxed text-stone-600">
              <strong className="font-medium text-stone-900">Gia đình nhạc sĩ Hoàng Vân</strong> (đại diện TS. Lê Y Linh &amp; Nhạc trưởng Lê Phi Phi) công bố công khai trên <code className="font-mono text-sm">hoangvan.org</code> phục vụ học tập, nghiên cứu phi thương mại.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="decades-heading" className="py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="decades-heading" className="font-editorial text-2xl font-semibold text-stone-900 sm:text-3xl">
              Thư viện ảnh theo thập niên
            </h2>
            <p className="mt-1 text-base text-stone-600">
              Chọn một thập niên để duyệt danh mục tư liệu, hoặc xem khung cấu trúc kiểm kê 15 trường Dublin Core.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('detail')}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 text-base font-medium text-[#1E3A8A] underline-offset-4 hover:underline"
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Xem khung cấu trúc chi tiết bản ghi</span>
          </button>
        </div>

        {visibleDecades.length === 0 ? (
          <p className="mt-6 rounded-md border border-stone-200 bg-white p-5 text-base text-stone-600">
            Chưa có bản ghi nào theo thập niên trong kho dữ liệu.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {visibleDecades.map(({ decade, count }) => (
              <button
                key={decade}
                type="button"
                onClick={() => onSearchNavigate('', decade)}
                className="flex min-h-[76px] cursor-pointer flex-col justify-between rounded-md border border-stone-200 bg-white p-4 text-left transition-colors hover:border-[#9A3412]/60 hover:bg-[#F3EFE7]/60"
              >
                <span className="font-editorial text-xl font-semibold text-stone-900">
                  {decade}
                </span>
                <span className="font-mono text-sm text-stone-500 tabular-nums">
                  {count} bản ghi
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
