import { cloneElement, Component, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { hasSession, logout, me, notifications } from "../api.js";
import { useCatalog } from "../catalog.js";
import { EmptyState, Page } from "../components/MarketplaceUi.jsx";

const nav = [
  ["/", "Trang chủ"],
  ["/tim-kiem", "Tìm kiếm"],
  ["/chat", "Chat"],
  ["/thong-bao", "Thông báo"],
  ["/ho-so", "Tôi"],
];
const quickCategories = [
  ["Sedan", 21],
  ["SUV / CUV", 22],
  ["Hatchback", 23],
  ["MPV", 24],
  ["Bán tải", 25],
  ["Coupe", 26],
  ["Mui trần", 27],
  ["Xe điện", 28],
  ["Xe sang", 29],
  ["Khác", 30],
];

export function Protected({ children }) {
  const location = useLocation();
  if (hasSession()) return children;
  const returnTo = `${location.pathname}${location.search}`;
  return (
    <Navigate
      to={`/dang-nhap?returnTo=${encodeURIComponent(returnTo)}&message=${encodeURIComponent("Vui lòng đăng nhập để tiếp tục.")}`}
      replace
    />
  );
}
export function AdminOnly({ children }) {
  const [current, setCurrent] = useState(),
    [error, setError] = useState("");
  useEffect(() => {
    me()
      .then(setCurrent)
      .catch((error) => setError(error.message));
  }, []);
  if (error)
    return (
      <Page title="Quản trị">
        <p className="error">{error}</p>
      </Page>
    );
  if (!current)
    return <Page title="Quản trị">Đang kiểm tra quyền truy cập...</Page>;
  const canAccessAdmin = current.roles?.some((role) =>
    ["ADMIN", "STAFF_CUSTOMER", "STAFF_CONTENT"].includes(role),
  );
  if (!canAccessAdmin)
    return (
      <Page title="Quản trị">
        <EmptyState
          title="Bạn không có quyền truy cập trang quản trị"
          action={
            <Link className="secondary" to="/">
              Về trang chủ
            </Link>
          }
        >
          Trang này chỉ dành cho tài khoản có vai trò vận hành CarX.
        </EmptyState>
      </Page>
    );
  return cloneElement(children, { roles: current.roles || [] });
}

export class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main id="main-content" className="fatal-error">
        <div className="panel">
          <h1>Đã có lỗi xảy ra</h1>
          <p>Vui lòng tải lại trang hoặc quay về trang chủ.</p>
          <a className="primary" href="/">
            Về trang chủ
          </a>
        </div>
      </main>
    ) : (
      this.props.children
    );
  }
}
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
export function Shell({ children }) {
  const navigate = useNavigate(),
    [user, setUser] = useState(),
    [unread, setUnread] = useState(0),
    [keyword, setKeyword] = useState(""),
    catalog = useCatalog();
  useEffect(() => {
    const load = async () => {
      if (!hasSession()) {
        setUser();
        setUnread(0);
        return;
      }
      try {
        const currentUser = await me();
        setUser(currentUser);
        const items = await notifications();
        setUnread(items.filter((item) => !item.readAt).length);
      } catch (error) {
        setUser();
        setUnread(0);
        if (error?.status === 401 || error?.status === 403) logout();
      }
    };
    load();
    window.addEventListener("auth-changed", load);
    window.addEventListener("notification-changed", load);
    return () => {
      window.removeEventListener("auth-changed", load);
      window.removeEventListener("notification-changed", load);
    };
  }, []);
  function submitSearch(e) {
    e.preventDefault();
    navigate(
      `/tim-kiem${keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : ""}`,
    );
  }
  return (
    <>
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <header>
        <Link className="brand" to="/">
          CARX
        </Link>
        <details className="area-picker">
          <summary className="location">⌖ Khu vực</summary>
          <div className="area-menu" role="menu">
            <Link to="/tim-kiem">Tất cả khu vực</Link>
            {catalog.provinces.map((location) => (
              <Link
                to={`/tim-kiem?locationId=${location.id}`}
                key={location.id}
              >
                {location.label}
              </Link>
            ))}
          </div>
        </details>
        <form className="searchbox" onSubmit={submitSearch}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm xe..."
            aria-label="Tìm xe"
          />
          <button type="submit" aria-label="Tìm kiếm">
            ⌕
          </button>
        </form>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          <Link to="/chat">Chat</Link>
          <Link to="/thong-bao">Thông báo{unread ? ` (${unread})` : ""}</Link>
          {user ? (
            <>
              <Link className="user-link" to="/ho-so">
                {user.displayName}
              </Link>
              <button
                type="button"
                className="secondary logout"
                onClick={logout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link className="login-link" to="/dang-nhap">
              Đăng nhập
            </Link>
          )}
          <Link className="primary" to="/dang-tin">
            ＋ Đăng tin
          </Link>
        </nav>
      </header>
      <nav className="category-bar" aria-label="Danh mục nhanh">
        {quickCategories.map(([name, id]) => (
          <Link to={`/tim-kiem?categoryId=${id}`} key={id}>
            {name}
          </Link>
        ))}
      </nav>
      {children}
      <footer>
        <div className="footer-grid">
          <section>
            <Link className="brand" to="/">
              CARX
            </Link>
            <p>Mua bán xe rõ ràng, minh bạch và gần bạn.</p>
            <Link className="primary" to="/dang-tin">
              Đăng tin miễn phí
            </Link>
          </section>
          <section>
            <b>Khám phá</b>
            <Link to="/tim-kiem">Tìm kiếm tin</Link>
            <Link to="/tin-cua-toi">Quản lý tin đăng</Link>
            <Link to="/danh-gia">Đánh giá giao dịch</Link>
          </section>
          <section>
            <b>Hỗ trợ</b>
            <a href="mailto:support@carx.local">Liên hệ hỗ trợ</a>
            <Link to="/bao-cao">Báo cáo tin xấu</Link>
            <Link to="/cai-dat">Cài đặt tài khoản</Link>
          </section>
          <section>
            <b>CarX</b>
            <p>Không tin VIP. Không lượt đẩy tin. Tin mới luôn lên đầu.</p>
          </section>
        </div>
        <div className="footer-bottom">
          © 2026 CarX · Nền tảng mua bán xe minh bạch.
        </div>
      </footer>
      <nav className="mobile-nav" aria-label="Điều hướng di động">
        {nav.map(([to, label]) => (
          <NavLink to={to} key={to}>
            {label}
          </NavLink>
        ))}
        <NavLink className="post-fab" to="/dang-tin" aria-label="Đăng tin">
          ＋
        </NavLink>
      </nav>
    </>
  );
}
