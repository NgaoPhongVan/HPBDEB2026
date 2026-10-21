# Sinh Nhật Em Bé Iu 2026 🎂💕

Trang web sinh nhật cảm xúc và interactive dành tặng **Hạnh** – em bé iu – nhân dịp sinh nhật năm 2026 (23 tuổi).

## 🌟 Tính Năng

- 🔐 **Màn hình đăng nhập** với mật khẩu bí mật
- 🎂 **Bánh sinh nhật interactive** – chạm bánh hoặc bật micro để thổi nến với hiệu ứng pháo hoa
- 🧾 **Hóa đơn tình yêu** – Love Receipt với animation đẹp
- ⏰ **Đồng hồ đếm thời gian** yêu nhau (theo giây thực)
- 📅 **Timeline kỷ niệm** – những mốc quan trọng của hai người
- 📸 **Album ảnh** với lightbox và điều hướng bàn phím
- 💌 **Lời chúc sinh nhật** từ anh
- 🎮 **Trò chơi tương tác**: Thả tim, Lời nhắn ngẫu nhiên, Pháo hoa
- ❓ **Quiz tình yêu** 5 câu hỏi về chúng mình
- 🎵 **Nhạc nền** (Perfect – Ed Sheeran) với nút bật/tắt
- ✨ **Hiệu ứng**: Confetti, Fireworks, Floating Hearts, Particles

## 🛠️ Cài Đặt Nhanh

1. Clone repo hoặc tải xuống
2. Chỉnh sửa `js/config.js` để cập nhật thông tin cá nhân
3. Thêm ảnh vào thư mục `images/`
4. Thêm nhạc vào thư mục `music/`
5. Mở `index.html` trên trình duyệt hoặc deploy lên GitHub Pages

## ✏️ Tùy Chỉnh

### Thổi nến bằng micro

- Bấm **Bật micro để thổi nến**, cấp quyền rồi giữ yên khoảng 2 giây để đo tiếng nền. Bộ nhận diện cần thêm một khoảng yên lặng liên tục trước khi sẵn sàng, tránh nhận nhầm âm thanh đang có lúc vừa đo xong.
- Khi hiện hướng dẫn thổi, thổi gần micro liên tục khoảng nửa giây. Nhạc nền tạm im khi micro bật và tự khôi phục khi tắt micro hoặc thổi xong.
- Có thể bấm **Tắt micro** để thử lại bước đo tiếng nền. Chạm bánh vẫn hoạt động khi không dùng được micro.
- Micro cần HTTPS (ví dụ GitHub Pages) hoặc localhost.

Kiểm tra bộ nhận diện và luồng micro bằng Node.js: `node --test tests/blow-detection.test.cjs`.

Tất cả thông tin cá nhân được lưu trong `js/config.js`:

```js
const CONFIG = {
  name: "Hạnh",           // Tên người yêu
  password: "09012024",   // Mật khẩu đăng nhập
  dates: { ... },         // Các ngày quan trọng
  timeline: [ ... ],      // Timeline sự kiện
  gallery: [ ... ],       // Ảnh gallery
  receipt: { ... },       // Nội dung hóa đơn
  birthdayMessage: "...", // Lời chúc sinh nhật
  randomMessages: [ ... ],// Lời nhắn ngẫu nhiên
  music: { ... },         // Nhạc nền
};
```

## 🚀 Deploy

### GitHub Pages
1. Push code lên GitHub
2. Settings → Pages → Source: `main` branch, root `/`
3. Link: `https://username.github.io/repo-name`

### Netlify
- Drag & drop thư mục vào [Netlify Drop](https://app.netlify.com/drop)

### Vercel
- Import GitHub repo vào Vercel

## 📁 Cấu Trúc

```
Sinhnhatbeiu2026/
├── index.html          # Main HTML
├── css/
│   └── main.css        # Stylesheet
├── js/
│   ├── config.js       # ← Sửa file này để tùy chỉnh!
│   └── main.js         # Logic chính
├── images/             # Ảnh kỷ niệm
├── music/              # Nhạc nền
└── README.md
```

---

Made with 💕 by anh – dành tặng em bé iu nhân dịp sinh nhật 2026!
