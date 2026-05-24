
var SUPABASE_URL   = "https://wicihqhrjgcikcyurbtd.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_ZgwGLXUMusAEhv1ghHdRGg_cnzDn4Of";
var SUPABASE_STORAGE_BUCKET = "career-lab-uploads";

var CLIENT_ID = "392344488331-qt8b726lvhbldl9bptpj58bagj8qq2af.apps.googleusercontent.com";
  
var APP_NAME  = "Career Laboratory Resource Website";
var PAGE_SIZE = 9;

var _idToken = sessionStorage.getItem("auth_id_token") || null;
var APP_USER = null;   
var SUPABASE = null;

function _initSupabase() {
  if (SUPABASE) return SUPABASE;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.indexOf("PUT_YOUR_SUPABASE_URL_HERE") !== -1 || SUPABASE_ANON_KEY.indexOf("PUT_YOUR_SUPABASE_ANON_KEY_HERE") !== -1) {
    throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY in index.html before using the app.");
  }
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase client library failed to load.");
  }
  SUPABASE = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return SUPABASE;
}

function _checkSupabaseConfig() {
  if (!SUPABASE_URL || SUPABASE_URL.indexOf("PUT_YOUR_SUPABASE_URL_HERE") !== -1) {
    return { ok: false, message: "Missing SUPABASE_URL." };
  }
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.indexOf("PUT_YOUR_SUPABASE_ANON_KEY_HERE") !== -1) {
    return { ok: false, message: "Missing SUPABASE_ANON_KEY." };
  }
  return { ok: true };
}

function _db() {
  return _initSupabase();
}

function _decodeJwt(token) {
  try {
    var payload = token.split('.')[1] || "";
    while (payload.length % 4) payload += "=";
    payload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

function _nowIso() {
  return new Date().toISOString();
}

function _uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function _isAllowedEmail(email) {
  return String(email || "").toLowerCase().endsWith("@hyd.silveroaks.co.in");
}

function _toCourse(row) {
  return {
    ID: row.id,
    Title: row.title,
    Description: row.description,
    Instructor: row.instructor,
    Category: row.category,
    Grade: row.grade,
    ThumbnailURL: row.thumbnail_url,
    YouTubeURL: row.youtube_url,
    PDFLink: row.pdf_link,
    Content: row.content,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function _toPost(row) {
  return {
    ID: row.id,
    Title: row.title,
    Content: row.content,
    FeaturedImageURL: row.featured_image_url,
    PDFLink: row.pdf_link,
    AuthorEmail: row.author_email,
    Tags: row.tags,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function _toReference(row) {
  return {
    ID: row.id,
    Title: row.title,
    Description: row.description,
    Author: row.author,
    Category: row.category,
    ThumbnailURL: row.thumbnail_url,
    YouTubeURL: row.youtube_url,
    PDFLink: row.pdf_link,
    Content: row.content,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function _toCareerLab(row) {
  return {
    ID: row.id,
    Title: row.title,
    Student: row.student,
    Description: row.description,
    Mentor: row.mentor,
    Category: row.category,
    ThumbnailURL: row.thumbnail_url,
    YouTubeURL: row.youtube_url,
    PDFLink: row.pdf_link,
    Content: row.content,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function _toUser(row) {
  return {
    Name: row.name,
    Email: row.email,
    Role: row.role,
    Status: row.status,
    CreatedDate: row.created_date,
  };
}

function _courseRowToDb(payload, existing) {
  return {
    id: payload.id || _uuid(),
    title: payload.title || "",
    description: payload.description || "",
    instructor: payload.instructor || "",
    category: payload.category || "",
    grade: payload.grade || "",
    thumbnail_url: payload.thumbnailUrl || "",
    youtube_url: payload.youtubeUrl || "",
    pdf_link: payload.pdfLink || "",
    content: payload.content || "",
    status: payload.status || "Draft",
    created_date: existing && existing.created_date ? existing.created_date : _nowIso(),
    updated_date: _nowIso(),
  };
}

function _postRowToDb(payload, existing, authorEmail) {
  return {
    id: payload.id || _uuid(),
    title: payload.title || "",
    content: payload.content || "",
    featured_image_url: payload.featuredImageUrl || "",
    pdf_link: payload.pdfLink || "",
    author_email: authorEmail || (existing && existing.author_email) || (APP_USER && APP_USER.email) || "",
    tags: payload.tags || "",
    status: payload.status || "Draft",
    created_date: existing && existing.created_date ? existing.created_date : _nowIso(),
    updated_date: _nowIso(),
  };
}

function _referenceRowToDb(payload, existing) {
  return {
    id: payload.id || _uuid(),
    title: payload.title || "",
    description: payload.description || "",
    author: payload.author || "",
    category: payload.category || "",
    thumbnail_url: payload.thumbnailUrl || "",
    youtube_url: payload.youtubeUrl || "",
    pdf_link: payload.pdfLink || "",
    content: payload.content || "",
    status: payload.status || "Draft",
    created_date: existing && existing.created_date ? existing.created_date : _nowIso(),
    updated_date: _nowIso(),
  };
}

function _careerLabRowToDb(payload, existing) {
  return {
    id: payload.id || _uuid(),
    title: payload.title || "",
    student: payload.student || "",
    description: payload.description || "",
    mentor: payload.mentor || "",
    category: payload.category || "",
    thumbnail_url: payload.thumbnailUrl || "",
    youtube_url: payload.youtubeUrl || "",
    pdf_link: payload.pdfLink || "",
    content: payload.content || "",
    status: payload.status || "Draft",
    created_date: existing && existing.created_date ? existing.created_date : _nowIso(),
    updated_date: _nowIso(),
  };
}

function _userRowToDb(user) {
  return {
    id: user.email,
    name: user.name || user.email.split("@")[0],
    email: user.email,
    role: user.role || "Student",
    status: user.status || "Active",
    created_date: user.created_date || _nowIso(),
  };
}

function _normalizeStatus(row) {
  return String(row && row.status || "");
}

function _youtubeEmbed(url) {
  if (!url) return "";
  var videoId = "";
  var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (m) videoId = m[1];
  if (!videoId) return "";
  return videoId;
}

function _youtubeThumb(videoId) {
  if (!videoId) return "";
  return "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg";
}

function _pdfDownload(url) {
  if (!url) return "";
  var m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return "https://drive.google.com/uc?export=download&id=" + m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return "https://drive.google.com/uc?export=download&id=" + m[1];
  return url;
}

function _withErrorContext(err, context) {
  var msg = err && err.message ? err.message : String(err || "Unknown error");
  return new Error(context ? (context + ": " + msg) : msg);
}

function _extractBucketPathFromUrl(url) {
  var raw = String(url || "").trim();
  if (!raw) return null;
  if (raw.indexOf("http") !== 0) return null;
  var marker = "/storage/v1/object/public/" + SUPABASE_STORAGE_BUCKET + "/";
  var idx = raw.indexOf(marker);
  if (idx === -1) return null;
  var part = raw.slice(idx + marker.length).split("?")[0].split("#")[0];
  try {
    part = decodeURIComponent(part);
  } catch (e) {}
  return part || null;
}

function _collectStoragePathsFromText(text) {
  var html = String(text || "");
  if (!html) return [];
  var rgx = /https?:\/\/[^"'\s<>]+/g;
  var found = html.match(rgx) || [];
  var paths = [];
  found.forEach(function(url) {
    var p = _extractBucketPathFromUrl(url);
    if (p) paths.push(p);
  });
  return paths;
}

function _unique(values) {
  var out = [];
  var seen = {};
  (values || []).forEach(function(v) {
    var key = String(v || "");
    if (!key || seen[key]) return;
    seen[key] = true;
    out.push(key);
  });
  return out;
}

function _collectAttachmentPaths(row, table) {
  if (!row) return [];
  var paths = [];
  [
    row.thumbnail_url,
    row.featured_image_url,
    row.pdf_link,
    row.youtube_url
  ].forEach(function(value) {
    var p = _extractBucketPathFromUrl(value);
    if (p) paths.push(p);
  });
  if (table === "courses" || table === "blogs" || table === "reference_materials" || table === "career_labs") {
    paths = paths.concat(_collectStoragePathsFromText(row.content));
  }
  return _unique(paths);
}

async function _deleteStoragePaths(db, paths) {
  var all = _unique(paths);
  if (!all.length) return;
  var bucket = db.storage.from(SUPABASE_STORAGE_BUCKET);
  var chunkSize = 100;
  for (var i = 0; i < all.length; i += chunkSize) {
    var chunk = all.slice(i, i + chunkSize);
    var result = await bucket.remove(chunk);
    if (result.error) throw _withErrorContext(result.error, "Failed to delete storage attachments");
  }
}

async function _selectAll(table, mapper) {
  var query = _db().from(table).select("*");
  if (table !== "users") query = query.eq("status", "Published");
  var result = await query.order(table === "users" ? "created_date" : "created_date", { ascending: false });
  if (result.error) throw _withErrorContext(result.error, "Failed to load " + table);
  return (result.data || []).map(mapper || function(r){ return r; });
}

async function _selectAny(table, mapper) {
  var result = await _db().from(table).select("*").order("created_date", { ascending: false });
  if (result.error) throw _withErrorContext(result.error, "Failed to load " + table);
  return (result.data || []).map(mapper || function(r){ return r; });
}

async function _selectById(table, id, mapper) {
  var result = await _db().from(table).select("*").eq("id", id).maybeSingle();
  if (result.error) throw _withErrorContext(result.error, "Failed to load " + table + " row");
  return result.data ? (mapper ? mapper(result.data) : result.data) : null;
}

async function _ensureUser(email, name) {
  var db = _db();
  var current = await db.from("users").select("*").eq("email", email).maybeSingle();
  if (current.error) throw _withErrorContext(current.error, "Failed to load user");
  if (current.data) return _toUser(current.data);
  var inserted = await db.from("users").upsert([_userRowToDb({ email: email, name: name, role: "Student", status: "Active" })], { onConflict: "email" }).select("*").single();
  if (inserted.error) throw _withErrorContext(inserted.error, "Failed to create user");
  return _toUser(inserted.data);
}

function _pageRows(rows, offset, limit) {
  var start = Number(offset) || 0;
  var size = Number(limit) || PAGE_SIZE;
  return { total: rows.length, rows: rows.slice(start, start + size) };
}

function _matchesText(value, q) {
  return String(value || "").toLowerCase().indexOf(String(q || "").toLowerCase()) !== -1;
}

function _filterCourses(rows, opts) {
  var search = String(opts.search || "").toLowerCase();
  var category = String(opts.category || "").toLowerCase();
  var grade = String(opts.grade || "").toLowerCase();
  return rows.filter(function (r) {
    if (search && !(_matchesText(r.Title, search) || _matchesText(r.Description, search) || _matchesText(r.Instructor, search) || _matchesText(r.Category, search) || _matchesText(r.Grade, search))) return false;
    if (category && String(r.Category || "").toLowerCase() !== category) return false;
    if (grade && String(r.Grade || "").toLowerCase() !== grade) return false;
    return true;
  });
}

function _filterPosts(rows, opts) {
  var search = String(opts.search || "").toLowerCase();
  var tag = String(opts.tag || "").toLowerCase();
  return rows.filter(function (r) {
    if (search && !(_matchesText(r.Title, search) || _matchesText(r.Content, search) || _matchesText(r.Tags, search))) return false;
    if (tag && !String(r.Tags || "").toLowerCase().split(",").some(function(t){ return t.trim() === tag; })) return false;
    return true;
  });
}

function _filterReferences(rows, opts) {
  var search = String(opts.search || "").toLowerCase();
  var category = String(opts.category || "").toLowerCase();
  return rows.filter(function (r) {
    if (search && !(_matchesText(r.Title, search) || _matchesText(r.Description, search) || _matchesText(r.Author, search) || _matchesText(r.Category, search))) return false;
    if (category && String(r.Category || "").toLowerCase() !== category) return false;
    return true;
  });
}

function _filterCareerLabs(rows, opts) {
  var search = String(opts.search || "").toLowerCase();
  var category = String(opts.category || "").toLowerCase();
  var student = String(opts.student || "").toLowerCase();
  return rows.filter(function (r) {
    if (search && !(_matchesText(r.Title, search) || _matchesText(r.Student, search) || _matchesText(r.Description, search) || _matchesText(r.Mentor, search) || _matchesText(r.Category, search))) return false;
    if (category && String(r.Category || "").toLowerCase() !== category) return false;
    if (student && String(r.Student || "").toLowerCase().indexOf(student) === -1) return false;
    return true;
  });
}

document.getElementById("footer-year").textContent = new Date().getFullYear();

window.onGoogleLibraryLoad = function() {
  google.accounts.id.initialize({
    client_id:   CLIENT_ID,
    callback:    handleCredential,
    auto_select: true,
  });

  if (_idToken) {
    
    verifyAndStart(_idToken);
  } else {
    
    renderLogin(null);
    google.accounts.id.prompt();
  }
};

if (window.google && window.google.accounts) {
  window.onGoogleLibraryLoad();
}

function handleCredential(response) {
  _idToken = response.credential;
  sessionStorage.setItem("auth_id_token", _idToken);
  verifyAndStart(_idToken);
}

function verifyAndStart(token) {
  showLoader();
  (async function() {
    try {
      var cfg = _checkSupabaseConfig();
      if (!cfg.ok) throw new Error(cfg.message);
      var info = _decodeJwt(token);
      if (!info) throw new Error("Invalid sign-in token. Please sign in again.");
      var email = String(info.email || "").toLowerCase();
      if (!info.email_verified) throw new Error("Google account email is not verified.");
      if (!_isAllowedEmail(email)) throw new Error("Access denied: only @hyd.silveroaks.co.in accounts are allowed.");
      if (CLIENT_ID && CLIENT_ID !== "PUT_YOUR_OAUTH_CLIENT_ID" && info.aud !== CLIENT_ID) {
        throw new Error("Invalid sign-in audience. Please sign in again.");
      }
      var user = await _ensureUser(email, info.name || email.split("@")[0]);
      if (_normalizeStatus(user).toLowerCase() !== "active") {
        await _db().from("users")
          .update({ status: "Active" })
          .eq("email", email);
      }
      APP_USER = {
        email: email,
        name: user.Name || info.name || email.split("@")[0],
        role: user.Role || "Student",
        isAdmin: (user.Role || "Student") === "Admin" || (user.Role || "Student") === "Editor",
      };
      _idToken = token;
      hideLoader();
      showChrome();
      route(_bootPageFromLocation());
      prewarmData();
    } catch (err) {
      hideLoader();
      _idToken = null;
      sessionStorage.removeItem("auth_id_token");
      APP_USER = null;
      renderLogin(err.message);
      if (window.google && google.accounts) {
        google.accounts.id.prompt();
      }
    }
  })();
}

function prewarmData() {
  // Prewarm minimal data only — avoid heavy parallel calls that slow initial load.
  Promise.all([
    apiAsync("home", {}),
    apiAsync("posts", { offset: 0, limit: 3 })
  ]).catch(function(){});
}

function showChrome() {
  document.getElementById("site-header").classList.remove("hidden");
  document.getElementById("site-footer").classList.remove("hidden");
  document.getElementById("mobile-dock").classList.remove("hidden");
  var name = APP_USER.name || APP_USER.email || "User";
  var initials = String(name).trim().split(/\s+/).slice(0, 2).map(function(part) { return part ? part[0] : ""; }).join("").toUpperCase() || "U";
  document.getElementById("nav-user").innerHTML =
    '<div class="nav-account" title="'+esc(name + ' • ' + APP_USER.email)+'">' +
    '<div class="nav-avatar" aria-hidden="true">' + esc(initials) + '</div>' +
    '<div class="nav-account-meta">' +
    '<div class="nav-account-name">' + esc(name) + '</div>' +
    '<div class="nav-account-role">' + esc(APP_USER.role || 'Student') + '</div>' +
    '<div class="nav-account-email">' + esc(APP_USER.email || '') + '</div>' +
    '</div>' +
    '</div>' +
    '<button class="nav-account-logout" onclick="signOut()" aria-label="Log out">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '<span>Log out</span></button>';
  document.getElementById("mobile-staff").classList.add("hidden");
  if (APP_USER.isAdmin) {
    document.getElementById("nav-staff").classList.remove("hidden");
    document.getElementById("mobile-staff").classList.remove("hidden");
  } else {
    document.getElementById("nav-staff").classList.add("hidden");
  }
}

function signOut() {
  _idToken = null;
  APP_USER = null;
  sessionStorage.removeItem("auth_id_token");
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  document.getElementById("site-header").classList.add("hidden");
  document.getElementById("site-footer").classList.add("hidden");
  document.getElementById("mobile-dock").classList.add("hidden");
  document.getElementById("nav-staff").classList.add("hidden");
  document.getElementById("mobile-staff").classList.add("hidden");
  renderLogin(null);
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.prompt();
  }
}

var _page  = "home";
var _state = {};

function _pageFile(page) {
  var map = {
    "home": "index.html",
    "courses": "courses.html",
    "blog": "blogs.html",
    "references": "references.html",
    "career-lab": "careerlab.html",
    "staff": "staff.html"
  };
  return map[page] || "index.html";
}

function _currentFileName() {
  return String((window.location.pathname || "").split("/").pop() || "index.html").toLowerCase();
}

function route(page, params) {
  var isTopLevel = page === "home" || page === "courses" || page === "blog" || page === "references" || page === "career-lab" || page === "staff";
  if (isTopLevel && (!params || !Object.keys(params).length)) {
    var targetFile = _pageFile(page);
    if (_currentFileName() !== targetFile.toLowerCase()) {
      window.location.href = targetFile;
      return;
    }
  }

  _page  = page;
  _state = params || {};
  setActiveNav(page);
  window.scrollTo(0, 0);
  document.getElementById("nav-collapse").classList.remove("open");

  switch (page) {
    case "home":    pageHome(_state);    break;
    case "courses": pageCourses(_state); break;
    case "search":  pageSearch(_state); break;
    case "course":  pageCourse(_state.id);  break;
    case "blog":       pageBlog(_state);    break;
    case "post":       pagePost(_state.id);    break;
    case "references": pageReferences(_state); break;
    case "reference":  pageReference(_state.id); break;
    case "career-lab":  pageCareerLabs(_state); break;
    case "career-lab-item":  pageCareerLab(_state.id); break;
    case "staff":
      if (APP_USER && APP_USER.isAdmin) pageStaff(); else render403();
      break;
    case "staff-course-form":
      if (APP_USER && APP_USER.isAdmin) pageStaffCourseForm(_state.course); else render403();
      break;
    case "staff-blog-form":
      if (APP_USER && APP_USER.isAdmin) pageStaffBlogForm(_state.post); else render403();
      break;
    case "staff-reference-form":
      if (APP_USER && APP_USER.isAdmin) pageStaffReferenceForm(_state.ref); else render403();
      break;
    case "staff-careerlab-form":
      if (APP_USER && APP_USER.isAdmin) pageStaffCareerLabForm(_state.lab); else render403();
      break;
    default: render404();
  }
}

function setActiveNav(page) {
  var navPage = page;
  if (page === "search") navPage = "home";
  if (page === "course") navPage = "courses";
  if (page === "post") navPage = "blog";
  if (page === "reference") navPage = "references";
  if (page === "career-lab-item") navPage = "career-lab";
  if (page === "staff-course-form" || page === "staff-blog-form" || page === "staff-reference-form" || page === "staff-careerlab-form") navPage = "staff";
  document.querySelectorAll(".nav-links a").forEach(function(a) {
    a.classList.toggle("active", a.dataset.page === navPage);
  });
  document.querySelectorAll(".mobile-dock .dock-item").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.page === navPage);
  });
}

var _npEl;
function _npStart() {
  if (!_npEl) { _npEl = document.createElement("div"); _npEl.id = "nprogress"; document.body.appendChild(_npEl); }
  _npEl.style.opacity = "1"; _npEl.style.width = "0";
  setTimeout(function(){ if(_npEl) _npEl.style.width = "70%"; }, 30);
}
function _npDone() {
  if (!_npEl) return;
  _npEl.style.width = "100%";
  setTimeout(function(){ if(_npEl){ _npEl.style.opacity = "0"; _npEl.style.width = "0"; } }, 280);
}

var _cache   = {};
var CACHE_TTL = 45000;
var _pending  = {};
function _cacheGet(k){ var e = _cache[k]; return (e && Date.now() - e.ts < CACHE_TTL) ? e.data : null; }
function _cacheSet(k, d){ _cache[k] = { ts: Date.now(), data: d }; }
function _cacheInvalidate(){ _cache = {}; }

function _bootPageFromLocation() {
  var allowed = {
    "home": "home",
    "courses": "courses",
    "blog": "blog",
    "blogs": "blog",
    "references": "references",
    "career-lab": "career-lab",
    "careerlab": "career-lab",
    "staff": "staff"
  };
  try {
    var params = new URLSearchParams(window.location.search || "");
    var qp = String(params.get("page") || "").toLowerCase().trim();
    if (allowed[qp]) return allowed[qp];
  } catch (e) {}
  var file = String((window.location.pathname || "").split("/").pop() || "").toLowerCase();
  var map = {
    "index.html": "home",
    "courses.html": "courses",
    "blogs.html": "blog",
    "staff.html": "staff",
    "references.html": "references",
    "refrences.html": "references",
    "careerlab.html": "career-lab"
  };
  return map[file] || "home";
}

function _buildQuery(params) {
  return Object.keys(params).map(function(k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(params[k] !== undefined ? params[k] : "");
  }).join("&");
}

function apiAsync(action, params) {
  var cacheKey = action + "|" + JSON.stringify(params || {});
  var cached = _cacheGet(cacheKey);
  if (cached) return Promise.resolve(cached);
  return _apiAsync(action, params || {}).then(function(data) {
    _cacheSet(cacheKey, data);
    return data;
  });
}

function api(action, params, onOk, onErr) {
  var cacheKey = action + "|" + JSON.stringify(params || {});
  var cached = _cacheGet(cacheKey);
  if (cached) {
    onOk(cached);
    return;
  }
  _npStart();
  _apiAsync(action, params || {})
    .then(function(data) {
      _npDone();
      _cacheSet(cacheKey, data);
      onOk(data);
    })
    .catch(function(e) { _npDone(); (onErr || defaultErr)(e); });
}

function apiPost(action, body, onOk, onErr) {
  showLoader();
  _apiPost(action, body || {})
    .then(function(data) {
      hideLoader();
      _cacheInvalidate();
      onOk(data);
    })
    .catch(function(e) { hideLoader(); (onErr || defaultErr)(e); });
}

async function _apiAsync(action, params) {
  var db = _db();
  switch (action) {
    case "me":
      return APP_USER;
    case "home":
      return _loadHomeData(db);
    case "courses":
      return _loadCourses(db, params);
    case "course":
      return _loadCourse(db, params.id);
    case "posts":
      return _loadPosts(db, params);
    case "post":
      return _loadPost(db, params.id);
    case "references":
      return _loadReferences(db, params);
    case "reference":
      return _loadReference(db, params.id);
    case "careerLabs":
      return _loadCareerLabs(db, params);
    case "careerLab":
      return _loadCareerLab(db, params.id);
    case "search":
      return _loadSearch(db, params.q, params.limit);
    case "stats":
      return _loadStats(db);
    case "allCourses":
      return _selectAny("courses", _toCourse);
    case "allPosts":
      return _selectAny("blogs", _toPost);
    case "allReferences":
      return _selectAny("reference_materials", _toReference);
    case "allCareerLabs":
      return _selectAny("career_labs", _toCareerLab);
    case "allUsers":
      return _selectAny("users", _toUser);
    default:
      throw new Error("Unknown action");
  }
}

async function _apiPost(action, body) {
  var db = _db();
  switch (action) {
    case "saveCourse":
      return _saveCourse(db, body.data || {});
    case "deleteCourse":
      return _deleteById(db, "courses", body.id);
    case "savePost":
      return _savePost(db, body.data || {});
    case "deletePost":
      return _deleteById(db, "blogs", body.id);
    case "saveReference":
      return _saveReference(db, body.data || {});
    case "deleteReference":
      return _deleteById(db, "reference_materials", body.id);
    case "saveCareerLab":
      return _saveCareerLab(db, body.data || {});
    case "deleteCareerLab":
      return _deleteById(db, "career_labs", body.id);
    case "updateUserRole":
      return _updateUserRole(db, body.email, body.role);
    case "deleteUser":
      return _deleteUserCompletely(db, body.email);
    case "uploadFile":
      throw new Error("Upload is handled directly in the browser.");
    default:
      throw new Error("Unknown action");
  }
}

async function _loadCourses(db, params) {
  var rows = await _selectAll("courses", _toCourse);
  rows = _filterCourses(rows, params || {});
  return _pageRows(rows, params && params.offset, params && params.limit);
}

async function _loadCourse(db, id) {
  var row = await _selectById("courses", id, _toCourse);
  if (!row || row.Status !== "Published") throw new Error("Not found");
  row._embedUrl = _youtubeEmbed(row.YouTubeURL);
  row._downloadUrl = _pdfDownload(row.PDFLink);
  return row;
}

async function _loadPosts(db, params) {
  var rows = await _selectAll("blogs", _toPost);
  rows = _filterPosts(rows, params || {});
  return _pageRows(rows, params && params.offset, params && params.limit);
}

async function _loadPost(db, id) {
  var row = await _selectById("blogs", id, _toPost);
  if (!row || row.Status !== "Published") throw new Error("Not found");
  row._downloadUrl = _pdfDownload(row.PDFLink);
  return row;
}

async function _loadReferences(db, params) {
  var rows = await _selectAll("reference_materials", _toReference);
  rows = _filterReferences(rows, params || {});
  return _pageRows(rows, params && params.offset, params && params.limit);
}

async function _loadReference(db, id) {
  var row = await _selectById("reference_materials", id, _toReference);
  if (!row || row.Status !== "Published") throw new Error("Not found");
  row._embedUrl = _youtubeEmbed(row.YouTubeURL);
  row._downloadUrl = _pdfDownload(row.PDFLink);
  return row;
}

async function _loadCareerLabs(db, params) {
  var rows = await _selectAll("career_labs", _toCareerLab);
  rows = _filterCareerLabs(rows, params || {});
  return _pageRows(rows, params && params.offset, params && params.limit);
}

async function _loadCareerLab(db, id) {
  var row = await _selectById("career_labs", id, _toCareerLab);
  if (!row || row.Status !== "Published") throw new Error("Not found");
  row._embedUrl = _youtubeEmbed(row.YouTubeURL);
  row._downloadUrl = _pdfDownload(row.PDFLink);
  return row;
}

async function _loadHomeData(db) {
  var courses = await _selectAll("courses", _toCourse);
  var posts = await _selectAll("blogs", _toPost);
  var references = await _selectAll("reference_materials", _toReference);
  var labs = await _selectAll("career_labs", _toCareerLab);
  return {
    featuredCourses: courses.slice(0, 3),
    featuredPosts: posts.slice(0, 3),
    featuredReferences: references.slice(0, 3),
    featuredCareerLabs: labs.slice(0, 3),
    categories: Array.from(new Set(courses.map(function(c){ return c.Category || ""; }).filter(Boolean))).sort(),
    refCategories: Array.from(new Set(references.map(function(r){ return r.Category || ""; }).filter(Boolean))).sort(),
    labCategories: Array.from(new Set(labs.map(function(l){ return l.Category || ""; }).filter(Boolean))).sort(),
    allGrades: Array.from(new Set(courses.map(function(c){ return c.Grade || ""; }).filter(Boolean))).sort(),
    allTags: Array.from(new Set(posts.reduce(function(acc, post){
      String(post.Tags || "").split(",").forEach(function(tag){ var t = tag.trim(); if (t) acc.push(t); });
      return acc;
    }, []) )).sort(),
  };
}

async function _loadSearch(db, q, limit) {
  var query = String(q || "").toLowerCase();
  var max = Math.max(1, Number(limit) || 5);
  var courses = await _selectAll("courses", _toCourse);
  var posts = await _selectAll("blogs", _toPost);
  var references = await _selectAll("reference_materials", _toReference);
  var careerLabs = await _selectAll("career_labs", _toCareerLab);
  function match(row, fields) {
    return fields.some(function(field) { return _matchesText(row[field], query); });
  }
  return {
    courses: courses.filter(function(r){ return match(r, ["Title", "Description", "Instructor", "Category", "Grade"]); }).slice(0, max),
    posts: posts.filter(function(r){ return match(r, ["Title", "Content", "Tags"]); }).slice(0, max),
    references: references.filter(function(r){ return match(r, ["Title", "Description", "Author", "Category"]); }).slice(0, max),
    careerLabs: careerLabs.filter(function(r){ return match(r, ["Title", "Student", "Description", "Mentor", "Category"]); }).slice(0, max),
  };
}

async function _loadStats(db) {
  var courses = await _selectAny("courses", _toCourse);
  var blogs = await _selectAny("blogs", _toPost);
  var references = await _selectAny("reference_materials", _toReference);
  var careerLabs = await _selectAny("career_labs", _toCareerLab);
  var users = await _selectAny("users", _toUser);
  var publishedCourses = courses.filter(function(r){ return r.Status === "Published"; });
  var publishedBlogs = blogs.filter(function(r){ return r.Status === "Published"; });
  var publishedReferences = references.filter(function(r){ return r.Status === "Published"; });
  var publishedCareerLabs = careerLabs.filter(function(r){ return r.Status === "Published"; });
  var activeUsers = users.filter(function(r){ return r.Status === "Active"; });
  var recent = [];
  courses.forEach(function(c){ recent.push({ type:"Course", id:c.ID, title:c.Title, status:c.Status, date:c.CreatedDate }); });
  blogs.forEach(function(b){ recent.push({ type:"Blog", id:b.ID, title:b.Title, status:b.Status, date:b.CreatedDate }); });
  references.forEach(function(r){ recent.push({ type:"Reference", id:r.ID, title:r.Title, status:r.Status, date:r.CreatedDate }); });
  careerLabs.forEach(function(l){ recent.push({ type:"Career Lab", id:l.ID, title:l.Title, status:l.Status, date:l.CreatedDate }); });
  recent.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  var catMap = {};
  courses.forEach(function(c) { var cat = c.Category || "Uncategorized"; catMap[cat] = (catMap[cat] || 0) + 1; });
  var gradeMap = {};
  courses.forEach(function(c) { var g = c.Grade || "Unassigned"; gradeMap[g] = (gradeMap[g] || 0) + 1; });
  return {
    totalCourses: courses.length,
    totalBlogs: blogs.length,
    totalReferences: references.length,
    totalCareerLabs: careerLabs.length,
    publishedCourses: publishedCourses.length,
    publishedBlogs: publishedBlogs.length,
    publishedReferences: publishedReferences.length,
    publishedCareerLabs: publishedCareerLabs.length,
    activeUsers: activeUsers.length,
    recentActivity: recent.slice(0, 10),
    categoryData: catMap,
    gradeData: gradeMap,
  };
}

async function _saveCourse(db, payload) {
  var existing = payload.id ? await _selectById("courses", payload.id) : null;
  var row = _courseRowToDb(payload, existing);
  var result = await db.from("courses").upsert([row], { onConflict: "id" }).select("*").single();
  if (result.error) throw _withErrorContext(result.error, "Failed to save course");
  return { ok: true, id: result.data.id };
}

async function _savePost(db, payload) {
  var existing = payload.id ? await _selectById("blogs", payload.id) : null;
  var row = _postRowToDb(payload, existing, APP_USER && APP_USER.email);
  var result = await db.from("blogs").upsert([row], { onConflict: "id" }).select("*").single();
  if (result.error) throw _withErrorContext(result.error, "Failed to save post");
  return { ok: true, id: result.data.id };
}

async function _saveReference(db, payload) {
  var existing = payload.id ? await _selectById("reference_materials", payload.id) : null;
  var row = _referenceRowToDb(payload, existing);
  var result = await db.from("reference_materials").upsert([row], { onConflict: "id" }).select("*").single();
  if (result.error) throw _withErrorContext(result.error, "Failed to save reference");
  return { ok: true, id: result.data.id };
}

async function _saveCareerLab(db, payload) {
  var existing = payload.id ? await _selectById("career_labs", payload.id) : null;
  var row = _careerLabRowToDb(payload, existing);
  var result = await db.from("career_labs").upsert([row], { onConflict: "id" }).select("*").single();
  if (result.error) throw _withErrorContext(result.error, "Failed to save career lab");
  return { ok: true, id: result.data.id };
}

async function _deleteById(db, table, id) {
  if (!id) throw new Error("Missing id");
  var current = await db.from(table).select("*").eq("id", id).maybeSingle();
  if (current.error) throw _withErrorContext(current.error, "Failed to load row before deletion");
  if (current.data) {
    var paths = _collectAttachmentPaths(current.data, table);
    await _deleteStoragePaths(db, paths);
  }
  var result = await db.from(table).delete().eq("id", id);
  if (result.error) throw _withErrorContext(result.error, "Failed to delete from " + table);
  return { ok: true };
}

async function _updateUserRole(db, email, role) {
  var result = await db.from("users").update({ role: role, status: "Active" }).eq("email", String(email || "").toLowerCase()).select("*").maybeSingle();
  if (result.error) throw _withErrorContext(result.error, "Failed to update user role");
  return { ok: true };
}

async function _deleteUserCompletely(db, email) {
  var safeEmail = String(email || "").toLowerCase();
  if (!safeEmail) throw new Error("Missing user email");

  // Remove authored blog records first so any related attachments are cleaned up.
  var postsRes = await db.from("blogs").select("id").eq("author_email", safeEmail);
  if (postsRes.error) throw _withErrorContext(postsRes.error, "Failed to load user authored posts");
  var postIds = (postsRes.data || []).map(function(p) { return p.id; });
  for (var i = 0; i < postIds.length; i++) {
    await _deleteById(db, "blogs", postIds[i]);
  }

  var result = await db.from("users").delete().eq("email", safeEmail);
  if (result.error) throw _withErrorContext(result.error, "Failed to delete user");
  return { ok: true };
}

function defaultErr(e) {
  toast(e.message || "Something went wrong.", "err");
}

function showLoader() { document.getElementById("loader").classList.add("show"); }
function hideLoader() { document.getElementById("loader").classList.remove("show"); }
function toggleNav()  { document.getElementById("nav-collapse").classList.toggle("open"); }

function toast(msg, type) {
  var box = document.getElementById("toast-box");
  var el  = document.createElement("div");
  el.className = "toast toast-" + (type === "err" ? "err" : "ok");
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(function() {
    el.style.opacity = "0"; el.style.transition = "opacity .4s";
    setTimeout(function() { el.remove(); }, 450);
  }, 3200);
}


function esc(s) {
  return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function fmtDate(d) {
  var dt = new Date(d);
  return isNaN(dt) ? (d || "") : dt.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}
function stripHtml(html) {
  var t = document.createElement("div"); t.innerHTML = html || ""; return (t.textContent || "").trim();
}

function isEmoji(s) {
  if (!s) return false;
  try {
    return /\p{Extended_Pictographic}/u.test(String(s));
  } catch (e) {
    return /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u.test(String(s));
  }
}

function initAC(inputId, dropId) {
  var inp = document.getElementById(inputId);
  var drop = document.getElementById(dropId);
  if (!inp || !drop) return;
  var timer;
  inp.addEventListener("input", function() {
    clearTimeout(timer);
    var q = inp.value.trim();
    if (q.length < 2) { drop.classList.remove("open"); return; }
    timer = setTimeout(function() {
      api("search", {q: q}, function(res) {
        drop.innerHTML = "";
        var items = [];
        (res.courses    || []).forEach(function(c) { items.push({type:"Course",    label:c.Title,id:c.ID,page:"course"}); });
        (res.posts      || []).forEach(function(p) { items.push({type:"Blog",      label:p.Title,id:p.ID,page:"post"}); });
        (res.references || []).forEach(function(r) { items.push({type:"Reference", label:r.Title,id:r.ID,page:"reference"}); });
        (res.careerLabs || []).forEach(function(l) { items.push({type:"Career Lab", label:l.Title,id:l.ID,page:"career-lab-item"}); });
        if (!items.length) {
          drop.innerHTML = "<div class='ac-item' style='color:#999'>No results</div>";
        } else {
          items.forEach(function(item) {
            var div = document.createElement("div");
            div.className = "ac-item";
            div.innerHTML = "<span class='ac-type'>"+esc(item.type)+"</span><span>"+esc(item.label)+"</span>";
            div.onclick = function() { route(item.page, {id: item.id}); drop.classList.remove("open"); };
            drop.appendChild(div);
          });
        }
        drop.classList.add("open");
      }, function() { drop.classList.remove("open"); });
    }, 280);
  });
  document.addEventListener("click", function(e) {
    if (!inp.contains(e.target) && !drop.contains(e.target)) drop.classList.remove("open");
    var navCollapse = document.getElementById("nav-collapse");
    var hamburger = document.querySelector(".hamburger");
    if (navCollapse && hamburger && navCollapse.classList.contains("open")) {
      if (!navCollapse.contains(e.target) && !hamburger.contains(e.target)) {
        navCollapse.classList.remove("open");
      }
    }
  });
}

var revealObserver = null;
function initRevealMotion(root) {
  var scope = root && root.querySelectorAll ? root : document;
  var nodes = scope.querySelectorAll(".reveal-up");
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window)) {
    nodes.forEach(function(el) { el.classList.add("in"); });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        obs.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: "0px 0px -48px 0px" });
  }

  nodes.forEach(function(el) {
    if (el.dataset.revealBound === "1") return;
    el.dataset.revealBound = "1";
    revealObserver.observe(el);
  });
}

function _closestSpotlightItem(track) {
  var items = Array.from(track.querySelectorAll(".spotlight-item"));
  if (!items.length) return null;
  var rect = track.getBoundingClientRect();
  var center = rect.left + rect.width / 2;
  var best = items[0];
  var dist = Infinity;
  items.forEach(function(item) {
    var r = item.getBoundingClientRect();
    var c = r.left + r.width / 2;
    var d = Math.abs(c - center);
    if (d < dist) { dist = d; best = item; }
  });
  return best;
}

function _paintSpotlightActive(track) {
  var items = Array.from(track.querySelectorAll(".spotlight-item"));
  if (!items.length) return;
  var active = _closestSpotlightItem(track);
  items.forEach(function(item) { item.classList.toggle("is-active", item === active); });
}

function initSpotlight(trackId) {
  var track = document.getElementById(trackId);
  if (!track) return;
  var kids = Array.from(track.children);
  if (!kids.length || kids[0].classList.contains("empty")) return;
  kids.forEach(function(child) {
    if (child.classList.contains("spotlight-item")) return;
    var wrap = document.createElement("div");
    wrap.className = "spotlight-item";
    child.replaceWith(wrap);
    wrap.appendChild(child);
  });
  _paintSpotlightActive(track);
  track.addEventListener("scroll", function() { _paintSpotlightActive(track); }, { passive: true });
}

function moveSpotlight(trackId, dir) {
  var track = document.getElementById(trackId);
  if (!track) return;
  var amount = Math.max(280, Math.round(track.clientWidth * 0.78));
  track.scrollBy({ left: dir * amount, behavior: "smooth" });
}

function fmt(cmd) {
  document.getElementById("f-content") && document.getElementById("f-content").focus();
  document.getElementById("p-content") && document.getElementById("p-content").focus();
  if      (cmd === "Bold")      document.execCommand("bold");
  else if (cmd === "Italic")    document.execCommand("italic");
  else if (cmd === "Underline") document.execCommand("underline");
  else if (cmd === "H2")        document.execCommand("formatBlock",false,"h2");
  else if (cmd === "H3")        document.execCommand("formatBlock",false,"h3");
  else if (cmd === "UL")        document.execCommand("insertUnorderedList");
  else if (cmd === "OL")        document.execCommand("insertOrderedList");
  else if (cmd === "Quote")     document.execCommand("formatBlock",false,"blockquote");
  else if (cmd === "Link") {
    var url = prompt("URL:");
    if (url) document.execCommand("createLink",false,url);
  }
}

function uploadFileToField(input, targetId, statusId, previewId, label) {
  var file = input.files && input.files[0];
  if (!file) return;
  var status = statusId ? document.getElementById(statusId) : null;
  var preview = previewId ? document.getElementById(previewId) : null;
  var target = document.getElementById(targetId);
  if (status) status.textContent = "Uploading…";
  var bucket = _db().storage.from(SUPABASE_STORAGE_BUCKET);
  var safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]+/g, "_");
  var path = (label || "upload").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "/" + Date.now() + "-" + safeName;
  bucket.upload(path, file, { upsert: true, contentType: file.type })
    .then(function(result) {
      if (result.error) throw result.error;
      return bucket.getPublicUrl(path);
    })
    .then(function(result) {
      var url = result.data && result.data.publicUrl;
      if (!url) throw new Error("Could not resolve public URL for uploaded file.");
      if (target) target.value = url;
      if (preview && file.type.indexOf("image/") === 0) {
        preview.src = url;
        preview.style.display = "block";
      }
      if (status) {
        status.textContent = (label || "File") + " uploaded";
        setTimeout(function(){ if (status) status.textContent = ""; }, 2600);
      }
    })
    .catch(function(err) {
      if (status) status.textContent = "Upload failed: " + (err.message || "unknown error");
    });
}

function renderPagination(key, total, offset, onPage) {
  var el = document.getElementById(key);
  if (!el || total <= PAGE_SIZE) { if (el) el.innerHTML = ""; return; }
  var pages = Math.ceil(total / PAGE_SIZE);
  var cur   = Math.floor(offset / PAGE_SIZE);
  var html  = "";
  if (cur > 0)       html += '<button class="page-btn" onclick="_pg(\''+key+'\','+(cur-1)+')">← Prev</button>';
  for (var i = 0; i < pages; i++) {
    html += '<button class="page-btn'+(i===cur?" active":"")+'" onclick="_pg(\''+key+'\','+i+')">'+(i+1)+'</button>';
  }
  if (cur < pages-1) html += '<button class="page-btn" onclick="_pg(\''+key+'\','+(cur+1)+')">Next →</button>';
  el.innerHTML = html;
  window["_pgcb_"+key] = onPage;
}
function _pg(key, idx) {
  var cb = window["_pgcb_"+key];
  if (cb) cb(idx * PAGE_SIZE);
}

function statusBadge(s) {
  return s === "Published"
    ? '<span class="badge badge-success">Published</span>'
    : '<span class="badge" style="background:#fef3c7;color:#92400e">Draft</span>';
}

function courseCard(c) {
  var canOpen = !!c.ID;
  var thumbVal = c.ThumbnailURL;
  var thumb = '';
  if (thumbVal) {
    var tv = String(thumbVal).trim();
    if (/^https?:\/\//.test(tv) || tv.charAt(0) === '/') {
      thumb = '<img loading="lazy" class="card-thumb" src="'+esc(tv)+'" alt="'+esc(c.Title)+'" onerror="this.parentElement.innerHTML=\'<div class=card-thumb-placeholder style=background:linear-gradient(135deg,#1e3a5f,#2d6a9f)>🎓<\/div>\'">';
    } else if (isEmoji(tv)) {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f)">'+esc(tv)+'</div>';
    } else {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f)">🎓</div>';
    }
  } else {
    thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f)">🎓</div>';
  }
  return '<div class="card resource-card"'+(canOpen?' style="cursor:pointer" onclick="route(\'course\',{id:\''+esc(c.ID)+'\'})"':'')+'>' + thumb +
    '<div class="card-body">' +
    '<div class="resource-tags">' +
    '<span class="badge badge-primary">'+esc(c.Category||"General")+'</span>' +
    (c.Grade ? '<span class="badge" style="background:#e0f2fe;color:#075985">'+esc(c.Grade)+'</span>' : "") +
    (c.YouTubeURL ? '<span class="badge" style="background:#fef2f2;color:#b91c1c">Video</span>' : "") +
    (c.PDFLink    ? '<span class="badge badge-success">PDF</span>' : "") +
    '</div>' +
    '<h3 class="card-title">'+esc(c.Title)+'</h3>' +
    '<p class="card-desc">'+esc((c.Description||"").slice(0,110))+((c.Description||"").length>110?"…":"")+'</p>' +
    '<div class="card-footer resource-card-footer">' +
    '<span class="card-meta">👨‍🏫 '+esc(c.Instructor||"Staff")+'</span>' +
    '<button class="btn btn-primary btn-sm"'+(canOpen?' onclick="event.stopPropagation();route(\'course\',{id:\''+esc(c.ID)+'\'})"':' disabled')+'>'+(canOpen?'View':'Unavailable')+'</button>' +
    '</div></div></div>';
}

function referenceCard(r) {
  var canOpen = !!r.ID;
  var thumbVal = r.ThumbnailURL;
  var thumb = '';
  if (thumbVal) {
    var tv = String(thumbVal).trim();
    if (/^https?:\/\//.test(tv) || tv.charAt(0) === '/') {
      thumb = '<img loading="lazy" class="card-thumb" src="'+esc(tv)+'" alt="'+esc(r.Title)+'" onerror="this.parentElement.innerHTML=\'<div class=card-thumb-placeholder style=background:linear-gradient(135deg,#2d6a4f,#52b788)>📎<\/div>\'">';
    } else if (isEmoji(tv)) {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#2d6a4f,#52b788)">'+esc(tv)+'</div>';
    } else {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#2d6a4f,#52b788)">📎</div>';
    }
  } else {
    thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#2d6a4f,#52b788)">📎</div>';
  }
  return '<div class="card resource-card"'+(canOpen?' style="cursor:pointer" onclick="route(\'reference\',{id:\''+esc(r.ID)+'\'})"':'')+'>'+thumb+
    '<div class="card-body">'+
    '<div class="resource-tags">'+
    '<span class="badge badge-primary">'+esc(r.Category||"General")+'</span>'+
    (r.YouTubeURL ? '<span class="badge" style="background:#fef2f2;color:#b91c1c">Video</span>' : "")+
    (r.PDFLink    ? '<span class="badge badge-success">PDF</span>' : "")+
    '</div>'+
    '<h3 class="card-title">'+esc(r.Title)+'</h3>'+
    '<p class="card-desc">'+esc((r.Description||"").slice(0,110))+((r.Description||"").length>110?"…":"")+'</p>'+
    '<div class="card-footer resource-card-footer">'+
    '<span class="card-meta">✍️ '+esc(r.Author||"Staff")+'</span>'+
    '<button class="btn btn-primary btn-sm"'+(canOpen?' onclick="event.stopPropagation();route(\'reference\',{id:\''+esc(r.ID)+'\'})"':' disabled')+'>'+(canOpen?'View':'Unavailable')+'</button>'+
    '</div></div></div>';
}

function careerLabCard(l) {
  var canOpen = !!l.ID;
  var thumbVal = l.ThumbnailURL;
  var thumb = '';
  if (thumbVal) {
    var tv = String(thumbVal).trim();
    if (/^https?:\/\//.test(tv) || tv.charAt(0) === '/') {
      thumb = '<img loading="lazy" class="card-thumb" src="'+esc(tv)+'" alt="'+esc(l.Title)+'" onerror="this.parentElement.innerHTML=\'<div class=card-thumb-placeholder style=background:linear-gradient(135deg,#0f766e,#14b8a6)>🧠<\/div>\'">';
    } else if (isEmoji(tv)) {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#0f766e,#14b8a6)">'+esc(tv)+'</div>';
    } else {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#0f766e,#14b8a6)">🧠</div>';
    }
  } else {
    thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#0f766e,#14b8a6)">🧠</div>';
  }
  return '<div class="card resource-card"'+(canOpen?' style="cursor:pointer" onclick="route(\'career-lab-item\',{id:\''+esc(l.ID)+'\'})"':'')+'>'+thumb+
    '<div class="card-body">'+
    '<div class="resource-tags">'+
    '<span class="badge badge-primary">'+esc(l.Category||"Research")+'</span>'+
    (l.Student ? '<span class="badge" style="background:#e0f2fe;color:#075985">'+esc(l.Student)+'</span>' : '')+
    (l.YouTubeURL ? '<span class="badge" style="background:#fef2f2;color:#b91c1c">Video</span>' : '')+
    (l.PDFLink ? '<span class="badge badge-success">PDF</span>' : '')+
    '</div>'+
    '<h3 class="card-title">'+esc(l.Title)+'</h3>'+
    '<p class="card-desc">'+esc((l.Description||"").slice(0,110))+((l.Description||"").length>110?"…":"")+'</p>'+
    '<div class="card-footer resource-card-footer">'+
    '<span class="card-meta">👤 '+esc(l.Mentor||"Staff")+'</span>'+
    '<button class="btn btn-primary btn-sm"'+(canOpen?' onclick="event.stopPropagation();route(\'career-lab-item\',{id:\''+esc(l.ID)+'\'})"':' disabled')+'>'+(canOpen?'View':'Unavailable')+'</button>'+
    '</div></div></div>';
}

function postCard(p) {
  var canOpen = !!p.ID;
  var excerpt = stripHtml(p.Content||"").slice(0,115);
  var thumbVal = p.FeaturedImageURL;
  var thumb = '';
  if (thumbVal) {
    var tv = String(thumbVal).trim();
    if (/^https?:\/\//.test(tv) || tv.charAt(0) === '/') {
      thumb = '<img loading="lazy" class="card-thumb" src="'+esc(tv)+'" alt="'+esc(p.Title)+'" onerror="this.parentElement.innerHTML=\'<div class=card-thumb-placeholder style=background:linear-gradient(135deg,#553c9a,#805ad5)>✍️<\/div>\'">';
    } else if (isEmoji(tv)) {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#553c9a,#805ad5)">'+esc(tv)+'</div>';
    } else {
      thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#553c9a,#805ad5)">✍️</div>';
    }
  } else {
    thumb = '<div class="card-thumb-placeholder" style="background:linear-gradient(135deg,#553c9a,#805ad5)">✍️</div>';
  }
  var tags = p.Tags ? p.Tags.split(",").map(function(t){ t=t.trim(); return t?'<a class="tag-pill" style="font-size:.7rem" href="#" onclick="event.preventDefault();setBlogTag(\''+esc(t)+'\')">'+esc(t)+'</a>':""}).join("") : "";
  return '<div class="card resource-card"'+(canOpen?' style="cursor:pointer" onclick="route(\'post\',{id:\''+esc(p.ID)+'\'})"':'')+'>'+thumb+
    '<div class="card-body">'+
    '<h3 class="card-title">'+esc(p.Title)+'</h3>'+
    '<p class="card-desc">'+esc(excerpt)+(excerpt.length>=115?"…":"")+'</p>'+
    '<div class="resource-tags">'+
    (p.PDFLink ? '<span class="badge badge-success">PDF</span>' : '')+
    '</div>'+
    (tags?'<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">'+tags+'</div>':'')+
    '<div class="card-footer resource-card-footer">'+
    '<span class="card-meta">📅 '+esc(fmtDate(p.CreatedDate))+'</span>'+
    '<button class="btn btn-primary btn-sm"'+(canOpen?' onclick="event.stopPropagation();route(\'post\',{id:\''+esc(p.ID)+'\'})"':' disabled')+'>'+(canOpen?'Read':'Unavailable')+'</button>'+
    '</div></div></div>';
}

function renderLogin(errMsg) {
  document.getElementById("site-header").classList.add("hidden");
  document.getElementById("site-footer").classList.add("hidden");
  document.getElementById("mobile-dock").classList.add("hidden");
  document.getElementById("mobile-staff").classList.add("hidden");
  var cfg = _checkSupabaseConfig();
  var cfgMsg = cfg.ok ? "" : ("Supabase not configured: " + cfg.message + " Update SUPABASE_URL and SUPABASE_ANON_KEY in index.html.");
  var loginHint = '<div class="auth-points">' +
    '<div class="auth-point">Private access for school accounts</div>' +
    '<div class="auth-point">Course, blog, reference, and career lab tools</div>' +
    '<div class="auth-point">Fast search with accessible navigation</div>' +
    '</div>';
  document.getElementById("app").innerHTML =
    '<div class="auth-shell">' +
    '<div class="auth-orb auth-orb-a"></div>' +
    '<div class="auth-orb auth-orb-b"></div>' +
    '<div class="auth-grid">' +
    '<section class="auth-panel">' +
    '<div class="auth-kicker">Silver Oaks Career Council</div>' +
    '<h1>' + esc(APP_NAME) + '</h1>' +
    '<p class="auth-lead">A focused workspace for students and staff to discover courses, read guidance, review references, and publish career lab work.</p>' +
    loginHint +
    '<div class="auth-meta">Internal access only. Use your verified school account.</div>' +
    '</section>' +
    '<section class="auth-card">' +
    '<div class="auth-card-head">' +
    '<div class="auth-mark">SO</div>' +
    '<div>' +
    '<div class="auth-card-title">Sign in</div>' +
    '<div class="auth-card-subtitle">Use your @hyd.silveroaks.co.in Google account.</div>' +
    '</div></div>' +
    ((errMsg || cfgMsg) ? '<div class="alert alert-danger">⚠️ <span>'+esc(errMsg || cfgMsg)+'</span></div>' : '<div class="alert alert-info">🔐 <span>Secure access for the school community.</span></div>') +
    '<div id="g_signin_btn" class="auth-google"></div>' +
    '<p class="auth-note">If you are not on a verified school account, access will be blocked.</p>' +
    '</section>' +
    '</div></div>';

  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.renderButton(
      document.getElementById("g_signin_btn"),
      { theme: "outline", size: "large", width: 400 }
    );
  }
}

function render403() {
  document.getElementById("app").innerHTML =
    '<div class="panel"><div class="panel-icon">🚫</div>' +
    '<h2 style="color:var(--danger);font-weight:800">Access Denied</h2>' +
    '<p style="color:var(--muted);margin-top:8px">You need Admin or Editor role to view this page.</p>' +
    '<button class="btn btn-primary btn-lg mt-3" onclick="route(\'home\')">← Back to Home</button></div>';
}

function render404() {
  document.getElementById("app").innerHTML =
    '<div class="panel"><div class="panel-icon">🔍</div>' +
    '<h2 style="font-weight:800">Not Found</h2><p style="color:var(--muted);margin-top:8px">This page does not exist.</p>' +
    '<button class="btn btn-primary btn-lg mt-3" onclick="route(\'home\')">← Back to Home</button></div>';
}

function pageHome() {
  function featureRail(opts) {
    var classes = "section reveal-up home-section " + (opts.theme || "home-section-light");
    var btnClass = opts.theme === "home-section-dark" ? "btn home-dark-btn" : "btn btn-ghost";
    return (
      '<section class="' + classes + '"><div class="container">' +
      '<div class="home-section-head">' +
      '<div><p class="home-overline">' + opts.kicker + '</p><h2 class="home-section-title">' + opts.title + '</h2><p class="home-section-sub">' + opts.desc + '</p></div>' +
      '<button class="' + btnClass + '" onclick="route(\'' + opts.route + '\')">' + opts.cta + '</button></div>' +
      '<div class="spotlight-wrap ' + (opts.theme === "home-section-dark" ? "" : "spotlight-light") + '">' +
      '<button class="spotlight-nav" aria-label="Previous" onclick="moveSpotlight(\'' + opts.trackId + '\',-1)">‹</button>' +
      '<div class="spotlight-track" id="' + opts.trackId + '"><div class="spinner"></div></div>' +
      '<button class="spotlight-nav" aria-label="Next" onclick="moveSpotlight(\'' + opts.trackId + '\',1)">›</button>' +
      '</div></div></section>'
    );
  }

  var chips = ["Courses", "Career Labs", "References", "Videos", "Mentor Insights"]
    .map(function(label){ return '<span class="hero-chip">' + label + '</span>'; })
    .join("");

  var pathways = [
    {
      title: "Career Discovery",
      desc: "Find strengths, interests, and future pathways using curated guides and mentor tasks.",
      route: "references",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80"
    },
    {
      title: "Skill Building",
      desc: "Use focused micro-courses and challenge-based learning to build practical confidence.",
      route: "courses",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80"
    },
    {
      title: "Portfolio Readiness",
      desc: "Document projects, reflections, and research in the Career Lab for future applications.",
      route: "career-lab",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80"
    }
  ];

  var pathwayHtml = pathways.map(function(item) {
    return '<article class="pathway-card">' +
      '<img src="' + item.image + '" alt="' + esc(item.title) + '" loading="lazy" referrerpolicy="no-referrer">' +
      '<div class="pathway-body"><h3>' + esc(item.title) + '</h3><p>' + esc(item.desc) + '</p>' +
      '<button class="btn btn-sm" onclick="route(\'' + item.route + '\')">Explore</button></div></article>';
  }).join("");

  document.getElementById("app").innerHTML =
    '<section class="hero"><div class="hero-content">' +
    '<div class="hero-kicker">Silver Oaks Career Council</div>' +
    '<h1>Designed for Direction.<br>Built for Student Futures.</h1>' +
    '<p class="hero-tagline">One professional workspace for discovery, planning, and execution.</p>' +
    '<p>Access trusted resources, skill-based courses, expert reflections, and real student work through one focused platform.</p>' +
    '<div class="hero-cta"><div class="search-bar home-search">' +
    '<div class="ac-wrap"><input id="h-srch" type="text" placeholder="Search courses, blog posts, references..." autocomplete="off"><div class="ac-drop" id="h-ac"></div></div>' +
    '<button class="btn btn-accent btn-lg" onclick="doHomeSearch()">Search</button>' +
    '</div></div><div class="hero-chips">' + chips + '</div></div></section>' +
    '<section class="section reveal-up home-pathways"><div class="container">' +
    '<div class="home-section-head"><div><p class="home-overline">Guided Journey</p><h2 class="home-section-title">Three focused tracks for student growth</h2>' +
    '<p class="home-section-sub">Everything is structured so students can discover, build, and present with clarity.</p></div></div>' +
    '<div class="pathway-grid">' + pathwayHtml + '</div></div></section>' +
    featureRail({ kicker: "Curated Learning", title: "Featured Courses", desc: "Handpicked modules for real school outcomes.", cta: "View All Courses →", route: "courses", trackId: "home-courses", theme: "home-section-alt" }) +
    featureRail({ kicker: "Writing & Thought", title: "Latest from Blog", desc: "Career awareness, academic insights, and guidance notes.", cta: "View All Posts →", route: "blog", trackId: "home-posts", theme: "home-section-light" }) +
    featureRail({ kicker: "Reference Library", title: "Featured References", desc: "Reliable documents and practical materials for decision making.", cta: "View All References →", route: "references", trackId: "home-refs", theme: "home-section-alt" }) +
    featureRail({ kicker: "Student Work", title: "Career Laboratory", desc: "Research-backed student submissions and mentor-supported progress.", cta: "View All Labs →", route: "career-lab", trackId: "home-labs", theme: "home-section-dark" });

  initAC("h-srch", "h-ac");
  initRevealMotion(document.getElementById("app"));
  var hSrch = document.getElementById("h-srch");
  if (hSrch) hSrch.addEventListener("keydown", function(e) { if (e.key === "Enter") doHomeSearch(); });

  api("home", {}, function(data) {
    var cEl = document.getElementById("home-courses");
    if (cEl) cEl.innerHTML = (data.featuredCourses && data.featuredCourses.length)
      ? data.featuredCourses.map(courseCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No courses yet.</p></div>';
    initSpotlight("home-courses");

    var pEl = document.getElementById("home-posts");
    if (pEl) pEl.innerHTML = (data.featuredPosts && data.featuredPosts.length)
      ? data.featuredPosts.map(postCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No posts yet.</p></div>';
    initSpotlight("home-posts");

    var rEl = document.getElementById("home-refs");
    if (rEl) rEl.innerHTML = (data.featuredReferences && data.featuredReferences.length)
      ? data.featuredReferences.map(referenceCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No references yet.</p></div>';
    initSpotlight("home-refs");

    var lEl = document.getElementById("home-labs");
    if (lEl) lEl.innerHTML = (data.featuredCareerLabs && data.featuredCareerLabs.length)
      ? data.featuredCareerLabs.map(careerLabCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No career labs yet.</p></div>';
    initSpotlight("home-labs");
  });
}

function doHomeSearch() {
  var el = document.getElementById("h-srch");
  route("search", { q: el ? el.value.trim() : "" });
}

var _sState = { q: "" };
function pageSearch(opts) {
  if (opts) _sState.q = (opts.q || "").trim();
  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>🔎 Search Everything</h1><p>Find results across courses, blog posts, references, and career labs.</p></div></div>' +
    '<section class="section"><div class="container">' +
    '<div class="search-bar" style="max-width:none;margin-bottom:20px">' +
    '<div class="ac-wrap"><input id="gs-srch" type="text" placeholder="Search all resources…" value="'+esc(_sState.q)+'" autocomplete="off"><div class="ac-drop" id="gs-ac"></div></div>' +
    '<button class="btn btn-primary" onclick="runGlobalSearch()">Search</button>' +
    (_sState.q ? '<button class="btn btn-ghost" onclick="route(\'search\',{q:\'\'})">Clear</button>' : '') +
    '</div>' +
    '<div id="gs-out"><div class="spinner"></div></div>' +
    '</div></section>';

  initAC("gs-srch", "gs-ac");
  var inp = document.getElementById("gs-srch");
  if (inp) inp.addEventListener("keydown", function(e) { if (e.key === "Enter") runGlobalSearch(); });

  if (!_sState.q) {
    document.getElementById("gs-out").innerHTML = '<div class="empty"><div class="empty-icon">🧭</div><p>Type keywords to search all sections.</p></div>';
    return;
  }

  apiAsync("search", { q: _sState.q, limit: 12 }).then(function(res) {
    var total = (res.courses||[]).length + (res.posts||[]).length + (res.references||[]).length + (res.careerLabs||[]).length;
    var html = '<p style="margin-bottom:24px;color:var(--muted)">Found '+total+' result'+(total===1?'':'s')+' for <strong>"'+esc(_sState.q)+'"</strong>.</p>';

    function block(title, icon, rows, page, cardFn) {
      if (!rows || !rows.length) return '';
      return '<div class="reveal-up" style="margin-bottom:38px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
        '<h2 style="margin:0;font-size:1.45rem">'+icon+' '+title+'</h2>' +
        '<button class="btn btn-ghost" onclick="route(\''+page+'\',{q:\''+esc(_sState.q)+'\'})">Open '+title+' →</button>' +
        '</div>' +
        '<div class="grid-3">'+rows.map(cardFn).join('')+'</div></div>';
    }

    html += block("Courses", "📚", res.courses, "courses", courseCard);
    html += block("Blog Posts", "✍️", res.posts, "blog", postCard);
    html += block("References", "📎", res.references, "references", referenceCard);
    html += block("Career Labs", "🧠", res.careerLabs, "career-lab", careerLabCard);

    if (total === 0) html += '<div class="empty"><div class="empty-icon">📭</div><p>No results found. Try a different keyword.</p></div>';
    document.getElementById("gs-out").innerHTML = html;
    initRevealMotion(document.getElementById("gs-out"));
  }).catch(defaultErr);
}

function runGlobalSearch() {
  var el = document.getElementById("gs-srch");
  route("search", { q: el ? el.value.trim() : "" });
}

var _cState = { q:"", category:"", grade:"", offset:0 };

function pageCourses(opts) {
  if (opts) { _cState.q = opts.q||""; _cState.category = opts.category||""; _cState.grade = opts.grade||""; _cState.offset = opts.offset||0; }

  var GRADE_LABELS = ["Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>Courses</h1><p>Browse all published learning modules with structured filters.</p></div></div>' +
    '<section class="section"><div class="container catalog-shell">' +
    '<aside class="catalog-side">' +
    '<h4>Browse By</h4><p>Choose a class level and category.</p>' +
    '<div class="catalog-tools" style="margin-bottom:8px">' +
    '<button class="tag-pill '+ (_cState.grade===''?'active':'') +'" onclick="setGradeFilter(\'\')">All Classes</button>' +
    GRADE_LABELS.map(function(g){
      return '<button class="tag-pill '+ (_cState.grade===g?'active':'') +'" onclick="setGradeFilter(\''+g+'\')">' + g + '</button>';
    }).join("") +
    '</div>' +
    '<label class="form-label" style="margin-top:12px">Category</label>' +
    '<select id="c-cat" class="form-control" onchange="courseSearch()"><option value="">All Categories</option></select>' +
    (_cState.q||_cState.category||_cState.grade ? '<button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="clearCourseFilter()">Reset Filters</button>' : "") +
    '</aside>' +
    '<div class="catalog-main">' +
    '<div class="catalog-tools">' +
    '<div class="search-bar"><div class="ac-wrap"><input id="c-srch" type="text" placeholder="Search courses…" value="'+esc(_cState.q)+'" autocomplete="off"><div class="ac-drop" id="c-ac"></div></div>' +
    '<button class="btn btn-primary" onclick="courseSearch()">Search</button></div>' +
    '</div>' +
    '<p id="c-count" class="catalog-count"></p>' +
    '<div class="grid-3 catalog-grid" id="c-grid"><div class="spinner"></div></div>' +
    '<div class="pagination" id="c-pages"></div>' +
    '</div></div></section>';

  initAC("c-srch", "c-ac");

  apiAsync("courses", { search: _cState.q, category: _cState.category, grade: _cState.grade, offset: _cState.offset, limit: PAGE_SIZE }).then(function(result) {

    var grid = document.getElementById("c-grid");
    var cnt  = document.getElementById("c-count");
    var end  = Math.min(_cState.offset + PAGE_SIZE, result.total);
    if (cnt) {
      cnt.textContent = result.total
        ? "Showing "+(_cState.offset+1)+"–"+end+" of "+result.total+" courses"+(_cState.q?' matching "'+_cState.q+'"':"")+(_cState.category?" in "+_cState.category:"")+(_cState.grade?" · "+_cState.grade:"")
        : "No courses found for the selected filters.";
    }

    if (grid) grid.innerHTML = (result.rows && result.rows.length)
      ? result.rows.map(courseCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No courses found. <a href="#" onclick="clearCourseFilter()">Reset</a></p></div>';

    renderPagination("c-pages", result.total, _cState.offset, function(off) { _cState.offset = off; pageCourses(); });
    apiAsync("home", {}).then(function(meta) {
      var sel = document.getElementById("c-cat");
      if (sel && meta.categories) {
        meta.categories.forEach(function(cat) {
          var opt = document.createElement("option");
          opt.value = cat; opt.textContent = cat;
          if (_cState.category === cat) opt.selected = true;
          sel.appendChild(opt);
        });
      }
    }).catch(function(){});
  }).catch(defaultErr);
}

function courseSearch() {
  _cState.q        = (document.getElementById("c-srch")||{}).value || "";
  _cState.category = (document.getElementById("c-cat")||{}).value  || "";
  _cState.offset   = 0;
  pageCourses();
}
function setGradeFilter(g) { _cState.grade = g; _cState.offset = 0; pageCourses(); }
function clearCourseFilter() { _cState = {q:"",category:"",grade:"",offset:0}; pageCourses(); }

function pageCourse(id) {
  if (!id) { render404(); return; }
  document.getElementById("app").innerHTML = '<div class="container section"><div class="spinner"></div></div>';

  api("course", {id: id}, function(c) {
    var html = '<section class="section"><div class="container" style="max-width:820px">';

    
    html += '<div style="margin-bottom:10px">' +
      '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">' +
      '<span class="badge badge-primary">'+esc(c.Category||"General")+'</span>' +
      (c.Grade      ? '<span class="badge" style="background:#e0f2fe;color:#075985">'+esc(c.Grade)+'</span>' : "") +
      (c.Instructor ? '<span class="badge" style="background:rgba(232,25,44,.15);color:#fca5a5">👨‍🏫 '+esc(c.Instructor)+'</span>' : "") +
      '</div><h1>'+esc(c.Title)+'</h1>' +
      (c.Description ? '<p style="color:var(--muted);margin-top:7px">'+esc(c.Description)+'</p>' : "") +
      '</div>';

    
    if (c._embedUrl) {
      var thumbUrl = _youtubeThumb(c._embedUrl);
      html += '<div class="card mb-3"><div class="card-body" style="padding:18px 18px 12px"><h3>🎬 Video Lesson</h3></div>' +
        '<div style="position:relative;overflow:hidden;border-radius:var(--radius);background:#000">' +
        '<img src="'+esc(thumbUrl)+'" alt="video thumbnail" style="width:100%;display:block;opacity:.9">' +
        '<a href="'+esc(c.YouTubeURL)+'" target="_blank" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none;backdrop-filter:blur(2px)" title="Watch video">' +
        '<span style="background:rgba(255,0,0,.8);color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;transition:all .2s">▶</span>' +
        '</a></div></div>';
    }

    
    if (c._downloadUrl) {
      html += '<div class="pdf-box mb-3"><div class="pdf-icon">📄</div><div>' +
        '<h4>Course PDF</h4><p style="color:var(--muted);font-size:.85rem;margin-bottom:8px">Download the course materials.</p>' +
        '<a href="'+esc(c._downloadUrl)+'" target="_blank" class="btn btn-primary btn-sm">⬇ Download PDF</a>' +
        '</div></div>';
    }

    
    if (c.Content) {
      html += '<div class="card"><div class="card-body"><h3 style="margin-bottom:14px">📖 Course Content</h3>' +
        '<div class="rich-content" id="course-body"></div></div></div>';
    }

    html += '<div style="margin-top:28px"><button class="btn btn-ghost" onclick="route(\'courses\')">← Back to Courses</button></div>';
    html += '</div></section>';

    document.getElementById("app").innerHTML = html;
    if (c.Content) {
      var el = document.getElementById("course-body");
      if (el) el.innerHTML = c.Content;
    }
  }, function() { render404(); });
}

var _bState = { q:"", tag:"", offset:0 };

function pageBlog(opts) {
  if (opts) { _bState.q = opts.q||""; _bState.tag = opts.tag||""; _bState.offset = opts.offset||0; }

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>Blog</h1><p>Editorial updates, student guidance notes, and counselor insights.</p></div></div>' +
    '<section class="section"><div class="container catalog-shell">' +
    '<aside class="catalog-side">' +
    '<h4>Browse By</h4><p>Filter posts by tag topic.</p>' +
    '<div id="b-tags" class="catalog-tools"></div>' +
    (_bState.q||_bState.tag ? '<button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="clearBlogFilter()">Reset Filters</button>' : "") +
    '</aside>' +
    '<div class="catalog-main">' +
    '<div class="catalog-tools">' +
    '<div class="search-bar"><div class="ac-wrap"><input id="b-srch" type="text" placeholder="Search posts…" value="'+esc(_bState.q)+'" autocomplete="off"><div class="ac-drop" id="b-ac"></div></div>' +
    '<button class="btn btn-primary" onclick="blogSearch()">Search</button></div>' +
    '</div>' +
    '<p id="b-count" class="catalog-count"></p>' +
    '<div class="grid-3 catalog-grid" id="b-grid"><div class="spinner"></div></div>' +
    '<div class="pagination" id="b-pages"></div>' +
    '</div></div></section>';

  initAC("b-srch", "b-ac");

  apiAsync("posts", { search: _bState.q, tag: _bState.tag, offset: _bState.offset, limit: PAGE_SIZE }).then(function(result) {

    var grid = document.getElementById("b-grid");
    var cnt  = document.getElementById("b-count");
    if (cnt) cnt.textContent = result.total
      ? result.total + " post"+(result.total!==1?"s":"")+(_bState.q?' matching "'+_bState.q+'"':"")+(_bState.tag?" tagged #"+_bState.tag:"")
      : "No blog posts found for the selected filters.";

    if (grid) grid.innerHTML = (result.rows && result.rows.length)
      ? result.rows.map(postCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No posts found. <a href="#" onclick="clearBlogFilter()">Reset</a></p></div>';

    renderPagination("b-pages", result.total, _bState.offset, function(off) { _bState.offset = off; pageBlog(); });
    apiAsync("home", {}).then(function(meta) {
      var bar = document.getElementById("b-tags");
      if (bar && meta.allTags && meta.allTags.length) {
        bar.innerHTML = '<a class="tag-pill'+(!_bState.tag?" active":"")+'" href="#" onclick="event.preventDefault();setBlogTag(\'\')">All</a>' +
          meta.allTags.map(function(t) {
            return '<a class="tag-pill'+(_bState.tag===t?" active":"")+'" href="#" onclick="event.preventDefault();setBlogTag(\''+esc(t)+'\')">'+esc(t)+'</a>';
          }).join("");
      }
    }).catch(function(){});
  }).catch(defaultErr);
}

function blogSearch() { _bState.q = (document.getElementById("b-srch")||{}).value||""; _bState.offset=0; pageBlog(); }
function setBlogTag(tag) { _bState.tag=tag; _bState.offset=0; pageBlog(); }
function clearBlogFilter() { _bState={q:"",tag:"",offset:0}; pageBlog(); }

function pagePost(id) {
  if (!id) { render404(); return; }
  document.getElementById("app").innerHTML = '<div class="container section"><div class="spinner"></div></div>';

  api("post", {id: id}, function(p) {
    var html = '<section class="section"><div class="container" style="max-width:800px">';

    html += '<h1>'+esc(p.Title)+'</h1>' +
      '<div class="post-meta">' +
      '<span>📅 '+esc(fmtDate(p.CreatedDate))+'</span>' +
      (p.AuthorEmail ? '<span>✍️ '+esc(p.AuthorEmail.split("@")[0])+'</span>' : "") +
      (p.Tags ? '<span>🏷 '+esc(p.Tags)+'</span>' : "") +
      '</div><hr style="border:none;border-top:1px solid var(--border);margin-bottom:24px">' +
      '<div class="rich-content" id="post-body"></div>';

    if (p._downloadUrl) {
      html += '<div class="pdf-box mb-3" style="margin-top:18px"><div class="pdf-icon">📄</div><div>' +
        '<h4>Blog PDF</h4><p style="color:var(--muted);font-size:.85rem;margin-bottom:8px">Download the attached file.</p>' +
        '<a href="'+esc(p._downloadUrl)+'" target="_blank" class="btn btn-primary btn-sm">⬇ Download PDF</a>' +
        '</div></div>';
    }

    if (p.Tags) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:22px">' +
        p.Tags.split(",").map(function(t) {
          t = t.trim();
          return t ? '<a class="tag-pill" href="#" onclick="event.preventDefault();route(\'blog\',{tag:\''+esc(t)+'\'})">'+esc(t)+'</a>' : "";
        }).join("") + '</div>';
    }

    html += '<div style="margin-top:32px"><button class="btn btn-ghost" onclick="route(\'blog\')">← Back to Blog</button></div>';
    html += '</div></section>';

    document.getElementById("app").innerHTML = html;
    var el = document.getElementById("post-body");
    if (el) el.innerHTML = p.Content || "";
  }, function() { render404(); });
}

var _rState = { q:"", category:"", offset:0 };

function pageReferences(opts) {
  if (opts) { _rState.q = opts.q||""; _rState.category = opts.category||""; _rState.offset = opts.offset||0; }

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>References</h1><p>Trusted resources, documents, and supporting study material.</p></div></div>' +
    '<section class="section"><div class="container catalog-shell">' +
    '<aside class="catalog-side">' +
    '<h4>Browse By</h4><p>Filter references by category.</p>' +
    '<label class="form-label">Category</label>' +
    '<select id="r-cat" class="form-control" onchange="refSearch()"><option value="">All Categories</option></select>' +
    (_rState.q||_rState.category ? '<button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="clearRefFilter()">Reset Filters</button>' : "") +
    '</aside>' +
    '<div class="catalog-main">' +
    '<div class="catalog-tools">' +
    '<div class="search-bar"><div class="ac-wrap"><input id="r-srch" type="text" placeholder="Search references…" value="'+esc(_rState.q)+'" autocomplete="off"><div class="ac-drop" id="r-ac"></div></div>' +
    '<button class="btn btn-primary" onclick="refSearch()">Search</button></div>' +
    '</div>' +
    '<p id="r-count" class="catalog-count"></p>' +
    '<div class="grid-3 catalog-grid" id="r-grid"><div class="spinner"></div></div>' +
    '<div class="pagination" id="r-pages"></div>' +
    '</div></div></section>';

  initAC("r-srch", "r-ac");

  apiAsync("references", { search: _rState.q, category: _rState.category, offset: _rState.offset, limit: PAGE_SIZE }).then(function(result) {

    var grid = document.getElementById("r-grid");
    var cnt  = document.getElementById("r-count");
    var end  = Math.min(_rState.offset + PAGE_SIZE, result.total);
    if (cnt) {
      cnt.textContent = result.total
        ? "Showing "+(_rState.offset+1)+"–"+end+" of "+result.total+" references"+(_rState.q?' matching "'+_rState.q+'"':"")+(_rState.category?" in "+_rState.category:"")
        : "No references found for the selected filters.";
    }

    if (grid) grid.innerHTML = (result.rows && result.rows.length)
      ? result.rows.map(referenceCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No references found. <a href="#" onclick="clearRefFilter()">Reset</a></p></div>';

    renderPagination("r-pages", result.total, _rState.offset, function(off) { _rState.offset = off; pageReferences(); });
    apiAsync("home", {}).then(function(meta) {
      var sel = document.getElementById("r-cat");
      if (sel && meta.refCategories) {
        meta.refCategories.forEach(function(cat) {
          var opt = document.createElement("option");
          opt.value = cat; opt.textContent = cat;
          if (_rState.category === cat) opt.selected = true;
          sel.appendChild(opt);
        });
      }
    }).catch(function(){});
  }).catch(defaultErr);
}

function refSearch() {
  _rState.q        = (document.getElementById("r-srch")||{}).value || "";
  _rState.category = (document.getElementById("r-cat")||{}).value  || "";
  _rState.offset   = 0;
  pageReferences();
}
function clearRefFilter() { _rState = {q:"",category:"",offset:0}; pageReferences(); }

function pageReference(id) {
  if (!id) { render404(); return; }
  document.getElementById("app").innerHTML = '<div class="container section"><div class="spinner"></div></div>';

  api("reference", {id: id}, function(r) {
    var html = '<section class="section"><div class="container" style="max-width:820px">';  

    html += '<div style="margin-bottom:10px">' +
      '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">' +
      '<span class="badge badge-primary">'+esc(r.Category||"General")+'</span>' +
      (r.Author ? '<span class="badge" style="background:rgba(45,106,79,.15);color:#2d6a4f">✍️ '+esc(r.Author)+'</span>' : "") +
      '</div><h1>'+esc(r.Title)+'</h1>' +
      (r.Description ? '<p style="color:var(--muted);margin-top:7px">'+esc(r.Description)+'</p>' : "") +
      '</div>';

    if (r._embedUrl) {
      var thumbUrl = _youtubeThumb(r._embedUrl);
      html += '<div class="card mb-3"><div class="card-body" style="padding:18px 18px 12px"><h3>🎬 Video</h3></div>' +
        '<div style="position:relative;overflow:hidden;border-radius:var(--radius);background:#000">' +
        '<img src="'+esc(thumbUrl)+'" alt="video thumbnail" style="width:100%;display:block;opacity:.9">' +
        '<a href="'+esc(r.YouTubeURL)+'" target="_blank" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none;backdrop-filter:blur(2px)" title="Watch video">' +
        '<span style="background:rgba(255,0,0,.8);color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;transition:all .2s">▶</span>' +
        '</a></div></div>';
    }

    if (r._downloadUrl) {
      html += '<div class="pdf-box mb-3"><div class="pdf-icon">📄</div><div>' +
        '<h4>Reference PDF</h4><p style="color:var(--muted);font-size:.85rem;margin-bottom:8px">Download the reference material.</p>' +
        '<a href="'+esc(r._downloadUrl)+'" target="_blank" class="btn btn-primary btn-sm">⬇ Download PDF</a>' +
        '</div></div>';
    }

    if (r.Content) {
      html += '<div class="card"><div class="card-body"><h3 style="margin-bottom:14px">📖 Content</h3>' +
        '<div class="rich-content" id="ref-body"></div></div></div>';
    }

    html += '<div style="margin-top:28px"><button class="btn btn-ghost" onclick="route(\'references\')">← Back to References</button></div>';
    html += '</div></section>';

    document.getElementById("app").innerHTML = html;
    if (r.Content) {
      var el = document.getElementById("ref-body");
      if (el) el.innerHTML = r.Content;
    }
  }, function() { render404(); });
}

var _lState = { q:"", category:"", student:"", offset:0 };

function pageCareerLabs(opts) {
  if (opts) { _lState.q = opts.q||""; _lState.category = opts.category||""; _lState.student = opts.student||""; _lState.offset = opts.offset||0; }

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>Career Laboratory</h1><p>Student research projects, mentor notes, video explainers, and downloadable reports.</p></div></div>' +
    '<section class="section"><div class="container catalog-shell">' +
    '<aside class="catalog-side">' +
    '<h4>Browse By</h4><p>Filter career labs by category.</p>' +
    '<label class="form-label">Category</label>' +
    '<select id="l-cat" class="form-control" onchange="labSearch()"><option value="">All Categories</option></select>' +
    (_lState.q||_lState.category||_lState.student ? '<button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="clearLabFilter()">Reset Filters</button>' : '') +
    '</aside>' +
    '<div class="catalog-main">' +
    '<div class="catalog-tools">' +
    '<div class="search-bar"><div class="ac-wrap"><input id="l-srch" type="text" placeholder="Search career labs…" value="'+esc(_lState.q)+'" autocomplete="off"><div class="ac-drop" id="l-ac"></div></div>' +
    '<button class="btn btn-primary" onclick="labSearch()">Search</button></div>' +
    '</div>' +
    '<p id="l-count" class="catalog-count"></p>' +
    '<div class="grid-3 catalog-grid" id="l-grid"><div class="spinner"></div></div>' +
    '<div class="pagination" id="l-pages"></div>' +
    '</div></div></section>';

  initAC("l-srch", "l-ac");

  apiAsync("careerLabs", { search: _lState.q, category: _lState.category, student: _lState.student, offset: _lState.offset, limit: PAGE_SIZE }).then(function(result) {

    var grid = document.getElementById("l-grid");
    var cnt  = document.getElementById("l-count");
    var end  = Math.min(_lState.offset + PAGE_SIZE, result.total);
    if (cnt) {
      cnt.textContent = result.total
        ? "Showing "+(_lState.offset+1)+"–"+end+" of "+result.total+" career labs"+(_lState.q?' matching "'+_lState.q+'"':"")+(_lState.category?" in "+_lState.category:"")+(_lState.student?" for "+_lState.student:"")
        : "No career labs found for the selected filters.";
    }

    if (grid) grid.innerHTML = (result.rows && result.rows.length)
      ? result.rows.map(careerLabCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📭</div><p>No career labs found. <a href="#" onclick="clearLabFilter()">Reset</a></p></div>';

    renderPagination("l-pages", result.total, _lState.offset, function(off) { _lState.offset = off; pageCareerLabs(); });
    apiAsync("home", {}).then(function(meta) {
      var sel = document.getElementById("l-cat");
      if (sel && meta.labCategories) {
        meta.labCategories.forEach(function(cat) {
          var opt = document.createElement("option");
          opt.value = cat; opt.textContent = cat;
          if (_lState.category === cat) opt.selected = true;
          sel.appendChild(opt);
        });
      }
    }).catch(function(){});
  }).catch(defaultErr);
}

function labSearch() {
  _lState.q        = (document.getElementById("l-srch")||{}).value || "";
  _lState.category = (document.getElementById("l-cat")||{}).value  || "";
  _lState.offset   = 0;
  pageCareerLabs();
}

function clearLabFilter() { _lState = {q:"",category:"",student:"",offset:0}; pageCareerLabs(); }

function pageCareerLab(id) {
  if (!id) { render404(); return; }
  document.getElementById("app").innerHTML = '<div class="container section"><div class="spinner"></div></div>';

  api("careerLab", {id: id}, function(l) {
    var html = '<section class="section"><div class="container" style="max-width:820px">';

    html += '<div style="margin-bottom:10px">' +
      '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">' +
      '<span class="badge badge-primary">'+esc(l.Category||"Research")+'</span>' +
      (l.Student ? '<span class="badge" style="background:#e0f2fe;color:#075985">'+esc(l.Student)+'</span>' : '') +
      (l.Mentor ? '<span class="badge" style="background:rgba(45,106,79,.15);color:#2d6a4f">👤 '+esc(l.Mentor)+'</span>' : '') +
      '</div><h1>'+esc(l.Title)+'</h1>' +
      (l.Description ? '<p style="color:var(--muted);margin-top:7px">'+esc(l.Description)+'</p>' : '') +
      '</div>';

    if (l._embedUrl) {
      var thumbUrl = _youtubeThumb(l._embedUrl);
      html += '<div class="card mb-3"><div class="card-body" style="padding:18px 18px 12px"><h3>🎬 Research Video</h3></div>' +
        '<div style="position:relative;overflow:hidden;border-radius:var(--radius);background:#000">' +
        '<img src="'+esc(thumbUrl)+'" alt="video thumbnail" style="width:100%;display:block;opacity:.9">' +
        '<a href="'+esc(l.YouTubeURL)+'" target="_blank" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none;backdrop-filter:blur(2px)" title="Watch video">' +
        '<span style="background:rgba(255,0,0,.8);color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;transition:all .2s">▶</span>' +
        '</a></div></div>';
    }

    if (l._downloadUrl) {
      html += '<div class="pdf-box mb-3"><div class="pdf-icon">📄</div><div>' +
        '<h4>Research PDF</h4><p style="color:var(--muted);font-size:.85rem;margin-bottom:8px">Download the attached material.</p>' +
        '<a href="'+esc(l._downloadUrl)+'" target="_blank" class="btn btn-primary btn-sm">⬇ Download PDF</a>' +
        '</div></div>';
    }

    if (l.Content) {
      html += '<div class="card"><div class="card-body"><h3 style="margin-bottom:14px">📖 Content</h3>' +
        '<div class="rich-content" id="lab-body"></div></div></div>';
    }

    html += '<div style="margin-top:28px"><button class="btn btn-ghost" onclick="route(\'career-lab\')">← Back to Career Lab</button></div>';
    html += '</div></section>';

    document.getElementById("app").innerHTML = html;
    if (l.Content) {
      var el = document.getElementById("lab-body");
      if (el) el.innerHTML = l.Content;
    }
  }, function() { render404(); });
}

function pageStaff() {
  document.getElementById("app").innerHTML =
    '<section class="staff-hero">' +
    '<div class="staff-shell">' +
    '<h1>Content Library</h1>' +
    '<p>Manage courses, posts, references, and Career Lab entries from one minimal workspace. Each content type stays separated as your archive grows.</p>' +
    '<div class="staff-kpis" id="stat-grid"><div class="spinner"></div></div>' +
    '</div></section>' +
    '<section class="section"><div class="staff-shell">' +
    '<div class="library-grid" id="staff-library"><div class="spinner"></div></div>' +
    '<div class="staff-users" id="users-table-wrap"><div class="spinner"></div></div>' +
    '</div></section>';

  Promise.all([
    apiAsync("stats", {}),
    apiAsync("allCourses", {}),
    apiAsync("allPosts", {}),
    apiAsync("allReferences", {}),
    apiAsync("allCareerLabs", {}),
    apiAsync("allUsers", {})
  ]).then(function(results) {
    var s = results[0];
    var courses = results[1];
    var posts = results[2];
    var refs = results[3];
    var labs = results[4];
    var users = results[5];

    document.getElementById("stat-grid").innerHTML = [
      {num:s.totalCourses, label:"Courses", published:s.publishedCourses},
      {num:s.totalBlogs, label:"Posts", published:s.publishedBlogs},
      {num:s.totalReferences, label:"References", published:s.publishedReferences},
      {num:s.totalCareerLabs, label:"Career Labs", published:s.publishedCareerLabs},
      {num:s.activeUsers, label:"Active Users", published:"—"}
    ].map(function(x) {
      var num = x.num == null ? 0 : x.num;
      var publishedMeta = (x.published !== "—" && x.published != null)
        ? '<div class="kpi-meta">' + esc(x.published) + ' published</div>'
        : '';
      return '<div class="kpi-card"><div class="kpi-value">' + esc(num) + '</div><div class="kpi-label">' + esc(x.label) + '</div>' +
        publishedMeta +
        '</div>';
    }).join("");

    var libraries = [
      {
        icon: "📚",
        title: "Courses",
        action: "route('staff-course-form',{course:null})",
        items: courses,
        getTitle: function(item) { return item.Title; },
        getDesc: function(item) { return (item.Category ? item.Category + " • " : "") + (item.Grade ? "Grade " + item.Grade : ""); },
        getStatus: function(item) { return item.Status; },
        onEdit: function(item) { return "_editCourse('" + esc(item.ID) + "')"; },
        onDelete: function(item) { return "_delCourse('" + esc(item.ID) + "')"; }
      },
      {
        icon: "✍️",
        title: "Blog Posts",
        action: "route('staff-blog-form',{post:null})",
        items: posts,
        getTitle: function(item) { return item.Title; },
        getDesc: function(item) { return fmtDate(item.CreatedDate); },
        getStatus: function(item) { return item.Status; },
        onEdit: function(item) { return "_editPost('" + esc(item.ID) + "')"; },
        onDelete: function(item) { return "_delPost('" + esc(item.ID) + "')"; }
      },
      {
        icon: "📎",
        title: "References",
        action: "route('staff-reference-form',{ref:null})",
        items: refs,
        getTitle: function(item) { return item.Title; },
        getDesc: function(item) { return item.Category || "Uncategorized"; },
        getStatus: function(item) { return item.Status; },
        onEdit: function(item) { return "_editReference('" + esc(item.ID) + "')"; },
        onDelete: function(item) { return "_delReference('" + esc(item.ID) + "')"; }
      },
      {
        icon: "🧠",
        title: "Career Laboratory",
        action: "route('staff-careerlab-form',{lab:null})",
        items: labs,
        getTitle: function(item) { return item.Title; },
        getDesc: function(item) { return (item.Student ? item.Student + " • " : "") + (item.Mentor ? "Mentor: " + item.Mentor : ""); },
        getStatus: function(item) { return item.Status; },
        onEdit: function(item) { return "_editCareerLab('" + esc(item.ID) + "')"; },
        onDelete: function(item) { return "_delCareerLab('" + esc(item.ID) + "')"; }
      }
    ];

    var libraryHtml = libraries.map(function(lib) {
      var count = lib.items.length;
      var published = lib.items.filter(function(i) { return lib.getStatus(i) === "Published"; }).length;
      var itemsHtml = lib.items.length ? lib.items.map(function(item) {
        var status = lib.getStatus(item);
        return '<div class="library-item">' +
          '<div style="min-width:0;flex:1">' +
          '<div class="library-item-title">' + esc(lib.getTitle(item)) + '</div>' +
          '<div class="library-item-meta">' + esc(lib.getDesc(item)) + '</div>' +
          '</div>' +
          '<div class="library-actions">' +
          '<span class="status-chip ' + (status === "Published" ? 'is-published' : 'is-draft') + '">' + esc(status) + '</span>' +
          '<button class="btn btn-ghost btn-sm" onclick="' + lib.onEdit(item) + '">Edit</button>' +
          '<button class="btn btn-danger btn-sm" onclick="' + lib.onDelete(item) + '">Delete</button>' +
          '</div>' +
          '</div>';
      }).join("") : '<div class="empty-inline">No items yet</div>';

      return '<article class="library-card">' +
        '<div class="library-head">' +
        '<div><h3 class="library-title">' + esc(lib.icon) + ' ' + esc(lib.title) + '</h3><div class="library-sub">' + esc(count) + ' total • ' + esc(published) + ' published</div></div>' +
        '<button class="btn btn-primary btn-sm" onclick="' + lib.action + '">+ Add</button>' +
        '</div>' +
        '<div class="library-list">' + itemsHtml + '</div>' +
        '</article>';
    }).join("");

    var usersCard = '<div class="staff-users-head"><h3 class="library-title">👥 User Management</h3><div class="staff-users-note">Change roles for editors and students without leaving the portal. Admins keep full access.</div></div>';

    if (users && users.length) {
      var roles = ["Student","Editor","Admin"];
      usersCard += '<div class="staff-users-body"><div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>' +
        users.map(function(u) {
          var isSelf = u.Email === APP_USER.email;
          var sel = '<select class="form-control" style="padding:5px 8px;font-size:.82rem;width:auto;border-radius:8px" id="role-'+esc(u.Email)+'">'+
            roles.map(function(r){ return '<option value="'+r+'"'+(u.Role===r?' selected':'')+'>'+r+'</option>'; }).join("") +
            '</select>';
          var deleteBtn = isSelf ? '' : '<button class="btn btn-danger btn-sm" onclick="_deleteUser(\''+esc(u.Email)+'\')">Delete</button>';
          return '<tr><td style="font-weight:500">'+esc(u.Name||"—")+'</td><td style="font-size:.82rem;color:var(--muted)">'+esc(u.Email)+'</td><td>'+sel+'</td>'+
                 '<td><div class="actions"><button class="btn btn-primary btn-sm" style="font-size:.75rem" onclick="_updateRole(\''+esc(u.Email)+'\')">Save</button>'+deleteBtn+'</div></td></tr>';
        }).join("") +
        '</tbody></table></div></div>';
    } else {
      usersCard += '<div class="staff-users-body"><div class="empty-inline">No users yet</div></div>';
    }
    document.getElementById("staff-library").innerHTML = libraryHtml;
    document.getElementById("users-table-wrap").innerHTML = usersCard;
  }).catch(defaultErr);
}

function buildAdminTable(rows, cols, cellsFn, actionsFn) {
  if (!rows || !rows.length) return '<div class="empty"><div class="empty-icon">📭</div><p>None yet.</p></div>';
  return '<div style="overflow-x:auto"><table class="data-table"><thead><tr>' +
    cols.map(function(c){ return '<th>'+esc(c)+'</th>'; }).join("") + '<th>Actions</th>' +
    '</tr></thead><tbody>' +
    rows.map(function(row) {
      return '<tr>'+cellsFn(row).map(function(v){ return '<td>'+v+'</td>'; }).join("")+
             '<td><div class="actions">'+actionsFn(row)+'</div></td></tr>';
    }).join("") +
    '</tbody></table></div>';
}

function _editCourse(id) {
  api("allCourses", {}, function(courses) {
    var c = courses.find(function(x){ return x.ID === id; });
    route("staff-course-form", { course: c || null });
  });
}
function _editPost(id) {
  api("allPosts", {}, function(posts) {
    var p = posts.find(function(x){ return x.ID === id; });
    route("staff-blog-form", { post: p || null });
  });
}
function _delCourse(id) {
  if (!confirm("Delete this course? This cannot be undone.")) return;
  apiPost("deleteCourse", {id: id}, function() { toast("Course deleted."); pageStaff(); });
}
function _delPost(id) {
  if (!confirm("Delete this post? This cannot be undone.")) return;
  apiPost("deletePost", {id: id}, function() { toast("Post deleted."); pageStaff(); });
}
function _editReference(id) {
  api("allReferences", {}, function(refs) {
    var r = refs.find(function(x){ return x.ID === id; });
    route("staff-reference-form", { ref: r || null });
  });
}
function _delReference(id) {
  if (!confirm("Delete this reference? This cannot be undone.")) return;
  apiPost("deleteReference", {id: id}, function() { toast("Reference deleted."); pageStaff(); });
}
function _editCareerLab(id) {
  api("allCareerLabs", {}, function(labs) {
    var lab = labs.find(function(x){ return x.ID === id; });
    route("staff-careerlab-form", { lab: lab || null });
  });
}
function _delCareerLab(id) {
  if (!confirm("Delete this career lab entry? This cannot be undone.")) return;
  apiPost("deleteCareerLab", {id: id}, function() { toast("Career Lab entry deleted."); pageStaff(); });
}
function _updateRole(email) {
  var sel = document.getElementById("role-" + email);
  if (!sel) return;
  var newRole = sel.value;
  if (!confirm("Change role of " + email + " to " + newRole + "?")) return;
  apiPost("updateUserRole", {email: email, role: newRole}, function() {
    toast("Role updated to " + newRole + " for " + email + " ✓");
    pageStaff();
  });
}

function _deleteUser(email) {
  if (!confirm("Delete " + email + " and all related records/attachments from Supabase?\nThis action cannot be undone.")) return;
  apiPost("deleteUser", {email: email}, function() {
    toast("User and related records deleted.");
    pageStaff();
  });
}

function drawBarChart(canvas, data) {
  var keys = Object.keys(data);
  if (!keys.length) { canvas.style.display="none"; return; }
  var ctx = canvas.getContext("2d");
  var W   = canvas.offsetWidth || 500;
  canvas.width = W; canvas.height = 120;
  var bW = (W - 40) / keys.length - 8;
  var max = Math.max.apply(null, keys.map(function(k){ return data[k]; }));
  var clrs = ["#1e3a5f","#2d6a9f","#f0b429","#2f855a","#c53030","#553c9a","#dd6b20"];
  keys.forEach(function(key, i) {
    var val = data[key];
    var bh  = Math.round((val / max) * 80);
    var x   = 20 + i * (bW + 8);
    var y   = 100 - bh;
    ctx.fillStyle = clrs[i % clrs.length];
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, bW, bh, 4); else ctx.rect(x, y, bW, bh);
    ctx.fill();
    ctx.fillStyle = "#1a202c"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(key.slice(0,10), x + bW/2, 115);
    ctx.fillStyle = "#fff";
    ctx.fillText(val, x + bW/2, y + 14);
  });
}

function pageStaffCourseForm(course) {
  var isEdit = course && course.ID;
  var v = function(f){ return isEdit ? esc(course[f]||"") : ""; };
  var toolbarHTML = ['Bold','Italic','Underline','H2','H3','UL','OL','Link','Quote'].map(function(c){
    return '<button type="button" onclick="fmt(\''+c+'\')">'+c+'</button>';
  }).join("");

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>'+(isEdit?"Edit":"Add")+' Course</h1></div></div>' +
    '<section class="section"><div class="container" style="max-width:720px"><div class="card"><div class="card-body">' +
    (isEdit ? '<input type="hidden" id="f-id" value="'+v("ID")+'">' : "") +
    '<div class="form-group"><label class="form-label">Title <span class="req">*</span></label>' +
    '<input id="f-title" class="form-control" value="'+v("Title")+'" placeholder="Course title"></div>' +
    '<div class="form-group"><label class="form-label">Description</label>' +
    '<textarea id="f-desc" class="form-control">'+v("Description")+'</textarea></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Instructor</label><input id="f-instr" class="form-control" value="'+v("Instructor")+'"></div>' +
    '<div class="form-group"><label class="form-label">Category</label><input id="f-cat" class="form-control" value="'+v("Category")+'" placeholder="e.g. Career, Resume…"></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">Grade / Class Level</label>' +
    '<select id="f-grade" class="form-control">' +
    '<option value="">— Select grade —</option>' +
    ['Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'].map(function(g){
      return '<option value="'+g+'"'+(isEdit&&course.Grade===g?' selected':'')+'>'+g+'</option>';
    }).join("") +
    '</select></div>' +
    '<div class="form-group"><label class="form-label">Thumbnail</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="f-thumb-file" accept="image/*" class="form-control" style="padding:6px" onchange="previewThumb(this)">' +
    '<span id="f-thumb-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<img id="f-thumb-img" src="'+v("ThumbnailURL")+'" style="max-height:120px;border-radius:8px;border:1px solid #ddd;display:'+(isEdit&&course&&course.ThumbnailURL?'block':'none')+'">' +
    '<div style="font-size:.8rem;color:var(--muted)">— or paste a URL directly —</div>' +
    '<input id="f-thumb" class="form-control" value="'+v("ThumbnailURL")+'" placeholder="https://…">' +
    '</div></div>' +
    '<div class="form-group"><label class="form-label">YouTube URL</label>' +
    '<input id="f-yt" class="form-control" value="'+v("YouTubeURL")+'" placeholder="https://www.youtube.com/watch?v=…"></div>' +
    '<div class="form-group"><label class="form-label">PDF Google Drive Link</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="f-pdf-file" accept="application/pdf" class="form-control" style="padding:6px" onchange="previewCoursePdf(this)">' +
    '<span id="f-pdf-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<input id="f-pdf" class="form-control" value="'+v("PDFLink")+'" placeholder="https://drive.google.com/file/d/…">' +
    '<div class="form-hint">Upload a PDF or paste a Google Drive share link.</div></div></div>' +
    '<div class="form-group"><label class="form-label">Content</label>' +
    '<div class="toolbar">'+toolbarHTML+'</div>' +
    '<div id="f-content" class="editor" contenteditable="true">'+(isEdit&&course.Content?course.Content:"")+'</div></div>' +
    '<div class="form-group"><label class="form-label">Status</label>' +
    '<select id="f-status" class="form-control">' +
    '<option value="Draft"'+(isEdit&&course.Status==="Draft"?" selected":"")+'>Draft</option>' +
    '<option value="Published"'+(isEdit&&course.Status==="Published"?" selected":"")+'>Published</option>' +
    '</select></div>' +
    '<div style="display:flex;gap:10px;margin-top:8px">' +
    '<button class="btn btn-primary" onclick="submitCourse()">💾 Save Course</button>' +
    '<button class="btn btn-ghost" onclick="route(\'staff\')">Cancel</button>' +
    '</div></div></div></div></section>';
}

function previewThumb(input) { uploadFileToField(input, "f-thumb", "f-thumb-status", "f-thumb-img", "Thumbnail"); }

function submitCourse() {
  var idEl = document.getElementById("f-id");
  var payload = {
    id:          idEl ? idEl.value : "",
    title:       (document.getElementById("f-title") ||{}).value || "",
    description: (document.getElementById("f-desc")  ||{}).value || "",
    instructor:  (document.getElementById("f-instr") ||{}).value || "",
    category:    (document.getElementById("f-cat")   ||{}).value || "",
    grade:       (document.getElementById("f-grade") ||{}).value || "",
    thumbnailUrl:(document.getElementById("f-thumb") ||{}).value || "",
    youtubeUrl:  (document.getElementById("f-yt")    ||{}).value || "",
    pdfLink:     (document.getElementById("f-pdf")   ||{}).value || "",
    content:     (document.getElementById("f-content")||{}).innerHTML || "",
    status:      (document.getElementById("f-status")||{}).value || "Draft",
  };
  if (!payload.title.trim()) { toast("Title is required.", "err"); return; }
  apiPost("saveCourse", {data: payload}, function() { toast("Course saved! \uD83C\uDF89"); route("staff"); });
}

function pageStaffReferenceForm(ref) {
  var isEdit = ref && ref.ID;
  var v = function(f){ return isEdit ? esc(ref[f]||""): ""; };
  var toolbarHTML = ['Bold','Italic','Underline','H2','H3','UL','OL','Link','Quote'].map(function(c){
    return '<button type="button" onclick="fmt(\''+c+'\')">' + c + '</button>';
  }).join("");

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>'+(isEdit?"Edit":"Add")+' Reference</h1></div></div>' +
    '<section class="section"><div class="container" style="max-width:720px"><div class="card"><div class="card-body">' +
    (isEdit ? '<input type="hidden" id="rf-id" value="'+v("ID")+'">' : "") +
    '<div class="form-group"><label class="form-label">Title <span class="req">*</span></label>' +
    '<input id="rf-title" class="form-control" value="'+v("Title")+'" placeholder="Reference title"></div>' +
    '<div class="form-group"><label class="form-label">Description</label>' +
    '<textarea id="rf-desc" class="form-control">'+v("Description")+'</textarea></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Author</label><input id="rf-author" class="form-control" value="'+v("Author")+'" placeholder="e.g. Career Council Team"></div>' +
    '<div class="form-group"><label class="form-label">Category</label><input id="rf-cat" class="form-control" value="'+v("Category")+'" placeholder="e.g. General, Skills…"></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">Thumbnail</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="rf-thumb-file" accept="image/*" class="form-control" style="padding:6px" onchange="previewRefThumb(this)">' +
    '<span id="rf-thumb-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<img id="rf-thumb-img" src="'+v("ThumbnailURL")+'" style="max-height:120px;border-radius:8px;border:1px solid #ddd;display:'+(isEdit&&ref&&ref.ThumbnailURL?'block':'none')+'">' +
    '<div style="font-size:.8rem;color:var(--muted)">— or paste a URL directly —</div>' +
    '<input id="rf-thumb" class="form-control" value="'+v("ThumbnailURL")+'" placeholder="https://…">' +
    '</div></div>' +
    '<div class="form-group"><label class="form-label">YouTube URL</label>' +
    '<input id="rf-yt" class="form-control" value="'+v("YouTubeURL")+'" placeholder="https://www.youtube.com/watch?v=…"></div>' +
    '<div class="form-group"><label class="form-label">PDF Google Drive Link</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="rf-pdf-file" accept="application/pdf" class="form-control" style="padding:6px" onchange="previewRefPdf(this)">' +
    '<span id="rf-pdf-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<input id="rf-pdf" class="form-control" value="'+v("PDFLink")+'" placeholder="https://drive.google.com/file/d/…">' +
    '<div class="form-hint">Upload a PDF or paste a Google Drive share link.</div></div></div>' +
    '<div class="form-group"><label class="form-label">Content</label>' +
    '<div class="toolbar">'+toolbarHTML+'</div>' +
    '<div id="rf-content" class="editor" contenteditable="true">'+(isEdit&&ref.Content?ref.Content:"")+"</div></div>" +
    '<div class="form-group"><label class="form-label">Status</label>' +
    '<select id="rf-status" class="form-control">' +
    '<option value="Draft"'+(isEdit&&ref.Status==="Draft"?" selected":"")+'>Draft</option>' +
    '<option value="Published"'+(isEdit&&ref.Status==="Published"?" selected":"")+'>Published</option>' +
    '</select></div>' +
    '<div style="display:flex;gap:10px;margin-top:8px">' +
    '<button class="btn btn-primary" onclick="submitReference()">💾 Save Reference</button>' +
    '<button class="btn btn-ghost" onclick="route(\'staff\')">Cancel</button>' +
    '</div></div></div></div></section>';
}

function previewRefThumb(input) { uploadFileToField(input, "rf-thumb", "rf-thumb-status", "rf-thumb-img", "Thumbnail"); }

function previewBlogThumb(input) { uploadFileToField(input, "p-img", "p-img-status", "p-img-preview", "Featured image"); }

function previewBlogPdf(input) { uploadFileToField(input, "p-pdf", "p-pdf-status", null, "PDF"); }

function previewCoursePdf(input) { uploadFileToField(input, "f-pdf", "f-pdf-status", null, "PDF"); }

function previewRefPdf(input) { uploadFileToField(input, "rf-pdf", "rf-pdf-status", null, "PDF"); }

function previewLabThumb(input) { uploadFileToField(input, "lab-thumb", "lab-thumb-status", "lab-thumb-img", "Thumbnail"); }

function previewLabPdf(input) { uploadFileToField(input, "lab-pdf", "lab-pdf-status", null, "PDF"); }

function pageStaffCareerLabForm(lab) {
  var isEdit = lab && lab.ID;
  var v = function(f){ return isEdit ? esc(lab[f]||"") : ""; };
  var toolbarHTML = ['Bold','Italic','Underline','H2','H3','UL','OL','Link','Quote'].map(function(c){
    return '<button type="button" onclick="fmt(\''+c+'\')">'+c+'</button>';
  }).join("");

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>'+(isEdit?"Edit":"Add")+' Career Lab</h1></div></div>' +
    '<section class="section"><div class="container" style="max-width:760px"><div class="card"><div class="card-body">' +
    (isEdit ? '<input type="hidden" id="lab-id" value="'+v("ID")+'">' : "") +
    '<div class="form-group"><label class="form-label">Title <span class="req">*</span></label>' +
    '<input id="lab-title" class="form-control" value="'+v("Title")+'" placeholder="Career research title"></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Student <span class="req">*</span></label><input id="lab-student" class="form-control" value="'+v("Student")+'" placeholder="Student name"></div>' +
    '<div class="form-group"><label class="form-label">Mentor</label><input id="lab-mentor" class="form-control" value="'+v("Mentor")+'" placeholder="Career mentor or staff"></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">Description</label>' +
    '<textarea id="lab-desc" class="form-control">'+v("Description")+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">Category</label><input id="lab-cat" class="form-control" value="'+v("Category")+'" placeholder="e.g. Aptitude, College, Stream…"></div>' +
    '<div class="form-group"><label class="form-label">Thumbnail</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="lab-thumb-file" accept="image/*" class="form-control" style="padding:6px" onchange="previewLabThumb(this)">' +
    '<span id="lab-thumb-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<img id="lab-thumb-img" src="'+v("ThumbnailURL")+'" style="max-height:120px;border-radius:8px;border:1px solid #ddd;display:'+(isEdit&&lab&&lab.ThumbnailURL?'block':'none')+'">' +
    '<input id="lab-thumb" class="form-control" value="'+v("ThumbnailURL")+'" placeholder="https://…">' +
    '</div></div>' +
    '<div class="form-group"><label class="form-label">YouTube URL</label>' +
    '<input id="lab-yt" class="form-control" value="'+v("YouTubeURL")+'" placeholder="Unlisted YouTube video link"></div>' +
    '<div class="form-group"><label class="form-label">PDF Google Drive Link</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="lab-pdf-file" accept="application/pdf" class="form-control" style="padding:6px" onchange="previewLabPdf(this)">' +
    '<span id="lab-pdf-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<input id="lab-pdf" class="form-control" value="'+v("PDFLink")+'" placeholder="https://drive.google.com/file/d/…">' +
    '<div class="form-hint">Upload a PDF or paste a Google Drive share link.</div></div></div>' +
    '<div class="form-group"><label class="form-label">Content</label>' +
    '<div class="toolbar">'+toolbarHTML+'</div>' +
    '<div id="lab-content" class="editor" contenteditable="true">'+(isEdit&&lab.Content?lab.Content:"")+'</div></div>' +
    '<div class="form-group"><label class="form-label">Status</label>' +
    '<select id="lab-status" class="form-control">' +
    '<option value="Draft"'+(isEdit&&lab.Status==="Draft"?" selected":"")+'>Draft</option>' +
    '<option value="Published"'+(isEdit&&lab.Status==="Published"?" selected":"")+'>Published</option>' +
    '</select></div>' +
    '<div style="display:flex;gap:10px;margin-top:8px">' +
    '<button class="btn btn-primary" onclick="submitCareerLab()">💾 Save Career Lab</button>' +
    '<button class="btn btn-ghost" onclick="route(\'staff\')">Cancel</button>' +
    '</div></div></div></div></section>';
}

function submitCareerLab() {
  var idEl = document.getElementById("lab-id");
  var payload = {
    id:           idEl ? idEl.value : "",
    title:        (document.getElementById("lab-title")  ||{}).value || "",
    student:      (document.getElementById("lab-student")||{}).value || "",
    description:  (document.getElementById("lab-desc")   ||{}).value || "",
    mentor:       (document.getElementById("lab-mentor") ||{}).value || "",
    category:     (document.getElementById("lab-cat")    ||{}).value || "",
    thumbnailUrl: (document.getElementById("lab-thumb")  ||{}).value || "",
    youtubeUrl:   (document.getElementById("lab-yt")     ||{}).value || "",
    pdfLink:      (document.getElementById("lab-pdf")    ||{}).value || "",
    content:      (document.getElementById("lab-content")||{}).innerHTML || "",
    status:       (document.getElementById("lab-status") ||{}).value || "Draft",
  };
  if (!payload.title.trim())   { toast("Title is required.", "err"); return; }
  if (!payload.student.trim()) { toast("Student name is required.", "err"); return; }
  apiPost("saveCareerLab", {data: payload}, function() { toast("Career Lab saved! 🎉"); route("staff"); });
}

function submitReference() {
  var idEl = document.getElementById("rf-id");
  var payload = {
    id:           idEl ? idEl.value : "",
    title:        (document.getElementById("rf-title")   ||{}).value || "",
    description:  (document.getElementById("rf-desc")    ||{}).value || "",
    author:       (document.getElementById("rf-author")  ||{}).value || "",
    category:     (document.getElementById("rf-cat")     ||{}).value || "",
    thumbnailUrl: (document.getElementById("rf-thumb")   ||{}).value || "",
    youtubeUrl:   (document.getElementById("rf-yt")      ||{}).value || "",
    pdfLink:      (document.getElementById("rf-pdf")     ||{}).value || "",
    content:      (document.getElementById("rf-content") ||{}).innerHTML || "",
    status:       (document.getElementById("rf-status")  ||{}).value || "Draft",
  };
  if (!payload.title.trim()) { toast("Title is required.", "err"); return; }
  apiPost("saveReference", {data: payload}, function() { toast("Reference saved! 📎"); route("staff"); });
}

function pageStaffBlogForm(post) {
  var isEdit = post && post.ID;
  var v = function(f){ return isEdit ? esc(post[f]||"") : ""; };
  var toolbarHTML = ['Bold','Italic','Underline','H2','H3','UL','OL','Link','Quote'].map(function(c){
    return '<button type="button" onclick="fmt(\''+c+'\')">'+c+'</button>';
  }).join("");

  document.getElementById("app").innerHTML =
    '<div class="page-header"><div class="container"><h1>'+(isEdit?"Edit":"Add")+' Post</h1></div></div>' +
    '<section class="section"><div class="container" style="max-width:720px"><div class="card"><div class="card-body">' +
    (isEdit ? '<input type="hidden" id="p-id" value="'+v("ID")+'">' : "") +
    '<div class="form-group"><label class="form-label">Title <span class="req">*</span></label>' +
    '<input id="p-title" class="form-control" value="'+v("Title")+'" placeholder="Post title"></div>' +
    '<div class="form-group"><label class="form-label">Featured Image URL</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="p-img-file" accept="image/*" class="form-control" style="padding:6px" onchange="previewBlogThumb(this)">' +
    '<span id="p-img-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<img id="p-img-preview" src="'+v("FeaturedImageURL")+'" style="max-height:120px;border-radius:8px;border:1px solid #ddd;display:'+(isEdit&&post&&post.FeaturedImageURL?'block':'none')+'">' +
    '<input id="p-img" class="form-control" value="'+v("FeaturedImageURL")+'" placeholder="https://…">' +
    '</div></div>' +
    '<div class="form-group"><label class="form-label">PDF Attachment</label>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<input type="file" id="p-pdf-file" accept="application/pdf" class="form-control" style="padding:6px" onchange="previewBlogPdf(this)">' +
    '<span id="p-pdf-status" style="font-size:.78rem;color:var(--muted)"></span>' +
    '<input id="p-pdf" class="form-control" value="'+v("PDFLink")+'" placeholder="https://drive.google.com/file/d/…">' +
    '<div class="form-hint">Upload a PDF or paste a Google Drive share link.</div>' +
    '</div></div>' +
    '<div class="form-group"><label class="form-label">Tags <span class="form-hint">(comma-separated)</span></label>' +
    '<input id="p-tags" class="form-control" value="'+v("Tags")+'" placeholder="interview, career, tips"></div>' +
    '<div class="form-group"><label class="form-label">Content <span class="req">*</span></label>' +
    '<div class="toolbar">'+toolbarHTML+'</div>' +
    '<div id="p-content" class="editor" contenteditable="true">'+(isEdit&&post.Content?post.Content:"")+'</div></div>' +
    '<div class="form-group"><label class="form-label">Status</label>' +
    '<select id="p-status" class="form-control">' +
    '<option value="Draft"'+(isEdit&&post.Status==="Draft"?" selected":"")+'>Draft</option>' +
    '<option value="Published"'+(isEdit&&post.Status==="Published"?" selected":"")+'>Published</option>' +
    '</select></div>' +
    '<div style="display:flex;gap:10px;margin-top:8px">' +
    '<button class="btn btn-primary" onclick="submitPost()">💾 Save Post</button>' +
    '<button class="btn btn-ghost" onclick="route(\'staff\')">Cancel</button>' +
    '</div></div></div></div></section>';
}

function submitPost() {
  var idEl = document.getElementById("p-id");
  var payload = {
    id:              idEl ? idEl.value : "",
    title:           (document.getElementById("p-title")  ||{}).value || "",
    featuredImageUrl:(document.getElementById("p-img")    ||{}).value || "",
    pdfLink:         (document.getElementById("p-pdf")    ||{}).value || "",
    tags:            (document.getElementById("p-tags")   ||{}).value || "",
    content:         (document.getElementById("p-content")||{}).innerHTML || "",
    status:          (document.getElementById("p-status") ||{}).value || "Draft",
  };
  if (!payload.title.trim())   { toast("Title is required.", "err"); return; }
  if (!stripHtml(payload.content||"")) { toast("Content is required.", "err"); return; }
  apiPost("savePost", {data: payload}, function() { toast("Post saved! 🎉"); route("staff"); });
}
