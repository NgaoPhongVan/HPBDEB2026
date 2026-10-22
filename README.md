# 🎂 Sinh Nhật Em Bé Iu 2026

**Happy 23rd Birthday, Hạnh! 💕**

Trang web sinh nhật dành riêng cho em bé iu năm 2026.

---

## 🌟 Tính năng

- **Preloader** đẹp với thanh loading
- **Flip card** dễ thương để mở bất ngờ
- **GSAP Animation Timeline** mượt mà, cảm xúc
- **Thổi nến** qua microphone (hoặc click)
- **Hóa đơn tình yêu** (Love Receipt) kiểu receipt giấy
- **Timeline câu chuyện** cuộn theo kiểu ThatDay
- **Gallery ảnh** kỷ niệm
- **Quiz** thử tài hiểu nhau
- **Nhạc nền**: Perfect – Ed Sheeran
- **Dark theme** đồng bộ xuyên suốt
- **Confetti + Fireworks + Balloons** 🎊

## 🎤 Thổi nến

Khi bánh xuất hiện, nhạc tạm dừng. Nhấn nút bật mic, giữ yên lặng khoảng 2 giây
để đo tiếng nền, đợi dòng “Sẵn sàng!”, rồi thổi gần mic khoảng nửa giây.
Thanh màu xanh hiển thị mức âm thanh mic nhận được. Có thể nhấn lại dòng hướng
dẫn để đo lại tiếng nền mà không phải xem lại từ đầu.
Mic không tự bật lại khi đã cấp quyền trước đó. Có thể nhấn vào bánh để tắt nến
nếu không dùng mic. Nhạc tiếp tục từ vị trí đã dừng sau khi nến tắt.

Kiểm tra nhận diện và vòng đời mic bằng Node.js (không cần cài thêm thư viện):

```sh
node --test tests/blow-detector.test.cjs tests/candle-flow.test.cjs
```

Kiểm tra hiệu ứng trên điện thoại, giới hạn số hạt và dọn hiệu ứng khi chuyển chương:

```sh
node --test tests/celebration-effects.test.cjs
```

Nếu máy đã có FFmpeg, kiểm tra thêm các đoạn nhạc thật:

```sh
node --test tests/music-rejection.test.cjs
```

## 🔐 Password

`09012024`

## 🚀 Deploy

Deploy tự động qua **GitHub Pages** tại:

```
https://ngaophongvan.github.io/HPBDEB2026/
```

## ✏️ Tùy chỉnh

Mọi thông tin cá nhân đều ở [`js/config.js`](js/config.js) — chỉ cần chỉnh ở đó là xong!

---

*Made with 💕 by NgaoPhongVan*
