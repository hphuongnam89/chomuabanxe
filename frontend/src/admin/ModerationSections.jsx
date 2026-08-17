import { Link } from "react-router-dom";
import { Pager, Toolbar, date, statusClass } from "./AdminShared.jsx";

export function Users({
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
export function Listings({
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
                    <Link className="secondary" to={`/admin/tin/${item.id}/sua`}>
                      Sửa
                    </Link>
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
export function Reports({ data, resolve, busy, page }) {
  const items = data?.content || [];
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
      <Pager data={data} onPage={page} />
    </>
  );
}
