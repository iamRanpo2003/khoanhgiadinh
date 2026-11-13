import { Download } from 'lucide-react';
import type { ArchivalRecord } from '../types/archive';

interface AboutPageProps {
  records: ArchivalRecord[];
  onExport: () => void;
}

export function AboutPage({ records, onExport }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium text-stone-500">
          Hồ sơ dự án trưng bày số
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-semibold text-stone-900 sm:text-4xl">
          Giới thiệu Kho Ảnh Gia Đình Có Chú Thích
        </h1>
      </div>

      <section aria-labelledby="author-credit-heading" className="mt-8 rounded-md border border-stone-200 bg-white p-6">
        <h2 id="author-credit-heading" className="font-editorial text-2xl font-semibold text-stone-900">
          Thông tin tác giả & Đơn vị thực hiện
        </h2>
        <p className="mt-3 text-base leading-relaxed text-stone-800">
          Sản phẩm thực tập của <strong className="font-semibold text-stone-900">Nguyễn Viết Hải</strong>, mã sinh viên <strong className="font-mono font-semibold text-stone-900">PH63500</strong>, <strong className="font-semibold text-stone-900">Nhóm 01</strong>, Chương trình Thực tập sinh Đợt 15 FPT Polytechnic và IMTA TECH, dự án xã hội phi lợi nhuận.
        </p>

        <dl className="mt-5 divide-y divide-stone-100 border-t border-stone-200 text-sm">
          <div className="grid gap-1 py-3 sm:grid-cols-12">
            <dt className="font-medium text-stone-600 sm:col-span-4">Sinh viên thực hiện</dt>
            <dd className="text-stone-900 sm:col-span-8">Nguyễn Viết Hải</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-12">
            <dt className="font-medium text-stone-600 sm:col-span-4">Mã sinh viên</dt>
            <dd className="font-mono text-stone-900 sm:col-span-8">PH63500</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-12">
            <dt className="font-medium text-stone-600 sm:col-span-4">Nhóm</dt>
            <dd className="font-mono text-stone-900 sm:col-span-8">Nhóm 01</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-12">
            <dt className="font-medium text-stone-600 sm:col-span-4">Chương trình</dt>
            <dd className="text-stone-900 sm:col-span-8">
              Chương trình Thực tập sinh Đợt 15 FPT Polytechnic và IMTA TECH — Dự án xã hội phi lợi nhuận
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="scope-heading" className="mt-8 space-y-4">
        <h2 id="scope-heading" className="font-editorial text-2xl font-semibold text-stone-900">
          Phạm vi tư liệu, Nơi lưu giữ & Quy tắc bảo quản
        </h2>

        <div className="rounded-md border border-stone-200 bg-white p-6 text-sm leading-relaxed text-stone-700 space-y-3">
          <p>
            <strong>1. Phạm vi nội dung:</strong> Trưng bày và kiểm kê tư liệu thật từ <strong>Bộ sưu tập tài liệu của nhạc sĩ Hoàng Vân</strong> — Di sản Tư liệu Thế giới được UNESCO ghi danh năm 2025 (Cấp Thế giới), gồm bản nhạc số hoá, tư liệu biểu diễn, ảnh chân dung và chú thích lịch sử qua các thập niên 1950s–2010s; phân biệt rõ phần đã kiểm chứng và phần chưa xác định được.
          </p>
          <p>
            <strong>2. Nơi lưu giữ và quyền cho phép:</strong> Bản gốc vật lý và tài liệu gia đình lưu giữ tại <strong>Gia đình nhạc sĩ Hoàng Vân, Hà Nội</strong> (cùng phần phông lưu trữ chuyển giao tại Trung tâm Lưu trữ Quốc gia III). Hệ thống web chỉ hiển thị bản số giảm kích thước đặt trong thư mục <code className="font-mono text-xs">anh_tu_lieu</code> theo bản đã công bố chính thức của gia đình tại <code className="font-mono text-xs">hoangvan.org</code> (TS. Lê Y Linh &amp; Nhạc trưởng Lê Phi Phi cho phép sử dụng học tập, nghiên cứu phi thương mại).
          </p>
          <p>
            <strong>3. Chuẩn dữ liệu tái sử dụng lâu dài:</strong> Toàn bộ siêu dữ liệu lưu trong tệp chuẩn mở <code className="font-mono text-xs">tulieu.json</code> bảng mã UTF-8, gồm 15 trường Dublin Core và đầy đủ trường kiểm kê theo Luật Di sản văn hoá số 45/2024/QH15 và Thông tư 05/2025/TT-BVHTTDL.
          </p>
          <p>
            <strong>4. Nguyên tắc sử dụng mô hình Gemini:</strong> Chỉ phục vụ hỏi đáp đối chiếu trực tiếp trên <code className="font-mono text-xs">tulieu.json</code> và đề xuất phiên âm nháp từ ảnh với nhãn <em>Chưa kiểm</em> để người kiểm hiệu đính. Tuyệt đối không sinh ảnh giả thay cho ảnh tư liệu thật và không bịa đặt thông tin.
          </p>
        </div>
      </section>

      <section aria-labelledby="export-heading" className="mt-8 rounded-md border border-stone-200 bg-[#F3EFE7] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="export-heading" className="font-editorial text-xl font-semibold text-stone-900">
              Xuất toàn bộ dữ liệu để sao lưu và sử dụng lại
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Tải về tệp <code className="font-mono text-xs">tulieu.json</code> đầy đủ (hiện có <span className="font-mono font-semibold tabular-nums">{records.length}</span> bản ghi, chuẩn UTF-8).
            </p>
          </div>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md bg-[#9A3412] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7C2D12] whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Xuất toàn bộ dữ liệu (tulieu.json)</span>
          </button>
        </div>
      </section>
    </div>
  );
}
