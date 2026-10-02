# G-Physics

Không gian học Vật lí cho học sinh **lớp 10, 11 và 12**, với giao diện tiếng Việt/tiếng Anh, gia sư AI, bản đồ kiến thức và luyện tập theo lớp. Nội dung được tổ chức theo Chương trình giáo dục phổ thông 2018 của Việt Nam.

## Bản nâng cấp

- Giao diện sáng/tối dùng bảng màu xanh lá và nền trung tính; bố cục mới cho trang chủ, không gian học tập và trang tài khoản; hỗ trợ màn hình điện thoại.
- Bộ chọn lớp dùng chung cho tổng quan, thư viện, gia sư, luyện tập và cài đặt. Liên kết từ chủ đề tới gia sư mang theo đúng lớp và gợi ý câu hỏi.
- Bản đồ 15 chủ đề chính, có tóm tắt, nhóm bài học và công thức; các chuyên đề học tập được giới thiệu riêng.
- 60 bài tập tiếng Việt tự biên soạn: 28 bài lớp 10, 16 bài lớp 11 và 16 bài lớp 12. Có trắc nghiệm một đáp án, đúng/sai và trả lời số.
- Bài luyện hiển thị số câu thực tế, chấm điểm theo thang 10, giải thích đáp án và lưu lịch sử trên trình duyệt. Đổi lớp giữa lúc làm bài không đổi nội dung bài đang làm.
- Thư viện cá nhân hỗ trợ thêm, xem trước và tải xuống tài liệu lưu trên trình duyệt.

Đây là **ngân hàng bài tập khởi đầu**, chưa phải bộ học liệu đầy đủ hoặc ngân hàng đề thi chính thức. Bài tập chuyên đề chưa nằm trong ngân hàng này. Xem phạm vi, nguồn chương trình và cách mở rộng tại [docs/CURRICULUM.md](docs/CURRICULUM.md); xem bàn giao tại [docs/UPGRADE.md](docs/UPGRADE.md).

## Công nghệ

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, KaTeX, Prisma/PostgreSQL và Better Auth. Gia sư kết nối API tương thích Ollama qua máy chủ ứng dụng.

## Chạy trên máy

Yêu cầu Node.js **20.9 trở lên**, npm và PostgreSQL nếu sử dụng các chức năng lưu trên máy chủ.

1. Cài thư viện:

   ```bash
   npm ci
   ```

2. Sao chép `.env.example` thành `.env`, sau đó điền cấu hình cần dùng. Trên PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Nếu dự án đã có `.env`, giữ nguyên tệp đó và bổ sung biến còn thiếu. Không đưa khóa thật vào mã nguồn.

3. Sinh Prisma Client và chạy ứng dụng:

   ```bash
   npm run db:generate
   npm run dev
   ```

4. Mở [http://localhost:3000](http://localhost:3000).

`db:generate` chỉ sinh mã client; lệnh này không tạo bảng hay cập nhật dữ liệu. Với một cơ sở dữ liệu phát triển mới, có thể chủ động chạy `npm run db:push` sau khi xác nhận `DATABASE_URL` trỏ đúng cơ sở dữ liệu đó. **Không tự động chạy `db:push` lên dữ liệu đang vận hành.** Hãy sao lưu và chuẩn bị quy trình thay đổi schema phù hợp với hệ thống trước khi triển khai.

## Biến môi trường

| Biến | Mục đích |
| --- | --- |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL cho đăng nhập và các API lưu dữ liệu máy chủ. Lấy từ môi trường cơ sở dữ liệu của bạn. |
| `BETTER_AUTH_URL` | URL gốc của ứng dụng, ví dụ `http://localhost:3000` khi chạy cục bộ; dùng tên miền HTTPS thực tế khi triển khai. |
| `BETTER_AUTH_SECRET` | Khóa ngẫu nhiên riêng cho Better Auth. Điền trước khi build hoặc chạy production. |
| `OLLAMA_BASE_URL` | Địa chỉ API có đuôi `/api`; mã hiện tại mặc định là `https://ollama.com/api`. |
| `OLLAMA_API_KEY` | Khóa cho nhà cung cấp yêu cầu xác thực. Chỉ đặt ở phía máy chủ. |
| `OLLAMA_MODEL` | Tên model mặc định mà endpoint đã cấu hình hỗ trợ. Lựa chọn model trong giao diện gia sư có thể ghi đè giá trị này. |

Có thể tạo khóa xác thực riêng trên máy bằng:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Lưu kết quả vào `BETTER_AUTH_SECRET` trong `.env` hoặc trình quản lý secret của nền tảng triển khai. Không dùng chung một khóa mẫu cho nhiều môi trường.

### Chức năng cần dịch vụ bên ngoài

Trang chủ, bản đồ chương trình, luyện tập từ ngân hàng có sẵn và tài liệu cá nhân có thể dùng để xem giao diện mà chưa kết nối AI hoặc cơ sở dữ liệu thực. Đăng nhập, hồ sơ, phản hồi và các API lưu trữ cần PostgreSQL đã có schema phù hợp. Gửi câu hỏi cho gia sư cần API/model hoạt động; thao tác xem giao diện không xác nhận các kết nối này đã sẵn sàng.

Luồng đặt lại mật khẩu kế thừa chưa hoàn thiện để đưa vào vận hành: callback hiện ghi liên kết vào console máy chủ, chưa có dịch vụ gửi email thật và chưa có trang `/reset-password`. Cần hoàn thiện, kiểm tra lại endpoint với Better Auth hiện tại và tránh ghi token đặt lại mật khẩu vào log production.

## Kiểm tra và build

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run start
```

`test` kiểm tra dữ liệu câu hỏi và cách chấm bài. `typecheck`, `lint` và `build` kiểm tra mã nguồn; chúng không thay thế kiểm thử đăng nhập, AI hoặc cơ sở dữ liệu với cấu hình thật.

## Vị trí nội dung và dữ liệu

| Tệp/thư mục | Vai trò |
| --- | --- |
| `src/lib/data/curriculum.ts` | Nguồn chủ đề, công thức và gợi ý gia sư dùng chung cho ba lớp. |
| `src/lib/data/questionBank.ts` | Ngân hàng bài tập hiện dùng, có lớp và mã chủ đề rõ ràng. |
| `src/lib/data/legacyQuestionBank.ts` | Ngân hàng cũ được giữ để tham khảo biên tập, không dùng để tạo bài luyện hiện tại. |
| `src/lib/practice.ts` | Quy tắc chấm, chuẩn hóa điểm và tính thời gian làm bài. |
| `src/lib/ai/` | Prompt theo lớp, điều phối chế độ gia sư và kết nối model. |
| `prisma/schema.prisma` | Schema dữ liệu máy chủ kế thừa. |
| `tests/` | Kiểm thử dữ liệu và logic luyện tập. |

Lớp đã chọn, lịch sử luyện tập và thư viện cá nhân được lưu cục bộ. Thư viện tiếp tục dùng khóa `g-physics-library`; lịch sử luyện mới dùng `g-physics-practice-history-v2`. Dữ liệu này không tự đồng bộ giữa các thiết bị; xóa dữ liệu trình duyệt có thể làm mất dữ liệu đã lưu. Hạn mức tải lên mỗi tệp là 10 MB, nhưng tổng dung lượng lưu được còn phụ thuộc trình duyệt; nên giữ bản gốc của tài liệu quan trọng.

API tạo đề từ cơ sở dữ liệu `/api/mock-exam` là luồng riêng so với trang luyện tập hiện tại. API chỉ chọn câu hỏi đã được gắn cả tag lớp (`grade:10`, `grade:11` hoặc `grade:12`) và `curriculum:gdpt-2018`. Bản nâng cấp không tự phân loại lại hay ghi đè ngân hàng trên máy chủ; dữ liệu chưa có tag cần được rà soát trước khi dùng qua API này.
"# F-Physics-" 
"# F-Physics-" 
