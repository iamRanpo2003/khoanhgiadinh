import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countMissingRequiredFields,
  createEmptyArchivalRecord,
  filterArchivalRecords,
  getVerificationBadgeMeta,
  groupRecordsByDecade,
  hasPublishPermission,
  matchesOriginalCondition,
  normalizeVietnameseSearchText,
  sanitizeRecordForPublicContext,
  validateImportedDataset,
} from './archiveLogic';

test('createEmptyArchivalRecord provides all 15 Dublin Core and supplementary fields', () => {
  const empty = createEmptyArchivalRecord();
  assert.equal(empty.dc_title, '');
  assert.equal(empty.dc_rights, '');
  assert.equal(empty.noi_luu_giu_hien_nay, '');
  assert.equal(empty.muc_kiem_chung, 'Chưa kiểm');
  assert.deepEqual(empty.danh_sach_tep_anh, []);
});

test('filterArchivalRecords filters by decade, copy type, original condition, verification, and text query', () => {
  const rec1 = {
    ...createEmptyArchivalRecord(),
    dc_identifier: 'GD-1975-01',
    dc_title: 'Ảnh gia đình tại Hà Nội',
    dc_description: 'Bữa cơm đoàn tụ bên cây đàn cũ sau ngày giải phóng.',
    nguoi_cho_phep_cong_bo: 'Bà Lê Y Linh (đại diện gia đình)',
    thap_nien: '1970s',
    loai_ban_dang_hien_thi: 'Bản số' as const,
    tinh_trang_ban_goc: 'Bản gốc giấy ố nhẹ theo thời gian',
    muc_kiem_chung: 'Đã có người kiểm' as const,
    phien_am: 'Ký tặng mùa thu 1975',
    noi_luu_giu_hien_nay: 'Tủ lưu trữ gia đình ông A',
    phan_khong_cong_bo: 'Số điện thoại mật nội bộ',
  };
  const rec2 = {
    ...createEmptyArchivalRecord(),
    dc_identifier: 'GD-1985-02',
    dc_title: 'Ảnh lễ mừng thọ tại Nam Định',
    dc_description: 'Tư liệu do con cháu chụp trước sân đình làng.',
    nguoi_cho_phep_cong_bo: 'Ông Lê Phi Phi',
    thap_nien: '1980s',
    loai_ban_dang_hien_thi: 'Bản sao' as const,
    tinh_trang_ban_goc: 'Bản in sạch đẹp, rõ nét',
    muc_kiem_chung: 'Chưa đọc được' as const,
    phien_am: 'Chữ mờ chưa đọc',
  };

  assert.equal(normalizeVietnameseSearchText('Đàn Bầu Hà Nội'), 'dan bau ha noi');

  assert.equal(
    filterArchivalRecords([rec1, rec2], {
      query: 'Hà Nội',
      decade: 'Tất cả',
      verification: 'Tất cả',
      copyType: 'Tất cả',
      originalCondition: 'Tất cả',
    }).length,
    1
  );

  // Tìm theo mô tả (dc_description) không dấu và nhiều từ khoá
  assert.equal(
    filterArchivalRecords([rec1, rec2], {
      query: 'doan tu dan cu',
      decade: 'Tất cả',
      verification: 'Tất cả',
      copyType: 'Tất cả',
      originalCondition: 'Tất cả',
    })[0]?.dc_identifier,
    'GD-1975-01'
  );

  // Tìm theo người cho phép công bố (nguoi_cho_phep_cong_bo) có dấu và không dấu
  assert.equal(
    filterArchivalRecords([rec1, rec2], {
      query: 'Lê Y Linh',
      decade: 'Tất cả',
      verification: 'Tất cả',
      copyType: 'Tất cả',
      originalCondition: 'Tất cả',
    })[0]?.dc_identifier,
    'GD-1975-01'
  );
  assert.equal(
    filterArchivalRecords([rec1, rec2], {
      query: 'le phi phi',
      decade: 'Tất cả',
      verification: 'Tất cả',
      copyType: 'Tất cả',
      originalCondition: 'Tất cả',
    })[0]?.dc_identifier,
    'GD-1985-02'
  );

  // Không bao giờ tìm khớp trường phan_khong_cong_bo hoặc phiên âm chưa kiểm chứng
  assert.equal(
    filterArchivalRecords([rec1, rec2], {
      query: 'điện thoại mật',
      decade: 'Tất cả',
      verification: 'Tất cả',
      copyType: 'Tất cả',
      originalCondition: 'Tất cả',
    }).length,
    0
  );
  assert.equal(
    filterArchivalRecords([rec1, rec2], {
      query: 'Chữ mờ chưa đọc',
      decade: 'Tất cả',
      verification: 'Tất cả',
      copyType: 'Tất cả',
      originalCondition: 'Tất cả',
    }).length,
    0
  );

  assert.equal(
    filterArchivalRecords([rec1, rec2], {
      query: '',
      decade: '1980s',
      verification: 'Chưa đọc được',
      copyType: 'Bản sao',
      originalCondition: 'Nguyên vẹn / Rõ nét',
    })[0].dc_identifier,
    'GD-1985-02'
  );

  assert.equal(matchesOriginalCondition('Bản gốc giấy ố nhẹ theo thời gian', 'Ố nhẹ / Dấu vết thời gian'), true);
  assert.equal(matchesOriginalCondition('', 'Chưa ghi tình trạng'), true);
});

test('getVerificationBadgeMeta returns green, yellow, and gray tones', () => {
  assert.equal(getVerificationBadgeMeta('Đã có người kiểm').tone, 'green');
  assert.equal(getVerificationBadgeMeta('Chưa kiểm').tone, 'yellow');
  assert.equal(getVerificationBadgeMeta('Chưa đọc được').tone, 'gray');
});

test('hasPublishPermission detects missing authorization field', () => {
  const unpermitted = { ...createEmptyArchivalRecord(), nguoi_cho_phep_cong_bo: '   ' };
  const permitted = { ...createEmptyArchivalRecord(), nguoi_cho_phep_cong_bo: 'Gia đình nhạc sĩ Hoàng Vân' };
  assert.equal(hasPublishPermission(unpermitted), false);
  assert.equal(hasPublishPermission(permitted), true);
});

test('sanitizeRecordForPublicContext withholds restricted content and unverified transcription', () => {
  const rec = {
    ...createEmptyArchivalRecord(),
    dc_identifier: 'GD-001',
    noi_luu_giu_hien_nay: 'Nhà trưởng tộc',
    loai_ban_dang_hien_thi: 'Bản số' as const,
    phan_khong_cong_bo: 'Số CMND và địa chỉ nhà riêng hiện tại',
    phien_am: 'Chữ viết tay mặt sau ảnh',
    muc_kiem_chung: 'Chưa kiểm' as const,
  };

  const sanitized = sanitizeRecordForPublicContext(rec);
  assert.equal(sanitized.co_phan_khong_cong_bo, true);
  assert.equal(sanitized.co_quyen_cong_bo, false);
  assert.equal((sanitized as Record<string, unknown>).phan_khong_cong_bo, undefined);
  assert.equal(sanitized.phien_am, '[Bản phiên âm chưa kiểm chứng]');
});

test('validateImportedDataset validates structure and normalizes records', () => {
  const bad = validateImportedDataset({ foo: 'bar' });
  assert.equal(bad.valid, false);

  const good = validateImportedDataset({
    ban_ghi: [{ dc_title: 'Ảnh cưới ông bà', thap_nien: '1960s' }],
  });
  assert.equal(good.valid, true);
  assert.equal(good.dataset?.ban_ghi.length, 1);
  assert.equal(good.dataset?.ban_ghi[0].muc_kiem_chung, 'Chưa kiểm');
});

test('countMissingRequiredFields and groupRecordsByDecade compute accurate counts', () => {
  const rec = createEmptyArchivalRecord();
  const completeness = countMissingRequiredFields(rec);
  assert.equal(completeness.filled, 1); // muc_kiem_chung defaults to 'Chưa kiểm'
  assert.ok(completeness.total >= 25);

  const grouped = groupRecordsByDecade([{ ...rec, thap_nien: '1970s' }]);
  assert.equal(grouped['1970s'], 1);
  assert.equal(grouped['1980s'], 0);
});
