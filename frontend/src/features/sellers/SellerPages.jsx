import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  followSeller,
  searchListings,
  sellerTrust,
  user,
} from "../../api.js";
import { useCatalog } from "../../catalog.js";
import { ListingCard, Page } from "../../components/MarketplaceUi.jsx";
import { Icon } from "../../components/Icon.jsx";

export function SellerTrust({ sellerId }) {
  const [seller, setSeller] = useState(),
    [score, setScore] = useState(),
    [message, setMessage] = useState("");
  useEffect(() => {
    Promise.all([user(sellerId), sellerTrust(sellerId)])
      .then(([profile, trust]) => {
        setSeller(profile);
        setScore(trust);
      })
      .catch(() => {});
  }, [sellerId]);
  async function follow() {
    try {
      await followSeller(sellerId);
      setMessage("Đã theo dõi người bán.");
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <section className="panel seller-card">
      <div className="seller-avatar">
        {seller?.displayName?.slice(0, 1) || "O"}
      </div>
      <div className="seller-info">
        <b>Người bán</b>
        {seller && (
          <Link to={`/nguoi-ban/${sellerId}`}>
            <h3>{seller.displayName}</h3>
          </Link>
        )}
        <p>
          <Icon name="star" size={16} /> {score?.averageRating || "Chưa có đánh giá"} ·{" "}
          {score?.reviewCount || 0} đánh giá
        </p>
        <small>
          Tham gia từ{" "}
          {seller
            ? new Date(seller.joinedAt).toLocaleDateString("vi-VN")
            : "..."}
        </small>
      </div>
      <button className="secondary" onClick={follow}>
        Theo dõi
      </button>
      {message && <p className="seller-message">{message}</p>}
    </section>
  );
}
export function SellerListings({ sellerId, excludeId }) {
  const [items, setItems] = useState([]);
  const catalog = useCatalog();
  useEffect(() => {
    searchListings({ sellerUserId: sellerId, size: 4 })
      .then((page) =>
        setItems(page.content.filter((item) => item.id !== excludeId)),
      )
      .catch(() => {});
  }, [sellerId, excludeId]);
  return items.length ? (
    <section className="section">
      <h2>Tin khác của người bán</h2>
      <div className="grid">
        {items.map((item) => (
          <ListingCard
            item={item}
            locations={catalog.locations}
            vehicleOptions={catalog.vehicle}
            key={item.id}
          />
        ))}
      </div>
    </section>
  ) : null;
}
export function SellerProfile() {
  const { id } = useParams(),
    [seller, setSeller] = useState(),
    [score, setScore] = useState(),
    [items, setItems] = useState([]),
    catalog = useCatalog();
  useEffect(() => {
    Promise.all([
      user(id),
      sellerTrust(id),
      searchListings({ sellerUserId: id }),
    ])
      .then(([profile, trust, page]) => {
        setSeller(profile);
        setScore(trust);
        setItems(page.content);
      })
      .catch(() => {});
  }, [id]);
  if (!seller) return <Page title="Người bán">Đang tải...</Page>;
  return (
    <Page title="Người bán">
      <section className="panel">
        <h2>{seller.displayName}</h2>
        <p>
          Tham gia CarX từ{" "}
          {new Date(seller.joinedAt).toLocaleDateString("vi-VN")}.
        </p>
        {score && (
          <p>
            Trust Score: {score.averageRating || "Chưa có"} ·{" "}
            {score.reviewCount} đánh giá
          </p>
        )}
      </section>
      <section className="section">
        <h2>Tin đang bán</h2>
        <div className="grid">
          {items.map((item) => (
          <ListingCard
            item={item}
            locations={catalog.locations}
            vehicleOptions={catalog.vehicle}
            key={item.id}
            />
          ))}
        </div>
      </section>
    </Page>
  );
}
