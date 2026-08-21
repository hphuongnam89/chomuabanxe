import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  confirmReceipt,
  createReview,
  myTransactions,
  reportListing,
} from "../../api.js";
import { EmptyState, Page } from "../../components/MarketplaceUi.jsx";

export function Reviews() {
  const [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [busyId, setBusyId] = useState();
  const load = () =>
    myTransactions()
      .then(setItems)
      .catch((error) => setError(error.message));
  useEffect(() => {
    load();
  }, []);
  async function confirm(id) {
    if (busyId) return;
    setBusyId(id);
    try {
      await confirmReceipt(id);
      await load();
      window.dispatchEvent(new Event("notification-changed"));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyId();
    }
  }
  async function submit(e, id) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusyId(id);
    try {
      await createReview(id, f.get("rating"), f.get("body"));
      await load();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyId();
    }
  }
  return (
    <Page title="Giao dịch & đánh giá">
      <p className="page-description">
        Chỉ xác nhận sau khi bạn đã nhận xe và kiểm tra xe.
      </p>
      {error && <p className="error">{error}</p>}
      {items.length ? (
        items.map((item) => (
          <section className="transaction-card panel" key={item.id}>
            <div className="transaction-head">
              <div>
                <b>Giao dịch tin #{item.listingId}</b>
                <small>
                  {item.status === "PENDING_BUYER_CONFIRM"
                    ? "Chờ bạn xác nhận"
                    : "Đã hoàn tất"}
                </small>
              </div>
              <span
                className={`transaction-status ${item.status.toLowerCase()}`}
              >
                {item.status === "PENDING_BUYER_CONFIRM"
                  ? "Chờ xác nhận"
                  : "Hoàn tất"}
              </span>
            </div>
            {item.status === "PENDING_BUYER_CONFIRM" ? (
              <>
                <p>
                  Người bán đã đánh dấu đã bán. Chỉ xác nhận khi bạn đã nhận
                  đúng xe.
                </p>
                <button
                  type="button"
                  className="primary"
                  disabled={busyId === item.id}
                  onClick={() => confirm(item.id)}
                >
                  {busyId === item.id ? "Đang xử lý..." : "Tôi đã nhận hàng"}
                </button>
              </>
            ) : item.status === "CONFIRMED" && !item.reviewed ? (
              <form
                className="review-form"
                onSubmit={(e) => submit(e, item.id)}
              >
                <label>
                  Đánh giá người bán
                  <select name="rating" defaultValue="5">
                    <option value="5">5 — Rất tốt</option>
                    <option value="4">4 — Tốt</option>
                    <option value="3">3 — Bình thường</option>
                    <option value="2">2 — Cần cải thiện</option>
                    <option value="1">1 — Không hài lòng</option>
                  </select>
                </label>
                <textarea
                  name="body"
                  placeholder="Chia sẻ trải nghiệm của bạn (tùy chọn)"
                />
                <button className="primary" disabled={busyId === item.id}>
                  {busyId === item.id ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </form>
            ) : (
              <p className="success">
                {item.reviewed
                  ? "Bạn đã gửi đánh giá cho giao dịch này."
                  : "Đang chờ xác nhận từ người bán."}
              </p>
            )}
          </section>
        ))
      ) : (
        <EmptyState title="Chưa có giao dịch cần xử lý">
          Khi giao dịch hoàn tất, bạn có thể đánh giá người bán tại đây.
        </EmptyState>
      )}
    </Page>
  );
}
export function Report() {
  const [query] = useSearchParams(),
    navigate = useNavigate(),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false),
    listingId = query.get("listing");
  async function submit(e) {
    e.preventDefault();
    if (!listingId) {
      setError("Thiếu mã tin cần báo cáo.");
      return;
    }
    setSubmitting(true);
    const f = new FormData(e.currentTarget);
    try {
      await reportListing(
        listingId,
        Number(f.get("reasonId")),
        f.get("details"),
      );
      navigate(`/tin/${listingId}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Page title="Báo cáo tin">
      <div className="report-intro">
        <p className="eyebrow">AN TOÀN CỘNG ĐỒNG</p>
        <h2>Giúp CarX an toàn hơn</h2>
        <p>
          Chỉ báo cáo khi bạn thấy tin đăng vi phạm. Báo cáo được gửi riêng đến
          đội ngũ kiểm duyệt.
        </p>
      </div>
      <form className="panel form" onSubmit={submit}>
        <label>
          Lý do báo cáo
          <select name="reasonId" required defaultValue="">
            <option value="" disabled>
              Chọn lý do
            </option>
            <option value="1">Spam hoặc thông tin sai lệch</option>
            <option value="2">Nghi ngờ lừa đảo</option>
            <option value="3">Hàng hóa bị cấm</option>
          </select>
        </label>
        <label>
          Thông tin bổ sung
          <textarea
            name="details"
            placeholder="Mô tả ngắn vấn đề bạn gặp phải (tùy chọn)"
          />
        </label>
        <button className="primary" disabled={submitting}>
          {submitting ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </Page>
  );
}
