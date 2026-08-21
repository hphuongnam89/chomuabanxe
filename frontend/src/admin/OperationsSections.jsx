import { useState } from "react";
import { Link } from "react-router-dom";
import {
  adminHideReview,
  adminRestoreReview,
  adminSendNotification,
} from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { Pager, Toolbar, date } from "./AdminShared.jsx";

export function Transactions({ data, stats, status, setStatus, search, page }) {
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

export function Reviews({ data, status, setStatus, search, reload, setError }) {
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
                    <b className="rating-icons" aria-label={`${item.rating} trên 5 sao`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Icon
                          key={index}
                          name="star"
                          size={14}
                          className={index < item.rating ? "is-filled" : "is-muted"}
                        />
                      ))}
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

export function NotificationComposer({ setError }) {
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
export function Security({ health, audits, page }) {
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
