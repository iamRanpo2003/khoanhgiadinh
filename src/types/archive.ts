export type VerificationLevel = 'Chưa kiểm' | 'Đã có người kiểm' | 'Chưa đọc được';

export type DisplayCopyType = 'Bản gốc' | 'Bản sao' | 'Bản số' | '';

export interface ArchivalImageRef {
  duong_dan: string;
  loai_khung: 'toan_trang' | 'can_canh';
  chu_thich: string;
  nguon: string;
}

export interface ArchivalRecord {
  // 15 trường chuẩn Dublin Core
  dc_title: string;
  dc_creator: string;
  dc_subject: string;
  dc_description: string;
  dc_publisher: string;
  dc_contributor: string;
  dc_date: string;
  dc_type: string;
  dc_format: string;
  dc_identifier: string;
  dc_source: string;
  dc_language: string;
  dc_relation: string;
  dc_coverage: string;
  dc_rights: string;

  // Các trường bổ sung theo chuẩn kiểm kê bảo tàng & Luật Di sản 2024
  noi_luu_giu_hien_nay: string;
  noi_luu_giu_thoi_diem_tu_lieu: string;
  loai_ban_dang_hien_thi: DisplayCopyType;
  tinh_trang_ban_goc: string;
  so_dang_ky: string;
  nguoi_cho_phep_cong_bo: string;
  pham_vi_duoc_phep: string;
  phan_khong_cong_bo: string;
  muc_kiem_chung: VerificationLevel;

  // Trường phục vụ thư viện ảnh gia đình theo thập niên & phiên âm
  thap_nien: string;
  nguoi_kiem_chung: string;
  nguoi_cung_cap_chu_thich: string;
  phan_chua_xac_dinh: string;
  phien_am: string;
  dich_nghia: string;
  danh_sach_tep_anh: ArchivalImageRef[];
}

export interface TuLieuDataset {
  metadata_chuan: {
    ten_bo_du_lieu: string;
    chuan_mo_ta: string;
    thu_muc_anh: string;
    luu_y_luu_tru: string;
    trang_thai_du_lieu: string;
  };
  mau_ban_ghi_rong: ArchivalRecord;
  ban_ghi: ArchivalRecord[];
}

export interface QACitation {
  ma_ban_ghi: string;
  noi_luu_giu: string;
  loai_ban: string;
  ten_nguon: string;
}

export interface QASuggestedSource {
  title: string;
  issuer: string;
  year: string;
  url: string;
}

export interface QAResponse {
  answer: string;
  hasMatch: boolean;
  citations: QACitation[];
  usedSources: string[];
  suggestedSources: QASuggestedSource[];
  totalRecordsChecked: number;
}

export interface TranscribeResponse {
  proposedTranscription: string;
  proposedTranslation: string;
  verificationLabel: 'Chưa kiểm';
  autoSaved: false;
  note: string;
}

export interface SourceReference {
  id: string;
  title: string;
  issuer: string;
  year: string;
  category:
    | 'Nguồn tư liệu Hoàng Vân'
    | 'Chính thống (Việt Nam)'
    | 'Chính thống (Quốc tế)'
    | 'Chuẩn & Tham khảo';
  effectiveDate?: string;
  summary: string;
  url: string;
}
