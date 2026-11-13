THƯ MỤC LƯU ẢNH TƯ LIỆU HIỂN THỊ WEB (/anh_tu_lieu)

1. Quy tắc đặt tệp:
- Chỉ đặt bản ảnh đã giảm kích thước (ví dụ chiều rộng tối đa 1600px, định dạng .jpg hoặc .webp) để hiển thị trên web.
- Bản quét gốc độ phân giải cao (RAW/TIFF/PNG không nén) phải được sao lưu riêng ở ổ lưu trữ ngoại tuyến của gia đình.
- Tuyệt đối không dùng ảnh do máy sinh (AI-generated) để thay cho ảnh tư liệu thật.

2. Cách tham chiếu trong tulieu.json:
Trong mỗi bản ghi thuộc mảng "ban_ghi", khai báo mảng "danh_sach_tep_anh":
{
  "duong_dan": "/anh_tu_lieu/ten_tep_anh.jpg",
  "loai_khung": "toan_trang" | "can_canh",
  "chu_thich": "Chú thích hiển thị ngay dưới ảnh",
  "nguon": "Nguồn ảnh và người giữ bản gốc"
}
