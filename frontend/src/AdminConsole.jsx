/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminActivateUser,
  adminArchive,
  adminArchiveReport,
  adminDismissReport,
  adminListings,
  adminReports,
  adminRestoreListing,
  adminStats,
  adminSuspendUser,
  adminUsers,
  adminCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminVehicleCatalog,
  adminCreateVehicleOption,
  adminUpdateVehicleOption,
  adminActivateVehicleOption,
  adminDeactivateVehicleOption,
  adminLocations,
  adminActivateLocation,
  adminDeactivateLocation,
  adminOperationsStats,
  adminTransactions,
  adminReviews,
  adminHideReview,
  adminRestoreReview,
  adminSendNotification,
  adminAuditLogs,
  adminHealth,
  adminUpdateUserRoles,
} from "./api.js";

const statusClass = (value) =>
  `admin-status status-${String(value).toLowerCase().replaceAll(" ", "-")}`;
const date = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

export default function AdminConsole({ roles = [] }) {
  const isAdmin = roles.includes("ADMIN"),
    canCustomer = isAdmin || roles.includes("STAFF_CUSTOMER"),
    canContent = isAdmin || roles.includes("STAFF_CONTENT"),
    firstTab = isAdmin ? "overview" : canCustomer ? "users" : "listings",
    [tab, setTab] = useState(firstTab),
    [stats, setStats] = useState(),
    [users, setUsers] = useState(),
    [listings, setListings] = useState(),
    [reports, setReports] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [userQuery, setUserQuery] = useState(""),
    [userStatus, setUserStatus] = useState(""),
    [listingQuery, setListingQuery] = useState(""),
    [listingState, setListingState] = useState(""),
    [categoryItems, setCategoryItems] = useState(),
    [vehicleCatalogItems, setVehicleCatalogItems] = useState(),
    [locationItems, setLocationItems] = useState(),
    [locationQuery, setLocationQuery] = useState(""),
    [locationLevel, setLocationLevel] = useState(""),
    [operations, setOperations] = useState(),
    [transactionItems, setTransactionItems] = useState(),
    [transactionStatus, setTransactionStatus] = useState(""),
    [reviewItems, setReviewItems] = useState(),
    [reviewStatus, setReviewStatus] = useState(""),
    [health, setHealth] = useState(),
    [auditItems, setAuditItems] = useState();

  useEffect(() => {
    document.title = "Quản trị | CarX";
    if (isAdmin) loadOverview();
  }, [isAdmin]);
  async function loadOverview() {
    try {
      const [summary, items] = await Promise.all([
        adminStats(),
        adminReports(),
      ]);
      setStats(summary);
      setReports(items);
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadReports() {
    try {
      setError("");
      setReports(await adminReports());
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadUsers(page = 0) {
    try {
      setError("");
      setUsers(
        await adminUsers({ query: userQuery, statusId: userStatus, page }),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadListings(page = 0) {
    try {
      setError("");
      setListings(
        await adminListings({
          query: listingQuery,
          archived: listingState,
          page,
        }),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadCategories() {
    try {
      setCategoryItems(await adminCategories());
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadVehicleCatalog() {
    try {
      setVehicleCatalogItems(await adminVehicleCatalog());
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadLocations(page = 0) {
    try {
      setLocationItems(
        await adminLocations({
          query: locationQuery,
          level: locationLevel,
          page,
        }),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadTransactions(page = 0) {
    try {
      const [summary, data] = await Promise.all([
        adminOperationsStats(),
        adminTransactions({ status: transactionStatus, page }),
      ]);
      setOperations(summary);
      setTransactionItems(data);
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadReviews(page = 0) {
    try {
      setReviewItems(await adminReviews({ status: reviewStatus, page }));
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadSecurity(page = 0) {
    try {
      const [healthData, auditData] = await Promise.all([
        adminHealth(),
        adminAuditLogs({ page }),
      ]);
      setHealth(healthData);
      setAuditItems(auditData);
    } catch (e) {
      setError(e.message);
    }
  }
  function switchTab(next) {
    if (!canSee(next)) return;
    setTab(next);
    if (next === "users" && !users) loadUsers();
    if (next === "listings" && !listings) loadListings();
    if (next === "reports" && !reports.length) loadReports();
    if (next === "categories" && !categoryItems) loadCategories();
    if (next === "vehicle-catalog" && !vehicleCatalogItems) loadVehicleCatalog();
    if (next === "locations" && !locationItems) loadLocations();
    if (next === "transactions" && !transactionItems) loadTransactions();
    if (next === "reviews" && !reviewItems) loadReviews();
    if (next === "security" && !auditItems) loadSecurity();
  }
  async function changeUser(user) {
    const suspend = user.statusId === 1;
    if (
      !confirm(
        `${suspend ? "Khóa" : "Mở khóa"} tài khoản “${user.displayName}”?`,
      )
    )
      return;
    setBusy(`user-${user.id}`);
    try {
      await (suspend ? adminSuspendUser(user.id) : adminActivateUser(user.id));
      await loadUsers(0);
      if (isAdmin) await loadOverview();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  async function changeRole(user, roleCode) {
    const revoke = user.roles.includes(roleCode);
    const labels = { ADMIN: "quản trị viên", STAFF_CUSTOMER: "chăm sóc khách hàng", STAFF_CONTENT: "nội dung xe" };
    if (
      !confirm(
        `${revoke ? "Thu hồi" : "Cấp"} quyền ${labels[roleCode]} cho “${user.displayName}”?`,
      )
    )
      return;
    setBusy(`role-${user.id}`);
    try {
      const roleCodes = revoke
        ? user.roles.filter((role) => role !== roleCode)
        : [...user.roles, roleCode];
      await adminUpdateUserRoles(user.id, roleCodes.filter((role) => ["ADMIN", "STAFF_CUSTOMER", "STAFF_CONTENT"].includes(role)));
      await loadUsers(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  async function changeListing(item) {
    const restore = Boolean(item.archivedAt);
    if (!confirm(`${restore ? "Khôi phục" : "Ẩn"} tin “${item.title}”?`))
      return;
    setBusy(`listing-${item.id}`);
    try {
      await (restore ? adminRestoreListing(item.id) : adminArchive(item.id));
      setError("");
      await loadListings(0);
      if (isAdmin) await loadOverview();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  async function resolveReport(report, archive) {
    if (archive && !confirm(`Ẩn tin #${report.listingId} vì báo cáo này?`))
      return;
    setBusy(`report-${report.id}`);
    try {
      await (archive
        ? adminArchiveReport(report.id)
        : adminDismissReport(report.id));
      if (isAdmin) await loadOverview();
      else await loadReports();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  const openReports = reports.filter((item) => item.status === "OPEN");
  const canSee = (next) =>
    (next === "overview" && isAdmin) ||
    (next === "users" && canCustomer) ||
    (["listings", "reports", "vehicle-catalog"].includes(next) && canContent) ||
    (["categories", "locations", "transactions", "reviews", "notifications", "security"].includes(next) && isAdmin);

  return (
    <main id="main-content" className="admin-page">
      <header className="admin-top">
        <div>
          <span>CARX OPS</span>
          <h1>Trung tâm quản trị</h1>
        </div>
        <Link to="/">← Về trang bán hàng</Link>
      </header>
      <div className="admin-workspace">
        <aside className="admin-nav" aria-label="Điều hướng quản trị">
          {isAdmin && <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => switchTab("overview")}
          >
            Tổng quan <span>⌂</span>
          </button>}
          {canCustomer && <button
            className={tab === "users" ? "active" : ""}
            onClick={() => switchTab("users")}
          >
            Người dùng <span>{stats?.totalUsers ?? "—"}</span>
          </button>}
          {canContent && <button
            className={tab === "listings" ? "active" : ""}
            onClick={() => switchTab("listings")}
          >
            Tin đăng <span>{stats?.totalListings ?? "—"}</span>
          </button>}
          {canContent && <button
            className={tab === "reports" ? "active" : ""}
            onClick={() => switchTab("reports")}
          >
            Báo cáo <span>{stats?.openReports ?? "—"}</span>
          </button>}
          {isAdmin && <button
            className={tab === "categories" ? "active" : ""}
            onClick={() => switchTab("categories")}
          >
            Danh mục <span>⌘</span>
          </button>}
          {canContent && <button
            className={tab === "vehicle-catalog" ? "active" : ""}
            onClick={() => switchTab("vehicle-catalog")}
          >
            Catalog xe <span>🚘</span>
          </button>}
          {isAdmin && <button
            className={tab === "locations" ? "active" : ""}
            onClick={() => switchTab("locations")}
          >
            Khu vực <span>⌖</span>
          </button>}
          {isAdmin && <button
            className={tab === "transactions" ? "active" : ""}
            onClick={() => switchTab("transactions")}
          >
            Giao dịch <span>{operations?.transactions ?? "—"}</span>
          </button>}
          {isAdmin && <button
            className={tab === "reviews" ? "active" : ""}
            onClick={() => switchTab("reviews")}
          >
            Đánh giá <span>{operations?.reviews ?? "—"}</span>
          </button>}
          {isAdmin && <button
            className={tab === "notifications" ? "active" : ""}
            onClick={() => switchTab("notifications")}
          >
            Thông báo <span>＋</span>
          </button>}
          {isAdmin && <button
            className={tab === "security" ? "active" : ""}
            onClick={() => switchTab("security")}
          >
            Vận hành & bảo mật <span>◉</span>
          </button>}
        </aside>
        <section className="admin-stage">
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {tab === "overview" && isAdmin && (
            <Overview
              stats={stats}
              reports={openReports}
              onReports={() => switchTab("reports")}
            />
          )}
          {tab === "users" && (
            <Users
              data={users}
              query={userQuery}
              setQuery={setUserQuery}
              status={userStatus}
              setStatus={setUserStatus}
              search={() => loadUsers()}
              change={changeUser}
              changeRole={changeRole}
              canManageRoles={isAdmin}
              busy={busy}
              page={loadUsers}
            />
          )}
          {tab === "listings" && (
            <Listings
              data={listings}
              query={listingQuery}
              setQuery={setListingQuery}
              state={listingState}
              setState={setListingState}
              search={() => loadListings()}
              change={changeListing}
              busy={busy}
              page={loadListings}
            />
          )}
          {tab === "reports" && (
            <Reports items={reports} resolve={resolveReport} busy={busy} />
          )}
          {tab === "categories" && (
            <Categories
              items={categoryItems || []}
              reload={loadCategories}
              setError={setError}
            />
          )}
          {tab === "vehicle-catalog" && (
            <VehicleCatalog
              items={vehicleCatalogItems}
              reload={loadVehicleCatalog}
              setError={setError}
            />
          )}
          {tab === "locations" && (
            <Locations
              data={locationItems}
              query={locationQuery}
              setQuery={setLocationQuery}
              level={locationLevel}
              setLevel={setLocationLevel}
              search={() => loadLocations()}
              reload={loadLocations}
              setError={setError}
            />
          )}
          {tab === "transactions" && (
            <Transactions
              data={transactionItems}
              stats={operations}
              status={transactionStatus}
              setStatus={setTransactionStatus}
              search={() => loadTransactions()}
              page={loadTransactions}
            />
          )}
          {tab === "reviews" && (
            <Reviews
              data={reviewItems}
              status={reviewStatus}
              setStatus={setReviewStatus}
              search={() => loadReviews()}
              reload={loadReviews}
              setError={setError}
            />
          )}
          {tab === "notifications" && (
            <NotificationComposer setError={setError} />
          )}
          {tab === "security" && (
            <Security health={health} audits={auditItems} page={loadSecurity} />
          )}
        </section>
      </div>
    </main>
  );
}

function Overview({ stats, reports, onReports }) {
  const cards = [
    ["Người dùng", stats?.totalUsers],
    ["Tổng tin đăng", stats?.totalListings],
    ["Tin mới hôm nay", stats?.publishedToday],
    ["Đang bán", stats?.activeListings],
    ["Đã ẩn", stats?.archivedListings],
    ["Báo cáo chờ xử lý", stats?.openReports],
  ];
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>TỔNG QUAN</span>
          <h2>Tình trạng sàn giao dịch</h2>
        </div>
        <small>Dữ liệu trực tiếp từ hệ thống</small>
      </div>
      <div className="admin-metrics">
        {cards.map(([label, value]) => (
          <article key={label}>
            <b>{value ?? "—"}</b>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <section className="admin-table-card">
        <header>
          <div>
            <span>ƯU TIÊN</span>
            <h2>Báo cáo cần xử lý</h2>
          </div>
          <button onClick={onReports}>Xem tất cả</button>
        </header>
        {reports.length ? (
          <div className="admin-compact-list">
            {reports.slice(0, 5).map((item) => (
              <div key={item.id}>
                <b>Tin #{item.listingId}</b>
                <span>{item.details || `Lý do #${item.reasonId}`}</span>
                <small>{date(item.createdAt)}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            <b>Hàng đợi đang trống</b>
            <p>Không có báo cáo mới cần xử lý.</p>
          </div>
        )}
      </section>
    </>
  );
}

function Toolbar({ children, onSubmit }) {
  return (
    <form
      className="admin-toolbar"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {children}
      <button className="primary">Tìm kiếm</button>
    </form>
  );
}
function Pager({ data, onPage }) {
  if (!data || data.totalPages <= 1) return null;
  return (
    <nav className="admin-pager" aria-label="Phân trang">
      <button disabled={data.first} onClick={() => onPage(data.number - 1)}>
        Trước
      </button>
      <span>
        Trang {data.number + 1}/{data.totalPages}
      </span>
      <button disabled={data.last} onClick={() => onPage(data.number + 1)}>
        Sau
      </button>
    </nav>
  );
}
function Users({
  data,
  query,
  setQuery,
  status,
  setStatus,
  search,
  change,
  changeRole,
  canManageRoles,
  busy,
  page,
}) {
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 1</span>
          <h2>Quản lý người dùng</h2>
        </div>
        <small>{data?.totalElements ?? "—"} tài khoản</small>
      </div>
      <Toolbar onSubmit={search}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tên hiển thị hoặc mã người dùng"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Mọi trạng thái</option>
          <option value="1">Hoạt động</option>
          <option value="2">Tạm khóa</option>
        </select>
      </Toolbar>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Tin đăng</th>
                <th>Trạng thái</th>
                <th>Tham gia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((user) => (
                <tr key={user.id}>
                  <td>
                    <b>{user.displayName}</b>
                    <small>#{user.id}</small>
                  </td>
                  <td>{user.roles.join(", ")}</td>
                  <td>{user.listingCount}</td>
                  <td>
                    <span className={statusClass(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td>{date(user.joinedAt)}</td>
                  <td>
                    {canManageRoles && <>
                      <button
                        className="secondary"
                        disabled={busy === `role-${user.id}`}
                        onClick={() => changeRole(user, "STAFF_CUSTOMER")}
                      >
                        CSKH {user.roles.includes("STAFF_CUSTOMER") ? "✓" : "+"}
                      </button>{" "}
                      <button
                        className="secondary"
                        disabled={busy === `role-${user.id}`}
                        onClick={() => changeRole(user, "STAFF_CONTENT")}
                      >
                        Nội dung {user.roles.includes("STAFF_CONTENT") ? "✓" : "+"}
                      </button>{" "}
                      <button
                        className={user.roles.includes("ADMIN") ? "danger" : "secondary"}
                        disabled={busy === `role-${user.id}`}
                        onClick={() => changeRole(user, "ADMIN")}
                      >
                        Admin {user.roles.includes("ADMIN") ? "✓" : "+"}
                      </button>{" "}
                    </>}
                    <button
                      className={user.roles.includes("ADMIN") ? "secondary" : user.statusId === 1 ? "danger" : "secondary"}
                      disabled={
                        busy === `user-${user.id}` ||
                        user.roles.includes("ADMIN")
                      }
                      title={user.roles.includes("ADMIN") ? "Không thể khóa tài khoản quản trị viên" : undefined}
                      onClick={() => change(user)}
                    >
                      {user.statusId === 1 ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && !data.content.length && (
          <div className="admin-empty">
            <b>Không tìm thấy tài khoản</b>
          </div>
        )}
        <Pager data={data} onPage={page} />
      </section>
    </>
  );
}
function Listings({
  data,
  query,
  setQuery,
  state,
  setState,
  search,
  change,
  busy,
  page,
}) {
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 2</span>
          <h2>Quản lý tin đăng</h2>
        </div>
        <small>{data?.totalElements ?? "—"} tin</small>
      </div>
      <Toolbar onSubmit={search}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tiêu đề hoặc mã tin"
        />
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">Tất cả tin</option>
          <option value="false">Đang hiển thị</option>
          <option value="true">Đã ẩn</option>
        </select>
      </Toolbar>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tin đăng</th>
                <th>Người bán</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Ngày đăng</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/tin/${item.id}`}>
                      <b>{item.title}</b>
                      <small>
                        #{item.id} · danh mục {item.categoryId}
                      </small>
                    </Link>
                  </td>
                  <td>
                    {item.sellerName}
                    <small>#{item.sellerUserId}</small>
                  </td>
                  <td>{Number(item.priceAmount).toLocaleString("vi-VN")} đ</td>
                  <td>
                    <span className={statusClass(item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td>{date(item.publishedAt)}</td>
                  <td>
                    <button
                      className={item.archivedAt ? "secondary" : "danger"}
                      disabled={busy === `listing-${item.id}`}
                      onClick={() => change(item)}
                    >
                      {item.archivedAt ? "Khôi phục" : "Ẩn tin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && !data.content.length && (
          <div className="admin-empty">
            <b>Không tìm thấy tin đăng</b>
          </div>
        )}
        <Pager data={data} onPage={page} />
      </section>
    </>
  );
}
function Reports({ items, resolve, busy }) {
  const open = items.filter((item) => item.status === "OPEN"),
    history = items.filter((item) => item.status !== "OPEN");
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>KIỂM DUYỆT</span>
          <h2>Hàng đợi báo cáo</h2>
        </div>
        <small>{open.length} báo cáo mới</small>
      </div>
      <section className="admin-table-card admin-reports">
        {open.length ? (
          open.map((item) => (
            <article key={item.id}>
              <div>
                <b>Tin #{item.listingId}</b>
                <small>
                  Báo cáo #{item.id} · Người báo #{item.reporterUserId} ·{" "}
                  {date(item.createdAt)}
                </small>
                <p>{item.details || `Lý do vi phạm #${item.reasonId}`}</p>
              </div>
              <div>
                <Link className="secondary" to={`/tin/${item.listingId}`}>
                  Xem tin
                </Link>
                <button
                  disabled={busy === `report-${item.id}`}
                  onClick={() => resolve(item, false)}
                >
                  Bỏ qua
                </button>
                <button
                  className="danger"
                  disabled={busy === `report-${item.id}`}
                  onClick={() => resolve(item, true)}
                >
                  Ẩn tin
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">
            <b>Không có báo cáo cần xử lý</b>
          </div>
        )}
      </section>
      {history.length > 0 && (
        <section className="admin-table-card">
          <header>
            <div>
              <span>LỊCH SỬ</span>
              <h2>Đã xử lý gần đây</h2>
            </div>
          </header>
          <div className="admin-compact-list">
            {history.slice(0, 20).map((item) => (
              <div key={item.id}>
                <b>Tin #{item.listingId}</b>
                <span>{item.status}</span>
                <small>{date(item.resolvedAt || item.createdAt)}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

const emptyCategory = {
  parentId: "",
  name: "",
  slug: "",
  leaf: true,
  sortOrder: 0,
  active: true,
};
function Categories({ items, reload, setError }) {
  const [form, setForm] = useState(emptyCategory),
    [saving, setSaving] = useState(false);
  const edit = (item) => setForm({ ...item, parentId: item.parentId ?? "" });
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      parentId: form.parentId ? Number(form.parentId) : null,
      sortOrder: Number(form.sortOrder),
    };
    try {
      await (form.id
        ? adminUpdateCategory(form.id, payload)
        : adminCreateCategory(payload));
      setForm(emptyCategory);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 3</span>
          <h2>Cây danh mục CarX</h2>
        </div>
        <small>{items?.length ?? "—"} danh mục</small>
      </div>
      <form className="admin-editor" onSubmit={submit}>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tên danh mục"
        />
        <input
          required
          pattern="[a-z0-9-]+"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="slug-khong-dau"
        />
        <select
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
        >
          <option value="">Danh mục gốc</option>
          {(items || [])
            .filter((x) => x.id !== form.id)
            .map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
        </select>
        <input
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          aria-label="Thứ tự"
        />
        <label>
          <input
            type="checkbox"
            checked={form.leaf}
            onChange={(e) => setForm({ ...form, leaf: e.target.checked })}
          />{" "}
          Cho phép đăng tin
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />{" "}
          Đang hoạt động
        </label>
        <button className="primary" disabled={saving}>
          {form.id ? "Lưu danh mục" : "Thêm danh mục"}
        </button>
        {form.id && (
          <button
            type="button"
            className="secondary"
            onClick={() => setForm(emptyCategory)}
          >
            Hủy
          </button>
        )}
      </form>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Slug</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{item.name}</b>
                    <small>
                      #{item.id}
                      {item.parentId ? ` · cha #${item.parentId}` : " · gốc"}
                    </small>
                  </td>
                  <td>{item.slug}</td>
                  <td>{item.leaf ? "Đăng tin" : "Nhóm"}</td>
                  <td>
                    <span
                      className={statusClass(item.active ? "active" : "hidden")}
                    >
                      {item.active ? "Hoạt động" : "Đã ẩn"}
                    </span>
                  </td>
                  <td>
                    <button className="secondary" onClick={() => edit(item)}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const vehicleResources = [
  ["brands", "Hãng xe"],
  ["models", "Mẫu xe"],
  ["origins", "Xuất xứ"],
  ["transmissions", "Hộp số"],
  ["fuels", "Nhiên liệu"],
  ["colors", "Màu xe"],
  ["body-types", "Kiểu dáng"],
  ["drivelines", "Dẫn động"],
];
const emptyVehicleOption = {
  code: "",
  name: "",
  sortOrder: 0,
  active: true,
  parentId: "",
};
function VehicleCatalog({ items, reload, setError }) {
  const [resource, setResource] = useState("brands"),
    [form, setForm] = useState(emptyVehicleOption),
    [saving, setSaving] = useState(false),
    [busy, setBusy] = useState("");
  const responseResource = resource === "body-types" ? "bodyTypes" : resource,
    current = items?.[responseResource] || [],
    isModel = resource === "models",
    brands = items?.brands || [];
  function edit(item) {
    setForm({ ...item, parentId: item.parentId ?? "" });
  }
  function changeResource(value) {
    setResource(value);
    setForm(emptyVehicleOption);
  }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      code: form.code.trim().toLowerCase(),
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder),
      active: form.active,
      parentId: isModel && form.parentId ? Number(form.parentId) : null,
    };
    try {
      await (form.id
        ? adminUpdateVehicleOption(resource, form.id, data)
        : adminCreateVehicleOption(resource, data));
      setForm(emptyVehicleOption);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function toggle(item) {
    setBusy(`${resource}-${item.id}`);
    setError("");
    try {
      await (item.active
        ? adminDeactivateVehicleOption(resource, item.id)
        : adminActivateVehicleOption(resource, item.id));
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 3 · CARX</span>
          <h2>Quản trị catalog xe</h2>
        </div>
        <small>{current.length} mục trong nhóm đang chọn</small>
      </div>
      <div className="admin-toolbar">
        <label>
          Nhóm dữ liệu
          <select value={resource} onChange={(e) => changeResource(e.target.value)}>
            {vehicleResources.map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <form className="admin-editor vehicle-editor" onSubmit={submit}>
        <input
          required
          pattern="[a-z0-9][a-z0-9-]*"
          maxLength="64"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="Mã dạng slug"
          aria-label="Mã catalog"
        />
        <input
          required
          maxLength="120"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tên hiển thị"
          aria-label="Tên hiển thị"
        />
        {isModel ? (
          <select
            required
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            aria-label="Hãng xe"
          >
            <option value="">Chọn hãng xe</option>
            {brands.map((brand) => (
              <option value={brand.id} key={brand.id} disabled={!brand.active}>
                {brand.name}{brand.active ? "" : " · đã ẩn"}
              </option>
            ))}
          </select>
        ) : <span className="admin-muted">Không có quan hệ cha</span>}
        <input
          type="number"
          min="0"
          max="32767"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          aria-label="Thứ tự"
        />
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />{" "}
          Đang hoạt động
        </label>
        <button className="primary" disabled={saving}>
          {form.id ? "Lưu thay đổi" : "Thêm mục"}
        </button>
        {form.id && (
          <button type="button" className="secondary" onClick={() => setForm(emptyVehicleOption)}>
            Hủy
          </button>
        )}
      </form>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                {isModel && <th>Hãng</th>}
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {current.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td><b>{item.name}</b><small>#{item.id}</small></td>
                  {isModel && <td>{brands.find((brand) => brand.id === item.parentId)?.name || `#${item.parentId}`}</td>}
                  <td>{item.sortOrder}</td>
                  <td>{item.active ? "Hoạt động" : "Đã ẩn"}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => edit(item)}>Sửa</button>{" "}
                    <button
                      type="button"
                      className={item.active ? "danger" : "secondary"}
                      disabled={busy === `${resource}-${item.id}`}
                      onClick={() => toggle(item)}
                    >
                      {item.active ? "Ẩn" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!current.length && <div className="admin-empty"><b>Chưa có dữ liệu</b></div>}
      </section>
    </>
  );
}

function Locations({
  data,
  query,
  setQuery,
  level,
  setLevel,
  search,
  reload,
  setError,
}) {
  async function toggle(item) {
    try {
      await (item.active
        ? adminDeactivateLocation(item.id)
        : adminActivateLocation(item.id));
      await reload(data.number);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 3</span>
          <h2>Quản lý địa giới</h2>
        </div>
        <small>{data?.totalElements ?? "—"} khu vực</small>
      </div>
      <Toolbar onSubmit={search}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tên hoặc mã khu vực"
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Tất cả cấp</option>
          <option value="1">Tỉnh / thành</option>
          <option value="2">Phường / xã</option>
        </select>
      </Toolbar>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Khu vực</th>
                <th>Mã</th>
                <th>Cấp</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{item.name}</b>
                    <small>
                      #{item.id}
                      {item.parentId ? ` · thuộc #${item.parentId}` : ""}
                    </small>
                  </td>
                  <td>{item.code}</td>
                  <td>{item.level === 1 ? "Tỉnh / thành" : "Phường / xã"}</td>
                  <td>{item.active ? "Hoạt động" : "Đã ẩn"}</td>
                  <td>
                    <button
                      className={item.active ? "danger" : "secondary"}
                      onClick={() => toggle(item)}
                    >
                      {item.active ? "Ẩn" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager data={data} onPage={reload} />
      </section>
    </>
  );
}

function Transactions({ data, stats, status, setStatus, search, page }) {
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 4</span>
          <h2>Giao dịch</h2>
        </div>
        <small>
          {stats?.confirmedTransactions ?? 0}/{stats?.transactions ?? 0} hoàn
          tất
        </small>
      </div>
      <Toolbar onSubmit={search}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã hoàn tất</option>
        </select>
      </Toolbar>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Giao dịch</th>
                <th>Người mua</th>
                <th>Người bán</th>
                <th>Trạng thái</th>
                <th>Xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/tin/${item.listingId}`}>
                      <b>{item.listingTitle}</b>
                      <small>
                        GD #{item.id} · Tin #{item.listingId}
                      </small>
                    </Link>
                  </td>
                  <td>
                    {item.buyerName}
                    <small>#{item.buyerId}</small>
                  </td>
                  <td>
                    {item.sellerName}
                    <small>#{item.sellerId}</small>
                  </td>
                  <td>{item.status}</td>
                  <td>{date(item.confirmedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager data={data} onPage={page} />
      </section>
    </>
  );
}

function Reviews({ data, status, setStatus, search, reload, setError }) {
  async function toggle(item) {
    try {
      await (item.status === "VISIBLE"
        ? adminHideReview(item.id)
        : adminRestoreReview(item.id));
      await reload(data.number);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 4</span>
          <h2>Đánh giá & Trust Score</h2>
        </div>
        <small>{data?.totalElements ?? "—"} đánh giá</small>
      </div>
      <Toolbar onSubmit={search}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="VISIBLE">Đang hiển thị</option>
          <option value="HIDDEN">Đã ẩn</option>
        </select>
      </Toolbar>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Đánh giá</th>
                <th>Người bán</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>
                      {"★".repeat(item.rating)}
                      {"☆".repeat(5 - item.rating)}
                    </b>
                    <small>
                      #{item.id} · GD #{item.transactionId}
                    </small>
                  </td>
                  <td>
                    {item.sellerName}
                    <small>#{item.sellerId}</small>
                  </td>
                  <td>{item.body || "Không có nội dung"}</td>
                  <td>{item.status}</td>
                  <td>
                    <button
                      className={
                        item.status === "VISIBLE" ? "danger" : "secondary"
                      }
                      onClick={() => toggle(item)}
                    >
                      {item.status === "VISIBLE" ? "Ẩn" : "Khôi phục"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager data={data} onPage={reload} />
      </section>
    </>
  );
}

function NotificationComposer({ setError }) {
  const [recipientUserId, setRecipient] = useState(""),
    [body, setBody] = useState(""),
    [referencePath, setPath] = useState("/thong-bao"),
    [sent, setSent] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSent(false);
    setError("");
    try {
      await adminSendNotification({
        recipientUserId: Number(recipientUserId),
        body,
        referencePath,
      });
      setBody("");
      setSent(true);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 4</span>
          <h2>Gửi thông báo hệ thống</h2>
        </div>
        <small>Gửi đúng người, đúng ngữ cảnh</small>
      </div>
      <form className="admin-compose admin-table-card" onSubmit={submit}>
        <label>
          ID người nhận
          <input
            type="number"
            min="1"
            required
            value={recipientUserId}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </label>
        <label>
          Nội dung
          <textarea
            required
            maxLength="500"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <label>
          Đường dẫn khi bấm
          <input
            required
            pattern="/.*"
            value={referencePath}
            onChange={(e) => setPath(e.target.value)}
          />
        </label>
        <button>Gửi thông báo</button>
        {sent && <p className="success">Đã gửi thông báo.</p>}
      </form>
    </>
  );
}

function Security({ health, audits, page }) {
  const services = [
    ["API", health?.api],
    ["MySQL", health?.database],
    ["Cloudflare R2", health?.storage],
  ];
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 5</span>
          <h2>Vận hành & bảo mật</h2>
        </div>
        <small>
          Kiểm tra{" "}
          {health?.checkedAt
            ? new Date(health.checkedAt).toLocaleString("vi-VN")
            : "—"}
        </small>
      </div>
      <div className="admin-metrics admin-health">
        {services.map(([label, state]) => (
          <article key={label}>
            <b className={state === "UP" ? "health-up" : "health-down"}>
              {state ?? "—"}
            </b>
            <span>{label}</span>
          </article>
        ))}
        <article title="Tổng số request bị chặn kể từ lần khởi động backend gần nhất">
          <b>{health?.rateLimitBlocks ?? "—"}</b>
          <span>Rate-limit từ lúc API khởi động</span>
        </article>
        <article title="Số tài khoản có lần đăng nhập thất bại đang được ghi nhận">
          <b>{health?.identitiesWithFailures ?? "—"}</b>
          <span>Tài khoản đăng nhập lỗi</span>
        </article>
        <article title="Số tài khoản đang bị khóa do chính sách bảo mật">
          <b>{health?.lockedIdentities ?? "—"}</b>
          <span>Tài khoản đang bị khóa</span>
        </article>
      </div>
      <section className="admin-table-card">
        <header>
          <div>
            <span>KHÔNG THỂ SỬA</span>
            <h2>Nhật ký quản trị</h2>
            <p className="admin-table-note">
              Nhật ký là bằng chứng kiểm toán nên không được sửa hoặc hoàn tác trực tiếp. Hãy mở đối tượng để thực hiện thao tác nghiệp vụ mới.
            </p>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Quản trị viên</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>Chi tiết</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {audits?.content?.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    <b>{item.adminName}</b>
                    <small>#{item.adminUserId}</small>
                  </td>
                  <td>{item.action}</td>
                  <td>
                    {item.targetType} #{item.targetId ?? "—"}
                  </td>
                  <td>{item.details || "Không có ghi chú bổ sung"}</td>
                  <td>
                    {item.targetType === "LISTING" && item.targetId ? (
                      <Link className="secondary" to={`/tin/${item.targetId}`}>Xem tin</Link>
                    ) : item.targetType === "USER" && item.targetId ? (
                      <Link className="secondary" to={`/nguoi-ban/${item.targetId}`}>Xem người dùng</Link>
                    ) : (
                      <span className="admin-muted">Không khả dụng</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {audits && !audits.content.length && (
          <div className="admin-empty">
            <b>Chưa có thao tác quản trị</b>
          </div>
        )}
        <Pager data={audits} onPage={page} />
      </section>
    </>
  );
}
