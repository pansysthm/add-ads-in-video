# ⚡ Quick Start: Video Ad Inserter

Công cụ giúp đồng loạt chèn quảng cáo vào các video (hỗ trợ hàng loạt - Batch Processing). Script đã được nâng cấp cơ chế chuẩn hóa (Scale & Pad), tự động điều chỉnh video quảng cáo khớp hoàn toàn với độ phân giải và tỷ lệ của video gốc.

## 🛠️ Cài đặt & Chuẩn bị

### 1. Cài đặt FFmpeg (Phần mềm lõi bắt buộc)
Script hoạt động dựa trên lõi xử lý FFmpeg. Bạn bắt buộc phải cài đặt:
- **Windows**: Download từ trang chủ FFmpeg. Sau khi giải nén, thêm đường dẫn đến thư mục `bin` (chứa ffmpeg.exe) vào biến môi trường **PATH** của máy tính.
- **macOS**: Chạy lệnh `brew install ffmpeg`
- **Linux**: Chạy lệnh `sudo apt-get install ffmpeg`

Trong project đã có sẵn thư mục FFmpeg, bạn chỉ cần thêm PATH vào biến môi trường của máy tính.

### 2. Cài đặt Node.js
- Tải bản Node.js LTS (Long Term Support) mới nhất từ website: https://nodejs.org/ và cài đặt nếu máy tính bạn chưa có.

## 🚀 Hướng dẫn Chạy công cụ

Mở Terminal (Command Prompt / PowerShell / Git Bash) và điều hướng (cd) vào thư mục gốc của dự án. Sau đó, chạy công cụ bằng 1 trong 2 cách sau:

**Cách 1: Chạy trực tiếp bằng mã JavaScript (Khuyên dùng - Nhanh nhất)**
Phiên bản `.js` chứa mã thực thi trực tiếp, tương thích cao nhất và ít gặp sự cố bộ nhớ cache biên dịch:
```bash
node ad-inserter.js
```

**Cách 2: Chạy bằng TypeScript & Package Script**
Nếu muốn sử dụng môi trường dev của typescript:
```bash
npm install
npm run dev
```

## ⚙️ Cơ chế & Cách thức hoạt động

Dưới đây là tóm tắt quy trình xử lý luồng ngầm của Tool để bạn dễ hình dung:
1. **Quét dữ liệu hàng loạt (Batch Scanning):** Khi bạn truyền URL của thư mục gốc, mã nguồn sẽ dùng `fs.readdir` để quét toàn bộ. Nó gom nhặt tự động mọi file có định dạng video hợp lệ (`.mp4`, `.mov`, `.avi`...).
2. **Thêm quảng cáo (Ad Insertion):** Công cụ dùng duy nhất *một* file video quảng cáo bạn đã cung cấp, sau đó lặp qua từng video gốc vừa tìm được.
3. **Gọi thao tác FFmpeg:** Đối với mỗi video đang xét, công cụ dựa theo điểm chèn (Đầu, Giữa, Cuối) để điều hướng các bộ lọc FFmpeg. Quá trình này sẽ tách nhỏ video gốc (nếu chèn giữa), chuẩn hóa độ phân giải của quảng cáo cho tương đồng, rồi nối lại xuất ra file tạm tên đuôi là `.tmp.mp4`.
4. **Ghi đè dọn dẹp an toàn:** Chờ khi công đoạn FFMpeg xử lý thành công 100%, file tạm thời kia sẽ được gỡ nón tên cũ và thay thế hoàn toàn vào vị trí video gốc đã được gỡ bỏ nhằm tiết kiệm dung lượng ổ cứng.

## 📱 Luồng cấu hình (CLI Flow)

Sau khi khởi chạy lệnh thành công, Terminal sẽ yêu cầu bạn thực hiện theo các bước sau:

1. Nhập đường dẫn thư mục (**Folder**) chứa các video gốc bạn muốn chèn quảng cáo. Script sẽ tự động liệt kê tất cả file video.
2. Nhập đường dẫn trỏ thẳng đến **file video quảng cáo**.
3. **Tuyển Tập Lựa Chọn Mới**: Chọn vị trí chèn quảng cáo thông minh:
   - `1` - Chèn ở đầu video (0s).
   - `2` - Chèn giữa video (Mặc định ở giây thứ 10).
   - `3` - Chèn ở đoạn cuối cùng của clip.
   - `4` - Tuỳ chỉnh số giây bạn muốn quảng cáo chen vào.
4. Gõ `yes` và bấm Enter để xác nhận quá trình Encoding và Ghi đè vào cùng thư mục gốc ban đầu.

## ⚠️ Lưu ý kỹ thuật cực kỳ quan trọng:

- **Bảo toàn tỷ lệ (Tự động Scale & Pad):** Dù quảng cáo của bạn có đang là tỷ lệ ngang hay dọc, kích thước lộn xộn... Công cụ đã được lập trình để tự động co giãn và điền viền đen bao quanh khung hình (pad) cho thật khớp với tỷ lệ video gốc, đảm bảo trải nghiệm MP4 đầu ra hoàn mỹ, không méo hình, không bể tỷ lệ.
- **Chất lượng Video & Thời gian xử lý:** Mọi video giờ đây được kết nối qua nhân Encode Video `libx264` cùng Audio `aac`, nhằm giải quyết dứt điểm các hiện tượng giật lag, hư luồng Streamcopy (Streamcopy Error). Tuỳ vào cấu hình GPU/CPU máy tính và độ phân giải, quá trình render sẽ tốn thêm một chút thời gian (từ vài chục giây cho đến vài phút) để máy tính đóng gói hoàn chỉnh đoạn video ghép.

## 🐛 Hỗ trợ khắc phục sự cố

- **Lỗi `ffmpeg is not recognized...`**: FFmpeg chưa được khai báo hoặc khai báo sai PATH vào môi trường Windows. Hệ thống không hiểu lệnh ffmpeg. (Khắc phục: Setup lại System Environments và mở lại Terminal).
- **Lỗi `Cannot find module...`**: Mã nguồn thiếu các thư viện Javascript nền, hãy thử chạy `npm install` trước khi run code nhé.
- **Thông báo `Filtering and streamcopy cannot be used together`**: Đảm bảo rằng bạn KHÔNG dùng các tệp code cũ (như chưa cập nhật lưu file typescript/javascript). Hãy chỉ chắc chắn chạy file `ad-inserter.js` như hướng dẫn phía trên.
