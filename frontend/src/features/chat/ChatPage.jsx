import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  confirmTransaction,
  conversationMessages,
  conversations,
  listing,
  me,
  sendMessage,
  user,
} from "../../api.js";
import {
  EmptyState,
  Page,
  timeAgo,
  visual,
} from "../../components/MarketplaceUi.jsx";

export default function Chat() {
  const [query] = useSearchParams(),
    navigate = useNavigate(),
    id = query.get("conversation"),
    [threads, setThreads] = useState([]),
    [listings, setListings] = useState({}),
    [profiles, setProfiles] = useState({}),
    [items, setItems] = useState([]),
    [body, setBody] = useState(""),
    [currentUser, setCurrentUser] = useState(),
    [message, setMessage] = useState(""),
    [sending, setSending] = useState(false),
    [error, setError] = useState("");
  const thread = threads.find((value) => String(value.id) === id),
    threadListing = thread && listings[thread.listingId],
    otherId =
      thread &&
      currentUser &&
      (currentUser.id === thread.buyerUserId
        ? thread.sellerUserId
        : thread.buyerUserId),
    otherUser = otherId && profiles[otherId];
  useEffect(() => {
    Promise.all([conversations(), me()])
      .then(async ([items, current]) => {
        setThreads(items);
        setCurrentUser(current);
        const pairs = await Promise.all(
          items.map((thread) =>
            listing(thread.listingId)
              .then((item) => [thread.listingId, item])
              .catch(() => [thread.listingId, null]),
          ),
        );
        setListings(Object.fromEntries(pairs.filter(([, item]) => item)));
        const ids = [
          ...new Set(
            items
              .flatMap((thread) => [thread.buyerUserId, thread.sellerUserId])
              .filter((userId) => userId !== current.id),
          ),
        ];
        const users = await Promise.all(
          ids.map((id) =>
            user(id)
              .then((profile) => [id, profile])
              .catch(() => [id, null]),
          ),
        );
        setProfiles(Object.fromEntries(users.filter(([, profile]) => profile)));
      })
      .catch((error) => setError(error.message));
  }, []);
  useEffect(() => {
    if (!id) return;
    const load = () =>
      conversationMessages(id)
        .then(setItems)
        .catch((error) => setError(error.message));
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [id]);
  async function submit(e) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const item = await sendMessage(id, body);
      setItems((previous) => [...previous, item]);
      setBody("");
      window.dispatchEvent(new Event("notification-changed"));
    } catch (error) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  }
  async function markSold() {
    if (!thread) return;
    try {
      await confirmTransaction(thread.listingId, thread.buyerUserId);
      setMessage(
        "Đã đánh dấu đã bán. Người mua sẽ nhận được yêu cầu xác nhận.",
      );
    } catch (error) {
      setError(error.message);
    }
  }
  function threadTitle(thread) {
    return listings[thread.listingId]?.title || `Tin #${thread.listingId}`;
  }
  function partnerName(thread) {
    const id =
      currentUser?.id === thread.buyerUserId
        ? thread.sellerUserId
        : thread.buyerUserId;
    return profiles[id]?.displayName || "Người dùng CarX";
  }
  return (
    <Page title="Chat">
      <div className="two-pane chat-layout">
        <aside className="panel chat-list">
          <div>
            <b>Cuộc trò chuyện</b>
            <small>{threads.length} cuộc trò chuyện</small>
          </div>
          {threads.length ? (
            threads.map((thread) => (
              <button
                type="button"
                key={thread.id}
                className={
                  String(thread.id) === id
                    ? "chat-thread active"
                    : "chat-thread"
                }
                onClick={() => navigate(`/chat?conversation=${thread.id}`)}
              >
                <span>
                  <b>{partnerName(thread)}</b>
                  <small>{threadTitle(thread)}</small>
                </span>
                <small>
                  {thread.lastMessageAt ? timeAgo(thread.lastMessageAt) : "Mới"}
                </small>
              </button>
            ))
          ) : (
            <EmptyState title="Chưa có cuộc trò chuyện">
              Mở một tin đăng để nhắn người bán.
            </EmptyState>
          )}
        </aside>
        <section className="panel chat-room">
          {thread ? (
            <>
              <div className="chat-room-head">
                <div>
                  <Link
                    className="chat-listing-summary"
                    to={`/tin/${thread.listingId}`}
                  >
                    <span className="chat-thumb">
                      {threadListing ? visual(threadListing) : "📦"}
                    </span>
                    <span>
                      <b>
                        {threadListing?.title || `Tin #${thread.listingId}`}
                      </b>
                      <strong>
                        {threadListing
                          ? `${threadListing.priceAmount.toLocaleString("vi-VN")} đ`
                          : "Đang tải giá..."}
                      </strong>
                      <small>Trao đổi an toàn ngay trên CarX</small>
                    </span>
                  </Link>
                  {otherId && (
                    <Link className="chat-partner" to={`/nguoi-ban/${otherId}`}>
                      Đang chat với{" "}
                      <b>{otherUser?.displayName || "Người dùng CarX"}</b>{" "}
                      · Xem hồ sơ và tin đang bán
                    </Link>
                  )}
                </div>
                {currentUser?.id === thread.sellerUserId && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={markSold}
                  >
                    Đánh dấu đã bán
                  </button>
                )}
              </div>
              <div className="messages">
                {items.map((item) => (
                  <div
                    className={
                      item.senderUserId === currentUser?.id
                        ? "message own"
                        : "message"
                    }
                    key={item.id}
                  >
                    {item.body}
                    <small>
                      {item.senderUserId === currentUser?.id
                        ? "Bạn"
                        : profiles[item.senderUserId]?.displayName ||
                          "Người dùng"}{" "}
                      ·{" "}
                      {new Date(item.sentAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                ))}
              </div>
              <form className="chat-compose" onSubmit={submit}>
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Nhập tin nhắn"
                  required
                />
                <button className="primary" disabled={sending}>
                  {sending ? "Đang gửi..." : "Gửi"}
                </button>
              </form>
            </>
          ) : (
            <EmptyState title="Chọn một cuộc trò chuyện">
              Tin nhắn của bạn sẽ được lưu tại đây.
            </EmptyState>
          )}
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </section>
      </div>
    </Page>
  );
}
