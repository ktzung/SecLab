/* SecLab — phần 3: module phòng thủ, header, chuỗi cung ứng, mô hình đe dọa và kiểm thử xâm nhập */
window.SECLAB = window.SECLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };

(function () {
  const D = window.SECLAB;
  D.modules = D.modules || [];
  D.lessons = D.lessons || {};
  D.practice = D.practice || [];
  D.cheatsheets = D.cheatsheets || [];

  D.modules.push({
    id: "phong-thu-va-kiem-thu",
    num: "03",
    title: "Phòng thủ và kiểm thử",
    tone: "yellow",
    blurb: "Bốn bài nối phòng thủ với kiểm chứng: đặt header đúng, giữ chuỗi cung ứng trong tầm kiểm soát, lập mô hình mối đe dọa trước khi viết mã, và kiểm thử xâm nhập có phạm vi rõ. Mỗi bài có sơ đồ, số liệu và checklist áp dụng ngay.",
    lessons: ["header", "dependency", "threat-model", "pentest"]
  });

  D.lessons["header"] = {
    id: "header",
    module: "phong-thu-va-kiem-thu",
    title: "Header bảo mật",
    shortTitle: "Header",
    subtitle: "CSP, HSTS và lớp chặn mặc định",
    blurb: "Header bảo mật là lớp chặn rẻ nhất nhưng hay bị bỏ sót. Bài này đọc phản hồi thật của một trang thanh toán, chỉ ra bốn header còn thiếu, rồi cấu hình CSP, HSTS, nosniff và frame-ancestors theo thứ tự ít rủi ro nhất.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["CSP", "HSTS", "nosniff", "frame-ancestors", "header"],
    metrics: [
      { key: "headers", label: "Header đã đặt", tone: "blue" },
      { key: "missing", label: "Header thiếu", tone: "yellow" },
      { key: "csp", label: "CSP", tone: "mint" },
      { key: "risk", label: "Rủi ro", tone: "coral" }
    ],
    nodes: [
      { id: "browser", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Trình duyệt", sub: "gửi yêu cầu HTTPS" },
      { id: "app", type: "server", x: 340, y: 80, w: 200, h: 70, label: "Máy chủ ứng dụng", sub: "trả trang thanh toán" },
      { id: "csp", type: "shield", x: 625, y: 80, w: 200, h: 70, label: "Content-Security-Policy", sub: "chỉ nguồn tin cậy" },
      { id: "hsts", type: "key", x: 55, y: 310, w: 200, h: 70, label: "Strict-Transport-Security", sub: "buộc HTTPS 1 năm" },
      { id: "xcto", type: "check", x: 340, y: 310, w: 200, h: 70, label: "X-Content-Type-Options", sub: "nosniff cho mọi tệp" },
      { id: "frame", type: "layers", x: 625, y: 310, w: 200, h: 70, label: "frame-ancestors", sub: "chặn nhúng iframe" },
      { id: "hole", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "XSS trên trang", sub: "script chèn chạy" }
    ],
    edges: [
      { id: "browser-app", from: "browser", to: "app", kind: "request", label: "yêu cầu trang" },
      { id: "app-csp", from: "app", to: "csp", kind: "control", label: "gắn CSP" },
      { id: "app-hsts", from: "app", to: "hsts", kind: "control", label: "gắn HSTS" },
      { id: "app-xcto", from: "app", to: "xcto", kind: "control", label: "gắn nosniff" },
      { id: "app-frame", from: "app", to: "frame", kind: "control", label: "chặn nhúng" },
      { id: "csp-hole", from: "csp", to: "hole", kind: "data", label: "thiếu CSP" },
      { id: "hole-browser", from: "hole", to: "browser", kind: "data", label: "script chạy" }
    ],
    learn: [
      "<code>CSP</code> giới hạn nguồn script, style và khung được tải.",
      "<code>HSTS</code> buộc HTTPS một năm, chặn hạ cấp giao thức.",
      "<code>nosniff</code> ngăn trình duyệt tự đoán kiểu tệp tải lên.",
      "<code>frame-ancestors</code> thay X-Frame-Options, chặn clickjacking."
    ],
    steps: [
      {
        short: "Header là gì",
        type: "concept",
        title: "Header là hợp đồng với trình duyệt",
        body: "Header bảo mật là chỉ dẫn máy chủ gửi kèm mỗi phản hồi, trình duyệt đọc rồi tự áp dụng. Chúng không sửa mã nguồn, không thay xác thực, nhưng chặn được cả lớp tấn công phổ biến: chèn script, nhúng trang vào iframe, hạ cấp xuống HTTP, đoán sai kiểu tệp. Một trang thanh toán đặt sau CDN thường có bảy header cần kiểm: <code>Content-Security-Policy</code>, <code>Strict-Transport-Security</code>, <code>X-Content-Type-Options</code>, <code>X-Frame-Options</code>, <code>Referrer-Policy</code>, <code>Permissions-Policy</code> và <code>Cross-Origin-Opener-Policy</code>. Thiếu một cái là mở một đường. Bài này đi từ phản hồi thật đến cấu hình chặt, kiểm bằng <code>curl -I</code>.",
        focus: ["browser", "app", "csp", "hole"],
        edges: ["browser-app", "app-csp", "csp-hole"],
        metrics: { headers: "2/7", missing: "5", csp: "chưa có", risk: "cao" },
        changes: [
          "Danh sách bảy header cần kiểm được ghi vào tài liệu dự án.",
          "Mỗi lần phát hành có bước đọc phản hồi thật thay vì tin cấu hình."
        ],
        note: "Header sai tên hoặc đặt trong thẻ meta đều không có tác dụng."
      },
      {
        short: "CSP",
        type: "flow",
        title: "CSP: danh sách nguồn được phép",
        body: "CSP là danh sách nguồn được phép tải script, style, ảnh, font và khung. Thay vì tin mọi thứ trình duyệt nhận, trang khai báo rõ: script chỉ từ chính tên miền, ảnh từ kho CDN, không có <code>unsafe-inline</code>. Khi kẻ tấn công chèn được thẻ script lạ vào khung nhập mã giảm giá, trình duyệt từ chối chạy vì nguồn không nằm trong danh sách, đồng thời gửi báo cáo về endpoint. Nên chạy chế độ report-only vài ngày để thu báo cáo trước khi bật chặn, vì CSP sai làm hỏng giao diện. Bắt đầu bằng <code>default-src 'self'</code>, thêm dần từng nguồn cần thiết và dùng nonce cho script nội tuyến thay vì mở <code>unsafe-inline</code>.",
        focus: ["app", "csp", "hole"],
        edges: ["app-csp", "csp-hole", "hole-browser"],
        metrics: { headers: "3/7", missing: "4", csp: "report-only", risk: "cao" },
        changes: [
          "Script nội tuyến phải có nonce, không còn chạy tùy ý.",
          "Báo cáo vi phạm được thu về một endpoint trước khi bật chặn."
        ],
        note: "Report-only là bước đệm bắt buộc với trang đang có doanh thu."
      },
      {
        short: "HSTS và nosniff",
        type: "detail",
        title: "HSTS, nosniff và chống nhúng khung",
        body: "Ba header còn lại xử lý ba tình huống khác nhau. <code>Strict-Transport-Security</code> bắt trình duyệt luôn dùng HTTPS với tên miền trong một năm, kể cả khi người dùng gõ http, nên chặn được hạ cấp và đánh cắp cookie phiên. <code>X-Content-Type-Options: nosniff</code> ngăn trình duyệt tự đoán kiểu tệp, tránh việc tệp người dùng tải lên bị hiểu thành HTML. Còn <code>frame-ancestors</code> trong CSP thay cho X-Frame-Options, chỉ định trang nào được nhúng trang này, chặn clickjacking trên nút thanh toán. Cả ba đều là một dòng cấu hình, nhưng sai một chỗ là mất tác dụng: HSTS thiếu <code>includeSubDomains</code>, nosniff chỉ đặt trên trang chủ, frame-ancestors viết trong thẻ meta.",
        focus: ["hsts", "xcto", "frame"],
        edges: ["app-hsts", "app-xcto", "app-frame"],
        metrics: { headers: "5/7", missing: "2", csp: "đã bật", risk: "trung bình" },
        changes: [
          "Tên miền thanh toán và tên miền con đều bị buộc HTTPS.",
          "Tệp tải lên không còn bị trình duyệt hiểu thành trang HTML."
        ],
        note: "HSTS có preload thì khó rút lại; chỉ bật khi chắc mọi tên miền con đã có HTTPS."
      },
      {
        short: "Thiếu hai header",
        type: "pitfall",
        title: "Chỉ một header không đủ",
        body: "Tình huống thật: trang thanh toán chỉ đặt <code>X-Frame-Options</code> và <code>Referrer-Policy</code>, thiếu CSP và HSTS. Một lỗi XSS ở khung nhập mã giảm giá chạy được vì không có CSP, kẻ tấn công đọc token trong bộ nhớ. Người dùng vào trang bằng link http trong email, không có HSTS nên bị hạ cấp và mất cookie. Chỉ một header không đủ vì mỗi header chặn một nhóm tấn công riêng: HSTS không cản script chèn, CSP không cản hạ cấp giao thức, nosniff không cản nhúng iframe. Cần kiểm trên phản hồi thật của đúng tên miền thanh toán, kể cả đường dự phòng, chứ không chỉ tin cấu hình trên giấy.",
        focus: ["hole", "browser", "csp", "hsts"],
        edges: ["csp-hole", "hole-browser", "app-hsts"],
        metrics: { headers: "2/7", missing: "5", csp: "thiếu", risk: "cao" },
        changes: [
          "Lỗ hổng XSS có đường chạy vì CSP chưa được đặt.",
          "Link http trong email hạ cấp được phiên vì thiếu HSTS."
        ],
        note: "Kiểm cả tên miền phụ và endpoint dự phòng; header hay thiếu ở đó nhất."
      },
      {
        short: "Checklist header",
        type: "final",
        title: "Bộ header chốt cho trang thanh toán",
        tone: "final",
        body: "Chốt bộ header tối thiểu: <code>Content-Security-Policy</code> với <code>default-src 'self'</code>, nonce cho script nội tuyến và frame-ancestors chỉ định đúng nguồn được nhúng; <code>Strict-Transport-Security</code> với max-age một năm, includeSubDomains, bật preload sau khi rà đủ tên miền con; <code>X-Content-Type-Options: nosniff</code>; <code>Referrer-Policy: strict-origin-when-cross-origin</code>; <code>Permissions-Policy</code> tắt camera và vị trí nếu không dùng. Triển khai theo thứ tự: report-only, thu báo cáo, bật chặn, rồi kiểm lại bằng <code>curl -I</code> trên từng tên miền. Ghi header vào cấu hình chung để mọi dịch vụ mới thừa hưởng. Thêm một bài kiểm thử trong CI: gọi một trang thật, đọc phản hồi và báo lỗi nếu thiếu header, để lần triển khai sau không âm thầm làm rơi cấu hình.",
        focus: "all",
        edges: "all",
        metrics: { headers: "7/7", missing: "0", csp: "chặn + báo cáo", risk: "thấp" },
        changes: [
          "Mọi phản hồi của tên miền thanh toán có đủ bảy header.",
          "Cấu hình header nằm ở tầng chung, dịch vụ mới không phải nhớ lại."
        ],
        note: "Header chỉ là lớp chặn; vẫn phải sửa lỗi XSS gốc trong mã."
      }
    ]
  };

  D.lessons["dependency"] = {
    id: "dependency",
    module: "phong-thu-va-kiem-thu",
    title: "Phụ thuộc và chuỗi cung ứng",
    shortTitle: "Phụ thuộc",
    subtitle: "Khóa phiên bản, quét lỗ hổng, SBOM",
    blurb: "Một dự án nhỏ kéo theo hàng trăm gói không ai đọc. Bài này đi qua ba việc: khóa phiên bản bằng tệp lock, quét và vá lỗ hổng theo ưu tiên, giữ SBOM để truy vết khi có lỗ hổng mới.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["npm", "lockfile", "SBOM", "CVE", "chuỗi cung ứng"],
    metrics: [
      { key: "packages", label: "Tổng số gói", tone: "blue" },
      { key: "vulnerable", label: "Gói có lỗi", tone: "yellow" },
      { key: "patchedPct", label: "Đã vá", tone: "mint" },
      { key: "open", label: "Còn hở", tone: "coral" }
    ],
    nodes: [
      { id: "dev", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Nhóm phát triển", sub: "thêm gói npm" },
      { id: "lock", type: "file", x: 340, y: 80, w: 200, h: 70, label: "package-lock.json", sub: "khóa đúng phiên bản" },
      { id: "registry", type: "server", x: 625, y: 80, w: 200, h: 70, label: "Kho npm", sub: "gói công khai" },
      { id: "scan", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "Quét lỗ hổng", sub: "npm audit và SCA" },
      { id: "sbom", type: "layers", x: 340, y: 310, w: 200, h: 70, label: "SBOM", sub: "danh mục thành phần" },
      { id: "patch", type: "check", x: 625, y: 310, w: 200, h: 70, label: "Vá 75%", sub: "30 trong 40 gói" },
      { id: "risk", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "10 gói còn hở", sub: "chưa có bản vá" }
    ],
    edges: [
      { id: "dev-lock", from: "dev", to: "lock", kind: "data", label: "khai báo gói" },
      { id: "lock-registry", from: "lock", to: "registry", kind: "request", label: "tải đúng bản" },
      { id: "registry-scan", from: "registry", to: "scan", kind: "data", label: "bản ghi gói" },
      { id: "scan-sbom", from: "scan", to: "sbom", kind: "data", label: "danh mục" },
      { id: "sbom-patch", from: "sbom", to: "patch", kind: "control", label: "ưu tiên vá" },
      { id: "patch-risk", from: "patch", to: "risk", kind: "data", label: "10 gói còn hở" },
      { id: "risk-dev", from: "risk", to: "dev", kind: "response", label: "báo lại nhóm" }
    ],
    learn: [
      "<code>package-lock.json</code> ghim phiên bản và mã băm của từng gói.",
      "<code>npm audit</code> chỉ thấy gói đã công bố lỗ hổng, không thấy gói bị bỏ rơi.",
      "SBOM là danh mục máy đọc được, cần cho truy vết khi có CVE mới.",
      "Khóa phiên bản chưa đủ: vẫn phải quét định kỳ và vá có kế hoạch."
    ],
    steps: [
      {
        short: "Bề mặt tấn công",
        type: "concept",
        title: "Mỗi gói là một bề mặt tấn công",
        body: "Một dự án Node trung bình kéo theo hàng trăm gói, phần lớn là phụ thuộc gián tiếp mà không ai đọc mã. Mỗi gói là một bề mặt tấn công: có thể bị chiếm tài khoản nhà phát hành, bị chèn mã trong bản mới, hoặc mang lỗ hổng đã công bố. Với 120 gói, một lần cài đặt vẫn có thể kéo về hàng nghìn tệp chạy trong tiến trình máy chủ. Vì vậy câu hỏi không phải có nên tin npm hay không, mà là biết mình đang chạy phiên bản nào và vá được trong bao lâu. Hai công cụ tối thiểu là tệp khóa phiên bản và bản kê thành phần phần mềm, cộng thêm lịch quét đều đặn.",
        focus: ["dev", "lock", "risk"],
        edges: ["dev-lock", "patch-risk"],
        metrics: { packages: "120", vulnerable: "40", patchedPct: "0%", open: "40" },
        changes: [
          "Danh sách gói trực tiếp và gián tiếp được đưa vào phạm vi rà soát.",
          "Mỗi bản phát hành phải trả lời được đang chạy phiên bản nào."
        ],
        note: "Gói gián tiếp thường là nơi lỗ hổng nằm lâu nhất."
      },
      {
        short: "Khóa phiên bản",
        type: "flow",
        title: "Tệp khóa và npm ci",
        body: "<code>package-lock.json</code> ghi chính xác phiên bản và mã băm của từng gói, nên máy khác cài lại đúng cây phụ thuộc đó. Không có tệp khóa, dấu mũ trong <code>^1.4.2</code> cho phép npm lấy bản mới nhất trong cùng major, và một bản phát hành lỗi có thể vào thẳng môi trường chạy. Trong dự án 120 gói, chỉ cần một gói gián tiếp đổi phiên bản là hành vi thay đổi. Khóa phiên bản không làm gói cũ an toàn hơn, nhưng biến mọi thay đổi thành hành động có chủ ý, có kiểm tra và có người phê duyệt. Hãy commit tệp khóa và cài bằng <code>npm ci</code> trong CI để bản dựng lặp lại được.",
        focus: ["dev", "lock", "registry"],
        edges: ["dev-lock", "lock-registry", "registry-scan"],
        metrics: { packages: "120", vulnerable: "40", patchedPct: "0%", open: "40" },
        changes: [
          "Ba môi trường cài ra cùng một cây phụ thuộc.",
          "Bản phát hành mới chỉ vào khi có thay đổi tệp khóa được duyệt."
        ],
        note: "Không commit tệp khóa là tự bỏ lớp tái lập quan trọng nhất."
      },
      {
        short: "SBOM",
        type: "detail",
        title: "SBOM trả lời ai đang dùng gói nào",
        body: "SBOM là danh mục máy đọc được ghi mọi thành phần: tên, phiên bản, giấy phép, nguồn và quan hệ phụ thuộc, thường theo chuẩn CycloneDX hoặc SPDX. Khi có CVE mới trong một thư viện nén, câu hỏi đầu tiên là hệ thống nào đang dùng nó; SBOM trả lời trong vài giây thay vì một ngày dò tay. Với 120 gói, SBOM còn chỉ ra gói không còn ai bảo trì và gói trùng chức năng. Hãy sinh SBOM ngay trong CI và lưu theo từng bản phát hành, vì sau này không dựng lại được cây phụ thuộc cũ. SBOM không thay quét lỗ hổng, nó là bản đồ để quét đúng chỗ và đánh giá thiệt hại.",
        focus: ["scan", "sbom", "registry"],
        edges: ["registry-scan", "scan-sbom"],
        metrics: { packages: "120", vulnerable: "40", patchedPct: "0%", open: "40" },
        changes: [
          "Mỗi bản phát hành có SBOM lưu kèm, truy vết được gói gián tiếp.",
          "Gói không còn bảo trì được đánh dấu để thay thế dần."
        ],
        note: "SBOM không có phiên bản chính xác thì gần như vô dụng khi có sự cố."
      },
      {
        short: "Vá nửa vời",
        type: "pitfall",
        title: "Vá 75% vẫn còn 10 gói hở",
        body: "Quét ra 40 gói có lỗ hổng đã biết, nhóm vá 30 gói rồi dừng vì bản mới phá API. Ba tháng sau, 10 gói vẫn hở, trong đó có gói xử lý XML nhận đầu vào từ người dùng. Lỗi thường gặp là chỉ nâng gói trực tiếp, quên gói gián tiếp; chạy <code>npm audit fix --force</code> làm nhảy major và sinh lỗi mới; hoặc để bản vá chờ sprint sau. Cách làm bền hơn: vá theo mức nghiêm trọng và khả năng chạm dữ liệu thật, ghi hạn cho từng mục, chấp nhận rủi ro có văn bản cho gói không thể nâng. Vá 75% không phải thành tích nếu 25% còn lại nằm đúng trên đường tấn công.",
        focus: ["patch", "risk", "dev"],
        edges: ["sbom-patch", "patch-risk", "risk-dev"],
        metrics: { packages: "120", vulnerable: "40", patchedPct: "75%", open: "10" },
        changes: [
          "10 gói còn hở được ghi thành mục có hạn và người phụ trách.",
          "Các lần nâng major được tách khỏi đợt vá khẩn cấp."
        ],
        note: "Mỗi gói chưa vá phải có lý do và ngày rà lại, không để mục treo."
      },
      {
        short: "Quy trình chốt",
        type: "final",
        title: "Chuỗi cung ứng trong tầm kiểm soát",
        tone: "final",
        body: "Chốt quy trình: mọi thay đổi gói đi qua tệp khóa và một lần CI cài bằng <code>npm ci</code>; mỗi bản dựng sinh SBOM và lưu lại; quét lỗ hổng chạy hằng tuần và ngay khi có CVE nghiêm trọng. Với 120 gói và 40 gói có lỗi, đặt mục tiêu vá 75% trong hai tuần, 10 gói còn lại có hạn cụ thể và phương án thay thế. Không dùng <code>npm audit fix --force</code> trên nhánh phát hành. Gói không còn bảo trì hai năm là ứng viên thay thế, kể cả khi chưa có CVE. Ghi lại mọi quyết định chấp nhận rủi ro để kiểm toán đọc được.",
        focus: "all",
        edges: "all",
        metrics: { packages: "120", vulnerable: "40", patchedPct: "75%", open: "10" },
        changes: [
          "Chuỗi cung ứng có lịch quét, SBOM và hạn vá rõ ràng.",
          "10 gói còn hở có chủ sở hữu và ngày đóng hoặc thay thế."
        ],
        note: "SBOM cộng lịch quét biến một sự cố CVE thành việc tra cứu vài phút."
      }
    ]
  };

  D.lessons["threat-model"] = {
    id: "threat-model",
    module: "phong-thu-va-kiem-thu",
    title: "Mô hình mối đe dọa",
    shortTitle: "Mô hình đe dọa",
    subtitle: "STRIDE, luồng dữ liệu, ranh giới tin cậy",
    blurb: "Mô hình mối đe dọa là buổi ngồi lại 90 phút để biết mình bảo vệ gì và ai muốn phá. Sơ đồ luồng dữ liệu, ranh giới tin cậy, sáu nhóm STRIDE và bảng xếp hạng giúp chọn việc làm trước.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["STRIDE", "DFD", "ranh giới", "xếp hạng", "tài sản"],
    metrics: [
      { key: "assets", label: "Tài sản", tone: "blue" },
      { key: "threats", label: "Đe dọa", tone: "yellow" },
      { key: "mitigations", label: "Giảm thiểu", tone: "mint" },
      { key: "score", label: "Điểm rủi ro", tone: "coral" }
    ],
    nodes: [
      { id: "team", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Nhóm thiết kế", sub: "họp 90 phút" },
      { id: "dfd", type: "grid", x: 340, y: 80, w: 200, h: 70, label: "Sơ đồ luồng dữ liệu", sub: "5 tiến trình, 2 kho" },
      { id: "boundary", type: "layers", x: 625, y: 80, w: 200, h: 70, label: "Ranh giới tin cậy", sub: "3 vùng tin cậy" },
      { id: "stride", type: "book", x: 55, y: 310, w: 200, h: 70, label: "STRIDE", sub: "6 nhóm đe dọa" },
      { id: "threat", type: "alert", x: 340, y: 310, w: 200, h: 70, label: "Danh sách đe dọa", sub: "24 mục đã ghi" },
      { id: "rank", type: "star", x: 625, y: 310, w: 200, h: 70, label: "Xếp hạng rủi ro", sub: "khả năng x thiệt hại" },
      { id: "ctrl", type: "shield", x: 340, y: 195, w: 200, h: 70, label: "Biện pháp giảm thiểu", sub: "18 biện pháp" }
    ],
    edges: [
      { id: "team-dfd", from: "team", to: "dfd", kind: "control", label: "vẽ sơ đồ" },
      { id: "dfd-boundary", from: "dfd", to: "boundary", kind: "data", label: "đánh dấu vùng" },
      { id: "boundary-stride", from: "boundary", to: "stride", kind: "control", label: "hỏi 6 nhóm" },
      { id: "stride-threat", from: "stride", to: "threat", kind: "data", label: "sinh đe dọa" },
      { id: "threat-rank", from: "threat", to: "rank", kind: "data", label: "chấm điểm" },
      { id: "rank-ctrl", from: "rank", to: "ctrl", kind: "control", label: "chọn giảm thiểu" },
      { id: "ctrl-dfd", from: "ctrl", to: "dfd", kind: "response", label: "cập nhật sơ đồ" }
    ],
    learn: [
      "Mô hình bắt đầu bằng tài sản, không bắt đầu bằng danh sách lỗi.",
      "Ranh giới tin cậy là nơi dữ liệu đổi mức tin, cũng là nơi dễ hở nhất.",
      "<code>STRIDE</code> chia sáu nhóm để không bỏ sót khi hỏi từng luồng.",
      "Chấm điểm theo khả năng và thiệt hại, ghi lý do để so sánh được."
    ],
    steps: [
      {
        short: "Bốn câu hỏi",
        type: "concept",
        title: "Bốn câu hỏi trước khi vẽ",
        body: "Mô hình mối đe dọa là cuộc họp có cấu trúc để trả lời bốn câu: đang bảo vệ cái gì, ai muốn phá, họ vào bằng đường nào, và chặn bằng cách nào. Với hệ thống đặt hàng, tài sản gồm dữ liệu khách, mã đơn và khóa thanh toán; mỗi tài sản có giá trị khác nhau. Làm mô hình trước khi viết mã rẻ hơn nhiều so với sửa sau khi triển khai, vì thay đổi kiến trúc lúc đó tốn gấp nhiều lần. Kết quả không phải tài liệu dài mà là danh sách ưu tiên: chặn gì trước, chấp nhận gì. Với một hệ thống vừa, 90 phút đủ cho vòng đầu tiên.",
        focus: ["team", "dfd", "threat"],
        edges: ["team-dfd"],
        metrics: { assets: "12", threats: "0", mitigations: "0", score: "chưa chấm" },
        changes: [
          "12 tài sản được liệt kê kèm người chịu trách nhiệm.",
          "Mỗi tài sản có mức thiệt hại ước tính nếu bị lộ hoặc bị sửa."
        ],
        note: "Bỏ bước liệt kê tài sản thì mọi đe dọa sau đó đều ngang giá trị."
      },
      {
        short: "Luồng và ranh giới",
        type: "flow",
        title: "Sơ đồ luồng dữ liệu và ranh giới",
        body: "Vẽ sơ đồ luồng dữ liệu trước, chưa cần đẹp: hình tròn là tiến trình, hình chữ nhật là nơi lưu, mũi tên là luồng, đường đứt là ranh giới tin cậy. Ranh giới xuất hiện ở chỗ dữ liệu đi từ vùng ít tin sang vùng tin hơn: từ trình duyệt vào API, từ API sang cơ sở dữ liệu, từ hệ thống nội bộ sang cổng thanh toán. Mọi mũi tên cắt qua ranh giới đều cần kiểm tra đầu vào, xác thực và ghi log. Với 12 tài sản và 5 tiến trình, sơ đồ thường có 3 ranh giới, và đó là nơi tập trung phần lớn lỗ hổng thật. Hãy vẽ theo dữ liệu chảy, không vẽ theo sơ đồ tổ chức.",
        focus: ["dfd", "boundary", "team"],
        edges: ["team-dfd", "dfd-boundary", "ctrl-dfd"],
        metrics: { assets: "12", threats: "0", mitigations: "0", score: "chưa chấm" },
        changes: [
          "Sơ đồ có 5 tiến trình, 2 kho dữ liệu và 3 ranh giới tin cậy.",
          "Mỗi mũi tên cắt ranh giới được đánh dấu để rà kiểm tra đầu vào."
        ],
        note: "Ranh giới vẽ sai thì đe dọa đặt sai chỗ, cả buổi họp mất giá trị."
      },
      {
        short: "Sáu nhóm STRIDE",
        type: "detail",
        title: "Hỏi sáu nhóm cho từng luồng",
        body: "<code>STRIDE</code> chia đe dọa thành sáu nhóm để không bỏ sót: giả mạo danh tính, sửa dữ liệu, chối bỏ hành vi, lộ thông tin, từ chối dịch vụ và leo thang đặc quyền. Với mỗi luồng trên sơ đồ, đặt sáu câu hỏi tương ứng; cách này nhanh hơn hỏi chung chung ai sẽ tấn công. Ví dụ luồng từ trình duyệt vào API đơn hàng: đã xác thực chưa, đã kiểm tra quyền chưa, dữ liệu có bị ghi log lộ không. Với hệ thống đặt hàng, cách làm này cho 24 mục đe dọa, trong đó 18 mục có biện pháp cụ thể và 6 mục chấp nhận rủi ro. STRIDE không cho điểm số; bước tiếp theo mới là xếp hạng.",
        focus: ["boundary", "stride", "threat"],
        edges: ["boundary-stride", "stride-threat"],
        metrics: { assets: "12", threats: "24", mitigations: "0", score: "chưa chấm" },
        changes: [
          "24 mục đe dọa được ghi kèm luồng và nhóm STRIDE tương ứng.",
          "6 mục không có biện pháp được đánh dấu để chấp nhận rủi ro."
        ],
        note: "Hỏi đủ sáu nhóm là cách rẻ nhất để không bỏ nhóm chối bỏ hành vi."
      },
      {
        short: "Xếp hạng",
        type: "pitfall",
        title: "Đừng chấm điểm theo cảm tính",
        body: "Lỗi thường gặp là chấm điểm theo cảm giác của người nói to nhất. Một lỗi hiếm nhưng lộ toàn bộ dữ liệu khách lại bị xếp dưới lỗi giao diện vì nhìn thấy rõ. Hãy chấm theo hai trục: khả năng xảy ra và mức thiệt hại, rồi nhân lại, ghi lý do cho từng điểm để lần sau so sánh được. Với 24 mục đe dọa, nhóm thường thấy 3 mục điểm cao, 9 mục trung bình và 12 mục thấp. Đừng quên đe dọa nằm ngay trên ranh giới tin cậy, vì đó là nơi điểm hay bị đánh giá thấp. Rà lại mô hình mỗi khi thêm dịch vụ hoặc đổi luồng thanh toán.",
        focus: ["threat", "rank", "ctrl"],
        edges: ["threat-rank", "rank-ctrl"],
        metrics: { assets: "12", threats: "24", mitigations: "18", score: "3,4" },
        changes: [
          "Mỗi đe dọa có điểm khả năng, điểm thiệt hại và lý do chấm.",
          "Ba mục điểm cao nhất được đưa vào sprint gần nhất."
        ],
        note: "Điểm số thiếu lý do sẽ bị tranh cãi lại từ đầu ở buổi sau."
      },
      {
        short: "Chốt và rà lại",
        type: "final",
        title: "Mô hình sống, không phải tài liệu chết",
        tone: "final",
        body: "Chốt cách làm: mỗi quý một buổi 90 phút, giữ danh sách 12 tài sản, vẽ lại sơ đồ nếu có dịch vụ mới, hỏi đủ sáu nhóm <code>STRIDE</code> cho từng luồng cắt ranh giới. Ghi 24 đe dọa vào một bảng chung, chấm điểm theo khả năng nhân thiệt hại, và gắn 18 biện pháp với người và hạn. Mục tiêu là hạ điểm rủi ro trung bình từ 3,4 xuống dưới 2 trong hai quý. Đưa bảng này vào tài liệu kiến trúc để người mới đọc được. Khi có sự cố thật, cập nhật mô hình ngay trong tuần đó thay vì chờ buổi họp quý sau.",
        focus: "all",
        edges: "all",
        metrics: { assets: "12", threats: "24", mitigations: "18", score: "1,6" },
        changes: [
          "Mô hình có lịch rà soát và nằm chung với tài liệu kiến trúc.",
          "Điểm rủi ro trung bình giảm từ 3,4 xuống 1,6 sau hai quý."
        ],
        note: "Mô hình không cập nhật sau sự cố là mô hình đã lỗi thời."
      }
    ]
  };

  D.lessons["pentest"] = {
    id: "pentest",
    module: "phong-thu-va-kiem-thu",
    title: "Kiểm thử xâm nhập",
    shortTitle: "Kiểm thử xâm nhập",
    subtitle: "Phạm vi, giao ước, báo cáo và kiểm lại",
    blurb: "Kiểm thử xâm nhập chỉ có giá trị khi có phạm vi, giao ước và bước kiểm lại. Đợt 14 phát hiện, 3 lỗi nghiêm trọng, cách viết báo cáo và vì sao đóng mục phải chứng minh bằng kịch bản cũ.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["pentest", "phạm vi", "báo cáo", "vá lỗi", "kiểm lại"],
    metrics: [
      { key: "findings", label: "Phát hiện", tone: "blue" },
      { key: "critical", label: "Nghiêm trọng", tone: "coral" },
      { key: "fixedPct", label: "Đã vá", tone: "mint" },
      { key: "open", label: "Còn mở", tone: "yellow" }
    ],
    nodes: [
      { id: "client", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Khách hàng", sub: "ký phạm vi" },
      { id: "scope", type: "file", x: 340, y: 80, w: 200, h: 70, label: "Phạm vi kiểm thử", sub: "8 tên miền" },
      { id: "rules", type: "book", x: 625, y: 80, w: 200, h: 70, label: "Quy tắc giao ước", sub: "khung giờ, giới hạn" },
      { id: "tester", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "Đội kiểm thử", sub: "thử có kiểm soát" },
      { id: "report", type: "page", x: 340, y: 310, w: 200, h: 70, label: "Báo cáo lỗ hổng", sub: "xếp mức nghiêm trọng" },
      { id: "fix", type: "check", x: 625, y: 310, w: 200, h: 70, label: "Vá và kiểm lại", sub: "xác nhận đã đóng" },
      { id: "open", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "3 lỗi còn mở", sub: "hạn 14 ngày" }
    ],
    edges: [
      { id: "client-scope", from: "client", to: "scope", kind: "control", label: "chốt phạm vi" },
      { id: "scope-rules", from: "scope", to: "rules", kind: "control", label: "gắn giới hạn" },
      { id: "rules-tester", from: "rules", to: "tester", kind: "control", label: "giao ước" },
      { id: "tester-report", from: "tester", to: "report", kind: "data", label: "phát hiện" },
      { id: "report-fix", from: "report", to: "fix", kind: "control", label: "vé sửa", bow: 22 },
      { id: "fix-report", from: "fix", to: "report", kind: "response", label: "xác nhận đóng", bow: -22 },
      { id: "fix-open", from: "fix", to: "open", kind: "data", label: "3 lỗi chưa vá" }
    ],
    learn: [
      "Không có phạm vi và giao ước thì đợt kiểm thử thành rủi ro pháp lý.",
      "Báo cáo phải có bước tái hiện, bằng chứng và mức nghiêm trọng.",
      "Vá giao diện mà quên API là kiểu vá thiếu phổ biến nhất.",
      "Chỉ đóng mục khi kịch bản tấn công cũ chạy lại và thất bại."
    ],
    steps: [
      {
        short: "Kiểm thử là gì",
        type: "concept",
        title: "Tấn công có ủy quyền",
        body: "Kiểm thử xâm nhập là việc đội được ủy quyền tấn công hệ thống trong giới hạn đã thỏa thuận, nhằm tìm lỗ hổng trước khi kẻ xấu làm. Khác với quét tự động, người thật ghép được nhiều lỗi nhỏ thành chuỗi khai thác: một endpoint quên kiểm quyền cộng một token sống quá lâu thành chiếm tài khoản. Giá trị nằm ở bằng chứng và thứ tự ưu tiên, không phải danh sách dài. Một đợt kiểm thử tốt cho ra báo cáo có bước tái hiện, mức nghiêm trọng và khuyến nghị cụ thể. Không có phạm vi và quy tắc rõ thì đợt kiểm thử có thể làm sập dịch vụ thật hoặc vi phạm pháp lý.",
        focus: ["client", "tester", "report"],
        edges: ["client-scope", "tester-report"],
        metrics: { findings: "0", critical: "0", fixedPct: "0%", open: "0" },
        changes: [
          "Mục tiêu đợt kiểm thử được viết thành câu đo được, không phải chung chung.",
          "Quét tự động được xếp là bước đầu, không thay thế người kiểm thử."
        ],
        note: "Ủy quyền miệng không có giá trị khi sự cố xảy ra."
      },
      {
        short: "Phạm vi",
        type: "flow",
        title: "Phạm vi và quy tắc giao ước",
        body: "Trước khi chạm hệ thống, hai bên ký văn bản ghi rõ phạm vi: 8 tên miền, dải IP, tài khoản thử và thời gian được phép. Quy tắc giao ước nêu điều được và không được làm: không tấn công từ chối dịch vụ, không chạm dữ liệu khách thật, không dùng kỹ thuật xã hội với nhân viên, dừng ngay khi phát hiện dữ liệu nhạy cảm. Cần kênh liên lạc trực tiếp và người trực hai bên. Nếu tìm thấy lỗi nghiêm trọng, dừng khai thác sâu và báo ngay. Văn bản này bảo vệ cả hai: đội kiểm thử khỏi bị coi là tấn công, doanh nghiệp khỏi sự cố ngoài ý muốn.",
        focus: ["client", "scope", "rules", "tester"],
        edges: ["client-scope", "scope-rules", "rules-tester"],
        metrics: { findings: "0", critical: "0", fixedPct: "0%", open: "0" },
        changes: [
          "8 tên miền và khung giờ được ghi trong phụ lục ký kết.",
          "Có số trực và quy trình dừng khẩn cấp khi chạm dữ liệu thật."
        ],
        note: "Phạm vi càng hẹp và rõ thì báo cáo càng dễ được chấp nhận."
      },
      {
        short: "Báo cáo",
        type: "detail",
        title: "Báo cáo viết cho hai người đọc",
        body: "Báo cáo tốt viết cho hai người đọc: kỹ sư cần tái hiện, lãnh đạo cần quyết định. Mỗi mục có tiêu đề, mức nghiêm trọng, mô tả, các bước tái hiện, bằng chứng và khuyến nghị. Với 14 phát hiện, trong đó 3 mức nghiêm trọng, hãy xếp theo tác động thật chứ không theo thứ tự tìm ra. Kèm ảnh chụp, đoạn yêu cầu và log đã che dữ liệu. Ghi rõ lỗi nào ghép được thành chuỗi, vì vá riêng lẻ có thể vẫn hở. Đừng đưa điểm <code>CVSS</code> mà không giải thích bối cảnh. Báo cáo nên có cả phần đã kiểm tra mà không thấy lỗi.",
        focus: ["tester", "report", "scope"],
        edges: ["tester-report", "scope-rules"],
        metrics: { findings: "14", critical: "3", fixedPct: "0%", open: "14" },
        changes: [
          "14 phát hiện được xếp theo tác động, 3 mục nghiêm trọng đứng đầu.",
          "Mỗi mục có bước tái hiện và bằng chứng đã che dữ liệu khách."
        ],
        note: "Báo cáo không tái hiện được là báo cáo không sửa được."
      },
      {
        short: "Vá và kiểm lại",
        type: "pitfall",
        title: "Vá 57% mà lỗi nặng vẫn mở",
        body: "Đội vá 8 trong 14 lỗi trong hai tuần, nhìn con số 57% là thấy ổn. Nhưng ba lỗi nghiêm trọng vẫn mở vì liên quan kiến trúc, và hai lỗi đánh dấu đã vá lại tái hiện do bản vá chỉ chặn ở giao diện, không chặn ở API. Lỗi thứ ba: không ai kiểm lại sau khi triển khai, nên báo cáo đóng mà lỗ hổng còn. Cách làm đúng là mỗi bản vá có bước chạy lại đúng kịch bản trong báo cáo, trên môi trường giống thật, và ghi bằng chứng. Vá giao diện mà quên API là kiểu thiếu rất phổ biến. Chỉ đóng mục khi kịch bản cũ thất bại.",
        focus: ["fix", "open", "report"],
        edges: ["report-fix", "fix-report", "fix-open"],
        metrics: { findings: "14", critical: "3", fixedPct: "57%", open: "6" },
        changes: [
          "Hai bản vá giao diện bị mở lại vì API vẫn nhận yêu cầu cũ.",
          "Mỗi mục đóng có ảnh chụp lần chạy lại kịch bản tấn công."
        ],
        note: "Kiểm lại bằng đúng kịch bản cũ, không bằng một kịch bản dễ hơn."
      },
      {
        short: "Quy trình chốt",
        type: "final",
        title: "Đóng đợt kiểm thử đúng cách",
        tone: "final",
        body: "Chốt quy trình: ký phạm vi 8 tên miền và quy tắc giao ước trước ngày đầu; kiểm thử trong khung giờ đã hẹn; báo cáo 14 phát hiện với 3 mục nghiêm trọng lên đầu, kèm bước tái hiện và bằng chứng. Vá theo thứ tự nghiêm trọng trước, mỗi bản vá có vé riêng và người chịu trách nhiệm. Kiểm lại bằng đúng kịch bản cũ trên môi trường giống thật, ghi ảnh chụp vào vé. Mục tiêu: 100% mục nghiêm trọng đóng trong 14 ngày, toàn bộ 14 mục đóng trong 60 ngày. Mục không vá được thì ghi rủi ro chấp nhận có chữ ký.",
        focus: "all",
        edges: "all",
        metrics: { findings: "14", critical: "3", fixedPct: "100%", open: "0" },
        changes: [
          "Toàn bộ 14 phát hiện được đóng kèm bằng chứng kiểm lại.",
          "Quy trình kiểm thử và vá trở thành mẫu dùng lại cho đợt sau."
        ],
        note: "Đợt kiểm thử chỉ kết thúc khi báo cáo được đóng bằng bằng chứng."
      }
    ]
  };

  D.practice.push({
    id: "practice-dependency",
    module: "phong-thu-va-kiem-thu",
    tag: "DEPENDENCY",
    tags: ["DEPENDENCY", "npm", "SBOM"],
    title: "120 gói npm, còn 10 gói hở",
    scenario: "Một cửa hàng trực tuyến dùng 120 gói npm, trong đó 40 gói có lỗ hổng đã biết. Đợt đầu nhóm kỹ thuật vá được 75%, tức 30 gói, còn 10 gói chưa nâng được vì là phụ thuộc gián tiếp hoặc bản mới phá API. Sếp hỏi vì sao không bỏ npm cho nhanh. Repo chưa có tệp khóa, mỗi máy cài ra một cây phụ thuộc khác nhau, và không ai biết bản phát hành tháng trước chứa gói nào. Bạn được giao quy trình cho ba tháng tới, vẫn dùng npm, đội chỉ có hai người.",
    metrics: [
      { label: "Tổng số gói", value: "120" },
      { label: "Gói có lỗi", value: "40", danger: true },
      { label: "Còn hở sau vá", value: "10", danger: true }
    ],
    options: [
      "Bỏ npm, chuyển sang chép thư viện trực tiếp vào repo",
      "Commit tệp khóa, cài bằng npm ci, quét hằng tuần và sinh SBOM mỗi bản dựng",
      "Chạy npm audit fix --force để nâng hết lên bản mới nhất",
      "Chỉ nâng các gói trực tiếp và bỏ qua gói gián tiếp",
    ],
    correct: 1,
    explain: "Bỏ npm không xóa được mã bên thứ ba, chỉ làm mất công cụ quản lý và kiểm toán. Chạy <code>npm audit fix --force</code> đẩy nhiều gói nhảy major, sinh lỗi mới và khó lăn về. Chỉ nâng gói trực tiếp là bỏ qua đúng nơi lỗ hổng hay nằm, vì phần lớn gói có lỗi là phụ thuộc gián tiếp. Tệp khóa ghim phiên bản và mã băm nên ba môi trường cài giống nhau, <code>npm ci</code> buộc bản dựng lặp lại được. Quét hằng tuần bắt CVE mới, SBOM trả lời ngay bản phát hành nào chứa gói bị lỗi. 10 gói còn hở cần hạn đóng và phương án thay thế."
  });

  D.practice.push({
    id: "practice-header",
    module: "phong-thu-va-kiem-thu",
    tag: "HEADER",
    tags: ["HEADER", "CSP", "HSTS"],
    title: "Trang thanh toán thiếu CSP và HSTS",
    scenario: "Trang thanh toán của một trường đại học chỉ gửi X-Frame-Options và Referrer-Policy. Kiểm tra phản hồi thật cho thấy thiếu CSP và HSTS. Tuần trước có báo cáo khung nhập mã giảm giá cho phép chèn script, và một số sinh viên vào trang bằng link http trong email. Đối tác thanh toán yêu cầu mọi tên miền có đủ header trước kỳ kiểm tra tháng sau. Nhóm phát triển muốn thêm một header nữa là xong, ngân sách chỉ có một buổi chiều, và không được làm hỏng luồng thanh toán đang chạy. Bạn chọn cách nào cho buổi chiều đó?",
    metrics: [
      { label: "Header đang có", value: "2/7", danger: true },
      { label: "Thiếu", value: "CSP, HSTS", danger: true },
      { label: "Thời gian", value: "1 buổi" }
    ],
    options: [
      "Chỉ thêm HSTS vì HTTPS là yêu cầu bắt buộc của cổng thanh toán",
      "Chỉ thêm CSP ở chế độ chặn với default-src self",
      "Bật CSP report-only, thêm HSTS max-age một năm, rồi thu báo cáo và bật chặn",
      "Thêm X-XSS-Protection và bỏ qua hai header còn lại"
    ],
    correct: 2,
    explain: "HSTS một mình không cản script chèn, còn CSP một mình không cản hạ cấp giao thức, nên hai phương án đầu đều để hở một đường. <code>X-XSS-Protection</code> đã bị các trình duyệt bỏ và có thể gây lỗi, không thay được CSP. Cách đúng là chạy CSP ở chế độ report-only để thu vi phạm mà không làm hỏng luồng thanh toán, đồng thời bật <code>Strict-Transport-Security</code> với max-age một năm để chặn link http trong email. Sau vài ngày đọc báo cáo, siết CSP sang chế độ chặn, thêm nosniff và frame-ancestors, rồi kiểm lại bằng curl trên đúng tên miền thanh toán."
  });

  D.cheatsheets.push({
    id: "defense",
    num: "03",
    module: "phong-thu-va-kiem-thu",
    title: "Bảng tra phòng thủ",
    intro: "Bảng tra dùng khi triển khai và khi rà soát: bộ header bảo mật kèm giá trị khuyến nghị, checklist chuỗi cung ứng, sáu nhóm STRIDE, mẫu báo cáo kiểm thử xâm nhập và quy trình vá có kiểm lại.",
    cards: [
      {
        title: "Header bảo mật và giá trị khuyến nghị",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Header</th><th>Giá trị khuyến nghị</th><th>Chặn</th></tr></thead><tbody><tr><td class=\"mono\">Content-Security-Policy</td><td>default-src 'self'; frame-ancestors 'self'</td><td>Chèn script, nhúng khung</td></tr><tr><td class=\"mono\">Strict-Transport-Security</td><td>max-age=31536000; includeSubDomains</td><td>Hạ cấp HTTP</td></tr><tr><td class=\"mono\">X-Content-Type-Options</td><td>nosniff</td><td>Đoán kiểu tệp</td></tr><tr><td class=\"mono\">Referrer-Policy</td><td>strict-origin-when-cross-origin</td><td>Lộ URL nội bộ</td></tr><tr><td class=\"mono\">Permissions-Policy</td><td>camera=(), geolocation=()</td><td>Lạm dụng quyền</td></tr></tbody></table>"
      },
      {
        title: "Checklist chuỗi cung ứng",
        html: "<ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\"><li>Commit tệp khóa, cài bằng <code>npm ci</code> trong CI.</li><li>Quét lỗ hổng hằng tuần và ngay khi có CVE nghiêm trọng.</li><li>Sinh SBOM mỗi bản dựng, lưu theo số phiên bản.</li><li>Vá theo mức nghiêm trọng và khả năng chạm dữ liệu thật.</li><li>Gói bỏ bảo trì hai năm là ứng viên thay thế.</li><li>Chấp nhận rủi ro phải có văn bản và ngày rà lại.</li></ul>"
      },
      {
        title: "Sáu nhóm STRIDE",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Nhóm</th><th>Câu hỏi cho từng luồng</th><th>Ví dụ</th></tr></thead><tbody><tr><td>Giả mạo</td><td>Ai chứng minh được danh tính?</td><td>Token dùng lại</td></tr><tr><td>Sửa dữ liệu</td><td>Có kiểm toàn vẹn không?</td><td>Sửa giá đơn hàng</td></tr><tr><td>Chối bỏ</td><td>Có log đủ để đối chiếu?</td><td>Xóa log sau khi lạm dụng</td></tr><tr><td>Lộ thông tin</td><td>Dữ liệu nào trả về thừa?</td><td>API trả cả bảng khách</td></tr><tr><td>Từ chối dịch vụ</td><td>Chỗ nào tốn tài nguyên?</td><td>Tìm kiếm không giới hạn</td></tr><tr><td>Leo thang</td><td>Quyền kiểm ở đâu?</td><td>Đổi role trong body</td></tr></tbody></table>"
      },
      {
        title: "Mẫu báo cáo pentest",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>## Tóm tắt\n14 phát hiện, 3 nghiêm trọng, 0 đã vá\n\n## Mục 1: chiếm tài khoản qua API\nMức: nghiêm trọng     CVSS: 9.1\nLuồng: trình duyệt -&gt; API đơn hàng\nTái hiện: 3 bước + request mẫu\nBằng chứng: ảnh chụp, log đã che\nKhuyến nghị: kiểm quyền ở API\nHạn: 14 ngày, người phụ trách: A\n\n## Phụ lục: đã kiểm tra, không thấy lỗi</code></pre></div>"
      },
      {
        title: "Vá và kiểm lại",
        html: "<table class=\"cheat-table\"><thead><tr><th>Bước</th><th>Việc làm</th><th>Bằng chứng</th></tr></thead><tbody><tr><td>1</td><td>Xếp mức nghiêm trọng trước</td><td>Bảng ưu tiên</td></tr><tr><td>2</td><td>Vá ở tầng API, không chỉ giao diện</td><td>Vé sửa</td></tr><tr><td>3</td><td>Chạy lại đúng kịch bản cũ</td><td>Ảnh chụp</td></tr><tr><td>4</td><td>Quét lại toàn bộ miền</td><td>Báo cáo quét</td></tr><tr><td>5</td><td>Đóng mục hoặc ghi rủi ro chấp nhận</td><td>Chữ ký</td></tr></tbody></table>"
      }
    ]
  });
})();
