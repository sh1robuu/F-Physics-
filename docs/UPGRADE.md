# Bàn giao bản nâng cấp G-Physics

Ngày: 16/09/2026.

## Thay đổi chính

### Giao diện

- Trang chủ có bố cục mới, giới thiệu ba khối lớp và hình minh họa dao động tương tác.
- Không gian học tập dùng thanh điều hướng, bộ chọn lớp, trang tổng quan và màu sắc thống nhất. Chế độ sáng/tối dùng các màu giao diện riêng.
- Bố cục đáp ứng màn hình nhỏ; menu học tập thu gọn trên điện thoại. Trang đăng nhập/đăng ký dùng khung giao diện mới.
- Thư viện có phần chương trình học, tìm kiếm chủ đề không phụ thuộc dấu tiếng Việt và phần tài liệu cá nhân.

### Nội dung và luồng học

- Lớp 10–12 cùng dùng dữ liệu chương trình GDPT 2018 tại `src/lib/data/curriculum.ts`.
- Liên kết học theo chủ đề đưa lớp và gợi ý tương ứng vào gia sư; prompt AI nhận lớp đã chọn.
- 60 bài tập mới có lớp và mã chủ đề, gồm 28 bài lớp 10, 16 bài lớp 11 và 16 bài lớp 12. Mỗi chủ đề chính có bốn bài; không nhân bản câu hỏi để đủ một số lượng đề cố định.
- Trang luyện tập dùng số câu và thời gian theo bộ câu hỏi thực tế, giữ lớp của bài đang làm, chấm ba dạng câu, giải thích đáp án và lưu lịch sử cục bộ.
- Ngân hàng lớp 12 cũ được giữ tại `src/lib/data/legacyQuestionBank.ts` để tham khảo; luồng luyện tập mới không nạp ngân hàng đó.
- API đề từ cơ sở dữ liệu yêu cầu lớp và chỉ lấy câu hỏi đã gắn tag lớp/chương trình. Không sửa schema hoặc tự cập nhật dữ liệu trên máy chủ.

Xem [CURRICULUM.md](CURRICULUM.md) để biết nguồn chương trình, cách chia chủ đề và giới hạn nội dung.

## Kiểm tra giao diện đã thực hiện

- [x] Trang chủ trên máy tính, điều khiển hình minh họa dao động và chuyển sáng/tối.
- [x] Chuyển lớp trong thư viện; tìm “dao dong” thấy chủ đề Dao động lớp 11.
- [x] Mở gia sư từ chủ đề Dao động: lớp và gợi ý câu hỏi đúng; đổi lớp không giữ lại gợi ý tự sinh của lớp trước.
- [x] Hoàn thành bốn câu chủ đề Khí lí tưởng lớp 12: kết quả 10/10; nhập số bằng dấu phẩy thập phân được chấp nhận.
- [x] Đổi bộ chọn sang lớp 10 giữa bài luyện lớp 12: bài đang làm vẫn giữ lớp 12.
- [x] Trang kết quả ở chiều rộng 390 px không tràn ngang.

Các kiểm tra này kiểm chứng luồng giao diện và bài luyện tại máy phát triển, không chứng minh các dịch vụ bên ngoài đã kết nối thành công.

## Kiểm tra mã nguồn

Chạy trong thư mục dự án:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Kiểm thử tự động bao phủ cấu trúc và tính tách biệt của ngân hàng theo lớp/chủ đề, đáp án số, công thức KaTeX, tạo bài luyện và chấm điểm. Kết quả kiểm tra cuối cùng cần được đối chiếu với bản mã nguồn đã bàn giao; tài liệu này không thay thế log chạy kiểm tra.

## Giới hạn cần biết khi đưa vào vận hành

- Nội dung hiện tại là bản đồ kiến thức và ngân hàng khởi đầu, chưa phải giáo trình đầy đủ cho ba lớp hoặc bộ đề thi chuẩn hóa. Câu hỏi tiếng Việt; giao diện và phần bản đồ kiến thức hỗ trợ thêm tiếng Anh. Chuyên đề học tập được giới thiệu nhưng chưa có bộ bài luyện riêng.
- Gia sư cần API và model hợp lệ. Câu trả lời AI chưa được kiểm chứng bằng một hệ thống truy xuất nguồn; cần giáo viên rà soát nội dung dùng để đánh giá học sinh.
- Đăng nhập, hồ sơ, phản hồi và các tính năng lưu máy chủ cần PostgreSQL/schema phù hợp. Chưa xác nhận kết nối tới dịch vụ thật trong đợt kiểm thử giao diện này.
- Luồng đặt lại mật khẩu kế thừa cần hoàn thiện dịch vụ gửi email, endpoint và trang đặt lại mật khẩu trước khi sử dụng thực tế.
- Lịch sử bài luyện và thư viện cá nhân nằm trong trình duyệt hiện tại, chưa đồng bộ tài khoản. Tệp tối đa 10 MB; hạn mức lưu trữ tổng phụ thuộc trình duyệt. Giữ bản gốc của tài liệu quan trọng.
- Câu hỏi cũ trên cơ sở dữ liệu không được tự gán lớp. Trước khi dùng API `/api/mock-exam`, rà soát nội dung và thêm tag lớp cùng `curriculum:gdpt-2018` cho từng câu phù hợp.

## Chuẩn bị triển khai

- [ ] Giữ bản sao mã nguồn và dữ liệu của phiên bản đang chạy.
- [ ] Thiết lập `.env`/secret của môi trường theo [README](../README.md); dùng URL và khóa Better Auth riêng.
- [ ] Kiểm tra kết nối PostgreSQL, schema và tài khoản thử nghiệm. Không chạy `db:push` tự động lên cơ sở dữ liệu đang vận hành.
- [ ] Kiểm tra gửi câu hỏi AI với model thực tế và từng lớp 10, 11, 12.
- [ ] Kiểm tra đăng ký, đăng nhập, đăng xuất, phản hồi và các thao tác quản trị với quyền phù hợp.
- [ ] Rà soát nội dung với giáo viên trước khi dùng làm tài liệu đánh giá chính thức.

## Kết quả kiểm tra ngày 16/09/2026

- `npm test`: 18/18 kiểm thử đạt (ngân hàng, chấm điểm, request gia sư dùng provider giả lập và render nội dung an toàn).
- `npm run typecheck`: đạt.
- `npm run lint`: 0 lỗi, 26 cảnh báo còn lại về import chưa dùng và tối ưu thẻ ảnh.
- `npm run build`: đạt; tạo thành công 23 route.
- Tìm kiếm nhanh không dấu từ “dong hoc” mở đúng gia sư lớp 10 và điền gợi ý Động học; sổ tay mở/đóng bằng bàn phím.

Build dùng URL localhost và khóa Better Auth tạm chỉ tồn tại trong tiến trình kiểm tra; không ghi khóa vào mã nguồn. Dịch vụ AI, email và cơ sở dữ liệu thật chưa được kiểm thử.
