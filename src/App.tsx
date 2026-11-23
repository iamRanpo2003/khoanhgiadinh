import { useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Header, type ScreenId } from './components/Header';
import { RecordIntakeModal } from './components/RecordIntakeModal';
import { AboutPage } from './pages/AboutPage';
import { ArchiveListPage } from './pages/ArchiveListPage';
import { HomePage } from './pages/HomePage';
import { QAPage } from './pages/QAPage';
import { RecordDetailPage } from './pages/RecordDetailPage';
import { SourcesCreditsPage } from './pages/SourcesCreditsPage';
import type { ArchivalRecord, TuLieuDataset } from './types/archive';
import { validateImportedDataset } from './utils/archiveLogic';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [dataset, setDataset] = useState<TuLieuDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('Tất cả');
  const [selectedRecord, setSelectedRecord] = useState<ArchivalRecord | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);

  const loadTuLieu = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/tulieu');
      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu từ tulieu.json.');
      }
      const data = (await res.json()) as TuLieuDataset;
      setDataset(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Lỗi tải kho dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTuLieu();
  }, []);

  const records = dataset?.ban_ghi ?? [];

  const handleNavigate = (screen: ScreenId) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchNavigate = (query: string, decade = 'Tất cả') => {
    setSearchQuery(query);
    setSelectedDecade(decade);
    handleNavigate('list');
  };

  const handleSelectRecord = (rec: ArchivalRecord | null) => {
    setSelectedRecord(rec);
    handleNavigate('detail');
  };

  const handleOpenRecordById = (identifier: string) => {
    const found = records.find(
      (r) => r.dc_identifier === identifier || r.so_dang_ky === identifier
    );
    setSelectedRecord(found ?? null);
    handleNavigate('detail');
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = '/api/tulieu/export';
    link.download = 'tulieu.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveRecord = async (
    record: ArchivalRecord,
    uploadedImages: Array<{
      filename: string;
      dataUrl: string;
      loai_khung: 'toan_trang' | 'can_canh';
      chu_thich: string;
      nguon: string;
    }>
  ) => {
    const res = await fetch('/api/tulieu/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record, uploadedImages }),
    });
    const data = (await res.json()) as {
      record?: ArchivalRecord;
      dataset?: TuLieuDataset;
      error?: string;
    };
    if (!res.ok || !data.dataset) {
      throw new Error(data.error || 'Không thể lưu bản ghi mới.');
    }
    setDataset(data.dataset);
    if (data.record) {
      setSelectedRecord(data.record);
    }
  };

  const handleUpdateRecord = async (updated: ArchivalRecord) => {
    await handleSaveRecord(updated, []);
  };

  const handleImportJsonFile = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const validation = validateImportedDataset(parsed);
    if (!validation.valid || !validation.dataset) {
      throw new Error(validation.error || 'Cấu trúc tệp JSON không hợp lệ.');
    }
    const res = await fetch('/api/tulieu/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.dataset),
    });
    const saved = (await res.json()) as TuLieuDataset & { error?: string };
    if (!res.ok) {
      throw new Error(saved.error || 'Không thể nhập tệp tulieu.json lên máy chủ.');
    }
    setDataset(saved);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Header
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        onExport={handleExport}
      />

      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="mx-auto max-w-6xl px-4 py-16 text-base text-stone-600 sm:px-6">
            Đang tải dữ liệu kiểm kê từ tulieu.json...
          </div>
        ) : loadError ? (
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-5 text-base text-red-900">
              <p className="font-semibold">Không thể kết nối kho dữ liệu</p>
              <p className="mt-1">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadTuLieu()}
                className="mt-3 inline-flex min-h-[44px] cursor-pointer items-center rounded-md border border-red-400 bg-white px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100"
              >
                Thử tải lại
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeScreen === 'home' && (
              <HomePage
                records={records}
                onSearchNavigate={handleSearchNavigate}
                onNavigate={handleNavigate}
              />
            )}

            {activeScreen === 'list' && (
              <ArchiveListPage
                records={records}
                initialQuery={searchQuery}
                initialDecade={selectedDecade}
                onSelectRecord={handleSelectRecord}
                onOpenIntake={() => setIntakeOpen(true)}
                onImportJsonFile={handleImportJsonFile}
              />
            )}

            {activeScreen === 'detail' && (
              <RecordDetailPage
                record={selectedRecord}
                onBack={() => handleNavigate('list')}
                onUpdateRecord={handleUpdateRecord}
              />
            )}

            {activeScreen === 'qa' && (
              <QAPage
                records={records}
                onOpenRecordById={handleOpenRecordById}
              />
            )}

            {activeScreen === 'sources' && (
              <SourcesCreditsPage records={records} />
            )}

            {activeScreen === 'about' && (
              <AboutPage records={records} onExport={handleExport} />
            )}
          </>
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onExport={handleExport}
        totalRecords={records.length}
      />

      <RecordIntakeModal
        isOpen={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        onSaveRecord={handleSaveRecord}
      />
    </div>
  );
}
