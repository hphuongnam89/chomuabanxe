export const statusClass = (value) =>
  `admin-status status-${String(value).toLowerCase().replaceAll(" ", "-")}`;
export const date = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

export function Overview({ stats, reports, onReports }) {
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

export function Toolbar({ children, onSubmit }) {
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
export function Pager({ data, onPage }) {
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

export function AdminNavigation({ activeTab, items, onSelect }) {
  return (
    <aside className="admin-nav" aria-label="Điều hướng quản trị">
      {items
        .filter((item) => item.visible)
        .map((item) => (
          <button
            className={activeTab === item.id ? "active" : ""}
            key={item.id}
            onClick={() => onSelect(item.id)}
          >
            {item.label} <span>{item.badge}</span>
          </button>
        ))}
    </aside>
  );
}
