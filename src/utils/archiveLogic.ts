import type {
  ArchivalRecord,
  QAResponse,
  QASuggestedSource,
  SourceReference,
  TuLieuDataset,
  VerificationLevel,
} from '../types/archive.ts';

export const DECADE_OPTIONS = [
  'Tất cả',
  '1940s',
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
  'Chưa xác định',
] as const;

export const ORIGINAL_CONDITION_OPTIONS = [
  'Tất cả',
  'Nguyên vẹn / Rõ nét',
  'Ố nhẹ / Dấu vết thời gian',
  'Số hoá / Sao chụp',
  'Mờ / Rách / Hư hỏng',
  'Chưa ghi tình trạng',
] as const;

export function hasPublishPermission(record: Pick<ArchivalRecord, 'nguoi_cho_phep_cong_bo'>): boolean {
  return typeof record.nguoi_cho_phep_cong_bo === 'string' && record.nguoi_cho_phep_cong_bo.trim().length > 0;
}

export function getVerificationBadgeMeta(level: VerificationLevel): {
  shortLabel: string;
  fullLabel: string;
  badgeClass: string;
  tone: 'green' | 'yellow' | 'gray';
} {
  if (level === 'Đã có người kiểm') {
    return {
      shortLabel: 'Đã kiểm',
      fullLabel: 'Đã có người kiểm',
      badgeClass: 'border-emerald-700/40 bg-emerald-50 text-emerald-900',
      tone: 'green',
    };
  }
  if (level === 'Chưa đọc được') {
    return {
      shortLabel: 'Chưa đọc được',
      fullLabel: 'Chưa đọc được',
      badgeClass: 'border-stone-400 bg-stone-200/80 text-stone-800',
      tone: 'gray',
    };
  }
  return {
    shortLabel: 'Chưa kiểm',
    fullLabel: 'Chưa kiểm',
    badgeClass: 'border-amber-700/40 bg-amber-50 text-amber-900',
    tone: 'yellow',
  };
}

export function matchesOriginalCondition(conditionText: string, filterValue: string): boolean {
  if (!filterValue || filterValue === 'Tất cả') return true;
  const text = (conditionText || '').trim().toLowerCase();

  if (filterValue === 'Chưa ghi tình trạng') {
    return text.length === 0;
  }
  if (!text) return false;

  if (filterValue === 'Nguyên vẹn / Rõ nét') {
    return /(nguyên vẹn|sạch đẹp|rõ nét|sắc nét|nguyên bản|rõ chữ)/.test(text);
  }
  if (filterValue === 'Ố nhẹ / Dấu vết thời gian') {
    return /(ố nhẹ|chấm ố|ố vàng|dấu vết thời gian|giấy cũ)/.test(text);
  }
  if (filterValue === 'Số hoá / Sao chụp') {
    return /(số hoá|sao chụp|kỹ thuật số)/.test(text);
  }
  if (filterValue === 'Mờ / Rách / Hư hỏng') {
    return /(mờ|rách|hư hỏng|nhoè|mất góc|phai)/.test(text);
  }

  return text.includes(filterValue.toLowerCase());
}

export const DUBLIN_CORE_FIELDS: Array<{ key: keyof ArchivalRecord; label: string; code: string }> = [
  { key: 'dc_title', label: 'Nhan đề tư liệu', code: 'dc:title' },
  { key: 'dc_creator', label: 'Tác giả / Người chụp', code: 'dc:creator' },
  { key: 'dc_subject', label: 'Chủ đề / Từ khoá', code: 'dc:subject' },
  { key: 'dc_description', label: 'Mô tả nội dung & bối cảnh', code: 'dc:description' },
  { key: 'dc_publisher', label: 'Đơn vị / Cá nhân công bố', code: 'dc:publisher' },
  { key: 'dc_contributor', label: 'Người đóng góp / Người kể lời chú thích', code: 'dc:contributor' },
  { key: 'dc_date', label: 'Niên đại / Thời gian chụp', code: 'dc:date' },
  { key: 'dc_type', label: 'Loại hình tư liệu', code: 'dc:type' },
  { key: 'dc_format', label: 'Định dạng vật mang & bản số', code: 'dc:format' },
  { key: 'dc_identifier', label: 'Mã định danh bản ghi', code: 'dc:identifier' },
  { key: 'dc_source', label: 'Nguồn gốc tư liệu', code: 'dc:source' },
  { key: 'dc_language', label: 'Ngôn ngữ trên tư liệu', code: 'dc:language' },
  { key: 'dc_relation', label: 'Liên kết tư liệu liên quan', code: 'dc:relation' },
  { key: 'dc_coverage', label: 'Phạm vi không gian & thời gian', code: 'dc:coverage' },
  { key: 'dc_rights', label: 'Quyền sở hữu & điều kiện sử dụng', code: 'dc:rights' },
];

export const SUPPLEMENTARY_ARCHIVAL_FIELDS: Array<{ key: keyof ArchivalRecord; label: string }> = [
  { key: 'so_dang_ky', label: 'Số đăng ký kiểm kê' },
  { key: 'noi_luu_giu_hien_nay', label: 'Nơi lưu giữ hiện nay' },
  { key: 'noi_luu_giu_thoi_diem_tu_lieu', label: 'Nơi lưu giữ tại thời điểm tư liệu' },
  { key: 'loai_ban_dang_hien_thi', label: 'Loại bản đang hiển thị' },
  { key: 'tinh_trang_ban_goc', label: 'Tình trạng bản gốc' },
  { key: 'nguoi_cho_phep_cong_bo', label: 'Người cho phép công bố' },
  { key: 'pham_vi_duoc_phep', label: 'Phạm vi được phép công bố' },
  { key: 'phan_khong_cong_bo', label: 'Phần không công bố (riêng tư)' },
  { key: 'muc_kiem_chung', label: 'Mức kiểm chứng' },
  { key: 'nguoi_kiem_chung', label: 'Người kiểm chứng nội dung' },
  { key: 'nguoi_cung_cap_chu_thich', label: 'Người cung cấp lời chú thích' },
  { key: 'phan_chua_xac_dinh', label: 'Phần chưa xác định được' },
];

export function createEmptyArchivalRecord(): ArchivalRecord {
  return {
    dc_title: '',
    dc_creator: '',
    dc_subject: '',
    dc_description: '',
    dc_publisher: '',
    dc_contributor: '',
    dc_date: '',
    dc_type: '',
    dc_format: '',
    dc_identifier: '',
    dc_source: '',
    dc_language: '',
    dc_relation: '',
    dc_coverage: '',
    dc_rights: '',
    noi_luu_giu_hien_nay: '',
    noi_luu_giu_thoi_diem_tu_lieu: '',
    loai_ban_dang_hien_thi: '',
    tinh_trang_ban_goc: '',
    so_dang_ky: '',
    nguoi_cho_phep_cong_bo: '',
    pham_vi_duoc_phep: '',
    phan_khong_cong_bo: '',
    muc_kiem_chung: 'Chưa kiểm',
    thap_nien: '',
    nguoi_kiem_chung: '',
    nguoi_cung_cap_chu_thich: '',
    phan_chua_xac_dinh: '',
    phien_am: '',
    dich_nghia: '',
    danh_sach_tep_anh: [],
  };
}

export interface FilterCriteria {
  query: string;
  decade: string;
  verification: string;
  copyType: string;
  originalCondition?: string;
}

export function normalizeVietnameseSearchText(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

export function filterArchivalRecords(
  records: ArchivalRecord[],
  criteria: FilterCriteria
): ArchivalRecord[] {
  const rawQuery = criteria.query.trim().toLowerCase();
  const normalizedQuery = normalizeVietnameseSearchText(criteria.query);
  const queryTokens = normalizedQuery ? normalizedQuery.split(' ').filter(Boolean) : [];

  return records.filter((record) => {
    if (criteria.decade && criteria.decade !== 'Tất cả') {
      if ((record.thap_nien || 'Chưa xác định') !== criteria.decade) {
        return false;
      }
    }

    if (criteria.verification && criteria.verification !== 'Tất cả') {
      if (record.muc_kiem_chung !== criteria.verification) {
        return false;
      }
    }

    if (criteria.copyType && criteria.copyType !== 'Tất cả') {
      if (record.loai_ban_dang_hien_thi !== criteria.copyType) {
        return false;
      }
    }

    if (criteria.originalCondition && criteria.originalCondition !== 'Tất cả') {
      if (!matchesOriginalCondition(record.tinh_trang_ban_goc, criteria.originalCondition)) {
        return false;
      }
    }

    if (!rawQuery && queryTokens.length === 0) {
      return true;
    }

    const publicTranscription =
      record.muc_kiem_chung === 'Đã có người kiểm' ? [record.phien_am, record.dich_nghia] : [];

    // Tuyệt đối không đưa phan_khong_cong_bo vào chỉ mục tìm kiếm công khai
    const searchableFields = [
      record.dc_title,
      record.dc_description,
      record.nguoi_cho_phep_cong_bo,
      record.dc_creator,
      record.dc_subject,
      record.dc_identifier,
      record.dc_date,
      record.dc_coverage,
      record.dc_contributor,
      record.dc_publisher,
      record.dc_source,
      record.so_dang_ky,
      record.noi_luu_giu_hien_nay,
      record.noi_luu_giu_thoi_diem_tu_lieu,
      record.nguoi_cung_cap_chu_thich,
      record.pham_vi_duoc_phep,
      record.tinh_trang_ban_goc,
      record.phan_chua_xac_dinh,
      record.thap_nien,
      ...publicTranscription,
    ];

    const rawHaystack = searchableFields.join(' ').toLowerCase();
    if (rawQuery && rawHaystack.includes(rawQuery)) {
      return true;
    }

    if (queryTokens.length > 0) {
      const normalizedHaystack = normalizeVietnameseSearchText(rawHaystack);
      return queryTokens.every((token) => normalizedHaystack.includes(token));
    }

    return false;
  });
}

export function countMissingRequiredFields(record: ArchivalRecord): {
  filled: number;
  total: number;
  missingLabels: string[];
} {
  const allChecks = [
    ...DUBLIN_CORE_FIELDS.map((f) => ({ key: f.key, label: f.label })),
    ...SUPPLEMENTARY_ARCHIVAL_FIELDS.filter((f) => f.key !== 'phan_khong_cong_bo').map((f) => ({
      key: f.key,
      label: f.label,
    })),
  ];

  const missingLabels: string[] = [];
  let filled = 0;

  for (const field of allChecks) {
    const val = record[field.key];
    if (typeof val === 'string' && val.trim().length > 0) {
      filled += 1;
    } else {
      missingLabels.push(field.label);
    }
  }

  return {
    filled,
    total: allChecks.length,
    missingLabels,
  };
}

export function sanitizeRecordForPublicContext(record: ArchivalRecord): Record<string, unknown> {
  return {
    ma_ban_ghi: record.dc_identifier || record.so_dang_ky || 'Chưa cấp mã',
    so_dang_ky: record.so_dang_ky,
    nhan_de: record.dc_title,
    thap_nien: record.thap_nien,
    nien_dai: record.dc_date,
    tac_gia: record.dc_creator,
    chu_de: record.dc_subject,
    mo_ta: record.dc_description,
    nguoi_cung_cap_chu_thich: record.nguoi_cung_cap_chu_thich || record.dc_contributor,
    khong_gian_thoi_gian: record.dc_coverage,
    nguon: record.dc_source,
    noi_luu_giu_hien_nay: record.noi_luu_giu_hien_nay,
    noi_luu_giu_thoi_diem_tu_lieu: record.noi_luu_giu_thoi_diem_tu_lieu,
    loai_ban_dang_hien_thi: record.loai_ban_dang_hien_thi,
    tinh_trang_ban_goc: record.tinh_trang_ban_goc,
    nguoi_cho_phep_cong_bo: record.nguoi_cho_phep_cong_bo,
    pham_vi_duoc_phep: record.pham_vi_duoc_phep,
    muc_kiem_chung: record.muc_kiem_chung,
    nguoi_kiem_chung: record.nguoi_kiem_chung,
    phan_chua_xac_dinh: record.phan_chua_xac_dinh,
    phien_am:
      record.muc_kiem_chung === 'Đã có người kiểm'
        ? record.phien_am
        : record.muc_kiem_chung === 'Chưa đọc được'
          ? '[Chưa đọc được nội dung chữ trên tư liệu]'
          : '[Bản phiên âm chưa kiểm chứng]',
    dich_nghia:
      record.muc_kiem_chung === 'Đã có người kiểm'
        ? record.dich_nghia
        : record.muc_kiem_chung === 'Chưa đọc được'
          ? '[Chưa đọc được nội dung để dịch nghĩa]'
          : '[Bản dịch nghĩa chưa kiểm chứng]',
    co_phan_khong_cong_bo: Boolean(record.phan_khong_cong_bo && record.phan_khong_cong_bo.trim().length > 0),
    co_quyen_cong_bo: hasPublishPermission(record),
  };
}

export function validateImportedDataset(raw: unknown): {
  valid: boolean;
  dataset?: TuLieuDataset;
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Tệp JSON không phải đối tượng hợp lệ.' };
  }

  const candidate = raw as Partial<TuLieuDataset>;
  if (!Array.isArray(candidate.ban_ghi)) {
    return { valid: false, error: 'Thiếu mảng "ban_ghi" trong tệp tulieu.json.' };
  }

  const normalizedRecords: ArchivalRecord[] = candidate.ban_ghi.map((item) => ({
    ...createEmptyArchivalRecord(),
    ...(typeof item === 'object' && item !== null ? item : {}),
    danh_sach_tep_anh: Array.isArray((item as ArchivalRecord)?.danh_sach_tep_anh)
      ? (item as ArchivalRecord).danh_sach_tep_anh
      : [],
  }));

  const dataset: TuLieuDataset = {
    metadata_chuan: candidate.metadata_chuan ?? {
      ten_bo_du_lieu: 'Kho ảnh gia đình có chú thích',
      chuan_mo_ta: 'Dublin Core (15 trường) + trường kiểm kê Di sản 2024',
      thu_muc_anh: 'anh_tu_lieu',
      luu_y_luu_tru: 'Bản gốc độ phân giải cao lưu giữ riêng; web hiển thị bản giảm kích thước.',
      trang_thai_du_lieu: `Đã nạp ${normalizedRecords.length} bản ghi`,
    },
    mau_ban_ghi_rong: candidate.mau_ban_ghi_rong ?? createEmptyArchivalRecord(),
    ban_ghi: normalizedRecords,
  };

  return { valid: true, dataset };
}

export function groupRecordsByDecade(records: ArchivalRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const dec of DECADE_OPTIONS) {
    if (dec !== 'Tất cả') {
      counts[dec] = 0;
    }
  }
  for (const rec of records) {
    const key = rec.thap_nien && rec.thap_nien.trim() ? rec.thap_nien : 'Chưa xác định';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function getNonEmptyDecades(
  records: ArchivalRecord[]
): Array<{ decade: string; count: number }> {
  const counts = groupRecordsByDecade(records);
  const orderedKeys = [
    ...DECADE_OPTIONS.filter((d) => d !== 'Tất cả' && d !== 'Chưa xác định'),
    ...Object.keys(counts).filter(
      (k) => k !== 'Chưa xác định' && !(DECADE_OPTIONS as readonly string[]).includes(k)
    ),
  ];

  return orderedKeys
    .map((decade) => ({ decade, count: counts[decade] ?? 0 }))
    .filter((item) => item.count > 0);
}

export function sanitizeSecretPatterns(text: string): string {
  return (text || '')
    .replace(/AIza[0-9A-Za-z_-]{16,}/g, '[ĐÃ_ẨN_KHOÁ]')
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[ĐÃ_ẨN_TOKEN]')
    .replace(/([?&]key=)[^&\s]+/gi, '$1[ĐÃ_ẨN_KHOÁ]');
}

export function getOfficialSuggestedSources(
  sources: SourceReference[],
  limit = 4
): QASuggestedSource[] {
  const preferred = sources.filter(
    (s) =>
      s.category === 'Nguồn tư liệu Hoàng Vân' ||
      s.category.startsWith('Chính thống')
  );
  return preferred.slice(0, limit).map((s) => ({
    title: s.title,
    issuer: s.issuer,
    year: s.year || '',
    url: s.url,
  }));
}

export function finalizeQAResponse(
  rawParsed: Partial<QAResponse>,
  records: ArchivalRecord[],
  officialSources: SourceReference[]
): QAResponse {
  const hasMatch = Boolean(rawParsed.hasMatch);
  const officialUrlMap = new Map(officialSources.map((s) => [s.url, s]));

  const citations = Array.isArray(rawParsed.citations)
    ? rawParsed.citations.map((cite) => {
        const matchedRec = records.find(
          (r) =>
            r.dc_identifier === cite.ma_ban_ghi || r.so_dang_ky === cite.ma_ban_ghi
        );
        return {
          ma_ban_ghi: cite.ma_ban_ghi || matchedRec?.dc_identifier || 'Chưa cấp mã',
          noi_luu_giu:
            cite.noi_luu_giu || matchedRec?.noi_luu_giu_hien_nay || 'Chưa ghi nhận',
          loai_ban:
            cite.loai_ban || matchedRec?.loai_ban_dang_hien_thi || 'Chưa rõ loại bản',
          ten_nguon:
            cite.ten_nguon ||
            matchedRec?.dc_source ||
            matchedRec?.dc_publisher ||
            'Hồ sơ tulieu.json trong ứng dụng',
        };
      })
    : [];

  const rawUsed = Array.isArray(rawParsed.usedSources)
    ? rawParsed.usedSources.filter((s) => typeof s === 'string' && s.trim().length > 0)
    : [];

  const derivedUsed =
    rawUsed.length > 0
      ? rawUsed
      : citations.length > 0
        ? Array.from(new Set(citations.map((c) => c.ten_nguon)))
        : hasMatch
          ? ['Kho dữ liệu tulieu.json — Bộ sưu tập tài liệu của nhạc sĩ Hoàng Vân']
          : [];

  let answer = (rawParsed.answer || '').trim();

  if (!hasMatch) {
    if (!answer.toLowerCase().includes('ứng dụng chưa có thông tin này')) {
      answer = answer
        ? `Ứng dụng chưa có thông tin này. ${answer}`
        : 'Ứng dụng chưa có thông tin này trong kho dữ liệu hiện có (tulieu.json). Bạn có thể tra cứu thêm tại các nguồn chính thống được gợi ý bên dưới.';
    }
    const validSuggested = Array.isArray(rawParsed.suggestedSources)
      ? rawParsed.suggestedSources
          .filter((s) => s && typeof s.url === 'string' && officialUrlMap.has(s.url))
          .map((s) => {
            const official = officialUrlMap.get(s.url)!;
            return {
              title: official.title,
              issuer: official.issuer,
              year: official.year,
              url: official.url,
            };
          })
      : [];

    const suggestedSources =
      validSuggested.length > 0
        ? validSuggested
        : getOfficialSuggestedSources(officialSources, 4);

    return {
      answer,
      hasMatch: false,
      citations: [],
      usedSources:
        derivedUsed.length > 0
          ? derivedUsed
          : ['Kho dữ liệu tulieu.json (đã kiểm tra toàn bộ bản ghi hiện có)'],
      suggestedSources,
      totalRecordsChecked: records.length,
    };
  }

  return {
    answer:
      answer ||
      'Đã tìm thấy tư liệu phù hợp trong tulieu.json. Vui lòng xem trích dẫn nguồn bên dưới.',
    hasMatch: true,
    citations,
    usedSources: derivedUsed,
    suggestedSources: [],
    totalRecordsChecked: records.length,
  };
}
