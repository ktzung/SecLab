/* SecLab — engine mô phỏng lọc đầu vào, kiểm tra phân quyền và xoay vòng bí mật */
(function () {
  "use strict";

  const SEED = window.SEC_SEED;
  if (!SEED) return;

  const fmt = new Intl.NumberFormat("vi-VN");

  function clampInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function runInject(input) {
    const box = input || {};
    const inputs = clampInt(box.inputs, 100, 10000, 5000);
    const unsafePct = clampInt(box.unsafePct, 1, 50, 20);
    const filteredPct = clampInt(box.filteredPct, 0, 100, 95);
    const risky = Math.round((inputs * unsafePct) / 100);
    const blocked = Math.round((risky * filteredPct) / 100);
    const open = risky - blocked;
    const ok = open === 0;
    const trace = [
      { step: "input", label: "Đầu vào", result: "ok", note: `${fmt.format(inputs)} mỗi ngày · ${unsafePct}% chưa an toàn` },
      { step: "risky", label: "Nguy hiểm", result: "ok", note: `${risky} đầu vào nguy hiểm` },
      { step: "filter", label: "Bộ lọc", result: "ok", note: `chặn ${blocked} · ${filteredPct}%` },
      { step: "verdict", label: "Còn lọt", result: ok ? "ok" : "fail", note: `${open} đầu vào lọt lưới` }
    ];
    return {
      ok,
      verdict: ok ? "Kín" : "Còn hở",
      meta: `${open} lọt`,
      statusText: ok ? "không còn đầu vào lọt" : `${open} đầu vào nguy hiểm lọt lưới`,
      tags: ["Input", `${open} lọt`],
      trace,
      payload: { "đầu vào": fmt.format(inputs), "nguy hiểm": risky, "đã chặn": blocked, "còn lọt": open },
      metrics: [
        { label: "Đầu vào", value: fmt.format(inputs) },
        { label: "Nguy hiểm", value: risky },
        { label: "Đã chặn", value: blocked },
        { label: "Còn lọt", value: open }
      ],
      values: { inputs, unsafePct, filteredPct, risky, blocked, open, ok: ok ? 1 : 0 }
    };
  }

  function runAccess(input) {
    const box = input || {};
    const endpoints = clampInt(box.endpoints, 10, 200, 80);
    const adminEndpoints = clampInt(box.adminEndpoints, 1, 50, 20);
    const checksPct = clampInt(box.checksPct, 0, 100, 75);
    const open = Math.round(adminEndpoints * (1 - checksPct / 100));
    const checked = adminEndpoints - open;
    const ok = open === 0;
    const trace = [
      { step: "endpoints", label: "Endpoint", result: "ok", note: `${endpoints} tổng · ${adminEndpoints} quản trị` },
      { step: "checks", label: "Kiểm tra quyền", result: "ok", note: `${checked}/${adminEndpoints} có kiểm tra · ${checksPct}%` },
      { step: "open", label: "Còn hở", result: ok ? "ok" : "fail", note: `${open} endpoint quản trị hở` },
      { step: "verdict", label: "Kết luận", result: ok ? "ok" : "fail", note: ok ? "phủ đủ quyền" : "phải vá ngay" }
    ];
    return {
      ok,
      verdict: ok ? "Đủ" : "Hở",
      meta: `${open} endpoint hở`,
      statusText: ok ? "mọi endpoint quản trị đều có kiểm tra" : `${open} endpoint quản trị thiếu kiểm tra`,
      tags: ["RBAC", `${open} hở`],
      trace,
      payload: { endpoint: endpoints, "quản trị": adminEndpoints, "có kiểm tra": checked, "còn hở": open },
      metrics: [
        { label: "Endpoint", value: endpoints },
        { label: "Quản trị", value: adminEndpoints },
        { label: "Đã kiểm", value: checked },
        { label: "Còn hở", value: open }
      ],
      values: { endpoints, adminEndpoints, checksPct, open, ok: ok ? 1 : 0 }
    };
  }

  function runSecret(input) {
    const box = input || {};
    const leaks = clampInt(box.leaks, 0, 100, 12);
    const rotatedPct = clampInt(box.rotatedPct, 0, 100, 50);
    const rotated = Math.round((leaks * rotatedPct) / 100);
    const active = leaks - rotated;
    const risk = Math.min(100, active * 10);
    const ok = active === 0;
    const trace = [
      { step: "leaks", label: "Khóa bị lộ", result: "ok", note: `${leaks} khóa` },
      { step: "rotate", label: "Xoay vòng", result: "ok", note: `${rotated} khóa đã đổi · ${rotatedPct}%` },
      { step: "active", label: "Còn hiệu lực", result: ok ? "ok" : "warn", note: `${active} khóa` },
      { step: "verdict", label: "Rủi ro", result: ok ? "ok" : "fail", note: `${risk}/100 · ${ok ? "sạch" : "phải xoay tiếp"}` }
    ];
    return {
      ok,
      verdict: ok ? "Sạch" : "Rủi ro",
      meta: `${active} khóa · ${risk} điểm`,
      statusText: ok ? "không còn khóa hiệu lực" : `${active} khóa còn dùng được, rủi ro ${risk}/100`,
      tags: ["Secret", `${risk} điểm`],
      trace,
      payload: { "bị lộ": leaks, "đã xoay": rotated, "còn hiệu lực": active, "rủi ro": `${risk}/100` },
      metrics: [
        { label: "Bị lộ", value: leaks },
        { label: "Đã xoay", value: rotated },
        { label: "Còn hiệu lực", value: active },
        { label: "Rủi ro", value: `${risk}/100` }
      ],
      values: { leaks, rotatedPct, rotated, active, risk, ok: ok ? 1 : 0 }
    };
  }

  function run(kind, values) {
    if (kind === "inject") return runInject(values);
    if (kind === "access") return runAccess(values);
    if (kind === "secret") return runSecret(values);
    throw new Error("Không rõ lát cắt: " + kind);
  }

  window.SEC_ENGINE = { run, formatNumber: (n) => fmt.format(n), round1, clampInt };
})();
