import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, FileSpreadsheet, FolderArchive, Search, ShieldCheck } from 'lucide-react';
import type { ArchivalRecord } from '../types/archive';
import type { ScreenId } from '../components/Header';
import { DECADE_OPTIONS, groupRecordsByDecade } from '../utils/archiveLogic';

interface HomePageProps {
  records: ArchivalRecord[];
  onSearchNavigate: (query: string, decade?: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenIntake: () => void;
}

export function HomePage({
  records,
  onSearchNavigate,
  onNavigate,
  onOpenIntake,
}: HomePageProps) {
  const [searchInput, setSearchInput] = useState('');
  const decadeCounts = groupRecordsByDecade(records);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchNavigate(searchInput.trim(), 'Tất cả');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section aria-labelledby="hero-heading" className="border-b border-stone-200 pb-12">
        <p className="text-sm font-medium text-stone-500">
          Di sản Tư liệu Thế giới UNESCO 2025 · Bộ sưu tập tài liệu của nhạc sĩ Hoàng Vân · Chuẩn Dublin Core & Luật Di sản 2024
        </p>

        <h1
          id="hero-heading"
          className="font-editorial mt-3 max-w-3xl text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl"
          style={{ textWrap: 'balance' }}
        >
          Kho Ảnh &amp; Tư Liệu Gia Đình Nhạc Sĩ Hoàng Vân
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-700 sm:text-lg">
          Không gian kiểm kê chuẩn bảo tàng và trưng bày số tư liệu gia đình qua các thập niên — giới thiệu Bộ sưu tập tài liệu của nhạc sĩ Hoàng Vân (1930–2018) lưu giữ tại Gia đình nhạc sĩ ở Hà Nội, tách bạch rõ bản gốc, bản sao, bản số và phần chưa xác định được.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl" role="search" aria-label="Tìm kiếm tư liệu ảnh gia đình">
          <label htmlFor="home-search-input" className="sr-only">
            Tìm kiếm theo tác phẩm, địa điểm, thập niên hoặc mã bản ghi
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                id="home-search-input"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm Hò kéo pháo, Quảng Bình, thập niên 1960s, mã bản ghi..."
                className="min-h-[48px] w-full rounded-md border border-stone-300 bg-white pr-4 pl-11 text-base text-stone-900 placeholder:text-stone-400 focus:border-[#9A3412] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#9A3412] px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-[#7C2D12] whitespace-nowrap shrink-0"
            >
              <span>Tìm tư liệu</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('list')}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0"
          >
            <FolderArchive className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
            <span>Xem danh sách ảnh gia đình</span>
          </button>

          <button
            type="button"
            onClick={onOpenIntake}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-[#F3EFE7] px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-200/70 whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
            <span>Nạp bản ghi tư liệu thật</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('qa')}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#1E3A8A] underline-offset-4 hover:underline whitespace-nowrap shrink-0"
          >
            <span>Hỏi đáp trên tulieu.json</span>
          </button>
        </div>
      </section>

      <section aria-labelledby="provenance-heading" className="border-b border-stone-200 py-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="provenance-heading" className="font-editorial text-2xl font-semibold text-stone-900 sm:text-3xl">
            Khối tư liệu, Nơi lưu giữ & Quyền cho phép công bố
          </h2>
          <span className="font-mono text-xs text-stone-500 tabular-nums">
            {records.length} bản ghi đã nạp
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <article className="rounded-md border border-stone-200 bg-white p-5">
            <h3 className="text-base font-semibold text-stone-900">1. Khối tư liệu số hoá</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Bộ sưu tập tài liệu của nhạc sĩ Hoàng Vân (được UNESCO ghi danh Ký ức Thế giới cấp Thế giới năm 2025): gồm các bản nhạc, tư liệu giao hưởng, ảnh chân dung và tư liệu bối cảnh qua các thập niên 1950s–2010s kèm chú thích truyền khẩu gia đình.
            </p>
          </article>

          <article className="rounded-md border border-stone-200 bg-white p-5">
            <h3 className="text-base font-semibold text-stone-900">2. Nơi lưu giữ hiện nay</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Bản gốc vật lý lưu giữ tại <strong className="font-medium text-stone-900">Gia đình nhạc sĩ Hoàng Vân, Hà Nội</strong> (cùng phông chuyển giao tại Trung tâm Lưu trữ Quốc gia III). Trên web chỉ hiển thị bản số giảm kích thước tại <code className="font-mono text-xs">anh_tu_lieu</code> và hồ sơ <code className="font-mono text-xs">tulieu.json</code>.
            </p>
          </article>

          <article className="rounded-md border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
              <h3 className="text-base font-semibold text-stone-900">3. Người cho phép công bố</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              <strong className="font-medium text-stone-900">Gia đình nhạc sĩ Hoàng Vân</strong> (đại diện TS. Lê Y Linh &amp; Nhạc trưởng Lê Phi Phi) công bố công khai trên <code className="font-mono text-xs">hoangvan.org</code> cho mục đích học tập, nghiên cứu phi thương mại theo Điều 60 Luật Di sản văn hoá 45/2024/QH15 và Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="decades-heading" className="py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="decades-heading" className="font-editorial text-2xl font-semibold text-stone-900 sm:text-3xl">
              Thư viện ảnh theo thập niên
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Chọn một thập niên để duyệt danh mục tư liệu, hoặc xem khung cấu trúc kiểm kê 15 trường Dublin Core.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('detail')}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 text-sm font-medium text-[#1E3A8A] underline-offset-4 hover:underline whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Xem khung cấu trúc chi tiết bản ghi</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {DECADE_OPTIONS.filter((d) => d !== 'Tất cả').map((decade) => {
            const count = decadeCounts[decade] ?? 0;
            return (
              <button
                key={decade}
                type="button"
                onClick={() => onSearchNavigate('', decade)}
                className="flex min-h-[76px] cursor-pointer flex-col justify-between rounded-md border border-stone-200 bg-white p-4 text-left transition-colors hover:border-[#9A3412]/60 hover:bg-[#F3EFE7]/60"
              >
                <span className="font-editorial text-xl font-semibold text-stone-900">
                  {decade}
                </span>
                <span className="font-mono text-xs text-stone-500 tabular-nums">
                  {count} bản ghi
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
