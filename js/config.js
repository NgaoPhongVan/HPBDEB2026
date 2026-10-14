/**
 * =========================================
 * CONFIG.JS - Tất cả thông tin cá nhân
 * Chỉnh sửa file này để thay đổi nội dung!
 * =========================================
 */
const CONFIG = {
  // ===== THÔNG TIN CÁ NHÂN =====
  name: "Hạnh",
  nicknames: ["em bé", "em bé be", "em bé iu"],
  age: 23,
  birthYear: 2003,
  myName: "anh",

  // ===== MẬT KHẨU ĐĂNG NHẬP =====
  password: "09012024", // Ngày chính thức yêu nhau

  // ===== NGÀY THÁNG QUAN TRỌNG =====
  dates: {
    firstMet: new Date("2023-04-18"),      // Ngày đầu gặp nhau
    together: new Date("2024-01-09"),       // Ngày chính thức yêu nhau
    birthday: new Date("2003-10-14"),       // Ngày sinh
  },

  // ===== TIMELINE SỰ KIỆN =====
  timeline: [
    {
      date: "18/04/2023",
      emoji: "💕",
      title: "Ngày Đầu Gặp Nhau",
      desc: "Cái ngày mà anh không ngờ sẽ thay đổi cả cuộc đời anh. Em xuất hiện với nụ cười đó... anh chịu thua từ phút đầu tiên rồi 😊",
      img: "./images/part1.jpg"
    },
    {
      date: "09/01/2024",
      emoji: "💖",
      title: "Chính Thức Bên Nhau",
      desc: "Ngày đẹp nhất trong cuộc đời anh – ngày em đồng ý làm người yêu của anh. Em có biết anh vui đến mức nào không? 🥹",
      img: "./images/part2.jpg"
    },
    {
      date: "Mùa hè 2024",
      emoji: "🌊",
      title: "Sầm Sơn Cùng Nhau",
      desc: "Chuyến đi biển đầu tiên bên nhau. Chụp trái tim trên cát, ngắm hoàng hôn cùng nhau – những khoảnh khắc không thể nào quên 🌅",
      img: "./images/samson.jpg"
    },
    {
      date: "2024",
      emoji: "🏛️",
      title: "Khám Phá Bảo Tàng",
      desc: "Đi bảo tàng cùng em, anh khám phá ra rằng: điều thú vị nhất không phải là hiện vật trong bảo tàng mà là em đứng cạnh anh 😄",
      img: "./images/baotang.jpg"
    },
    {
      date: "2024",
      emoji: "🛍️",
      title: "Đi Mua Sắm Cùng Nhau",
      desc: "Trung tâm thương mại, tay trong tay, em thử đủ thứ còn anh đứng nhìn em và thấy mình là người hạnh phúc nhất trên đời 💝",
      img: "./images/mall1.jpg"
    },
    {
      date: "2024",
      emoji: "🎓",
      title: "Anh Tốt Nghiệp",
      desc: "Ngày trọng đại của anh và em là người đầu tiên anh muốn chia sẻ niềm vui. Cảm ơn em luôn ở đây cổ vũ cho anh 🎊",
      img: "./images/totnghiep.jpg"
    },
    {
      date: "14/10/2026",
      emoji: "🎂",
      title: "Sinh Nhật Em Lần Này",
      desc: "23 tuổi rồi em bé ơi! Mỗi năm qua anh lại càng thấy mình may mắn vì có em. Chúc mừng sinh nhật em yêu! 🎉",
      img: "./images/embebecamchao.jpeg"
    },
  ],

  // ===== ẢNH GALLERY =====
  gallery: [
    { src: "./images/tet.jpg", caption: "Tết em bé chụp cho anh 🌸" },
    { src: "./images/samson.jpg", caption: "Trái tim ở Sầm Sơn 🌊" },
    { src: "./images/samson2.jpg", caption: "Selfie ở Sầm Sơn 😍" },
    { src: "./images/gachno.jpg", caption: "Nắm tay đi chơi 💑" },
    { src: "./images/mall1.jpg", caption: "Đi trung tâm thương mại ♥️" },
    { src: "./images/mall2.jpg", caption: "Vẫn ở mall, vẫn đáng yêu 💕" },
    { src: "./images/totnghiep.jpg", caption: "Anh bé tốt nghiệp 🎓" },
    { src: "./images/baotang.jpg", caption: "Đi bảo tàng cùng nhau 🏛️" },
    { src: "./images/embebecamchao.jpeg", caption: "Em bé cầm chào 🍳" },
    { src: "./images/embebeslay.jpeg", caption: "Em bé slay 💅" },
    { src: "./images/embebeban.jpeg", caption: "Em bé bắn 🎯" },
    { src: "./images/embebemam.jpeg", caption: "Em bé mam 🍜" },
  ],

  // ===== HÓA ĐƠN TÌNH YÊU =====
  receipt: {
    title: "HÓA ĐƠN TÌNH YÊU",
    subtitle: "Best Girlfriend Inc. ™",
    items: [
      { label: "Thời gian yêu nhau", value: "Hơn 1 năm rưỡi ♾️" },
      { label: "Ngày đầu gặp nhau", value: "18/04/2023 💕" },
      { label: "Ngày chính thức yêu", value: "09/01/2024 💖" },
      { label: "Chuyến phiêu lưu cùng nhau", value: "Nhiều lắm 🎈" },
      { label: "Tiếng cười đã chia sẻ", value: "Vô số 😂" },
      { label: "Inside jokes", value: "Quá nhiều!" },
      { label: "Bữa ăn cùng nhau", value: "Hàng trăm 🍜" },
      { label: "Kỷ niệm đã tạo", value: "∞ Vô hạn" },
      { label: "Mức độ yêu em", value: "HẾT MỨC ❤️‍🔥" },
    ],
    total: "VÔ GIÁ ❤️",
    totalLabel: "TỔNG GIÁ TRỊ TÌNH YÊU:",
    signature: "– anh iu em 🫶",
    footer: "Cảm ơn em đã chọn anh ♡",
  },

  // ===== LỜI CHÚC SINH NHẬT =====
  birthdayMessage: `Em bé iu ơi,

Hôm nay em tròn 23 tuổi rồi. Anh không biết nói gì nhiều, chỉ biết rằng mỗi ngày bên em là một ngày anh thấy mình thật may mắn.

Em là người làm cho những ngày bình thường trở nên đặc biệt. Là người mà anh muốn kể mọi chuyện dù lớn dù nhỏ. Là người mà chỉ cần nhìn thấy thôi là lòng anh đã nhẹ đi rồi.

Chúc em sinh nhật vui vẻ, luôn khỏe mạnh, xinh đẹp và hạnh phúc. Anh mong mình sẽ được ở cạnh em thật lâu, được tạo thêm thật nhiều kỷ niệm, được cùng em trải qua thêm nhiều sinh nhật nữa.

Em bé iu của anh – anh yêu em! 💕`,

  // ===== LỜI NHẮN NGẪU NHIÊN =====
  randomMessages: [
    "Em bé ơi, chỉ cần em cười thôi là ngày của anh đã hoàn hảo rồi 💕",
    "Anh nghĩ về em... suốt cả ngày mà không chán 😊",
    "Em là lý do anh luôn muốn trở về nhà 🏠❤️",
    "Cảm ơn em đã luôn hiểu anh và yêu anh theo cách của em 🥹",
    "Em bé be của anh – cute nhất thế giới này! 🌟",
    "Mỗi khi em cười, anh muốn dừng thời gian lại 📸",
    "Anh iu em bé iu lắm lắm lắm luôn 💗",
    "Em là người mà anh muốn nhắn tin đầu tiên khi có điều gì đó xảy ra 📱",
    "Nếu được chọn lại, anh vẫn sẽ chọn em – không cần suy nghĩ 💫",
    "Em bé iu ơi, hôm nay em có nhớ anh không? Anh đang nhớ em đây 🥺",
    "Yêu em theo từng phút từng giây, không bao giờ chán 💝",
    "Em bé be, em là của anh, anh là của em nha! ✨",
  ],

  // ===== MUSIC =====
  music: {
    src: "./music/Perfect_Ed-Sheeran.mp3",
    title: "Perfect – Ed Sheeran",
  },
};
