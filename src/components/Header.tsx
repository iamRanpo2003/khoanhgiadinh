import { useState } from 'react';
import { Download, Menu, X } from 'lucide-react';

export type ScreenId = 'home' | 'list' | 'detail' | 'qa' | 'sources' | 'about';

interface HeaderProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onExport: () => void;
}

const NAV_ITEMS: Array<{ id: ScreenId; label: string }> = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'list', label: 'Danh sách ảnh' },
  { id: 'qa', label: 'Hỏi đáp' },
  { id: 'sources', label: 'Nguồn & Ghi nhận' },
  { id: 'about', label: 'Giới thiệu' },
];

export function Header({ activeScreen, onNavigate, onExport }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: ScreenId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#FBF9F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-8 sm:px-6 sm:py-3.5">
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="font-editorial min-h-[44px] cursor-pointer text-left text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412]"
        >
          Kho Ảnh Gia Đình
        </button>

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeScreen === item.id ||
              (item.id === 'list' && activeScreen === 'detail');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`min-h-[44px] cursor-pointer border-b-2 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A3412] ${
                  isActive
                    ? 'border-[#9A3412] text-stone-900'
                    : 'border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExport}
            className="hidden min-h-[44px] cursor-pointer items-center gap-2 rounded-md bg-[#9A3412] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7C2D12] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412] md:inline-flex"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Xuất dữ liệu</span>
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-md border border-stone-200 bg-white text-stone-800 hover:bg-stone-100 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-[#FBF9F5] px-4 py-3 md:hidden">
          <nav aria-label="Điều hướng di động" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                activeScreen === item.id ||
                (item.id === 'list' && activeScreen === 'detail');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F3EFE7] text-[#9A3412]'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                onExport();
                setMobileMenuOpen(false);
              }}
              className="mt-2 flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#9A3412] px-4 text-sm font-medium text-white hover:bg-[#7C2D12]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Xuất dữ liệu (tulieu.json)</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
