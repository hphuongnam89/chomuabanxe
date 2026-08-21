import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  changePassword,
  me,
  myListings,
  notifications,
  readNotification,
  savedListingIds,
  updateUser,
} from "../../api.js";
import {
  EmptyState,
  Page,
  timeAgo,
} from "../../components/MarketplaceUi.jsx";
import { Icon } from "../../components/Icon.jsx";

export function Profile() {
  const [user, setUser] = useState(),
    [summary, setSummary] = useState({ posts: 0, saved: 0, unread: 0 }),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([me(), myListings(), savedListingIds(), notifications()])
      .then(([profile, posts, saved, alerts]) => {
        setUser(profile);
        setSummary({
          posts: posts.totalElements,
          saved: saved.length,
          unread: alerts.filter((item) => !item.readAt).length,
        });
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <Page title="Hồ sơ">
      {error && <p className="error">{error}</p>}
      {user && (
        <>
          <div className="panel profile">
            <div className="avatar-big">{user.displayName.slice(0, 1)}</div>
            <div>
              <h2>{user.displayName}</h2>
              <p>
                Tham gia CarX từ{" "}
                {new Date(user.joinedAt).toLocaleDateString("vi-VN")}.
              </p>
              <Link to="/cai-dat">Chỉnh sửa hồ sơ</Link>
            </div>
          </div>
          <div className="account-stats">
            <Link to="/tin-cua-toi">
              <b>{summary.posts}</b>
              <span>Tin đang bán</span>
            </Link>
            <Link to="/tin-da-luu">
              <b>{summary.saved}</b>
              <span>Tin đã lưu</span>
            </Link>
            <Link to="/thong-bao">
              <b>{summary.unread}</b>
              <span>Thông báo mới</span>
            </Link>
          </div>
        </>
      )}
      <div className="account-menu">
        <Link to="/tin-cua-toi">
          <span className="account-menu-label"><Icon name="list" size={18} /> Quản lý tin đăng</span><Icon name="chevronRight" size={16} />
        </Link>
        <Link to="/tin-da-luu">
          <span className="account-menu-label"><Icon name="heart" size={18} /> Tin đã lưu</span><Icon name="chevronRight" size={16} />
        </Link>
        <Link to="/danh-gia">
          <span className="account-menu-label"><Icon name="star" size={18} /> Giao dịch & đánh giá</span><Icon name="chevronRight" size={16} />
        </Link>
        <Link to="/cai-dat">
          <span className="account-menu-label"><Icon name="settings" size={18} /> Cài đặt tài khoản</span><Icon name="chevronRight" size={16} />
        </Link>
      </div>
    </Page>
  );
}
export function Settings() {
  const [user, setUser] = useState(),
    [summary, setSummary] = useState({ posts: 0, saved: 0, unread: 0 }),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([me(), myListings(), savedListingIds(), notifications()])
      .then(([profile, posts, saved, alerts]) => {
        setUser(profile);
        setSummary({
          posts: posts.totalElements,
          saved: saved.length,
          unread: alerts.filter((item) => !item.readAt).length,
        });
      })
      .catch((error) => setError(error.message));
  }, []);
  async function submitProfile(e) {
    e.preventDefault();
    try {
      const updated = await updateUser(
        user.id,
        new FormData(e.currentTarget).get("displayName"),
      );
      setUser(updated);
      setMessage("Đã cập nhật hồ sơ.");
      window.dispatchEvent(new Event("auth-changed"));
    } catch (error) {
      setError(error.message);
    }
  }
  async function submitPassword(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("newPassword") !== form.get("confirmPassword")) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      await changePassword(
        form.get("currentPassword"),
        form.get("newPassword"),
      );
      e.currentTarget.reset();
      setMessage("Đã đổi mật khẩu.");
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <Page title="Cài đặt tài khoản">
      {user && (
        <>
          <section className="settings-hero panel">
            <div className="avatar-big">{user.displayName.slice(0, 1)}</div>
            <div>
              <p className="eyebrow">TÀI KHOẢN CARX</p>
              <h2>{user.displayName}</h2>
              <p>
                Mã người dùng #{user.id} ·{" "}
                {user.userStatusId === 1 ? "Đang hoạt động" : "Cần kiểm tra"}
              </p>
              <small>
                Tham gia từ{" "}
                {new Date(user.joinedAt).toLocaleDateString("vi-VN")} · Cập nhật
                hoạt động{" "}
                {user.lastActiveAt ? timeAgo(user.lastActiveAt) : "chưa có"}
              </small>
            </div>
            <Link className="secondary" to="/ho-so">
              Xem hồ sơ
            </Link>
          </section>
          <div className="account-stats">
            <Link to="/tin-cua-toi">
              <b>{summary.posts}</b>
              <span>Tin đang bán</span>
            </Link>
            <Link to="/tin-da-luu">
              <b>{summary.saved}</b>
              <span>Tin đã lưu</span>
            </Link>
            <Link to="/thong-bao">
              <b>{summary.unread}</b>
              <span>Thông báo mới</span>
            </Link>
          </div>
          <div className="settings-layout">
            <aside className="account-menu">
              <Link to="/tin-cua-toi">
                <span className="account-menu-label"><Icon name="list" size={18} /> Quản lý tin đăng</span><Icon name="chevronRight" size={16} />
              </Link>
              <Link to="/tin-da-luu">
                <span className="account-menu-label"><Icon name="heart" size={18} /> Tin đã lưu</span><Icon name="chevronRight" size={16} />
              </Link>
              <Link to="/danh-gia">
                <span className="account-menu-label"><Icon name="star" size={18} /> Giao dịch & đánh giá</span><Icon name="chevronRight" size={16} />
              </Link>
              <Link to="/chat">
                <span className="account-menu-label"><Icon name="message" size={18} /> Tin nhắn</span><Icon name="chevronRight" size={16} />
              </Link>
            </aside>
            <div className="settings-forms">
              <form className="panel form" onSubmit={submitProfile}>
                <div>
                  <p className="eyebrow">HỒ SƠ CÔNG KHAI</p>
                  <h2>Thông tin hiển thị</h2>
                  <p className="page-description">
                    Tên này sẽ xuất hiện trong tin đăng, chat và đánh giá.
                  </p>
                </div>
                <label>
                  Tên hiển thị
                  <input
                    name="displayName"
                    defaultValue={user.displayName}
                    required
                    minLength="2"
                    maxLength="100"
                  />
                </label>
                <button className="primary">Lưu thông tin</button>
              </form>
              <form className="panel form" onSubmit={submitPassword}>
                <div>
                  <p className="eyebrow">BẢO MẬT</p>
                  <h2>Đổi mật khẩu</h2>
                  <p className="page-description">
                    Dùng mật khẩu ít nhất 8 ký tự và không chia sẻ với người
                    khác.
                  </p>
                </div>
                <input
                  name="currentPassword"
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  required
                />
                <input
                  name="newPassword"
                  type="password"
                  placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
                  minLength="8"
                  required
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  minLength="8"
                  required
                />
                <button className="secondary">Đổi mật khẩu</button>
              </form>
            </div>
          </div>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </>
      )}
    </Page>
  );
}
export function Notifications() {
  const navigate = useNavigate(),
    [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [busyId, setBusyId] = useState();
  useEffect(() => {
    notifications()
      .then(setItems)
      .catch((error) => setError(error.message));
  }, []);
  async function open(item) {
    setBusyId(item.id);
    try {
      if (!item.readAt) {
        await readNotification(item.id);
        setItems((previous) =>
          previous.map((value) =>
            value.id === item.id
              ? { ...value, readAt: new Date().toISOString() }
              : value,
          ),
        );
        window.dispatchEvent(new Event("notification-changed"));
      }
      if (item.referencePath?.startsWith("/")) navigate(item.referencePath);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyId();
    }
  }
  const unread = items.filter((item) => !item.readAt).length;
  return (
    <Page title="Thông báo">
      <div className="page-toolbar">
        <p>
          {unread ? `${unread} thông báo chưa đọc` : "Bạn đã xem hết thông báo"}
        </p>
      </div>
      {error && <p className="error">{error}</p>}
      {items.length ? (
        <div className="notification-list">
          {items.map((item) => (
            <button
              type="button"
              className={
                item.readAt ? "notification-item" : "notification-item unread"
              }
              key={item.id}
              onClick={() => open(item)}
              disabled={busyId === item.id}
            >
              <span className="notification-dot" />
              <span>
                <b>{item.body}</b>
                <small>{timeAgo(item.createdAt)}</small>
              </span>
              <Icon name="chevronRight" size={16} />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="Không có thông báo mới">
          Hoạt động về tin đăng, chat và giao dịch sẽ xuất hiện tại đây.
        </EmptyState>
      )}
    </Page>
  );
}
