import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  archiveListing,
  listing,
  myListings,
  savedListingIds,
  unsaveListing,
} from "../../api.js";
import { useCatalog } from "../../catalog.js";
import { Icon } from "../../components/Icon.jsx";
import {
  EmptyState,
  ListingCard,
  Page,
} from "../../components/MarketplaceUi.jsx";

export function MyPosts() {
  const [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [busyId, setBusyId] = useState(),
    catalog = useCatalog();
  useEffect(() => {
    myListings()
      .then((page) => setItems(page.content))
      .catch((error) => setError(error.message));
  }, []);
  async function remove(id) {
    if (!window.confirm("Ẩn tin đăng này?")) return;
    setBusyId(id);
    try {
      await archiveListing(id);
      setItems((previous) => previous.filter((item) => item.id !== id));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyId();
    }
  }
  return (
    <Page title="Tin của tôi">
      <div className="page-toolbar">
        <p>{items.length} tin đang hiển thị</p>
        <Link className="primary" to="/dang-tin">
          <Icon name="plus" size={18} /> Đăng tin
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      {items.length ? (
        <div className="grid">
          {items.map((item) => (
            <article className="my-listing card" key={item.id}>
              <span className="status-chip">Đang bán</span>
              <ListingCard
                item={item}
                locations={catalog.locations}
                vehicleOptions={catalog.vehicle}
              />
              <div className="actions">
                <Link className="secondary" to={`/tin/${item.id}/sua`}>
                  Sửa tin
                </Link>
                <button
                  type="button"
                  className="secondary"
                  disabled={busyId === item.id}
                  onClick={() => remove(item.id)}
                >
                  {busyId === item.id ? "Đang ẩn..." : "Ẩn tin"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Bạn chưa có tin đăng"
          action={
            <Link className="primary" to="/dang-tin">
              Đăng tin đầu tiên
            </Link>
          }
        >
          Đăng món đồ không dùng để bắt đầu mua bán.
        </EmptyState>
      )}
    </Page>
  );
}
export function Saved() {
  const [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [busyId, setBusyId] = useState(),
    catalog = useCatalog();
  useEffect(() => {
    savedListingIds()
      .then((ids) => Promise.all(ids.map(listing)))
      .then(setItems)
      .catch((error) => setError(error.message));
  }, []);
  async function remove(id) {
    setBusyId(id);
    try {
      await unsaveListing(id);
      setItems((previous) => previous.filter((item) => item.id !== id));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyId();
    }
  }
  return (
    <Page title="Tin đã lưu">
      {error && <p className="error">{error}</p>}
      {items.length ? (
        <div className="grid">
          {items.map((item) => (
            <article className="saved-card" key={item.id}>
              <ListingCard
                item={item}
                locations={catalog.locations}
                vehicleOptions={catalog.vehicle}
              />
              <button
                type="button"
                className="text-button"
                disabled={busyId === item.id}
                onClick={() => remove(item.id)}
              >
                {busyId === item.id ? "Đang bỏ..." : "Bỏ lưu"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có tin đã lưu"
          action={
            <Link className="primary" to="/tim-kiem">
              Khám phá tin đăng
            </Link>
          }
        >
          Nhấn “Lưu tin” ở trang chi tiết để xem lại sau.
        </EmptyState>
      )}
    </Page>
  );
}
