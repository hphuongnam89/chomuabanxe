import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Categories, Locations, VehicleCatalog } from "./admin/CatalogSections.jsx";
import { AdminNavigation, Overview } from "./admin/AdminShared.jsx";
import { Listings, Reports, Users } from "./admin/ModerationSections.jsx";
import {
  NotificationComposer,
  Reviews,
  Security,
  Transactions,
} from "./admin/OperationsSections.jsx";
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
  adminVehicleCatalog,
  adminLocations,
  adminOperationsStats,
  adminTransactions,
  adminReviews,
  adminAuditLogs,
  adminHealth,
  adminUpdateUserRoles,
} from "./api.js";
import { Icon } from "./components/Icon.jsx";

const MANAGED_ROLES = ["ADMIN", "STAFF_CUSTOMER", "STAFF_CONTENT"];
const ROLE_LABELS = {
  ADMIN: "quản trị viên",
  STAFF_CUSTOMER: "chăm sóc khách hàng",
  STAFF_CONTENT: "nội dung xe",
};

export default function AdminConsole({ roles = [] }) {
  const isAdmin = roles.includes("ADMIN"),
    canCustomer = isAdmin || roles.includes("STAFF_CUSTOMER"),
    canContent = isAdmin || roles.includes("STAFF_CONTENT"),
    firstTab = isAdmin ? "overview" : canCustomer ? "users" : "listings",
    [tab, setTab] = useState(firstTab),
    [stats, setStats] = useState(),
    [users, setUsers] = useState(),
    [listings, setListings] = useState(),
    [reports, setReports] = useState(),
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
        adminReports({ size: 20 }),
      ]);
      setStats(summary);
      setReports(items);
    } catch (e) {
      setError(e.message);
    }
  }
  async function loadReports(page = 0) {
    try {
      setError("");
      setReports(await adminReports({ page, size: 20 }));
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
  const tabAccess = {
    overview: isAdmin,
    users: canCustomer,
    listings: canContent,
    reports: canContent,
    categories: isAdmin,
    "vehicle-catalog": canContent,
    locations: isAdmin,
    transactions: isAdmin,
    reviews: isAdmin,
    notifications: isAdmin,
    security: isAdmin,
  };
  function switchTab(next) {
    if (!tabAccess[next]) return;
    setTab(next);
    const loaders = {
      users: [!users, loadUsers],
      listings: [!listings, loadListings],
      reports: [!reports?.content?.length, loadReports],
      categories: [!categoryItems, loadCategories],
      "vehicle-catalog": [!vehicleCatalogItems, loadVehicleCatalog],
      locations: [!locationItems, loadLocations],
      transactions: [!transactionItems, loadTransactions],
      reviews: [!reviewItems, loadReviews],
      security: [!auditItems, loadSecurity],
    };
    const [shouldLoad, load] = loaders[next] || [];
    if (shouldLoad) load();
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
    if (
      !confirm(
        `${revoke ? "Thu hồi" : "Cấp"} quyền ${ROLE_LABELS[roleCode]} cho “${user.displayName}”?`,
      )
    )
      return;
    setBusy(`role-${user.id}`);
    try {
      const roleCodes = revoke
        ? user.roles.filter((role) => role !== roleCode)
        : [...user.roles, roleCode];
      await adminUpdateUserRoles(
        user.id,
        roleCodes.filter((role) => MANAGED_ROLES.includes(role)),
      );
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
      else await loadReports(reports?.number || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  const openReports = (reports?.content || []).filter(
    (item) => item.status === "OPEN",
  );
  const navigationItems = [
    ["overview", "Tổng quan", <Icon name="chart" size={16} />],
    ["users", "Người dùng", stats?.totalUsers ?? "—"],
    ["listings", "Tin đăng", stats?.totalListings ?? "—"],
    ["reports", "Báo cáo", stats?.openReports ?? "—"],
    ["categories", "Danh mục", <Icon name="grid" size={16} />],
    ["vehicle-catalog", "Catalog xe", <Icon name="car" size={16} />],
    ["locations", "Khu vực", <Icon name="mapPin" size={16} />],
    ["transactions", "Giao dịch", operations?.transactions ?? "—"],
    ["reviews", "Đánh giá", operations?.reviews ?? "—"],
    ["notifications", "Thông báo", <Icon name="bell" size={16} />],
    ["security", "Vận hành & bảo mật", <Icon name="shield" size={16} />],
  ].map(([id, label, badge]) => ({
    id,
    label,
    badge,
    visible: tabAccess[id],
  }));

  return (
    <main id="main-content" className="admin-page">
      <header className="admin-top">
        <div>
          <span>CARX OPS</span>
          <h1>Trung tâm quản trị</h1>
        </div>
        <Link to="/"><Icon name="arrowLeft" size={17} /> Về trang bán hàng</Link>
      </header>
      <div className="admin-workspace">
        <AdminNavigation
          activeTab={tab}
          items={navigationItems}
          onSelect={switchTab}
        />
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
            <Reports data={reports} resolve={resolveReport} busy={busy} page={loadReports} />
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
