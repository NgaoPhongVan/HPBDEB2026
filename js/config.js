// =========================================================
//  CONFIG – Sinh Nhật Em Bé 2026
//  Chỉnh thông tin tại đây, tất cả nơi khác tự cập nhật
// =========================================================

const CONFIG = {
  // --- Thông tin cơ bản ---
  name: "Hạnh",
  nicknames: ["em bé", "em bé be", "em bé iu"],
  age: 23,
  birthday: "2003-10-14",

  // --- Thông tin tình yêu ---
  firstMet: "18/04/2023",
  firstMetFull: "Ngày 18 tháng 04 năm 2023",
  together: "09/01/2024",
  togetherFull: "Ngày 09 tháng 01 năm 2024",
  password: "09012024",

  // --- Tên người gửi ---
  senderName: "Anh",
  senderNickname: "người yêu của em",

  // --- Music ---
  musicFile: "./music/Perfect_Ed-Sheeran.mp3",

  // --- Profile photo (dùng trong section-six) ---
  profilePhoto: "./images/embebecamchao.jpeg",

  // --- Lời chúc trong chatbox (section-four) ---
  chatboxMessage:
    "Sinh nhật em bé iu của anh! 23 tuổi rồi mà vẫn dễ thương hết sức vậy nè 🥺 Anh chúc em luôn vui, luôn khoẻ, luôn tự tin vào bản thân. Cảm ơn em đã xuất hiện trong cuộc đời anh và cho anh cơ hội được yêu em mỗi ngày. Anh yêu em nhiều lắm, em bé iu ơi! 💕",

  // --- Idea texts (section-five) ---
  ideas: [
    "Đó là điều anh định nói.",
    "Nhưng rồi anh nhận ra...",
    "Anh cần làm điều gì đó\n<strong>đặc biệt hơn</strong>",
    "Vì...",
    "Em thật sự đặc biệt ✨",
  ],

  // --- Wish (section-six) ---
  wishText: "Sinh nhật em bé iu!",
  wishSubtext: "Chúc em mãi mãi hạnh phúc và được yêu thương! 🌟",

  // --- Cake ---
  cakeTitle: "Ước gì đi em bé... 🌟",
  blowInstruction: "🌬️ Thổi vào mic để thổi nến nhé! 🌬️",
  blownMessage: "🎊 Điều ước đã được gửi lên những vì sao! 🎊\nChúc mọi điều ước của em đều thành sự thật! ✨",

  // --- Love Receipt ---
  receipt: {
    title: "HÓA ĐƠN TÌNH YÊU",
    subtitle: "Best Girlfriend Inc. ❤️",
    address: "Ngôi sao số 1, Vũ trụ tình yêu",
    date: "14/10/2026",
    cashier: "Người yêu của em",
    items: [
      { label: "Thời gian yêu nhau", value: "Hơn 1 năm 9 tháng 💑" },
      { label: "Lần đầu gặp nhau", value: "18/04/2023 🌸" },
      { label: "Ngày chính thức yêu", value: "09/01/2024 💍" },
      { label: "Cuộc phiêu lưu cùng nhau", value: "Nhiều lắm 🎈" },
      { label: "Tiếng cười đã chia sẻ", value: "Vô số 😂" },
      { label: "Lần cãi nhau (giả vờ)", value: "Đã hoà giải hết 😄" },
      { label: "Inside jokes", value: "Quá nhiều để đếm!" },
      { label: "Kỷ niệm đã tạo ra", value: "∞ Vô hạn" },
      { label: "Lần anh nói yêu em", value: "Mỗi ngày ❤️" },
    ],
    total: "VÔ GIÁ ❤️",
    totalLabel: "TỔNG CỘNG",
    signature: "Ký tên: Người yêu em mãi mãi 💖",
    thankYou: "Cảm ơn em đã là em bé iu của anh!",
  },

  // --- Timeline / Câu chuyện của chúng ta ---
  timeline: [
    {
      emoji: "🌸",
      date: "18/04/2023",
      title: "Lần đầu gặp nhau",
      description:
        "Cái ngày mà anh không biết là sẽ thay đổi cuộc đời anh mãi mãi. Em xuất hiện và mọi thứ bắt đầu từ đó...",
      image: "./images/part1.jpg",
    },
    {
      emoji: "💬",
      date: "2023",
      title: "Những tin nhắn đầu tiên",
      description:
        "Hồi đó nhắn tin cả ngày mà không thấy chán, không biết tại sao lúc đó lại dám nhắn nhiều vậy 😂",
      image: "./images/tinnhan.jpg",
    },
    {
      emoji: "🎡",
      date: "2023",
      title: "Những buổi đi chơi cùng nhau",
      description:
        "Mall, quán café, lang thang khắp nơi... Mỗi chuyến đi đều để lại kỷ niệm trong tim anh.",
      image: "./images/mall1.jpg",
    },
    {
      emoji: "💕",
      date: "09/01/2024",
      title: "Chính thức là của nhau",
      description:
        "Ngày đặc biệt nhất – ngày anh được gọi em là người yêu, ngày anh hứa sẽ luôn ở bên em.",
      image: "./images/embebeban.jpeg",
    },
    {
      emoji: "🐱",
      date: "2024",
      title: "Samson – thành viên bé nhỏ",
      description:
        "Con mèo nhỏ xíu mà yêu lắm, cũng như em vậy – nhỏ nhưng chiếm hết trái tim anh rồi 🐾",
      image: "./images/samson.jpg",
    },
    {
      emoji: "🎓",
      date: "2024",
      title: "Tốt nghiệp rồi em ơi!",
      description:
        "Em đã cố gắng rất nhiều. Nhìn em trong bộ áo tốt nghiệp, anh tự hào em lắm nha em bé!",
      image: "./images/totnghiep.jpg",
    },
    {
      emoji: "🎊",
      date: "2025",
      title: "Tết cùng nhau",
      description:
        "Cái Tết đầu tiên bên nhau, ngắm pháo hoa, ăn bánh chưng, chúc nhau những điều tốt đẹp nhất.",
      image: "./images/tet.jpg",
    },
    {
      emoji: "🛍️",
      date: "2025",
      title: "Đi mall – hobby chung",
      description:
        "Shopping, ăn uống, ngồi cafe... Anh thích nhất là nhìn em vui khi tìm được thứ mình thích 😄",
      image: "./images/mall2.jpg",
    },
    {
      emoji: "💪",
      date: "2025",
      title: "Em bé đi làm rồi",
      description:
        "Nhìn em chăm chỉ làm việc, anh thấy yêu em hơn mỗi ngày. Em bé của anh giỏi giang lắm!",
      image: "./images/embebelamviec.jpeg",
    },
    {
      emoji: "📸",
      date: "2026",
      title: "Bộ sưu tập những khoảnh khắc",
      description:
        "Mỗi tấm ảnh chụp chung là một kỷ niệm anh sẽ giữ mãi. Em bé đẹp nhất trong mắt anh!",
      image: "./images/ghephinhjpg.jpg",
    },
  ],

  // --- Quiz ---
  quiz: [
    {
      question: "Ngày anh và em chính thức yêu nhau là ngày nào? 💑",
      options: ["09/01/2024", "18/04/2023", "14/10/2023", "01/09/2024"],
      correct: 0,
      explanation: "Đúng rồi! 09/01/2024 – ngày chúng mình chính thức là của nhau 💕",
    },
    {
      question: "Anh thường gọi em là gì? 🥰",
      options: ["Em yêu", "Em bé iu", "Cục cưng", "Baby"],
      correct: 1,
      explanation: "Đúng! Em bé iu – cái tên dễ thương nhất thế giới 🥺",
    },
    {
      question: "Lần đầu tiên anh và em gặp nhau là vào ngày nào? 🌸",
      options: ["09/01/2024", "14/10/2023", "18/04/2023", "01/06/2023"],
      correct: 2,
      explanation: "18/04/2023 – ngày anh gặp em lần đầu và mọi thứ thay đổi từ đó! 🌸",
    },
    {
      question: "Em bé năm nay bao nhiêu tuổi? 🎂",
      options: ["21 tuổi", "22 tuổi", "23 tuổi", "24 tuổi"],
      correct: 2,
      explanation: "23 tuổi rồi! Em bé lớn rồi mà vẫn dễ thương lắm nha 🥺",
    },
    {
      question: "Con mèo nhỏ của chúng mình tên là gì? 🐱",
      options: ["Mimi", "Samson", "Tom", "Lulu"],
      correct: 1,
      explanation: "Samson! Bé mèo nhỏ xíu chiếm hết tình thương rồi 🐾",
    },
  ],

  // --- Final section ---
  finalMessage: "Sinh nhật em bé iu! 🎂💘",
  finalQuestion: "Em có thích không? 💕",
  replayText: "Xem lại từ đầu nhé! 🔄",
  foreverText: "Mãi mãi là của nhau! 💖",
};
