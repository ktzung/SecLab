/* SecLab — dữ liệu bài học: bề mặt ứng dụng, tình huống và bảng tra */
window.SECLAB = window.SECLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };
(function () {
  const T = window.SECLAB;

  T.modules.push({
    id: "be-mat-ung-dung",
    num: "01",
    title: "Bề mặt ứng dụng",
    tone: "blue",
    blurb: "Bốn bài khép kín quanh bề mặt ứng dụng: xác thực bằng băm chậm và lớp thứ hai, phân quyền theo vai trò với đặc quyền tối thiểu, kiểm soát đầu vào bằng allowlist, và quản lý bí mật trong vault xoay vòng. Mỗi bài có sơ đồ, số liệu và checklist áp dụng ngay.",
    lessons: ["xac-thuc", "phan-quyen", "dau-vao", "bi-mat"]
  });

  T.lessons["xac-thuc"] = {
    id: "xac-thuc",
    module: "be-mat-ung-dung",
    title: "Xác thực người dùng",
    shortTitle: "Xác thực",
    subtitle: "Băm mật khẩu, MFA và vòng đời phiên",
    blurb: "Xác thực là cửa vào của mọi ứng dụng. Bài này đi từ băm mật khẩu bằng bcrypt hay Argon2id, thêm lớp thứ hai bằng TOTP, quản lý phiên ngắn hạn, đến khóa tạm sau nhiều lần sai mà không khóa nhầm người khác.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["bcrypt", "Argon2id", "MFA", "phiên", "khóa tài khoản"],
    metrics: [
      { key: "hashMs", label: "Thời gian băm", tone: "blue" },
      { key: "mfaPct", label: "Tỉ lệ bật MFA", tone: "mint" },
      { key: "sessionMin", label: "Phiên (phút)", tone: "yellow" },
      { key: "lockAfter", label: "Khóa sau", tone: "coral" }
    ],
    nodes: [
      { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Người dùng", sub: "nhập email, mật khẩu" },
      { id: "auth", type: "server", x: 340, y: 80, w: 200, h: 70, label: "Máy chủ xác thực", sub: "kiểm hash bcrypt" },
      { id: "hash", type: "key", x: 625, y: 80, w: 200, h: 70, label: "Hàm băm chậm", sub: "cost 12, salt 16 byte" },
      { id: "db", type: "disk", x: 340, y: 195, w: 200, h: 70, label: "Cơ sở dữ liệu", sub: "bảng tài khoản" },
      { id: "mfa", type: "shield", x: 55, y: 310, w: 200, h: 70, label: "Lớp xác thực thứ hai", sub: "TOTP đổi mỗi 30 giây" },
      { id: "session", type: "clock", x: 340, y: 310, w: 200, h: 70, label: "Phiên đăng nhập", sub: "cookie 30 phút" },
      { id: "lock", type: "alert", x: 625, y: 310, w: 200, h: 70, label: "Khóa tạm thời", sub: "sai 5 lần, khóa 15 phút" }
    ],
    edges: [
      { id: "user-auth", from: "user", to: "auth", kind: "request", label: "mật khẩu" },
      { id: "auth-hash", from: "auth", to: "hash", kind: "control", label: "băm lại" },
      { id: "hash-db", from: "hash", to: "db", kind: "data", label: "so khớp hash" },
      { id: "auth-mfa", from: "auth", to: "mfa", kind: "control", label: "yêu cầu TOTP" },
      { id: "mfa-session", from: "mfa", to: "session", kind: "control", label: "cấp phiên" },
      { id: "auth-lock", from: "auth", to: "lock", kind: "control", label: "đếm lần sai" },
      { id: "session-db", from: "session", to: "db", kind: "data", label: "lưu mã phiên" }
    ],
    learn: [
      "Lưu mật khẩu bằng <code>bcrypt</code> cost 12 hoặc Argon2id 64 MiB, không dùng MD5.",
      "Salt 16 byte sinh riêng cho từng tài khoản và lưu công khai cạnh hash.",
      "MFA bằng <code>TOTP</code> chặn kẻ đã có mật khẩu nhưng chưa có thiết bị.",
      "Phiên ngắn hạn, thu hồi được phía máy chủ và khóa tạm sau 5 lần sai."
    ],
    steps: [
      {
        short: "Băm mật khẩu",
        type: "concept",
        title: "Mật khẩu chỉ nên tồn tại dưới dạng băm",
        body: "Mật khẩu chỉ nên tồn tại dưới dạng băm chậm, có salt riêng cho từng tài khoản. <code>bcrypt</code> với cost 12 tốn khoảng 250 ms mỗi lần tính trên một lõi CPU, nên bảng 10 triệu mật khẩu phổ biến mất nhiều ngày thay vì vài giờ. Khi đăng nhập, máy chủ nhận mật khẩu, băm lại với salt đã lưu, rồi so sánh bằng phép so sánh hằng thời gian. Lớp học có 12.000 học viên và khoảng 3.000 lượt đăng nhập mỗi ngày, nên tham số phải đo trên máy chủ thật. Băm dưới 100 ms là quá rẻ, còn trên 300 ms thì người dùng bắt đầu thấy chậm khi mạng yếu.",
        focus: ["user", "auth", "hash", "db"],
        edges: ["user-auth", "auth-hash", "hash-db"],
        metrics: { hashMs: "250 ms", mfaPct: "0%", sessionMin: "120", lockAfter: "không" },
        changes: [
          "Bảng tài khoản chỉ còn hash kèm salt, không còn mật khẩu gốc.",
          "Thời gian đăng nhập được đo trên máy chủ thật trước khi chốt cost."
        ],
        note: "Hàm băm nhanh như MD5 biến bản sao lưu bị lộ thành danh sách mật khẩu."
      },
      {
        short: "Lớp thứ hai",
        type: "flow",
        title: "Thêm lớp thứ hai bằng TOTP",
        body: "Chỉ mật khẩu là chưa đủ khi người dùng dùng lại mật khẩu ở nơi khác. Lớp thứ hai nên là mã một lần dựa trên thời gian, ví dụ <code>TOTP</code> sáu chữ số đổi mỗi 30 giây, hoặc khóa an toàn theo WebAuthn. Ban đầu chỉ 35% tài khoản bật MFA, thường là nhóm quản trị; sau khi bắt buộc với toàn bộ tài khoản nội bộ, tỉ lệ lên 100%. Mã dự phòng phải sinh một lần, lưu dưới dạng băm và chỉ hiện khi người dùng xác nhận. Đừng gửi mã qua SMS nếu còn lựa chọn khác, vì SIM có thể bị chiếm. MFA không thay băm mật khẩu, nó chỉ chặn kẻ đã biết mật khẩu.",
        focus: ["auth", "mfa", "session"],
        edges: ["auth-mfa", "mfa-session"],
        metrics: { hashMs: "250 ms", mfaPct: "35%", sessionMin: "120", lockAfter: "không" },
        changes: [
          "Mọi tài khoản quản trị phải nhập thêm mã TOTP khi đăng nhập.",
          "Mã dự phòng được lưu dạng băm, không hiển thị lại lần hai."
        ],
        note: "MFA làm giảm giá trị của một mật khẩu bị lộ, nhưng không sửa được mật khẩu yếu."
      },
      {
        short: "Vòng đời phiên",
        type: "detail",
        title: "Phiên ngắn hạn và thu hồi được",
        body: "Sau khi xác thực, máy chủ cấp phiên chứ không tin điều trình duyệt tự khai. Cookie phiên phải có <code>HttpOnly</code>, <code>Secure</code> và <code>SameSite=Lax</code>; giá trị là chuỗi ngẫu nhiên 128 bit, lưu trong cơ sở dữ liệu kèm thời điểm hết hạn. Thời gian sống nên ngắn, khoảng 30 phút, và được làm mới khi có thao tác thật. Đăng xuất phải xóa bản ghi phía máy chủ, không chỉ xóa cookie. Khi người dùng đổi mật khẩu hoặc bật MFA, hãy thu hồi toàn bộ phiên cũ. Đừng nhét vai trò vào cookie đã ký nhưng không mã hóa, vì người dùng đọc được nội dung và có thể sửa nếu chữ ký bị kiểm sai.",
        focus: ["session", "db", "mfa"],
        edges: ["mfa-session", "session-db"],
        metrics: { hashMs: "250 ms", mfaPct: "100%", sessionMin: "30", lockAfter: "không" },
        changes: [
          "Phiên rút từ 120 phút xuống 30 phút, có làm mới khi thao tác.",
          "Cookie mang cờ HttpOnly, Secure, SameSite và không chứa vai trò."
        ],
        note: "Phiên là vé vào cửa; vé phải ngắn hạn và thu hồi được từ phía máy chủ."
      },
      {
        short: "Khóa và dò tài khoản",
        type: "pitfall",
        title: "Khóa sai cách tạo lỗ hổng mới",
        body: "Ba lỗi hay gặp. Thứ nhất, đếm sai theo tài khoản mà không theo IP, nên kẻ tấn công thử một mật khẩu cho 5.000 tài khoản. Thứ hai, thông báo lỗi phân biệt email không tồn tại với mật khẩu sai, giúp dò danh sách tài khoản. Thứ ba, khóa vĩnh viễn sau vài lần sai, biến chức năng bảo vệ thành công cụ khóa người khác. Cách làm hợp lý: khóa tạm 15 phút sau 5 lần sai, kèm thời gian chờ tăng dần; luôn trả cùng một câu lỗi; ghi log theo IP và thiết bị. Với tài khoản quản trị, dùng <code>rate limit</code> chặt hơn và cảnh báo khi có chuỗi thất bại bất thường.",
        focus: ["auth", "lock", "user"],
        edges: ["auth-lock", "user-auth"],
        metrics: { hashMs: "250 ms", mfaPct: "100%", sessionMin: "30", lockAfter: "5 lần" },
        changes: [
          "Câu lỗi đăng nhập giống nhau cho mọi trường hợp, không lộ tài khoản tồn tại.",
          "Khóa tạm 15 phút thay cho khóa vĩnh viễn, có đếm thêm theo IP."
        ],
        note: "Khóa vĩnh viễn là món quà cho kẻ muốn làm hỏng dịch vụ của người khác."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Checklist xác thực",
        tone: "final",
        body: "Chốt lại bằng checklist áp dụng được ngay. Một: băm bằng <code>bcrypt</code> cost 12 hoặc Argon2id 64 MiB, salt 16 byte cho từng tài khoản, đo lại tham số trên máy chủ thật. Hai: bắt buộc MFA với toàn bộ tài khoản nội bộ và quản trị, phát hành mã dự phòng một lần. Ba: phiên 30 phút, cookie HttpOnly, Secure, SameSite, lưu phía máy chủ và thu hồi khi đổi mật khẩu. Bốn: khóa tạm 15 phút sau 5 lần sai, đếm cả theo IP, trả cùng một câu lỗi. Năm: ghi log đăng nhập thành công và thất bại, cảnh báo khi có chuỗi bất thường. Sáu: kiểm thử bằng bộ mật khẩu yếu trước mỗi lần phát hành.",
        focus: "all",
        edges: "all",
        metrics: { hashMs: "250 ms", mfaPct: "100%", sessionMin: "30", lockAfter: "5 lần/15 phút" },
        changes: [
          "Chính sách xác thực gói trong một tài liệu, áp cho cả tài khoản dịch vụ.",
          "Có kiểm thử tự động cho đăng nhập sai, khóa tạm và thu hồi phiên."
        ],
        note: "Mật khẩu vẫn là mắt xích yếu nhất; MFA và phiên ngắn hạn là hai lớp bù."
      }
    ]
  };

  T.lessons["phan-quyen"] = {
    id: "phan-quyen",
    module: "be-mat-ung-dung",
    title: "Phân quyền theo vai trò",
    shortTitle: "Phân quyền",
    subtitle: "RBAC, đặc quyền tối thiểu và endpoint hở",
    blurb: "Phân quyền trả lời câu hỏi ai được làm gì. Bài này dựng mô hình RBAC cho hệ thống đơn hàng 80 endpoint, chỉ ra 5 endpoint quản trị thiếu kiểm tra, và cách kiểm thử bằng tài khoản thường.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["RBAC", "đặc quyền tối thiểu", "middleware", "IDOR", "kiểm thử quyền"],
    metrics: [
      { key: "endpoints", label: "Tổng endpoint", tone: "blue" },
      { key: "admin", label: "Endpoint quản trị", tone: "yellow" },
      { key: "checksPct", label: "Tỉ lệ kiểm tra", tone: "mint" },
      { key: "open", label: "Endpoint hở", tone: "coral" }
    ],
    nodes: [
      { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Nhân viên", sub: "vai trò nhân viên" },
      { id: "api", type: "api", x: 340, y: 80, w: 200, h: 70, label: "API đơn hàng", sub: "nhận yêu cầu" },
      { id: "rbac", type: "grid", x: 625, y: 80, w: 200, h: 70, label: "Ma trận RBAC", sub: "vai trò và hành động" },
      { id: "db", type: "disk", x: 340, y: 195, w: 200, h: 70, label: "Cơ sở dữ liệu", sub: "bảng vai trò" },
      { id: "checks", type: "check", x: 55, y: 310, w: 200, h: 70, label: "Kiểm tra quyền", sub: "middleware dùng chung" },
      { id: "admin", type: "server", x: 625, y: 310, w: 200, h: 70, label: "Endpoint quản trị", sub: "20 trong 80 endpoint" },
      { id: "open", type: "alert", x: 340, y: 310, w: 200, h: 70, label: "5 endpoint hở", sub: "thiếu kiểm tra" }
    ],
    edges: [
      { id: "user-api", from: "user", to: "api", kind: "request", label: "gọi API" },
      { id: "api-rbac", from: "api", to: "rbac", kind: "control", label: "hỏi quyền" },
      { id: "rbac-db", from: "rbac", to: "db", kind: "data", label: "đọc vai trò" },
      { id: "api-admin", from: "api", to: "admin", kind: "control", label: "định tuyến" },
      { id: "api-checks", from: "api", to: "checks", kind: "control", label: "gọi middleware" },
      { id: "checks-open", from: "checks", to: "open", kind: "data", label: "phát hiện 5" },
      { id: "admin-open", from: "admin", to: "open", kind: "data", label: "bỏ qua kiểm tra" }
    ],
    learn: [
      "Gán quyền theo <code>vai trò</code>, không gán lẻ cho từng tài khoản.",
      "Middleware kiểm quyền đặt trước mọi route, mặc định từ chối.",
      "Đặc quyền tối thiểu: nhân viên không cần quyền hoàn tiền hay xóa đơn.",
      "Kiểm thử bằng tài khoản thường gọi endpoint quản trị, mong đợi mã 403."
    ],
    steps: [
      {
        short: "Vai trò và quyền",
        type: "concept",
        title: "Ai đang gọi và được làm gì",
        body: "Mỗi yêu cầu vào hệ thống đơn hàng phải trả lời hai câu: ai đang gọi và người đó được làm gì. <code>RBAC</code> gom quyền thành vai trò như nhân viên, kế toán, quản trị, rồi gán vai trò cho tài khoản thay vì gán từng quyền lẻ. Hệ thống có 80 endpoint, trong đó 20 endpoint quản trị như hoàn tiền, xuất báo cáo, xóa đơn. Ban đầu chỉ 40% endpoint quản trị có kiểm tra, phần còn lại tin vào giao diện, nên 12 endpoint bị gọi thẳng bằng công cụ. Vai trò phải lưu phía máy chủ và đọc lại mỗi lần gọi, không nhận từ tham số hay header do trình duyệt gửi lên.",
        focus: ["user", "api", "rbac", "db"],
        edges: ["user-api", "api-rbac", "rbac-db"],
        metrics: { endpoints: "80", admin: "20", checksPct: "40%", open: "12" },
        changes: [
          "Quyền được gom theo vai trò, không còn danh sách quyền rời cho từng người.",
          "Vai trò đọc từ cơ sở dữ liệu, không lấy từ tham số yêu cầu."
        ],
        note: "Giao diện ẩn nút không phải là kiểm soát truy cập; công cụ dòng lệnh bỏ qua nút."
      },
      {
        short: "Middleware quyền",
        type: "flow",
        title: "Một middleware cho mọi route",
        body: "Bước tiếp theo là đặt middleware kiểm tra quyền trước mọi route. Middleware đọc mã phiên, tra vai trò trong cơ sở dữ liệu, so với hành động mà route yêu cầu, rồi từ chối bằng mã <code>403</code> nếu thiếu. Cách này gom logic về một chỗ nên không còn route nào quên kiểm tra. Khi áp cho nhóm endpoint quản trị, tỉ lệ có kiểm tra tăng từ 40% lên 60%, số endpoint hở giảm từ 12 xuống 8. Nhóm còn lại là các route cũ viết tay, mỗi route tự gọi một hàm kiểm tra riêng và vài chỗ đã bị bỏ sót khi thêm chức năng. Danh sách route phải sinh tự động để không ai thêm route mà quên khai báo quyền.",
        focus: ["api", "checks", "admin", "open"],
        edges: ["api-checks", "api-admin", "admin-open"],
        metrics: { endpoints: "80", admin: "20", checksPct: "60%", open: "8" },
        changes: [
          "Kiểm tra quyền chuyển vào middleware dùng chung, chạy trước handler.",
          "Số endpoint quản trị hở giảm từ 12 xuống 8."
        ],
        note: "Một middleware đúng còn hơn hai mươi lời nhắc nhở trong tài liệu."
      },
      {
        short: "Năm endpoint hở",
        type: "detail",
        title: "5 endpoint quản trị còn hở",
        body: "Sau khi áp middleware, trong 20 endpoint quản trị có 15 endpoint được kiểm tra, tức 75%, còn 5 endpoint hở: hoàn tiền, xuất danh sách khách, sửa giá, xóa đơn và đổi trạng thái đối tác. Năm route này viết trước khi có middleware và vẫn gọi thẳng tầng dữ liệu. Cách phát hiện rẻ nhất là dùng một tài khoản nhân viên thường, gọi từng endpoint quản trị và mong đợi <code>403</code>; nếu nhận 200 thì đó là lỗ hổng thật. Đừng chỉ kiểm tra trên giao diện, vì công cụ như curl bỏ qua mọi nút bị ẩn. Đặc quyền tối thiểu nghĩa là mặc định từ chối, chỉ mở đúng hành động cần thiết.",
        focus: ["checks", "admin", "open"],
        edges: ["checks-open", "admin-open"],
        metrics: { endpoints: "80", admin: "20", checksPct: "75%", open: "5" },
        changes: [
          "Danh sách endpoint hở được ghi tên cụ thể thay vì báo cáo chung.",
          "Bộ kiểm thử quyền chạy bằng tài khoản nhân viên thường."
        ],
        note: "Endpoint hở thường là route cũ, không phải route mới viết."
      },
      {
        short: "Bốn cái bẫy",
        type: "pitfall",
        title: "Bẫy thường gặp khi phân quyền",
        body: "Bốn cái bẫy. Thứ nhất là kiểm tra quyền ở giao diện rồi tin rằng đã an toàn. Thứ hai là kiểm tra vai trò nhưng không kiểm tra chủ sở hữu, nên nhân viên đọc được đơn hàng của người khác khi đổi số trên đường dẫn, dạng lỗi <code>IDOR</code>. Thứ ba là tin header như <code>X-Role</code> do client gửi, hoặc giải mã token mà không kiểm chữ ký. Thứ tư là cấp quyền quản trị cho tài khoản dịch vụ để chạy nhanh. Mỗi bẫy đều dẫn tới cùng kết quả: 5 endpoint hở trở thành cửa vào. Cách chặn là kiểm tra cả hành động lẫn phạm vi dữ liệu, và rà soát quyền của tài khoản dịch vụ mỗi quý.",
        focus: ["user", "rbac", "open"],
        edges: ["api-rbac", "checks-open", "user-api"],
        metrics: { endpoints: "80", admin: "20", checksPct: "75%", open: "5" },
        changes: [
          "Kiểm tra bổ sung phạm vi dữ liệu, không chỉ tên vai trò.",
          "Tài khoản dịch vụ bị rà soát quyền theo quý."
        ],
        note: "IDOR là lỗi phân quyền phổ biến nhất và cũng dễ kiểm thử nhất."
      },
      {
        short: "Chốt phân quyền",
        type: "final",
        title: "Chốt mô hình phân quyền",
        tone: "final",
        body: "Chốt lại: mọi yêu cầu đi qua middleware kiểm quyền, mặc định từ chối, chỉ mở đúng hành động cần thiết. Vai trò lưu phía máy chủ, đọc lại mỗi lần gọi, không tin header hay tham số. Với dữ liệu của từng người, kiểm tra cả chủ sở hữu để chặn <code>IDOR</code>. Danh sách route sinh tự động từ bảng khai báo quyền, nên thêm route mới là bắt buộc khai báo. Kiểm thử tự động chạy bộ ba tài khoản: khách, nhân viên, quản trị, gọi toàn bộ endpoint và so mã trả về với ma trận mong đợi. Với 20 endpoint quản trị, mục tiêu là 100% có kiểm tra và 0 endpoint hở, thay vì 75% và 5 như hiện tại.",
        focus: "all",
        edges: "all",
        metrics: { endpoints: "80", admin: "20", checksPct: "100%", open: "0" },
        changes: [
          "Toàn bộ 20 endpoint quản trị có kiểm tra quyền, không còn endpoint hở.",
          "Ma trận vai trò trở thành dữ liệu kiểm thử, không chỉ là tài liệu."
        ],
        note: "Phân quyền đúng là mặc định từ chối, cộng với kiểm thử lặp lại được."
      }
    ]
  };

  T.lessons["dau-vao"] = {
    id: "dau-vao",
    module: "be-mat-ung-dung",
    title: "Kiểm soát đầu vào",
    shortTitle: "Đầu vào",
    subtitle: "Allowlist, mã hóa đầu ra, truy vấn tham số",
    blurb: "Mọi dữ liệu từ người dùng phải qua ba lớp: allowlist khi nhận, truy vấn tham số hóa khi chạm cơ sở dữ liệu, và mã hóa đầu ra khi hiển thị. Bài này tính 5.000 đầu vào mỗi ngày và số còn lọt.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["allowlist", "SQL injection", "XSS", "mã hóa đầu ra", "tham số hóa"],
    metrics: [
      { key: "inputs", label: "Đầu vào/ngày", tone: "blue" },
      { key: "unsafe", label: "Chưa an toàn", tone: "yellow" },
      { key: "blocked", label: "Tỉ lệ chặn", tone: "mint" },
      { key: "open", label: "Còn lọt", tone: "coral" }
    ],
    nodes: [
      { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Người đăng ký", sub: "form lớp học" },
      { id: "gate", type: "check", x: 340, y: 80, w: 200, h: 70, label: "Allowlist", sub: "kiểu, độ dài, định dạng" },
      { id: "sanitize", type: "code", x: 625, y: 80, w: 200, h: 70, label: "Mã hóa đầu ra", sub: "escape HTML" },
      { id: "log", type: "audit", x: 340, y: 195, w: 200, h: 70, label: "Nhật ký kiểm toán", sub: "50 đầu vào lọt" },
      { id: "bad", type: "alert", x: 55, y: 310, w: 200, h: 70, label: "Đầu vào nguy hiểm", sub: "1.000 mỗi ngày" },
      { id: "blocked", type: "shield", x: 340, y: 310, w: 200, h: 70, label: "Bộ lọc chặn", sub: "95% bị loại" },
      { id: "db", type: "disk", x: 625, y: 310, w: 200, h: 70, label: "Cơ sở dữ liệu", sub: "truy vấn tham số hóa" }
    ],
    edges: [
      { id: "user-gate", from: "user", to: "gate", kind: "request", label: "5.000/ngày" },
      { id: "gate-sanitize", from: "gate", to: "sanitize", kind: "control", label: "chuẩn hóa" },
      { id: "sanitize-db", from: "sanitize", to: "db", kind: "data", label: "tham số hóa" },
      { id: "bad-gate", from: "bad", to: "gate", kind: "data", label: "1.000 chưa an toàn" },
      { id: "gate-blocked", from: "gate", to: "blocked", kind: "control", label: "chuyển lọc" },
      { id: "blocked-log", from: "blocked", to: "log", kind: "data", label: "50 lọt" },
      { id: "log-db", from: "log", to: "db", kind: "data", label: "mẫu tấn công" }
    ],
    learn: [
      "Dùng <code>allowlist</code>: chỉ nhận ký tự và định dạng đã khai báo.",
      "Truy vấn tham số hóa để dữ liệu không bao giờ thành câu lệnh SQL.",
      "Mã hóa đầu ra theo ngữ cảnh HTML, thuộc tính và JavaScript.",
      "Lọc là lớp giảm tải, không phải giấy phép bỏ qua hai lớp còn lại."
    ],
    steps: [
      {
        short: "Allowlist",
        type: "concept",
        title: "Chỉ nhận thứ đã khai báo",
        body: "Form đăng ký lớp học nhận khoảng 5.000 đầu vào mỗi ngày gồm tên, email, số điện thoại và ghi chú. Khoảng 20% tức 1.000 đầu vào chưa an toàn: có chuỗi SQL, thẻ <code>&lt;script&gt;</code>, ký tự điều khiển hoặc độ dài bất thường. Cách bền nhất là allowlist, nghĩa là mô tả trước cái được phép nhận thay vì liệt kê cái cấm. Tên chỉ nhận chữ và khoảng trắng, tối đa 80 ký tự; email kiểm bằng biểu thức chặt; số điện thoại đúng 10 chữ số. Blacklist luôn thua vì kẻ tấn công chỉ cần một cách viết mới. Allowlist cũng giúp thông báo lỗi rõ ràng cho người dùng thật.",
        focus: ["user", "gate", "bad"],
        edges: ["user-gate", "bad-gate"],
        metrics: { inputs: "5.000", unsafe: "1.000", blocked: "0%", open: "1.000" },
        changes: [
          "Mỗi trường có kiểu, độ dài và bộ ký tự được phép rõ ràng.",
          "Đầu vào sai bị từ chối ngay tại cửa vào, không đi tiếp."
        ],
        note: "Allowlist mô tả cái đúng; blacklist chỉ đuổi theo cái sai."
      },
      {
        short: "Hai lớp giữa",
        type: "flow",
        title: "Chuẩn hóa và mã hóa đầu ra",
        body: "Sau khi qua allowlist, dữ liệu vẫn phải được xử lý theo ngữ cảnh sử dụng. Chuẩn hóa Unicode để hai cách viết tương đương không lách được bộ kiểm tra, rồi mã hóa đầu ra khi hiển thị: HTML escape cho nội dung, thuộc tính chỉ nhận giá trị đã kiểm, JavaScript nhận dữ liệu qua <code>JSON.stringify</code>. Bộ lọc theo mẫu chặn được khoảng 80% đầu vào nguy hiểm, đưa 1.000 xuống còn 200 mỗi ngày, nhưng phần còn lại vẫn cần hai lớp kia. Đừng lọc rồi lưu nguyên chuỗi đã lọc vào cơ sở dữ liệu, vì dữ liệu sẽ hỏng khi hiển thị ở nơi khác. Lưu dữ liệu gốc đã kiểm, mã hóa đúng lúc hiển thị.",
        focus: ["gate", "sanitize", "blocked"],
        edges: ["gate-sanitize", "gate-blocked"],
        metrics: { inputs: "5.000", unsafe: "1.000", blocked: "80%", open: "200" },
        changes: [
          "Đầu ra được escape theo đúng ngữ cảnh thay vì lọc đầu vào.",
          "Số đầu vào nguy hiểm đi qua bộ lọc giảm từ 1.000 xuống 200."
        ],
        note: "Mã hóa đầu ra là lớp chống XSS đúng chỗ; lọc đầu vào không thay được."
      },
      {
        short: "Truy vấn tham số",
        type: "detail",
        title: "Truy vấn tham số hóa",
        body: "Lỗi SQL injection xảy ra khi chuỗi người dùng được ghép vào câu lệnh. Câu <code>SELECT * FROM orders WHERE id = '</code> cộng với giá trị người dùng là một lỗ hổng, vì dấu nháy trong dữ liệu đổi cấu trúc câu lệnh. Truy vấn tham số hóa gửi câu lệnh và dữ liệu thành hai phần riêng, nên cơ sở dữ liệu không bao giờ hiểu dữ liệu là mã. Với 5.000 đầu vào mỗi ngày và bộ lọc chặn 95%, còn khoảng 50 đầu vào nguy hiểm lọt qua, và đúng nhóm này sẽ chạm tới tầng dữ liệu. Nếu tầng đó dùng tham số hóa thì 50 đầu vào chỉ là chuỗi vô hại. Đừng nối chuỗi, kể cả khi giá trị đã là số.",
        focus: ["sanitize", "db", "gate"],
        edges: ["sanitize-db", "gate-sanitize"],
        metrics: { inputs: "5.000", unsafe: "1.000", blocked: "95%", open: "50" },
        changes: [
          "Câu lệnh SQL cố định, giá trị truyền qua tham số ràng buộc.",
          "50 đầu vào nguy hiểm còn lọt không còn khả năng đổi cấu trúc truy vấn."
        ],
        note: "Tham số hóa là lớp chặn cuối; bộ lọc chỉ làm giảm số lần chạm tới nó."
      },
      {
        short: "Lỗi thường gặp",
        type: "pitfall",
        title: "Giải mã hai lần và lọc sai chỗ",
        body: "Bốn lỗi thường gặp. Thứ nhất là giải mã URL hai lần, nên <code>%253Cscript%253E</code> lọt qua bộ lọc rồi thành thẻ thật ở lớp sau. Thứ hai là lọc đầu vào nhưng vẫn ghép chuỗi SQL ở một nhánh mã cũ. Thứ ba là ghi toàn bộ dữ liệu thô vào log, biến log thành nơi chứa mật khẩu và thẻ độc. Thứ tư là tin rằng thư viện template tự an toàn, trong khi hàm nối chuỗi HTML thì không. Cách chặn: giải mã đúng một lần, kiểm tra ở biên hệ thống, tham số hóa mọi truy vấn, escape ở điểm hiển thị, và che dữ liệu nhạy cảm trước khi ghi log. Rà soát cả job nền, không chỉ endpoint công khai.",
        focus: ["bad", "blocked", "log"],
        edges: ["bad-gate", "blocked-log", "log-db"],
        metrics: { inputs: "5.000", unsafe: "1.000", blocked: "95%", open: "50" },
        changes: [
          "Dữ liệu được giải mã đúng một lần tại biên, không lặp lại ở handler.",
          "Log che trường nhạy cảm thay vì ghi nguyên dữ liệu thô."
        ],
        note: "Lọc mà vẫn ghép chuỗi SQL thì chỉ là cảm giác an toàn."
      },
      {
        short: "Chốt đầu vào",
        type: "final",
        title: "Chốt quy tắc kiểm soát đầu vào",
        tone: "final",
        body: "Chốt lại ba lớp và một thứ tự. Một: allowlist tại biên, mỗi trường có kiểu, độ dài và bộ ký tự rõ ràng, giải mã đúng một lần. Hai: truy vấn tham số hóa cho mọi câu lệnh, kể cả câu chỉ đọc, không nối chuỗi trong bất kỳ nhánh nào. Ba: mã hóa đầu ra theo ngữ cảnh, HTML escape cho nội dung, kiểm giá trị cho thuộc tính, JSON cho JavaScript. Với 5.000 đầu vào mỗi ngày, allowlist và bộ lọc đưa 1.000 đầu vào nguy hiểm xuống 50, còn tham số hóa và escape khiến 50 đầu vào đó vô hại. Bổ sung: giới hạn kích thước yêu cầu, ghi log đã che dữ liệu, và kiểm thử bằng bộ mẫu tấn công cố định.",
        focus: "all",
        edges: "all",
        metrics: { inputs: "5.000", unsafe: "1.000", blocked: "99%", open: "10" },
        changes: [
          "Cả ba lớp cùng chạy, mỗi lớp chặn một kiểu lỗi khác nhau.",
          "Bộ mẫu tấn công cố định chạy trong kiểm thử tự động mỗi lần phát hành."
        ],
        note: "Không lớp nào đủ một mình; ba lớp rẻ hơn nhiều so với một vụ rò rỉ."
      }
    ]
  };

  T.lessons["bi-mat"] = {
    id: "bi-mat",
    module: "be-mat-ung-dung",
    title: "Quản lý bí mật",
    shortTitle: "Bí mật",
    subtitle: "Từ .env trong git đến vault có xoay vòng",
    blurb: "Khóa API và mật khẩu cơ sở dữ liệu không nên nằm trong kho mã. Bài này lần theo 12 khóa bị lộ, cách chuyển sang vault cấp khóa ngắn hạn, xoay theo mức thiệt hại và đưa rủi ro từ 90 xuống 10.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: [".env", "vault", "xoay vòng khóa", "KMS", "quét bí mật"],
    metrics: [
      { key: "leaks", label: "Khóa bị lộ", tone: "coral" },
      { key: "rotatedPct", label: "Đã xoay", tone: "mint" },
      { key: "active", label: "Còn hiệu lực", tone: "yellow" },
      { key: "risk", label: "Điểm rủi ro", tone: "blue" }
    ],
    nodes: [
      { id: "app", type: "server", x: 55, y: 80, w: 200, h: 70, label: "Ứng dụng", sub: "đọc cấu hình" },
      { id: "env", type: "file", x: 340, y: 80, w: 200, h: 70, label: "Tệp .env", sub: "12 khóa từng lộ" },
      { id: "vault", type: "key", x: 625, y: 80, w: 200, h: 70, label: "Vault trung tâm", sub: "cấp khóa ngắn hạn" },
      { id: "git", type: "code", x: 340, y: 195, w: 200, h: 70, label: "Kho mã nguồn", sub: "quét bí mật tự động" },
      { id: "audit", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "Nhật ký truy cập", sub: "ai đọc khóa nào" },
      { id: "active", type: "alert", x: 340, y: 310, w: 200, h: 70, label: "6 khóa còn hiệu lực", sub: "vẫn dùng được" },
      { id: "rotate", type: "clock", x: 625, y: 310, w: 200, h: 70, label: "Xoay vòng khóa", sub: "50% đã xoay" }
    ],
    edges: [
      { id: "app-env", from: "app", to: "env", kind: "request", label: "đọc cấu hình" },
      { id: "env-vault", from: "env", to: "vault", kind: "control", label: "chuyển sang vault" },
      { id: "app-vault", from: "app", to: "vault", kind: "request", label: "lấy khóa runtime" },
      { id: "vault-rotate", from: "vault", to: "rotate", kind: "control", label: "lịch xoay" },
      { id: "rotate-active", from: "rotate", to: "active", kind: "data", label: "khóa mới" },
      { id: "active-audit", from: "active", to: "audit", kind: "data", label: "cảnh báo" },
      { id: "git-env", from: "git", to: "env", kind: "data", label: "12 khóa lộ" }
    ],
    learn: [
      "Không commit tệp <code>.env</code>; dùng mẫu rỗng và biến môi trường lúc chạy.",
      "Vault cấp khóa ngắn hạn theo danh tính dịch vụ, quyền đọc hẹp nhất.",
      "Xoay khóa theo mức thiệt hại: khóa ký token trước, khóa ít quyền sau.",
      "Xóa dòng trong commit mới không xóa bí mật khỏi lịch sử git."
    ],
    steps: [
      {
        short: "Mười hai khóa lộ",
        type: "concept",
        title: "Bí mật nằm sai chỗ",
        body: "Bí mật gồm khóa API, mật khẩu cơ sở dữ liệu và khóa ký token. Cách làm phổ biến là đặt chúng trong tệp <code>.env</code> ở máy chủ, nhưng tệp này rất dễ bị commit nhầm. Một lần quét kho mã nguồn của ứng dụng đơn hàng tìm thấy 12 khóa còn giá trị: ba khóa thanh toán, bốn khóa gửi thư, hai khóa lưu trữ tệp và ba mật khẩu cơ sở dữ liệu. Chưa khóa nào được xoay, nên cả 12 khóa vẫn dùng được, mức rủi ro tính theo số nơi lộ là 90 trên 100. Xóa dòng trong commit mới không đủ, vì lịch sử git vẫn giữ nguyên nội dung cũ.",
        focus: ["app", "env", "git"],
        edges: ["app-env", "git-env"],
        metrics: { leaks: "12", rotatedPct: "0%", active: "12", risk: "90" },
        changes: [
          "Danh sách 12 khóa bị lộ được lập kèm nơi sử dụng và mức quyền.",
          "Kho mã nguồn được quét bí mật ở mỗi lần đẩy mã."
        ],
        note: "Lịch sử git là bản sao vĩnh viễn; đổi mật khẩu mới là cách duy nhất."
      },
      {
        short: "Chuyển sang vault",
        type: "flow",
        title: "Vault cấp khóa ngắn hạn",
        body: "Bước sửa là chuyển sang vault: ứng dụng không giữ khóa lâu dài mà xin khóa ngắn hạn lúc chạy, kèm danh tính dịch vụ và quyền đọc hẹp. Vault ghi lại ai đọc khóa nào, khi nào, nên sự cố về sau truy được. Trong tuần đầu, nhóm chỉ xoay được 3 trong 12 khóa, tức 25%, vì ba khóa thanh toán phải phối hợp với đối tác. Số khóa còn hiệu lực giảm từ 12 xuống 9, rủi ro từ 90 xuống 75. Mỗi khóa mới phải có hạn dùng và hạn xoay ghi rõ, không đặt khóa vĩnh viễn. Xoay khóa phải là thao tác thường lệ, không phải dự án riêng.",
        focus: ["app", "vault", "env"],
        edges: ["env-vault", "app-vault"],
        metrics: { leaks: "12", rotatedPct: "25%", active: "9", risk: "75" },
        changes: [
          "Ứng dụng xin khóa lúc chạy thay vì đọc tệp .env trên đĩa.",
          "Ba khóa đầu tiên được xoay, số khóa còn hiệu lực giảm còn 9."
        ],
        note: "Vault chỉ có ích khi quyền đọc hẹp; quyền rộng thì vault thành .env đắt tiền."
      },
      {
        short: "Xoay theo thứ tự",
        type: "detail",
        title: "Xoay 50% và thứ tự ưu tiên",
        body: "Đến giai đoạn hai, 6 trong 12 khóa được xoay, tức 50%, còn 6 khóa cũ vẫn hiệu lực và vẫn nằm trong lịch sử git đã lộ. Rủi ro hạ xuống 60 nhưng chưa về mức chấp nhận được, vì người có bản sao kho mã vẫn dùng được nửa số khóa. Nguyên tắc là xoay theo mức thiệt hại: khóa ký token trước, rồi khóa thanh toán, cuối cùng là khóa ít quyền. Với mỗi khóa, tạo bản mới, triển khai, xác nhận lưu lượng đã chuyển, rồi mới thu hồi bản cũ. Đừng thu hồi trước khi triển khai, vì dịch vụ sẽ dừng giữa lúc xoay. Ghi mốc thời gian từng bước để điều tra về sau.",
        focus: ["vault", "rotate", "active"],
        edges: ["vault-rotate", "rotate-active"],
        metrics: { leaks: "12", rotatedPct: "50%", active: "6", risk: "60" },
        changes: [
          "Sáu khóa được thay, sáu khóa cũ bị đưa vào danh sách thu hồi.",
          "Mỗi lần xoay có thứ tự, người chịu trách nhiệm và mốc thời gian."
        ],
        note: "Thu hồi trước khi chuyển lưu lượng là cách gây sự cố nhanh nhất."
      },
      {
        short: "Bốn chỗ rò rỉ",
        type: "pitfall",
        title: "Rò rỉ ở nơi ít ai nhìn",
        body: "Bốn chỗ rò rỉ ít ai để ý. Thứ nhất là log lỗi in nguyên chuỗi kết nối kèm mật khẩu. Thứ hai là ảnh <code>Docker</code> đóng gói tệp .env vào lớp nền, ai kéo ảnh là đọc được. Thứ ba là quyền đọc vault quá rộng, cả nhóm kỹ thuật đọc được khóa thanh toán. Thứ tư là tệp mẫu .env.example bị điền giá trị thật. Cách chặn: che bí mật trong log, truyền khóa qua biến môi trường lúc chạy hoặc volume, phân quyền đọc theo dịch vụ, và quét kho mã nguồn trong CI. Khi phát hiện lộ, xoay khóa trước rồi mới dọn dẹp, vì bản sao đã có thể nằm ngoài tầm kiểm soát.",
        focus: ["audit", "active", "env"],
        edges: ["active-audit", "git-env"],
        metrics: { leaks: "12", rotatedPct: "50%", active: "6", risk: "60" },
        changes: [
          "Log và ảnh đóng gói được rà soát, không còn chuỗi kết nối đầy đủ.",
          "Quyền đọc vault tách theo dịch vụ thay vì theo nhóm người."
        ],
        note: "Một bí mật đã lên ảnh đóng gói phải coi như đã lộ công khai."
      },
      {
        short: "Chốt bí mật",
        type: "final",
        title: "Chốt quy trình quản lý bí mật",
        tone: "final",
        body: "Chốt quy trình. Một: không commit bí mật, chỉ giữ tệp mẫu rỗng, và bật quét bí mật trong CI lẫn hook trước khi đẩy mã. Hai: mọi khóa đọc từ vault theo danh tính dịch vụ, quyền hẹp nhất, có hạn dùng ngắn. Ba: mỗi khóa có chủ sở hữu, hạn xoay và quy trình xoay đã tập dượt. Bốn: khi nghi lộ, xoay trước rồi mới dọn lịch sử, và ghi lại 12 khóa cũ vào danh sách thu hồi. Năm: log che bí mật, ảnh đóng gói không chứa tệp cấu hình. Kết quả mục tiêu là 0 khóa còn hiệu lực trong nhóm đã lộ và điểm rủi ro dưới 10, thay vì 6 khóa và mức 60.",
        focus: "all",
        edges: "all",
        metrics: { leaks: "12", rotatedPct: "100%", active: "0", risk: "10" },
        changes: [
          "Toàn bộ 12 khóa được xoay, không còn khóa cũ nào dùng được.",
          "Quy trình xoay được tập dượt định kỳ thay vì chỉ nằm trong tài liệu."
        ],
        note: "Xoay khóa là việc thường lệ; chỉ khi đó sự cố rò rỉ mới còn nhẹ."
      }
    ]
  };

  T.practice.push({
    id: "lop-hoc-dau-vao",
    module: "be-mat-ung-dung",
    tag: "INJECT",
    title: "Form đăng ký lớp học bị chèn mã",
    tags: ["SQL injection", "XSS", "allowlist", "tham số hóa"],
    scenario: "Trung tâm đào tạo mở form đăng ký lớp học, mỗi ngày nhận khoảng 5.000 đầu vào gồm tên, email, số điện thoại và ghi chú. Kiểm tra cho thấy 20% tức 1.000 đầu vào chưa an toàn, trong đó có chuỗi SQL và thẻ script. Nhóm kỹ thuật đã bật bộ lọc theo mẫu, chặn được 95%, nhưng vẫn còn khoảng 50 đầu vào nguy hiểm lọt qua mỗi ngày. Cơ sở dữ liệu là MySQL, trang quản trị hiển thị ghi chú của học viên cho nhân viên xem. Giám đốc yêu cầu chặn dứt điểm trong hai tuần mà không làm hỏng dữ liệu cũ. Bạn chọn hướng nào?",
    metrics: [
      { label: "Đầu vào/ngày", value: "5.000", danger: false },
      { label: "Chưa an toàn", value: "1.000", danger: true },
      { label: "Còn lọt", value: "50/ngày", danger: true }
    ],
    options: [
      "Tăng bộ lọc theo mẫu lên 300 quy tắc để chặn nốt 50 đầu vào còn lọt",
      "Chặn toàn bộ ký tự đặc biệt ở mọi trường, kể cả dấu nháy trong ghi chú",
      "Allowlist khi nhận, truy vấn tham số hóa khi ghi, escape khi hiển thị ghi chú",
      "Chuyển sang lưu tệp CSV mỗi ngày và nhập vào cơ sở dữ liệu bằng tay"
    ],
    correct: 2,
    explain: "Bộ lọc theo mẫu chỉ đuổi theo cách viết đã biết, nên 50 đầu vào lọt vẫn là 50 cơ hội mỗi ngày, và 300 quy tắc sẽ chặn nhầm ghi chú hợp lệ. Chặn mọi ký tự đặc biệt làm hỏng dữ liệu thật như tên có dấu nháy hoặc email lạ, mà không sửa được lỗi ghép chuỗi SQL. CSV nhập tay chỉ dời chỗ nguy hiểm. Đáp án đúng là ba lớp: <code>allowlist</code> theo kiểu và độ dài ngay tại biên, truy vấn tham số hóa để 50 đầu vào lọt chỉ còn là chuỗi vô hại, và escape HTML khi hiển thị ghi chú để chặn thẻ script."
  });

  T.practice.push({
    id: "don-hang-quyen",
    module: "be-mat-ung-dung",
    tag: "ACCESS",
    title: "Nhân viên gọi được endpoint quản trị",
    tags: ["RBAC", "middleware", "IDOR", "đặc quyền tối thiểu"],
    scenario: "Hệ thống quản lý đơn hàng có 80 endpoint, trong đó 20 endpoint quản trị như hoàn tiền, sửa giá, xuất danh sách khách và xóa đơn. Rà soát cho thấy chỉ 75% endpoint quản trị có kiểm tra quyền, tức 5 endpoint hở. Một nhân viên chăm sóc khách hàng đã dùng công cụ dòng lệnh gọi thẳng endpoint hoàn tiền cho đơn của mình. Giao diện đã ẩn các nút quản trị, nhưng API vẫn trả dữ liệu bình thường. Nhóm kỹ thuật phải vá trong tuần này và bảo đảm không tái diễn khi thêm chức năng mới. Bạn chọn cách nào?",
    metrics: [
      { label: "Tổng endpoint", value: "80", danger: false },
      { label: "Quản trị", value: "20", danger: false },
      { label: "Endpoint hở", value: "5", danger: true }
    ],
    options: [
      "Ẩn kỹ hơn các nút quản trị trên giao diện và ghi log thao tác của nhân viên",
      "Thêm kiểm tra quyền vào từng handler còn thiếu rồi đóng ticket",
      "Đặt middleware kiểm quyền trước mọi route, mặc định từ chối, kèm kiểm tra chủ sở hữu",
      "Cấp quyền quản trị cho nhóm chăm sóc khách hàng để tránh chặn nhầm"
    ],
    correct: 2,
    explain: "Ẩn nút không phải kiểm soát truy cập, vì công cụ dòng lệnh bỏ qua giao diện và API vẫn trả dữ liệu. Vá riêng 5 handler giải quyết hôm nay, nhưng route mới sẽ lại quên. Cấp quyền quản trị cho nhóm chăm sóc khách hàng chỉ mở rộng thiệt hại. Đáp án đúng là middleware dùng chung trước mọi route, mặc định từ chối và khai báo quyền theo bảng: 20 endpoint quản trị chỉ dành cho vai trò quản trị. Kiểm tra thêm chủ sở hữu để chặn <code>IDOR</code> khi nhân viên đổi mã đơn trên đường dẫn. Kiểm thử bằng tài khoản thường, mong đợi mã 403."
  });

  const card = (title, html, wide) => ({ title: title, wide: !!wide, body: html, html: html });

  T.cheatsheets.push({
    id: "appsec",
    num: "01",
    module: "be-mat-ung-dung",
    title: "Bảng tra bảo mật ứng dụng",
    intro: "Bảng tra ngắn cho bốn lớp bề mặt ứng dụng: so sánh bcrypt và Argon2id, checklist xác thực nhiều lớp, ma trận vai trò RBAC, quy tắc kiểm soát đầu vào và quy trình xoay vòng khóa. Dùng khi rà soát.",
    cards: [
      card("Băm mật khẩu: bcrypt và Argon2id",
        "<table class=\"cheat-table\"><thead><tr><th>Tiêu chí</th><th class=\"mono\">bcrypt</th><th class=\"mono\">Argon2id</th></tr></thead><tbody>" +
        "<tr><td>Đơn vị chi phí</td><td>cost 12, khoảng 250 ms</td><td>64 MiB, t=3, p=1</td></tr>" +
        "<tr><td>Chống GPU</td><td>Tốt, nhờ vòng lặp chậm</td><td>Tốt hơn, tốn cả RAM</td></tr>" +
        "<tr><td>Salt</td><td>Tự gộp vào chuỗi lưu</td><td>Tham số riêng, 16 byte</td></tr>" +
        "<tr><td>Giới hạn</td><td>Chỉ dùng 72 byte đầu</td><td>Không cắt cụt</td></tr>" +
        "<tr><td>Nên chọn khi</td><td>Hệ cũ đã có bcrypt</td><td>Dự án mới, cần mạnh nhất</td></tr>" +
        "<tr><td>Ghi kèm</td><td>Thuật toán, cost, salt</td><td>Thuật toán, tham số, salt</td></tr>" +
        "</tbody></table><p>Mục tiêu chung: 100 đến 250 ms mỗi lần đăng nhập, đo trên máy chủ thật.</p>", true),
      card("Checklist xác thực nhiều lớp",
        "<ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\">" +
        "<li>Băm mật khẩu bằng hàm chậm, salt 16 byte cho từng tài khoản.</li>" +
        "<li>Bắt buộc <code>TOTP</code> hoặc khóa WebAuthn với tài khoản nội bộ và quản trị.</li>" +
        "<li>Phát hành mã dự phòng một lần, lưu dạng băm.</li>" +
        "<li>Cookie phiên có HttpOnly, Secure, SameSite, sống 30 phút.</li>" +
        "<li>Thu hồi mọi phiên khi đổi mật khẩu hoặc bật thêm lớp.</li>" +
        "<li>Khóa tạm 15 phút sau 5 lần sai, đếm cả theo IP.</li>" +
        "<li>Trả cùng một câu lỗi cho email lạ và mật khẩu sai.</li></ul>"),
      card("Ma trận vai trò RBAC",
        "<table class=\"cheat-table\"><thead><tr><th>Hành động</th><th>Nhân viên</th><th>Kế toán</th><th>Quản trị</th></tr></thead><tbody>" +
        "<tr><td>Xem đơn của mình</td><td>Có</td><td>Có</td><td>Có</td></tr>" +
        "<tr><td>Xem mọi đơn</td><td>Không</td><td>Có</td><td>Có</td></tr>" +
        "<tr><td>Sửa giá, hoàn tiền</td><td>Không</td><td>Không</td><td>Có</td></tr>" +
        "<tr><td>Xuất danh sách khách</td><td>Không</td><td>Có</td><td>Có</td></tr>" +
        "<tr><td>Xóa đơn, đổi vai trò</td><td>Không</td><td>Không</td><td>Có</td></tr>" +
        "<tr><td>Tài khoản dịch vụ</td><td>Chỉ đọc</td><td>Chỉ đọc</td><td>Không</td></tr>" +
        "</tbody></table><p>Mặc định từ chối. Mọi route quản trị phải trả <code>403</code> với vai trò nhân viên.</p>", true),
      card("Quy tắc kiểm soát đầu vào",
        "<table class=\"cheat-table\"><thead><tr><th>Lớp</th><th>Cách làm</th><th>Tránh</th></tr></thead><tbody>" +
        "<tr><td>Nhận dữ liệu</td><td>Allowlist kiểu, độ dài, bộ ký tự</td><td>Blacklist mẫu, giải mã hai lần</td></tr>" +
        "<tr><td>Truy vấn</td><td>Tham số ràng buộc cho mọi câu lệnh</td><td>Nối chuỗi, kể cả với số</td></tr>" +
        "<tr><td>Hiển thị</td><td>Escape HTML theo ngữ cảnh</td><td>Lọc đầu vào thay escape đầu ra</td></tr>" +
        "<tr><td>Ghi log</td><td>Che trường nhạy cảm</td><td>Ghi nguyên chuỗi kết nối</td></tr>" +
        "</tbody></table><p>Với 5.000 đầu vào mỗi ngày và 1.000 chưa an toàn, lọc 95% còn 50; tham số hóa làm 50 đầu vào đó vô hại.</p>"),
      card("Quy trình xoay vòng khóa",
        "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>1. Lap danh sach khoa: noi dung, quyen, noi su dung\n2. Uu tien: khoa ky token, khoa thanh toan, khoa it quyen\n3. Tao khoa moi trong vault, gan han dung ngan\n4. Trien khai doc khoa moi, theo doi loi 403/401\n5. Xac nhan luu luong da chuyen het\n6. Thu hoi khoa cu, ghi moc thoi gian\n7. Quet lai git va log tim ban sao con sot</code></pre></div>" +
        "<p style=\"margin-top:8px\">12 khóa lộ, xoay 50% thì còn 6 khóa dùng được; xoay đủ 100% mới đưa rủi ro về mức thấp.</p>")
    ]
  });
})();
