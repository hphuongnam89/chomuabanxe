import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  login,
  markSession,
  me,
  register,
  requestPasswordReset,
} from "../../api.js";
import { safeReturnTo } from "../../authNavigation.js";
import { Page } from "../../components/MarketplaceUi.jsx";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export function Captcha() {
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || window.turnstile) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);
  return TURNSTILE_SITE_KEY ? (
    <div
      className="cf-turnstile captcha-box"
      data-sitekey={TURNSTILE_SITE_KEY}
    />
  ) : null;
}

export function Login() {
  const navigate = useNavigate(),
    [query] = useSearchParams(),
    [error, setError] = useState(
      query.get("oauthError") === "invalid_credentials"
        ? "Đăng nhập Google chưa được cấu hình đúng. Vui lòng thử lại sau khi hệ thống được cập nhật."
        : query.get("message") || "",
    );
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      const session = await login(f.get("email"), f.get("password"));
      navigate(
        safeReturnTo(query.get("returnTo")) ||
          (session.roles?.some((role) => ["ADMIN", "STAFF_CUSTOMER", "STAFF_CONTENT"].includes(role))
            ? "/admin"
            : "/"),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Auth title="Đăng nhập">
      <form onSubmit={submit}>
        <input name="email" type="email" placeholder="Email" required />
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          required
        />
        <Captcha />
        <button className="primary">Đăng nhập</button>
        <a className="secondary" style={{ gap: 10 }} href="/api/v1/auth/oauth2/authorization/google">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z"/><path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.5Z"/><path fill="#FBBC05" d="M6.54 13.58a5.86 5.86 0 0 1 0-3.16V7.89H3.29a9.75 9.75 0 0 0 0 8.22l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.39l3.25 2.53C7.31 8.11 9.46 6.39 12 6.39Z"/></svg>
          Đăng nhập với Google
        </a>
        {error && <p className="error">{error}</p>}
        <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
        <Link to="/dang-ky">Chưa có tài khoản? Đăng ký</Link>
      </form>
    </Auth>
  );
}
export function OAuthSuccess() {
  const navigate = useNavigate(), [error, setError] = useState("");
  useEffect(() => { me().then(() => { markSession(); window.dispatchEvent(new Event("auth-changed")); navigate("/", { replace: true }); }).catch((e) => setError(e.message || "Không thể hoàn tất đăng nhập.")); }, [navigate]);
  return <Page><p>{error || "Đang hoàn tất đăng nhập…"}</p></Page>;
}
export function Register() {
  const navigate = useNavigate(),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await register(f.get("displayName"), f.get("email"), f.get("password"));
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Auth title="Tạo tài khoản">
      <form onSubmit={submit}>
        <input name="displayName" placeholder="Tên hiển thị" required />
        <input name="email" type="email" placeholder="Email" required />
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu (ít nhất 8 ký tự)"
          minLength="8"
          required
        />
        <Captcha />
        <button className="primary">Tạo tài khoản</button>
        {error && <p className="error">{error}</p>}
        <Link to="/dang-nhap">Đã có tài khoản? Đăng nhập</Link>
      </form>
    </Auth>
  );
}
function Auth({ title, children }) {
  return (
    <main className="auth">
      <section className="panel">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
export function Forgot() {
  const [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      await requestPasswordReset(new FormData(e.currentTarget).get("email"));
      setMessage("Nếu email tồn tại, hướng dẫn đặt lại đã được tạo.");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Auth title="Quên mật khẩu">
      <form onSubmit={submit}>
        <input
          name="email"
          type="email"
          placeholder="Email đã đăng ký"
          required
        />
        <button className="primary">Gửi hướng dẫn đặt lại</button>
        {message && <p>{message}</p>}
        {error && <p className="error">{error}</p>}
        <Link to="/dang-nhap">Quay lại đăng nhập</Link>
      </form>
    </Auth>
  );
}
