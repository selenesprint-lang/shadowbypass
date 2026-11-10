// Ganti dengan URL Worker setelah backend berhasil di-deploy.
const API_BASE = "https://GANTI-DENGAN-NAMA-WORKER.workers.dev";
const input = document.querySelector("#urlInput");
const button = document.querySelector("#checkBtn");
const message = document.querySelector("#message");
const result = document.querySelector("#result");
const chain = document.querySelector("#chain");
const finalBox = document.querySelector("#finalBox");
const finalUrl = document.querySelector("#finalUrl");
const historyEl = document.querySelector("#history");
const STORAGE_KEY = "shadowbypass-history-v1";

function validWebUrl(value) {
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol); }
  catch { return false; }
}
function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveHistory(item) {
  const items = [item, ...getHistory()].slice(0, 15);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  renderHistory();
}
function renderHistory() {
  const items = getHistory();
  if (!items.length) { historyEl.className = "history-empty"; historyEl.textContent = "Belum ada pemeriksaan."; return; }
  historyEl.className = "";
  historyEl.replaceChildren();
  items.forEach(item => {
    const div = document.createElement("div"); div.className = "history-item";
    const a = document.createElement("a"); a.href = item.finalUrl || item.input; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = item.finalUrl || item.input;
    const small = document.createElement("small"); small.textContent = new Date(item.time).toLocaleString("id-ID");
    div.append(a, small); historyEl.append(div);
  });
}
function safeLink(url, label) {
  const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = label || url; return a;
}
async function inspect() {
  const value = input.value.trim();
  message.className = "message"; message.textContent = "";
  if (!validWebUrl(value)) { message.classList.add("error"); message.textContent = "Masukkan URL lengkap yang diawali http:// atau https://."; return; }
  if (API_BASE.includes("GANTI-DENGAN")) { message.classList.add("error"); message.textContent = "Backend belum dikonfigurasi. Deploy Worker lalu isi API_BASE di app.js."; return; }
  button.disabled = true; button.textContent = "Memeriksa…"; result.classList.add("hidden");
  try {
    const response = await fetch(`${API_BASE.replace(/\/$/, "")}/api/resolve`, {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({url:value})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Pemeriksaan gagal.");
    chain.replaceChildren();
    (data.hops || []).forEach((hop, index) => {
      const div = document.createElement("div"); div.className = "hop";
      const small = document.createElement("small"); small.textContent = `Langkah ${index + 1} · HTTP ${hop.status}`;
      div.append(small, safeLink(hop.url)); chain.append(div);
    });
    document.querySelector("#hopCount").textContent = `${(data.hops || []).length} langkah`;
    if (data.finalUrl) { finalUrl.href = data.finalUrl; finalUrl.textContent = data.finalUrl; finalBox.classList.remove("hidden"); }
    else finalBox.classList.add("hidden");
    result.classList.remove("hidden");
    saveHistory({input:value, finalUrl:data.finalUrl || "", time:Date.now()});
    message.textContent = data.note || "Pemeriksaan selesai.";
  } catch (err) {
    message.classList.add("error"); message.textContent = err.message || "Tidak dapat menghubungi backend.";
  } finally { button.disabled = false; button.innerHTML = 'Periksa link <span>→</span>'; }
}
button.addEventListener("click", inspect);
input.addEventListener("keydown", e => { if (e.key === "Enter") inspect(); });
document.querySelector("#clearHistory").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); renderHistory(); });
renderHistory();
