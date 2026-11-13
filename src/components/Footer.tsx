import { Download } from 'lucide-react';
import type { ScreenId } from './Header';

interface FooterProps {
  onNavigate: (screen: ScreenId) => void;
  onExport: () => void;
  totalRecords: number;
}

export function Footer({ onNavigate, onExport, totalRecords }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-[#F3EFE7]/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-editorial text-xl font-semibold text-stone-900">
              Kho Ảnh Gia Đình Có Chú Thích
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Lưu trữ, kiểm kê và trưng bày tư liệu ảnh gia đình theo chuẩn 15 trường Dublin Core, Luật Di sản văn hoá 45/2024/QH15 và Thông tư 05/2025/TT-BVHTTDL.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Quy chuẩn hiển thị tư liệu
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Chỉ sử dụng ảnh tư liệu thật được chủ sở hữu cho phép. Tuyệt đối không dùng ảnh do máy sinh thay cho hiện vật thật. Bản gốc độ phân giải cao lưu ngoại tuyến; giao diện web hiển thị bản giảm kích thước.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Thao tác kho dữ liệu
              </h2>
              <p className="mt-2 font-mono text-sm text-stone-700 tabular-nums">
                Số bản ghi hiện có: {totalRecords}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onExport}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Xuất tulieu.json</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="inline-flex min-h-[40px] cursor-pointer items-center rounded-md px-2 py-2 text-sm font-medium text-[#1E3A8A] underline-offset-4 hover:underline whitespace-nowrap shrink-0"
              >
                Thông tin thực hiện
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-stone-200 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Sản phẩm thực tập của Nguyễn Viết Hải (PH63500 · Nhóm 01) — Chương trình Thực tập sinh Đợt 15 FPT Polytechnic và IMTA TECH · Dự án xã hội phi lợi nhuận.
          </p>
          <p className="font-mono tabular-nums">UTF-8 · Dublin Core</p>
        </div>
      </div>
    </footer>
  );
}
