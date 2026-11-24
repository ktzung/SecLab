/* SecLab — dữ liệu mô phỏng kiểm soát đầu vào, phân quyền và bí mật bị lộ */
window.SEC_SEED = {
  lab: {
    heading: "Ba lỗ hổng thường gặp",
    intro: "Đo số đầu vào nguy hiểm lọt qua bộ lọc, số endpoint quản trị thiếu kiểm tra quyền và số bí mật còn hiệu lực sau khi xoay vòng. Engine viết tay, kết quả tất định để đối chiếu từng nhiệm vụ.",
    tabs: [
      {
        id: "inject",
        label: "Đầu vào",
        title: "Lọc và tiêm nhiễm",
        badge: "input",
        runLabel: "Đo đầu vào hở",
        hint: "Đầu vào nguy hiểm = tổng đầu vào × tỉ lệ chưa an toàn. Tỉ lệ lọc chặn phần lớn; chỉ cần một đầu vào lọt qua là còn lỗ hổng.",
        fields: [
          { id: "inputs", label: "Đầu vào mỗi ngày", type: "number", min: 100, max: 10000, step: 100, value: 5000 },
          { id: "unsafePct", label: "Chưa an toàn (%)", type: "number", min: 1, max: 50, step: 1, value: 20 },
          { id: "filteredPct", label: "Bộ lọc chặn (%)", type: "number", min: 0, max: 100, step: 5, value: 95 }
        ]
      },
      {
        id: "access",
        label: "Phân quyền",
        title: "Endpoint quản trị",
        badge: "RBAC",
        runLabel: "Kiểm tra quyền",
        hint: "Endpoint hở = endpoint quản trị × (1 − tỉ lệ có kiểm tra). Không được để hở endpoint nào; chỉ cần một cái là đủ chiếm hệ thống.",
        fields: [
          { id: "endpoints", label: "Tổng endpoint", type: "number", min: 10, max: 200, step: 5, value: 80 },
          { id: "adminEndpoints", label: "Endpoint quản trị", type: "number", min: 1, max: 50, step: 1, value: 20 },
          { id: "checksPct", label: "Có kiểm tra quyền (%)", type: "number", min: 0, max: 100, step: 5, value: 75 }
        ]
      },
      {
        id: "secret",
        label: "Bí mật",
        title: "Khóa bị lộ",
        badge: "rotate",
        runLabel: "Đo khóa còn hiệu lực",
        hint: "Khóa còn hiệu lực = số khóa lộ × (1 − tỉ lệ xoay vòng). Mỗi khóa còn hiệu lực cộng 10 điểm rủi ro, chặn trần 100.",
        fields: [
          { id: "leaks", label: "Khóa bị lộ", type: "number", min: 0, max: 100, step: 1, value: 12 },
          { id: "rotatedPct", label: "Đã xoay vòng (%)", type: "number", min: 0, max: 100, step: 5, value: 50 }
        ]
      }
    ],
    defaults: {
      inject: { inputs: 5000, unsafePct: 20, filteredPct: 95 },
      access: { endpoints: 80, adminEndpoints: 20, checksPct: 75 },
      secret: { leaks: 12, rotatedPct: 50 }
    },
    presets: {
      inject: [
        { id: "sec-inject-base", label: "5.000 vào, lọc 95%", dataset: { inputs: 5000, unsafePct: 20, filteredPct: 95 } },
        { id: "sec-inject-clean", label: "Lọc kín 100%", dataset: { inputs: 2000, unsafePct: 10, filteredPct: 100 } },
        { id: "sec-inject-open", label: "Lọc 60%, hở nhiều", dataset: { inputs: 8000, unsafePct: 30, filteredPct: 60 } }
      ],
      access: [
        { id: "sec-access-base", label: "20 endpoint, kiểm 75%", dataset: { endpoints: 80, adminEndpoints: 20, checksPct: 75 } },
        { id: "sec-access-clean", label: "Kiểm tra đủ 100%", dataset: { endpoints: 40, adminEndpoints: 8, checksPct: 100 } },
        { id: "sec-access-open", label: "Chỉ kiểm 40%", dataset: { endpoints: 120, adminEndpoints: 30, checksPct: 40 } }
      ],
      secret: [
        { id: "sec-secret-base", label: "12 khóa, xoay 50%", dataset: { leaks: 12, rotatedPct: 50 } },
        { id: "sec-secret-clean", label: "Xoay đủ 100%", dataset: { leaks: 5, rotatedPct: 100 } },
        { id: "sec-secret-open", label: "40 khóa, xoay 25%", dataset: { leaks: 40, rotatedPct: 25 } }
      ]
    },
    examples: [
      { id: "ex-inject", kind: "inject", label: "Lọc 60% còn hở bao nhiêu?", dataset: { inputs: 8000, unsafePct: 30, filteredPct: 60 } },
      { id: "ex-access", kind: "access", label: "Endpoint quản trị thiếu kiểm tra", dataset: { endpoints: 120, adminEndpoints: 30, checksPct: 40 } },
      { id: "ex-secret", kind: "secret", label: "Khóa cũ chưa xoay", dataset: { leaks: 40, rotatedPct: 25 } }
    ],
    missions: [
      {
        id: "m-inject-open",
        kind: "inject",
        title: "Đầu vào lọt lưới",
        prompt: "Mỗi ngày 5.000 đầu vào, 20% chưa an toàn, bộ lọc chặn 95%. Ghi lại số đầu vào nguy hiểm còn lọt.",
        metric: "open",
        expect: 50,
        hint: "1.000 đầu vào nguy hiểm, chặn 950, còn 50.",
        dataset: { inputs: 5000, unsafePct: 20, filteredPct: 95 }
      },
      {
        id: "m-inject-ok",
        kind: "inject",
        title: "Lọc kín",
        prompt: "2.000 đầu vào, 10% chưa an toàn, bộ lọc chặn 100%. Engine phải kết luận không còn đầu vào lọt.",
        metric: "ok",
        expect: 1,
        hint: "200 đầu vào nguy hiểm, chặn đủ 200.",
        dataset: { inputs: 2000, unsafePct: 10, filteredPct: 100 }
      },
      {
        id: "m-access-open",
        kind: "access",
        title: "Endpoint quản trị hở",
        prompt: "80 endpoint, 20 là quản trị, chỉ 75% có kiểm tra quyền. Ghi lại số endpoint quản trị còn hở.",
        metric: "open",
        expect: 5,
        hint: "20 × 25% = 5 endpoint chưa được kiểm tra.",
        dataset: { endpoints: 80, adminEndpoints: 20, checksPct: 75 }
      },
      {
        id: "m-access-ok",
        kind: "access",
        title: "Kiểm tra phủ đủ",
        prompt: "40 endpoint, 8 quản trị, kiểm tra quyền 100%. Engine phải kết luận không còn endpoint hở.",
        metric: "ok",
        expect: 1,
        hint: "8 × 0% = 0 endpoint hở.",
        dataset: { endpoints: 40, adminEndpoints: 8, checksPct: 100 }
      },
      {
        id: "m-secret-active",
        kind: "secret",
        title: "Khóa còn hiệu lực",
        prompt: "12 khóa bị lộ, mới xoay vòng 50%. Ghi lại số khóa còn hiệu lực.",
        metric: "active",
        expect: 6,
        hint: "12 × 50% = 6 khóa vẫn dùng được.",
        dataset: { leaks: 12, rotatedPct: 50 }
      },
      {
        id: "m-secret-ok",
        kind: "secret",
        title: "Xoay vòng đủ",
        prompt: "5 khóa bị lộ, đã xoay vòng 100%. Engine phải kết luận không còn khóa hiệu lực.",
        metric: "ok",
        expect: 1,
        hint: "5 × 0% = 0 khóa còn hiệu lực.",
        dataset: { leaks: 5, rotatedPct: 100 }
      }
    ]
  }
};

window.SEC_SEED.home = {
  "title": "SecLab — An toàn ứng dụng, nhìn thấy từng bước",
  "eyebrow": "Khóa học tương tác · 12 bài · tiếng Việt",
  "h1": "Một lỗ hổng.<br><span class=\"hl\">Thấy</span> cả đường vào.",
  "sub": "Đi từ xác thực, phân quyền, kiểm tra đầu vào đến injection, XSS, CSRF và phòng thủ nhiều lớp. Mỗi bài là <strong>một sơ đồ sống</strong>, còn phòng mô phỏng đo đầu vào lọt lưới, endpoint hở và khóa còn hiệu lực ngay trong trình duyệt — không cần cài đặt.",
  "note": "Không backend. Số liệu mô phỏng và tiến độ nằm trên máy bạn.",
  "startLabel": "Bắt đầu bài 01",
  "labLabel": "Mở phòng mô phỏng",
  "modesHead": "Bốn cách học, một lớp phòng thủ",
  "modesSub": "Không chỉ đọc danh sách lỗ hổng. Bạn xem dữ liệu đi qua từng chốt chặn, tự đo một cấu hình cụ thể và sửa hiểu nhầm ngay.",
  "modes": [
    {
      "title": "Học bằng sơ đồ sống",
      "desc": "Từng chốt kiểm tra, luồng dữ liệu và điểm vỡ hiện ra theo bước, kèm một tình huống cụ thể để đối chiếu.",
      "href": "#/learn",
      "icon": "process",
      "tone": "blue",
      "cta": "Vào lớp học"
    },
    {
      "title": "Luyện tập tình huống",
      "desc": "8 ca thường gặp: lọc thiếu, quyền hở, khóa chưa xoay và báo cáo lỗ hổng thiếu bằng chứng.",
      "href": "#/practice",
      "icon": "star",
      "tone": "coral",
      "cta": "Bắt đầu luyện"
    },
    {
      "title": "Phòng mô phỏng",
      "desc": "Đo đầu vào nguy hiểm lọt lưới, endpoint quản trị thiếu kiểm tra và khóa còn hiệu lực, kèm 6 nhiệm vụ.",
      "href": "#/lab",
      "icon": "gateway",
      "tone": "violet",
      "cta": "Mở phòng mô phỏng"
    },
    {
      "title": "Cheatsheets",
      "desc": "Bảng chốt chặn theo tầng, mẫu payload để kiểm thử hợp pháp và checklist trước khi phát hành — tra nhanh.",
      "href": "#/cheatsheets",
      "icon": "file",
      "tone": "green",
      "cta": "Mở bảng tra"
    }
  ],
  "outlineHead": "Lộ trình 12 bài",
  "outlineSub": "Từ dữ liệu vào đến bản phát hành: mỗi module trả lời một câu hỏi lớn của an toàn ứng dụng.",
  "faq": [
    {
      "q": "Đây có phải công cụ quét lỗ hổng thật?",
      "a": "Không. Đây là mô phỏng viết tay cho khóa học: ước lượng đầu vào lọt lưới, endpoint hở và khóa còn hiệu lực. Đủ để thấy vì sao từng chốt chặn tồn tại — không thay thế Burp, ZAP hay một buổi pentest thật."
    },
    {
      "q": "Vì sao số liệu mẫu cố định?",
      "a": "Dữ liệu cố định để kết quả tất định và dễ đối chiếu: 5.000 đầu vào, 20% chưa an toàn, 80 endpoint. Nhờ vậy nhiệm vụ có đáp án kiểm chứng được, không phụ thuộc dữ liệu ngẫu nhiên."
    },
    {
      "q": "Bài học có dạy tấn công không?",
      "a": "Chỉ ở mức nhận diện và phòng thủ. Ví dụ payload dùng để hiểu cơ chế và kiểm thử trên hệ thống của chính mình; không có hướng dẫn tấn công người khác hay né phát hiện."
    },
    {
      "q": "Dùng trên điện thoại hoặc máy chiếu được không?",
      "a": "Được. Giao diện responsive, thanh bên chuyển thành drawer và sơ đồ cuộn ngang trên màn hình nhỏ. Bảng kết quả vẫn đọc được; nên xoay ngang khi xem nhiều cột."
    }
  ],
  "letter": "S",
  "brand": "SecLab",
  "hero": {
    "bar": "sec://request",
    "title": "đầu vào · lọc · phân quyền · phát hành",
    "aria": "Yêu cầu đi qua kiểm tra đầu vào, phân quyền và bước phát hành",
    "states": [
      {
        "label": "Input"
      },
      {
        "label": "Filter"
      },
      {
        "label": "RBAC"
      },
      {
        "label": "Ship"
      }
    ],
    "final": "An",
    "queueSmall": "Kết quả",
    "queueChip": "Kín",
    "queueVerdict": "0 hở",
    "frames": [
      {
        "small": "Đầu vào lọt",
        "b": "50",
        "cls": "miss"
      },
      {
        "small": "Quyền phủ",
        "b": "75%",
        "cls": "hit"
      },
      {
        "small": "Khóa chưa xoay",
        "b": "6"
      }
    ]
  },
  "promo": {
    "eyebrow": "Phòng mô phỏng · chạy cục bộ",
    "h2": "Một yêu cầu.<br>Ba chốt chặn.",
    "p": "Đo số đầu vào nguy hiểm lọt qua bộ lọc, số endpoint quản trị thiếu kiểm tra quyền và số bí mật còn hiệu lực sau khi xoay vòng. Sáu nhiệm vụ chấm điểm ngay trên kết quả, kèm gợi ý sửa từng cấu hình yếu.",
    "cta": "Mở phòng mô phỏng",
    "nodes": [
      {
        "icon": "user",
        "label": "Yêu cầu",
        "sub": "đầu vào",
        "hot": true
      },
      {
        "icon": "check",
        "label": "Lọc",
        "sub": "validate"
      },
      {
        "icon": "shield",
        "label": "Phân quyền",
        "sub": "RBAC"
      },
      {
        "icon": "key",
        "label": "Bí mật",
        "sub": "xoay vòng",
        "hot": true
      },
      {
        "icon": "alert",
        "label": "Cảnh báo",
        "sub": "lỗ hổng"
      },
      {
        "icon": "audit",
        "label": "Kiểm thử",
        "sub": "pentest"
      },
      {
        "icon": "server",
        "label": "Phát hành",
        "sub": "an toàn"
      }
    ]
  }
};
window.SECLAB = window.SECLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };
window.SECLAB.home = window.SEC_SEED.home;

(function () {
  const D = window.SECLAB;
  if (!D) return;
  Object.values(D.lessons || {}).forEach((lesson) => {
    (lesson.steps || []).forEach((step) => {
      if (Array.isArray(step.metrics)) {
        const keyed = {};
        step.metrics.forEach((m) => { if (m && m.key != null) keyed[m.key] = m.value; });
        step.metrics = keyed;
      }
      if (Array.isArray(step.changes)) {
        step.changes = step.changes.map((c) => {
          if (!c || typeof c !== "object") return String(c);
          if (c.before && c.after) return c.label + ": " + c.before + " thành " + c.after;
          return String(c.label || c.after || "");
        });
      }
    });
  });
})();

(function () {
  const T = window.SECLAB;
  T.practice.push(
    {
      id: "sec-practice-secret",
      module: "be-mat-ung-dung",
      tag: "SECRET",
      title: "Mười hai khóa lộ trong lịch sử",
      scenario: "Đội vận hành phát hiện một kho mã nguồn công khai lộ 12 khóa API trong lịch sử commit. Nhóm đã xóa các dòng chứa khóa khỏi nhánh chính và xoay vòng 50% số khóa, tức 6 khóa được cấp mới và thu hồi bản cũ. Sáu khóa còn lại vẫn dùng được vì nằm trong các dịch vụ ít người đụng tới. Quản lý hỏi liệu xóa khỏi mã nguồn đã đủ an toàn chưa, và vì sao phải xoay vòng toàn bộ chứ không chỉ những khóa còn thấy trong tệp cấu hình hiện tại.",
      metrics: [
        { label: "Khóa lộ", value: "12" },
        { label: "Đã xoay", value: "50%" },
        { label: "Còn hiệu lực", value: "6" }
      ],
      options: [
        "Đủ an toàn vì khóa đã bị xóa khỏi mã nguồn",
        "Chưa đủ; phải xoay vòng cả 12 khóa vì bản cũ vẫn nằm trong lịch sử và bản sao lưu",
        "Chỉ cần xoay 6 khóa còn dùng, 6 khóa kia đã bị xóa nên vô hiệu",
        "Đổi tên biến môi trường là đủ, không cần xoay khóa"
      ],
      correct: 1,
      explain: "Xóa khóa khỏi nhánh chính không xóa chúng khỏi lịch sử Git, bản sao lưu hay log của dịch vụ đã dùng khóa. Kẻ tấn công có thể đọc lịch sử và dùng lại bất kỳ khóa nào còn hiệu lực. Vì vậy phải xoay vòng cả 12 khóa: <code>12 − 6 = 6</code> khóa còn hiệu lực chính là lỗ hổng đang mở. Phương án chỉ xoay 6 khóa bỏ qua 6 khóa đã lộ nhưng chưa thu hồi; đổi tên biến không làm khóa cũ mất giá trị. Sau khi xoay, cần quét lại lịch sử và thêm bước chặn bí mật vào CI."
    },
    {
      id: "sec-practice-pentest",
      module: "phong-thu-va-kiem-thu",
      tag: "PENTEST",
      title: "Báo cáo thiếu bằng chứng",
      scenario: "Trước khi phát hành, nhóm thuê một đơn vị kiểm thử xâm nhập cho ứng dụng đặt lịch khám. Báo cáo cuối kỳ liệt kê ba lỗ hổng mức cao nhưng chỉ ghi tên lỗ hổng, không có bước tái hiện, ảnh chụp hay đoạn log. Đội phát triển sửa xong hai lỗi và cho rằng lỗi thứ ba không tái hiện được nên bỏ qua. Giảng viên hướng dẫn nhắc rằng một phát hiện không có bằng chứng thì không thể xác nhận đã vá, và cũng không thể chấm điểm rủi ro cho đúng. Nhóm cần quyết định bước tiếp theo trước khi ký nghiệm thu.",
      metrics: [
        { label: "Phát hiện", value: "3" },
        { label: "Có bằng chứng", value: "0" },
        { label: "Đã vá", value: "2" }
      ],
      options: [
        "Ký nghiệm thu vì đã sửa hai trong ba lỗi",
        "Yêu cầu bên kiểm thử bổ sung bước tái hiện và bằng chứng, rồi kiểm lại cả ba",
        "Bỏ lỗi thứ ba vì không tái hiện được",
        "Tự viết lại báo cáo mà không cần bên kiểm thử"
      ],
      correct: 1,
      explain: "Một phát hiện thiếu bằng chứng không đủ để xác nhận hay bác bỏ: không biết lỗi nằm ở đâu, điều kiện nào kích hoạt, đã vá đúng chưa. Cách đúng là yêu cầu bổ sung bước tái hiện, ảnh chụp, log và kiểm lại cả ba lỗi; chỉ khi tái hiện được mới chứng minh bản vá có hiệu lực. Ký nghiệm thu khi còn một lỗi chưa rõ là chấp nhận rủi ro. Bỏ qua lỗi không tái hiện được là tự loại bỏ bằng chứng. Tự viết lại báo cáo không thay thế được kiểm thử độc lập, còn làm mất dấu vết đối chiếu."
    }
  );
})();
