window.SECLAB = window.SECLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };
/* SecLab — phần 2: module lỗ hổng web, tình huống và bảng tra */
(function () {
  const T = window.SECLAB;

  T.modules.push({
    id: "lo-hong-web",
    num: "02",
    title: "Lỗ hổng web",
    tone: "mint",
    blurb: "Bốn lỗ hổng quen thuộc nhất của ứng dụng web: câu truy vấn nối chuỗi bị tiêm lệnh, bình luận lưu thô dẫn tới XSS, biểu mẫu thiếu token bị CSRF, và máy chủ gọi hộ URL nội bộ trong SSRF. Mỗi bài có sơ đồ luồng, số liệu và checklist rà soát.",
    lessons: ["injection", "xss", "csrf", "ssrf"]
  });

  T.lessons["injection"] = {
    id: "injection",
    module: "lo-hong-web",
    title: "Tiêm lệnh SQL",
    shortTitle: "SQL injection",
    subtitle: "Từ nối chuỗi đến truy vấn tham số hóa",
    blurb: "Câu truy vấn nối chuỗi biến ô nhập thành cú pháp SQL. Bài này dựng lại lần tra điểm bị chèn điều kiện luôn đúng, rồi chốt ba lớp chặn: tham số hóa, kiểm tra kiểu dữ liệu và tài khoản chỉ có quyền đọc.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["SQL injection", "tham số hóa", "quyền tối thiểu", "chuỗi truy vấn", "kiểm tra đầu vào"],
    metrics: [
      { key: "queries", label: "Truy vấn", tone: "blue" },
      { key: "taintedPct", label: "Chuỗi nối", tone: "coral" },
      { key: "blocked", label: "Hàng bị chặn", tone: "mint" },
      { key: "risk", label: "Rủi ro", tone: "yellow" }
    ],
    nodes: [
      { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Học viên", sub: "nhập mã lớp" },
      { id: "form", type: "page", x: 340, y: 80, w: 200, h: 70, label: "Biểu mẫu tra điểm", sub: "ô nhập tự do" },
      { id: "query", type: "code", x: 625, y: 80, w: 200, h: 70, label: "Chuỗi truy vấn", sub: "nối bằng dấu cộng" },
      { id: "db", type: "server", x: 55, y: 310, w: 200, h: 70, label: "Máy chủ CSDL", sub: "chạy cả chuỗi" },
      { id: "table", type: "disk", x: 340, y: 310, w: 200, h: 70, label: "Bảng điểm", sub: "12.480 hàng" },
      { id: "attacker", type: "alert", x: 625, y: 310, w: 200, h: 70, label: "Kẻ tấn công", sub: "chèn OR 1=1" },
      { id: "shield", type: "shield", x: 340, y: 195, w: 200, h: 70, label: "Truy vấn tham số", sub: "giữ chỗ riêng" }
    ],
    edges: [
      { id: "user-form", from: "user", to: "form", kind: "request", label: "mã lớp" },
      { id: "form-query", from: "form", to: "query", kind: "data", label: "nối chuỗi" },
      { id: "query-db", from: "query", to: "db", kind: "request", label: "gửi nguyên văn" },
      { id: "db-table", from: "db", to: "table", kind: "data", label: "trả 12.480 hàng" },
      { id: "attacker-form", from: "attacker", to: "form", kind: "control", label: "chèn OR 1=1" },
      { id: "table-attacker", from: "table", to: "attacker", kind: "data", label: "rò rỉ điểm" },
      { id: "shield-query", from: "shield", to: "query", kind: "control", label: "tham số hóa" }
    ],
    learn: [
      "Không ghép chuỗi, không nội suy biến vào câu lệnh SQL.",
      "Truy vấn tham số hóa gửi cú pháp và dữ liệu trong hai kênh riêng.",
      "Tài khoản ứng dụng chỉ có quyền đọc đúng bảng cần thiết.",
      "Thông báo lỗi chung, chi tiết chỉ ghi vào log nội bộ."
    ],
    steps: [
      {
        short: "Vì sao dính lỗi",
        type: "concept",
        title: "Dữ liệu trở thành cú pháp",
        body: "Ô tra điểm trên trang lớp học nhận mã sinh viên rồi ghép thẳng vào câu lệnh: <code>SELECT diem FROM bang_diem WHERE ma = '...'</code>. Khi người học gõ <code>' OR '1'='1</code>, chuỗi cuối cùng có điều kiện luôn đúng, nên cơ sở dữ liệu trả về toàn bộ 12.480 hàng thay vì một hàng. Lỗi không nằm ở SQL mà ở chỗ để dữ liệu người dùng trở thành cú pháp. Mọi ô nhập, tham số URL, tiêu đề tệp đều là nguồn không tin cậy. Cách nhận diện nhanh: nếu câu lệnh có dấu cộng hoặc nội suy chuỗi quanh biến, đó là chỗ phải sửa trước.",
        focus: ["user", "form", "query", "db"],
        edges: ["user-form", "form-query", "query-db"],
        metrics: { queries: "1 câu nối chuỗi", taintedPct: "100%", blocked: "0", risk: "cao" },
        changes: [
          "Mã lớp người dùng nhập trở thành một phần câu lệnh.",
          "Điều kiện lọc bị vô hiệu hóa, truy vấn trả toàn bảng."
        ],
        note: "Mọi chỗ có dấu cộng quanh biến trong câu lệnh đều là ứng viên."
      },
      {
        short: "Chèn qua ô nhập",
        type: "flow",
        title: "Một ô nhập, cả bảng dữ liệu",
        body: "Kẻ tấn công không cần mật khẩu cơ sở dữ liệu, chỉ cần một ô nhập. Họ gửi mã lớp kèm mệnh đề <code>UNION SELECT</code> để nối thêm bảng người dùng, hoặc dùng <code>OR 1=1</code> để bỏ qua điều kiện lọc. Vì ứng dụng chạy câu lệnh bằng tài khoản có quyền đọc cả lược đồ, phản hồi trả về đủ 12.480 hàng điểm kèm tên, email và số điện thoại. Thời gian phản hồi khoảng 40 ms, không có dấu hiệu bất thường trong log vì câu lệnh vẫn hợp lệ. Chỉ cần thử vài chục biến thể là kẻ tấn công lập được bảng dữ liệu đầy đủ để bán hoặc tống tiền.",
        focus: ["attacker", "form", "query", "table"],
        edges: ["attacker-form", "query-db", "db-table", "table-attacker"],
        metrics: { queries: "1 câu nối chuỗi", taintedPct: "100%", blocked: "0", risk: "cao" },
        changes: [
          "Phản hồi chứa 12.480 hàng thay vì một hàng điểm.",
          "Tên, email và số điện thoại lọt ra ngoài qua cùng một ô nhập."
        ],
        note: "Log vẫn sạch vì câu lệnh chèn vẫn là SQL hợp lệ."
      },
      {
        short: "Tham số hóa",
        type: "detail",
        title: "Tách cú pháp khỏi dữ liệu",
        body: "Truy vấn tham số hóa tách cú pháp khỏi dữ liệu: <code>SELECT diem FROM bang_diem WHERE ma = $1</code>. Máy chủ gửi câu lệnh đã biên dịch trước, rồi truyền giá trị như một tham số riêng, nên chuỗi <code>' OR '1'='1</code> chỉ được so sánh như một mã lớp không tồn tại. Cùng một câu lệnh dùng lại được cho mọi lần tra, không phải ghép chuỗi mỗi lần. Với ORM, hãy dùng tham số ràng buộc thay vì nối chuỗi trong <code>whereRaw</code>. Kiểm tra thêm kiểu dữ liệu: mã lớp phải khớp mẫu sáu chữ số. Kết quả là 0 hàng bất thường và không còn đường nào để chèn cú pháp.",
        focus: ["shield", "query", "db", "table"],
        edges: ["shield-query", "query-db", "db-table"],
        metrics: { queries: "1 câu tham số", taintedPct: "0%", blocked: "12.480", risk: "thấp" },
        changes: [
          "Chuỗi chèn chỉ còn là giá trị so sánh, không phải cú pháp.",
          "Toàn bộ 12.480 hàng không còn trả về khi đầu vào sai."
        ],
        note: "Tham số hóa là mặc định, không phải tùy chọn bật thêm."
      },
      {
        short: "Quyền và lỗi",
        type: "pitfall",
        title: "Quyền rộng và lỗi chi tiết",
        body: "Tham số hóa chưa đủ nếu tài khoản cơ sở dữ liệu vẫn giữ quyền <code>DROP</code> hoặc đọc bảng thanh toán. Hãy tách ba tài khoản: đọc, ghi và quản trị; ứng dụng web chỉ dùng tài khoản đọc đúng ba bảng cần thiết. Lỗi thứ hai là trả nguyên văn thông báo cơ sở dữ liệu ra trang, kèm tên bảng và câu lệnh, giúp kẻ tấn công dò cấu trúc. Lỗi thứ ba là tin vào bộ lọc chuỗi thay cho tham số, ví dụ xóa dấu nháy đơn, vẫn bị vượt qua bằng mã hóa khác. Ghi log câu lệnh đã tham số hóa, không ghi giá trị thô của người dùng.",
        focus: ["db", "table", "user", "shield"],
        edges: ["query-db", "db-table", "shield-query"],
        metrics: { queries: "1 câu tham số", taintedPct: "0%", blocked: "12.480", risk: "trung bình" },
        changes: [
          "Tài khoản ứng dụng mất quyền xóa và quyền đọc bảng thanh toán.",
          "Trang chỉ trả mã lỗi chung, chi tiết chuyển vào log nội bộ."
        ],
        note: "Quyền tối thiểu giới hạn thiệt hại khi vẫn còn một chỗ sót."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Checklist chống tiêm SQL",
        tone: "final",
        body: "Chốt lại bằng checklist ngắn. Một: mọi câu lệnh đi qua tham số hóa, không nối chuỗi, không nội suy. Hai: kiểm tra kiểu và độ dài đầu vào trước khi chạm cơ sở dữ liệu. Ba: tài khoản ứng dụng chỉ có quyền đọc ba bảng cần thiết, không có quyền <code>DROP</code>. Bốn: thông báo lỗi chung, chi tiết chỉ vào log nội bộ. Năm: bật ghi log câu lệnh chậm để phát hiện truy vấn bất thường. Sáu: quét mã tự động và đưa chuỗi <code>' OR '1'='1</code> vào bộ kiểm thử. Bảy: rà cả job nền và công cụ quản trị vì chúng thường bị bỏ sót.",
        focus: "all",
        edges: "all",
        metrics: { queries: "1 câu tham số", taintedPct: "0%", blocked: "12.480", risk: "thấp" },
        changes: [
          "Không còn câu lệnh nào ghép chuỗi trong toàn bộ ứng dụng.",
          "Có bộ kiểm thử tự động chặn payload quay lại sau này."
        ],
        note: "Tham số hóa chặn đường vào; quyền tối thiểu chặn đường ra."
      }
    ]
  };

  T.lessons["xss"] = {
    id: "xss",
    module: "lo-hong-web",
    title: "XSS và mã hóa đầu ra",
    shortTitle: "XSS",
    subtitle: "Escape theo ngữ cảnh và CSP",
    blurb: "Trình duyệt không phân biệt dữ liệu với mã. Bài này đi từ bình luận lưu thô đến thẻ script chạy trong phiên người đọc, rồi chốt hai lớp phòng thủ: escape theo ngữ cảnh HTML, JS, URL và CSP chặn script ngoài danh sách.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["XSS", "escape", "CSP", "HttpOnly", "ngữ cảnh"],
    metrics: [
      { key: "fields", label: "Trường nhập", tone: "blue" },
      { key: "rawPct", label: "In thô", tone: "coral" },
      { key: "escapedPct", label: "Đã escape", tone: "mint" },
      { key: "risk", label: "Rủi ro", tone: "yellow" }
    ],
    nodes: [
      { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Sinh viên", sub: "gửi bình luận" },
      { id: "store", type: "disk", x: 340, y: 80, w: 200, h: 70, label: "Cơ sở dữ liệu", sub: "lưu nguyên văn" },
      { id: "page", type: "page", x: 625, y: 80, w: 200, h: 70, label: "Trang lớp học", sub: "in bình luận thô" },
      { id: "script", type: "code", x: 55, y: 310, w: 200, h: 70, label: "Thẻ script", sub: "chạy trong phiên" },
      { id: "session", type: "key", x: 340, y: 310, w: 200, h: 70, label: "Cookie phiên", sub: "bị đọc trộm" },
      { id: "csp", type: "check", x: 625, y: 310, w: 200, h: 70, label: "Chính sách CSP", sub: "script ngoài bị chặn" },
      { id: "shield", type: "shield", x: 340, y: 195, w: 200, h: 70, label: "Escape ngữ cảnh", sub: "HTML, JS, URL" }
    ],
    edges: [
      { id: "user-store", from: "user", to: "store", kind: "request", label: "bình luận" },
      { id: "store-page", from: "store", to: "page", kind: "data", label: "nguyên văn" },
      { id: "page-script", from: "page", to: "script", kind: "data", label: "script chạy" },
      { id: "script-session", from: "script", to: "session", kind: "data", label: "đọc cookie" },
      { id: "shield-page", from: "shield", to: "page", kind: "control", label: "escape đầu ra" },
      { id: "csp-script", from: "csp", to: "script", kind: "control", label: "chặn script" },
      { id: "page-user", from: "page", to: "user", kind: "response", label: "trang nhiễm" }
    ],
    learn: [
      "Stored, reflected và DOM XSS khác nhau ở nơi dữ liệu bị hiểu là mã.",
      "Escape phải khớp ngữ cảnh: HTML, thuộc tính, script hay URL.",
      "CSP không có <code>unsafe-inline</code> chặn script chèn vào.",
      "Cookie phiên đặt <code>HttpOnly</code> để JavaScript không đọc được."
    ],
    steps: [
      {
        short: "Ba dạng XSS",
        type: "concept",
        title: "Khi dữ liệu thành mã",
        body: "XSS xảy ra khi dữ liệu người dùng được trình duyệt hiểu là mã. Ba dạng thường gặp: reflected khi tham số trên URL được in lại ngay, stored khi bình luận nằm trong cơ sở dữ liệu rồi hiển thị cho người khác, và DOM khi đoạn JavaScript tự ghi chuỗi vào <code>innerHTML</code>. Trang lớp học của chúng ta thuộc dạng stored: 600 trường nhập, trong đó 80% hiển thị nguyên văn. Chỉ cần một bình luận chứa thẻ mở script là mọi học viên mở trang đều chạy mã đó trong phiên của mình. Hậu quả không dừng ở popup mà là đọc cookie và gửi yêu cầu thay người dùng.",
        focus: ["user", "store", "page", "script"],
        edges: ["user-store", "store-page", "page-script"],
        metrics: { fields: "600", rawPct: "80%", escapedPct: "20%", risk: "cao" },
        changes: [
          "Bình luận được lưu nguyên văn, không qua bước làm sạch.",
          "600 trường nhập trở thành 600 điểm có thể chèn mã."
        ],
        note: "Dạng stored nguy hiểm hơn vì một payload phục vụ mọi người đọc."
      },
      {
        short: "Đường đi payload",
        type: "flow",
        title: "Từ ô bình luận đến cookie",
        body: "Một học viên dán vào ô bình luận đoạn mã đọc <code>document.cookie</code> rồi gửi sang máy chủ lạ. Ứng dụng lưu nguyên văn vào cơ sở dữ liệu vì tin rằng sẽ lọc sau. Khi 40 học viên khác mở trang, máy chủ trả HTML có lẫn thẻ script, trình duyệt chạy nó như mã của chính trang. Cookie phiên không đặt <code>HttpOnly</code> nên đoạn mã đọc được và gửi đi trong 300 ms. Kẻ tấn công dùng phiên đó đọc bài làm và sửa điểm. Sự cố kéo dài ba ngày vì log chỉ ghi các yêu cầu hợp lệ. Điểm mấu chốt: lọc lúc nhập không bao giờ đủ, vì dữ liệu còn đi qua nhiều nơi hiển thị.",
        focus: ["page", "script", "session", "user"],
        edges: ["store-page", "page-script", "script-session", "page-user"],
        metrics: { fields: "600", rawPct: "80%", escapedPct: "20%", risk: "cao" },
        changes: [
          "40 phiên bị đọc cookie và gửi sang miền ngoài.",
          "Bài làm và điểm bị sửa mà không cần mật khẩu."
        ],
        note: "Cookie thiếu HttpOnly biến XSS thành chiếm đoạt phiên hoàn chỉnh."
      },
      {
        short: "Escape theo ngữ cảnh",
        type: "detail",
        title: "Mỗi ngữ cảnh một cách escape",
        body: "Escape phải khớp nơi dữ liệu xuất hiện. Trong HTML, đổi <code>&lt;</code>, <code>&gt;</code>, <code>&amp;</code> và nháy kép thành thực thể; trong thuộc tính nên đặt trong nháy kép và escape cả nháy. Trong thẻ script, không chèn chuỗi trực tiếp mà dùng <code>JSON.stringify</code> rồi escape dấu gạch chéo. Trong URL, dùng <code>encodeURIComponent</code>. Một hàm thay thế chung cho mọi ngữ cảnh sẽ sai ở ít nhất một chỗ. Thư viện template engine tự escape theo ngữ cảnh, hãy dùng nó thay vì <code>innerHTML</code>. Với 600 trường nhập, escape đúng đưa tỉ lệ trường thô từ 80% xuống 0%.",
        focus: ["shield", "page", "store"],
        edges: ["shield-page", "store-page"],
        metrics: { fields: "600", rawPct: "0%", escapedPct: "100%", risk: "thấp" },
        changes: [
          "Thẻ script trong bình luận hiện thành văn bản, không chạy.",
          "Tỉ lệ trường in thô giảm từ 80% xuống 0%."
        ],
        note: "Escape tại điểm xuất, không phải tại điểm nhập."
      },
      {
        short: "Vì sao lọc thua",
        type: "pitfall",
        title: "Danh sách đen không đủ",
        body: "Lọc chuỗi theo danh sách đen luôn thua vì cú pháp HTML quá rộng: thẻ <code>img onerror</code>, <code>svg onload</code>, thuộc tính sự kiện, mã hóa thực thể hay thẻ tự đóng đều vượt qua. Mỗi lần trình duyệt thêm tính năng là danh sách lại hở. CSP bổ sung lớp thứ hai: chỉ cho phép script từ miền của mình, chặn <code>unsafe-inline</code>, nên thẻ script chèn vào không chạy dù lọt qua escape. Đặt thêm <code>HttpOnly</code> cho cookie phiên để mã chèn không đọc được. Ba lớp này độc lập: escape đúng, CSP chặt, cookie không đọc được bằng JavaScript.",
        focus: ["csp", "script", "shield", "session"],
        edges: ["csp-script", "shield-page", "script-session"],
        metrics: { fields: "600", rawPct: "0%", escapedPct: "100%", risk: "trung bình" },
        changes: [
          "Script nội tuyến bị CSP chặn dù có chỗ escape còn sót.",
          "Cookie phiên không còn đọc được từ JavaScript."
        ],
        note: "CSP là lưới an toàn, không phải giấy phép bỏ escape."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Checklist chống XSS",
        tone: "final",
        body: "Chốt checklist chống XSS. Một: escape theo ngữ cảnh tại mọi điểm xuất, không lọc thay escape. Hai: không dùng <code>innerHTML</code> cho dữ liệu người dùng, dùng <code>textContent</code>. Ba: cookie phiên có <code>HttpOnly</code>, <code>Secure</code> và <code>SameSite=Lax</code>. Bốn: CSP không có <code>unsafe-inline</code>, dùng nonce cho từng script hợp lệ. Năm: kiểm thử bằng bộ payload có sẵn, gồm cả thuộc tính sự kiện và thẻ SVG. Sáu: rà cả email và trang quản trị vì chúng dùng chung một kho dữ liệu. Bảy: bật báo cáo vi phạm CSP để biết chỗ còn sót.",
        focus: "all",
        edges: "all",
        metrics: { fields: "600", rawPct: "0%", escapedPct: "100%", risk: "thấp" },
        changes: [
          "Mọi điểm xuất dùng escape theo ngữ cảnh, có test đi kèm.",
          "CSP và HttpOnly cùng bật, tạo ba lớp độc lập."
        ],
        note: "Kiểm thử XSS phải chạy trên trang thật, không chỉ trên biểu mẫu."
      }
    ]
  };

  T.lessons["csrf"] = {
    id: "csrf",
    module: "lo-hong-web",
    title: "CSRF và token",
    shortTitle: "CSRF",
    subtitle: "SameSite, token đồng bộ và Origin",
    blurb: "CSRF mượn cookie phiên của người đang đăng nhập để gửi yêu cầu ngoài ý muốn. Bài này dựng lại biểu mẫu ẩn chuyển 4.500.000 đồng học phí, rồi chốt ba lớp: cookie SameSite, token đồng bộ và kiểm tra Origin.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["CSRF", "SameSite", "token đồng bộ", "Origin", "cookie phiên"],
    metrics: [
      { key: "forms", label: "Biểu mẫu", tone: "blue" },
      { key: "tokenPct", label: "Có token", tone: "mint" },
      { key: "sameSite", label: "SameSite", tone: "yellow" },
      { key: "risk", label: "Rủi ro", tone: "coral" }
    ],
    nodes: [
      { id: "student", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Sinh viên", sub: "đang đăng nhập" },
      { id: "evil", type: "alert", x: 340, y: 80, w: 200, h: 70, label: "Trang lừa đảo", sub: "biểu mẫu ẩn" },
      { id: "bank", type: "server", x: 625, y: 80, w: 200, h: 70, label: "Cổng học phí", sub: "nhận yêu cầu POST" },
      { id: "pay", type: "task", x: 55, y: 310, w: 200, h: 70, label: "Lệnh chuyển tiền", sub: "4.500.000 đồng" },
      { id: "cookie", type: "key", x: 340, y: 310, w: 200, h: 70, label: "Cookie SameSite", sub: "Lax, tự gửi kèm" },
      { id: "origin", type: "audit", x: 625, y: 310, w: 200, h: 70, label: "Kiểm tra Origin", sub: "so danh sách miền" },
      { id: "token", type: "check", x: 340, y: 195, w: 200, h: 70, label: "Token đồng bộ", sub: "32 byte gắn phiên" }
    ],
    edges: [
      { id: "student-evil", from: "student", to: "evil", kind: "request", label: "mở link lạ" },
      { id: "evil-bank", from: "evil", to: "bank", kind: "request", label: "POST ẩn" },
      { id: "bank-pay", from: "bank", to: "pay", kind: "control", label: "trừ 4.500.000" },
      { id: "cookie-bank", from: "cookie", to: "bank", kind: "data", label: "tự gửi kèm" },
      { id: "token-bank", from: "token", to: "bank", kind: "control", label: "đối chiếu token" },
      { id: "origin-bank", from: "origin", to: "bank", kind: "control", label: "so miền gửi" },
      { id: "pay-student", from: "pay", to: "student", kind: "response", label: "biên lai" }
    ],
    learn: [
      "Trình duyệt tự gắn cookie vào yêu cầu gửi tới miền đã đặt cookie.",
      "Cookie <code>SameSite=Lax</code> chặn phần lớn POST từ miền khác.",
      "Token đồng bộ 32 byte gắn phiên, so bằng phép so sánh hằng thời gian.",
      "Kiểm tra <code>Origin</code> là lớp thứ ba khi token bị bỏ sót."
    ],
    steps: [
      {
        short: "Lỗi ở trình duyệt",
        type: "concept",
        title: "Yêu cầu hợp lệ nhưng ngoài ý muốn",
        body: "CSRF lợi dụng việc trình duyệt tự gắn cookie vào mọi yêu cầu gửi tới miền đã đặt cookie. Sinh viên đang đăng nhập cổng học phí, mở một link lạ trong tab khác; trang đó tự động gửi biểu mẫu POST tới cổng học phí. Trình duyệt thấy đúng miền nên gắn cookie phiên, máy chủ thấy phiên hợp lệ và thực hiện lệnh chuyển 4.500.000 đồng. Người dùng không bấm nút nào trong cổng, nhưng yêu cầu vẫn hợp lệ về mặt kỹ thuật. Vì vậy kiểm tra đăng nhập là chưa đủ; cần thêm bằng chứng rằng yêu cầu xuất phát từ chính biểu mẫu của ứng dụng.",
        focus: ["student", "evil", "bank", "pay"],
        edges: ["student-evil", "evil-bank", "bank-pay"],
        metrics: { forms: "1.240 form", tokenPct: "0%", sameSite: "Lax", risk: "cao" },
        changes: [
          "Cookie phiên được gửi kèm yêu cầu do trang khác tạo ra.",
          "Máy chủ không phân biệt được yêu cầu thật và yêu cầu mượn phiên."
        ],
        note: "Đăng nhập hợp lệ không chứng minh người dùng muốn thao tác này."
      },
      {
        short: "Một form ẩn",
        type: "flow",
        title: "Biểu mẫu ẩn tự gửi",
        body: "Trang lừa đảo chứa biểu mẫu ẩn trỏ tới <code>/hocphi/chuyen</code>, các trường số tiền và tài khoản nhận đã điền sẵn, rồi tự gửi bằng một dòng script khi trang tải xong. Trình duyệt gắn cookie phiên của sinh viên, máy chủ nhận yêu cầu và trừ tiền ngay. Vì cookie đặt <code>SameSite=Lax</code>, yêu cầu POST từ miền khác bị chặn ở trình duyệt mới, nhưng nhiều người dùng còn trình duyệt cũ hoặc webview bỏ qua thuộc tính này. Biên lai gửi vào email, sinh viên chỉ phát hiện sau vài giờ. Sự cố cho thấy chỉ dựa vào SameSite là chưa đủ cho thao tác đổi tiền.",
        focus: ["evil", "bank", "pay", "cookie"],
        edges: ["evil-bank", "bank-pay", "cookie-bank", "pay-student"],
        metrics: { forms: "1.240 form", tokenPct: "0%", sameSite: "Lax", risk: "cao" },
        changes: [
          "Một biểu mẫu ẩn ngoài miền trừ được 4.500.000 đồng.",
          "Biên lai chỉ hiện sau khi tiền đã rời ví."
        ],
        note: "SameSite=Lax giảm rủi ro nhưng không thay được token."
      },
      {
        short: "Token đồng bộ",
        type: "detail",
        title: "Token gắn với phiên",
        body: "Token đồng bộ là chuỗi ngẫu nhiên 32 byte gắn với phiên, sinh khi người dùng đăng nhập và nhúng vào mỗi biểu mẫu dưới dạng trường ẩn. Khi nhận yêu cầu, máy chủ so token gửi lên với token lưu trong phiên bằng phép so sánh hằng thời gian. Trang lừa đảo không đọc được token vì chính sách cùng nguồn, nên không dựng được yêu cầu hợp lệ. Với 1.240 biểu mẫu trong hệ thống, hãy sinh token ở tầng khung và chèn tự động thay vì sửa từng trang. Token nên dùng một lần cho thao tác nhạy cảm như chuyển tiền, và không đặt trong URL vì URL lọt vào log và header referer.",
        focus: ["token", "bank", "cookie"],
        edges: ["token-bank", "cookie-bank"],
        metrics: { forms: "1.240 form", tokenPct: "100%", sameSite: "Lax", risk: "thấp" },
        changes: [
          "Mỗi biểu mẫu mang một token riêng, không đoán được từ ngoài.",
          "Yêu cầu thiếu token bị từ chối trước khi chạm ví tiền."
        ],
        note: "Token phải so với bản lưu trong phiên, không so với chính nó."
      },
      {
        short: "Ba lỗi token",
        type: "pitfall",
        title: "Token đặt sai chỗ",
        body: "Ba lỗi làm token mất tác dụng. Thứ nhất, đặt token trong cookie thay vì trường ẩn, vì trình duyệt tự gửi cookie nên kẻ tấn công không cần biết giá trị. Thứ hai, chỉ kiểm token khi có, tức là bỏ qua nếu trường trống; hãy từ chối mọi yêu cầu thiếu token. Thứ ba, dùng chung một token cho toàn hệ thống hoặc không xoay sau đăng nhập. Ngoài ra nên kiểm tra <code>Origin</code> hoặc <code>Referer</code> với danh sách miền cho phép, trả 403 khi không khớp. Với thao tác đổi trạng thái, chỉ nhận POST, không nhận GET, để link ảnh không kích hoạt được.",
        focus: ["token", "origin", "bank"],
        edges: ["token-bank", "origin-bank"],
        metrics: { forms: "1.240 form", tokenPct: "100%", sameSite: "Lax", risk: "trung bình" },
        changes: [
          "Yêu cầu thiếu hoặc sai token đều bị trả 403 như nhau.",
          "Chỉ phương thức POST được nhận cho thao tác đổi tiền."
        ],
        note: "Kiểm token có điều kiện tệ như không kiểm."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Checklist chống CSRF",
        tone: "final",
        body: "Chốt checklist CSRF. Một: mọi biểu mẫu đổi trạng thái có token đồng bộ gắn phiên, kiểm bằng so sánh hằng thời gian. Hai: từ chối yêu cầu thiếu token, không có ngoại lệ cho API nội bộ. Ba: cookie phiên đặt <code>SameSite=Lax</code> hoặc <code>Strict</code>, kèm <code>Secure</code> và <code>HttpOnly</code>. Bốn: kiểm <code>Origin</code> với danh sách miền, trả 403 nếu lạ. Năm: không dùng GET cho thao tác đổi dữ liệu. Sáu: token mới sau mỗi lần đăng nhập và sau khi đổi quyền. Bảy: kiểm thử bằng một trang HTML dựng ngoài miền, gửi biểu mẫu và xác nhận bị chặn.",
        focus: "all",
        edges: "all",
        metrics: { forms: "1.240 form", tokenPct: "100%", sameSite: "Lax", risk: "thấp" },
        changes: [
          "Toàn bộ 1.240 biểu mẫu dùng chung một cơ chế token.",
          "Có bài kiểm thử dựng form ngoài miền để xác nhận bị chặn."
        ],
        note: "Ba lớp cùng bật: SameSite, token đồng bộ, kiểm Origin."
      }
    ]
  };

  T.lessons["ssrf"] = {
    id: "ssrf",
    module: "lo-hong-web",
    title: "SSRF và danh sách cho phép",
    shortTitle: "SSRF",
    subtitle: "Khi máy chủ gọi hộ URL của người lạ",
    blurb: "SSRF biến máy chủ thành bàn đạp vào mạng nội bộ: người dùng dán URL, máy chủ gọi hộ và trả về khóa truy cập. Bài này đi từ dịch vụ metadata đến allowlist miền, chặn 14 dải IP nội bộ và chống chuyển hướng.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["SSRF", "allowlist", "metadata", "DNS rebinding", "chuyển hướng"],
    metrics: [
      { key: "urls", label: "URL mỗi ngày", tone: "blue" },
      { key: "allowPct", label: "Qua allowlist", tone: "mint" },
      { key: "internalBlocked", label: "Dải bị chặn", tone: "yellow" },
      { key: "risk", label: "Rủi ro", tone: "coral" }
    ],
    nodes: [
      { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Người dùng", sub: "dán URL ảnh" },
      { id: "api", type: "api", x: 340, y: 80, w: 200, h: 70, label: "API tải ảnh", sub: "nhận tham số url" },
      { id: "fetch", type: "code", x: 625, y: 80, w: 200, h: 70, label: "Máy chủ tải", sub: "gọi URL bất kỳ" },
      { id: "meta", type: "server", x: 55, y: 310, w: 200, h: 70, label: "Metadata nội bộ", sub: "169.254.169.254" },
      { id: "data", type: "disk", x: 340, y: 310, w: 200, h: 70, label: "Khóa truy cập", sub: "trả về trong JSON" },
      { id: "block", type: "shield", x: 625, y: 310, w: 200, h: 70, label: "Chặn IP nội bộ", sub: "14 dải, IPv4 + IPv6" },
      { id: "allow", type: "check", x: 340, y: 195, w: 200, h: 70, label: "Danh sách cho phép", sub: "chỉ miền ảnh" }
    ],
    edges: [
      { id: "user-api", from: "user", to: "api", kind: "request", label: "dán URL" },
      { id: "api-fetch", from: "api", to: "fetch", kind: "control", label: "gọi hộ" },
      { id: "fetch-meta", from: "fetch", to: "meta", kind: "request", label: "169.254.169.254" },
      { id: "meta-data", from: "meta", to: "data", kind: "data", label: "khóa tạm" },
      { id: "data-api", from: "data", to: "api", kind: "response", label: "trả nội dung" },
      { id: "allow-fetch", from: "allow", to: "fetch", kind: "control", label: "duyệt miền" },
      { id: "block-fetch", from: "block", to: "fetch", kind: "control", label: "chặn dải nội bộ" }
    ],
    learn: [
      "Máy chủ nằm trong mạng nội bộ nên gọi hộ URL là mở cửa hậu.",
      "Allowlist theo nhãn miền, không dùng <code>endsWith</code> hay chứa chuỗi.",
      "Chặn 14 dải IP riêng, gồm cả IPv6 và <code>169.254/16</code>.",
      "Tắt theo chuyển hướng, ghim IP sau khi phân giải để chống DNS rebinding."
    ],
    steps: [
      {
        short: "Gọi hộ là gì",
        type: "concept",
        title: "Máy chủ gọi hộ URL",
        body: "SSRF xảy ra khi máy chủ nhận URL từ người dùng rồi tự gọi URL đó. Tính năng tải ảnh đại diện, nhập link bài viết hay kiểm tra webhook đều có dạng này. Vấn đề là máy chủ nằm trong mạng nội bộ, nên URL người dùng nhập có thể trỏ tới dịch vụ mà người ngoài không với tới: <code>169.254.169.254</code> của dịch vụ metadata, <code>10.0.0.5</code> của cơ sở dữ liệu, hay cổng quản trị chỉ mở nội bộ. Kẻ tấn công không cần xâm nhập máy chủ, chỉ cần mượn quyền gọi của nó. Vì yêu cầu đi ra từ địa chỉ tin cậy, tường lửa thường cho qua.",
        focus: ["user", "api", "fetch", "meta"],
        edges: ["user-api", "api-fetch", "fetch-meta"],
        metrics: { urls: "1 URL", allowPct: "0%", internalBlocked: "0", risk: "cao" },
        changes: [
          "Tham số url trở thành đích gọi của máy chủ.",
          "Mọi dịch vụ nội bộ đều nằm trong tầm với của người dùng."
        ],
        note: "Máy chủ càng nhiều quyền, SSRF càng đắt giá."
      },
      {
        short: "Một URL, một khóa",
        type: "flow",
        title: "Metadata trả khóa trong 400 ms",
        body: "API tải ảnh nhận tham số <code>url</code> và gọi thẳng bằng thư viện HTTP. Kẻ tấn công gửi <code>http://169.254.169.254/latest/meta-data/iam/security-credentials/</code>. Máy chủ gọi trong 400 ms và nhận JSON chứa khóa truy cập tạm thời, rồi trả nguyên nội dung về trình duyệt vì tưởng đó là ảnh. Không có cảnh báo nào vì yêu cầu đi ra hợp lệ và mã trạng thái là 200. Với khóa đó, kẻ tấn công đọc được kho lưu trữ trong 20 phút trước khi khóa hết hạn. Sự cố chỉ lộ khi hóa đơn tăng bất thường. Đây là lý do phải chặn dải nội bộ, không chỉ kiểm tra URL có dạng http.",
        focus: ["fetch", "meta", "data", "api"],
        edges: ["fetch-meta", "meta-data", "data-api"],
        metrics: { urls: "1 URL", allowPct: "0%", internalBlocked: "0", risk: "cao" },
        changes: [
          "Khóa truy cập tạm thời bị trả về qua phản hồi tải ảnh.",
          "Kho lưu trữ bị đọc trong 20 phút mà không cần mật khẩu."
        ],
        note: "Mã 200 và nội dung hợp lệ khiến sự cố không hiện trong log lỗi."
      },
      {
        short: "Allowlist miền",
        type: "detail",
        title: "Cho phép thay vì chặn",
        body: "Thay vì chặn danh sách đen, hãy dùng danh sách cho phép. Chỉ nhận URL có giao thức https, cổng 443 và tên miền thuộc danh sách như <code>cdn.truong.edu.vn</code>. So khớp theo nhãn miền đầy đủ, không dùng <code>endsWith</code> vì <code>cdn.truong.edu.vn.kẻ-tấn-công.net</code> cũng thỏa. Phân giải tên miền trước, kiểm tra địa chỉ IP nhận được không thuộc dải riêng, rồi mới gọi. Giới hạn kích thước phản hồi 2 MB và thời gian chờ 3 giây, chỉ cho phép loại nội dung ảnh. Với 2.300 URL mỗi ngày, danh sách cho phép giữ tỉ lệ hợp lệ 100% mà không cần bảo trì nhiều.",
        focus: ["allow", "fetch", "block"],
        edges: ["allow-fetch", "block-fetch"],
        metrics: { urls: "2.300 URL/ngày", allowPct: "100%", internalBlocked: "14 dải", risk: "thấp" },
        changes: [
          "Chỉ URL thuộc miền trong danh sách được gọi.",
          "Phản hồi bị giới hạn 2 MB và chờ tối đa 3 giây."
        ],
        note: "Allowlist theo nhãn miền, không so khớp chuỗi con."
      },
      {
        short: "Chuyển hướng và DNS",
        type: "pitfall",
        title: "Ba kẽ hở sau allowlist",
        body: "Ba kẽ hở thường gặp. Thứ nhất, kiểm tra URL rồi mới gọi nhưng máy chủ đích trả chuyển hướng 302 sang <code>127.0.0.1</code>; hãy tắt tự động theo chuyển hướng hoặc kiểm lại từng chặng. Thứ hai, DNS rebinding: tên miền qua kiểm tra phân giải lại thành địa chỉ nội bộ ở lần gọi thật; hãy phân giải một lần, ghim IP và gọi đúng IP đó. Thứ ba, chỉ chặn dải <code>10/8</code> mà quên <code>127/8</code>, <code>172.16/12</code>, <code>192.168/16</code>, <code>169.254/16</code> và địa chỉ IPv6 nội bộ. Danh sách chặn phải phủ 14 dải, cả IPv4 lẫn IPv6.",
        focus: ["block", "fetch", "allow"],
        edges: ["block-fetch", "allow-fetch"],
        metrics: { urls: "2.300 URL/ngày", allowPct: "100%", internalBlocked: "14 dải", risk: "trung bình" },
        changes: [
          "Chuyển hướng bị tắt, mỗi chặng phải qua kiểm tra riêng.",
          "IP được ghim sau khi phân giải, chặn DNS rebinding."
        ],
        note: "Kiểm tra URL không kiểm tra IP đích là bỏ sót phổ biến nhất."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Checklist chống SSRF",
        tone: "final",
        body: "Chốt checklist SSRF. Một: chỉ nhận https, cổng 443, tên miền trong danh sách cho phép so khớp theo nhãn. Hai: phân giải tên miền, kiểm IP không thuộc 14 dải nội bộ, ghim IP khi gọi. Ba: tắt theo chuyển hướng hoặc kiểm lại từng chặng. Bốn: giới hạn 2 MB, chờ 3 giây, chỉ nhận nội dung ảnh. Năm: chạy tiến trình tải trong mạng riêng, không có quyền đọc metadata. Sáu: không trả nguyên phản hồi lỗi của máy chủ đích về người dùng. Bảy: ghi log URL đã qua kiểm để phát hiện dò quét.",
        focus: "all",
        edges: "all",
        metrics: { urls: "2.300 URL/ngày", allowPct: "100%", internalBlocked: "14 dải", risk: "thấp" },
        changes: [
          "Mọi lần tải ảnh đi qua allowlist và bộ lọc IP.",
          "Tiến trình tải không còn quyền đọc metadata nội bộ."
        ],
        note: "Giảm quyền của tiến trình tải là lớp chặn cuối khi allowlist hở."
      }
    ]
  };

  T.practice.push({
    id: "xss-binh-luan",
    module: "lo-hong-web",
    tag: "XSS",
    tags: ["XSS"],
    title: "Bình luận lớp học bị chèn script",
    scenario: "Trang lớp học của một trường đại học cho phép sinh viên bình luận dưới mỗi bài giảng. Cơ sở dữ liệu có 600 trường nhập do người dùng gửi, và báo cáo kiểm thử cho thấy 80% trong số đó được in nguyên văn vào HTML. Một sinh viên đã chèn thẻ script đọc cookie phiên rồi gửi sang miền lạ; 40 tài khoản bị đăng nhập trộm. Nhóm kỹ thuật đề xuất bốn hướng xử lý, tất cả đều chặn được payload vừa rồi ở mức nào đó. Trang phải tiếp tục hiển thị bình luận có định dạng và vẫn cho phép giáo viên dán công thức toán. Bạn chọn hướng nào?",
    metrics: [
      { label: "Trường nhập", value: "600" },
      { label: "In thô", value: "80%", danger: true },
      { label: "Phiên bị chiếm", value: "40" }
    ],
    options: [
      "Lọc bỏ mọi thẻ HTML và từ khóa script trước khi lưu bình luận vào cơ sở dữ liệu",
      "Escape theo ngữ cảnh khi xuất ra HTML, thêm CSP không cho script nội tuyến và bật HttpOnly cho cookie phiên",
      "Chỉ đặt cookie phiên trong HttpOnly, giữ nguyên cách in bình luận",
      "Chuyển toàn bộ bình luận sang iframe không sandbox để cô lập"
    ],
    correct: 1,
    explain: "Đáp án đúng là escape tại điểm xuất kèm CSP và HttpOnly. Escape theo ngữ cảnh biến thẻ thành văn bản ở mọi chỗ hiển thị, nên payload không chạy mà bình luận vẫn giữ định dạng cho phép. CSP chặn script nội tuyến như lớp thứ hai khi có chỗ sót, còn <code>HttpOnly</code> khiến mã chèn không đọc được cookie. Lọc chuỗi theo danh sách đen sai vì cú pháp HTML quá rộng, chỉ cần một thuộc tính sự kiện là vượt qua. Chỉ đặt HttpOnly thì thẻ script vẫn chạy, vẫn gửi yêu cầu thay người dùng. iframe không sandbox còn nguy hiểm hơn vì cùng nguồn."
  });

  T.practice.push({
    id: "csrf-hoc-phi",
    module: "lo-hong-web",
    tag: "CSRF",
    tags: ["CSRF"],
    title: "Biểu mẫu chuyển học phí thiếu token",
    scenario: "Cổng học phí của một trường cho phép sinh viên chuyển tiền từ ví nội bộ sang tài khoản khác bằng một biểu mẫu POST. Biểu mẫu chưa có trường ẩn nào ngoài số tiền và tài khoản nhận; cookie phiên đặt SameSite=Lax. Tuần trước, một sinh viên mở link trong email lạ, sau đó tài khoản bị trừ 4.500.000 đồng dù không bấm nút nào. Nhóm kỹ thuật có một ngày để vá trước kỳ thu học phí, vẫn phải giữ 1.240 biểu mẫu khác hoạt động bình thường. Bốn phương án được đưa ra, tất cả đều chạy được trên hạ tầng hiện tại. Bạn chọn phương án nào?",
    metrics: [
      { label: "Thiệt hại", value: "4.500.000", danger: true },
      { label: "SameSite", value: "Lax" },
      { label: "Biểu mẫu", value: "1.240" }
    ],
    options: [
      "Đổi cookie phiên sang SameSite=Strict và giữ nguyên biểu mẫu",
      "Thêm trường ẩn chứa token đồng bộ gắn phiên, kiểm bằng so sánh hằng thời gian và đối chiếu Origin",
      "Yêu cầu nhập lại mật khẩu ở mọi lần chuyển tiền, bỏ qua token",
      "Chuyển biểu mẫu sang GET để trình duyệt không tự gửi cookie"
    ],
    correct: 1,
    explain: "Token đồng bộ là lớp đúng: mỗi biểu mẫu mang một chuỗi 32 byte gắn phiên, trang ngoài miền không đọc được nên không dựng được yêu cầu hợp lệ; máy chủ so token bằng phép so sánh hằng thời gian và trả 403 khi thiếu. Kiểm thêm <code>Origin</code> bắt được cả trường hợp token bị lộ qua lỗi khác. SameSite=Strict một mình vẫn hở với trình duyệt cũ và webview, đồng thời làm hỏng luồng quay lại từ email. Bắt nhập lại mật khẩu không thay được token, vẫn bị gửi tự động nếu phiên đã mở. Chuyển sang GET còn tệ hơn: link ảnh và thẻ preload kích hoạt được, nên tránh."
  });

  T.cheatsheets.push({
    id: "web",
    num: "02",
    module: "lo-hong-web",
    title: "Bảng tra lỗ hổng web",
    intro: "Bốn lỗ hổng có cùng gốc: dữ liệu người dùng đi vào chỗ được hiểu là mã, hoặc máy chủ tin một yêu cầu không đáng tin. Bảng tra gom cách nhận diện, mẫu mã an toàn và checklist để dùng khi rà soát.",
    cards: [
      {
        title: "So sánh SQLi, XSS, CSRF, SSRF",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Lỗ hổng</th><th>Nguồn</th><th>Hậu quả</th><th>Chặn</th></tr></thead><tbody><tr><td class=\"mono\">SQLi</td><td>Ô nhập nối vào câu lệnh</td><td>Đọc, sửa cả bảng dữ liệu</td><td>Truy vấn tham số hóa, quyền tối thiểu</td></tr><tr><td class=\"mono\">XSS</td><td>Dữ liệu in thô ra HTML</td><td>Chạy mã trong phiên người đọc</td><td>Escape theo ngữ cảnh, CSP, HttpOnly</td></tr><tr><td class=\"mono\">CSRF</td><td>Cookie phiên tự gửi kèm</td><td>Thao tác thay người dùng</td><td>Token đồng bộ, SameSite, kiểm Origin</td></tr><tr><td class=\"mono\">SSRF</td><td>URL người dùng nhập</td><td>Gọi dịch vụ nội bộ, lộ khóa</td><td>Allowlist miền, chặn IP nội bộ</td></tr></tbody></table>"
      },
      {
        title: "Mẫu truy vấn tham số hóa",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>// Sai: noi chuoi\nconst sql = \"SELECT diem FROM bang_diem \"\n  + \"WHERE ma = '\" + ma + \"'\";\n\n// Dung: tham so hoa\nawait db.query(\n  'SELECT diem FROM bang_diem WHERE ma = $1',\n  [ma]\n);\n// ORM: where('ma', ma), khong whereRaw</code></pre></div><p>Kiểm thêm mẫu sáu chữ số trước khi chạm cơ sở dữ liệu.</p>"
      },
      {
        title: "Escape theo ngữ cảnh",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Ngữ cảnh</th><th>Cách làm</th><th>Lỗi thường gặp</th></tr></thead><tbody><tr><td>Thân HTML</td><td class=\"mono\">&amp;lt; &amp;gt; &amp;amp; &amp;quot;</td><td>Chỉ thay dấu nháy đơn</td></tr><tr><td>Thuộc tính</td><td>Đặt trong nháy kép, escape cả nháy kép</td><td>Thuộc tính không nháy bao</td></tr><tr><td>Trong script</td><td class=\"mono\">JSON.stringify</td><td>Chèn chuỗi trực tiếp</td></tr><tr><td>Trong URL</td><td class=\"mono\">encodeURIComponent</td><td>Nối chuỗi vào query</td></tr></tbody></table>"
      },
      {
        title: "Checklist cookie và CSRF",
        html: "<ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\"><li>Cookie phiên: <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite=Lax</code>.</li><li>Mọi biểu mẫu đổi trạng thái có token đồng bộ 32 byte.</li><li>Từ chối yêu cầu thiếu token, không có ngoại lệ.</li><li>So token bằng phép so sánh hằng thời gian.</li><li>Kiểm <code>Origin</code> với danh sách miền, trả 403 nếu lạ.</li><li>Không dùng GET cho thao tác đổi dữ liệu.</li></ul>"
      },
      {
        title: "Danh sách chặn SSRF",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>10.0.0.0/8      172.16.0.0/12\n192.168.0.0/16  127.0.0.0/8\n169.254.0.0/16  100.64.0.0/10\n0.0.0.0/8       ::1/128\nfc00::/7        fe80::/10\n\n# Tat redirect, ghim IP sau khi phan giai\n# Gioi han 2 MB, cho 3 giay, chi nhan anh</code></pre></div><p>Allowlist theo nhãn miền, không dùng so khớp chuỗi con.</p>"
      }
    ]
  });
})();
