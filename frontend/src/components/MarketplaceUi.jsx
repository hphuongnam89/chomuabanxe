import { useEffect } from "react";
import { Link } from "react-router-dom";

export const timeAgo = (value) => {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value)) / 60000),
  );
  return minutes < 1
    ? "Vừa xong"
    : minutes < 60
      ? `${minutes} phút trước`
      : minutes < 1440
        ? `${Math.floor(minutes / 60)} giờ trước`
        : new Date(value).toLocaleDateString("vi-VN");
};
export function ListingCard({ item, locations, vehicleOptions }) {
  const location =
    locations.find((value) => value.id === item.locationId)?.label ||
      "Khu vực chưa rõ",
    brand = vehicleOptions?.brands?.find(
      (value) => value.id === item.vehicle?.brandId,
    )?.name,
    vehicleLabel = [brand, item.vehicle?.manufactureYear]
      .filter(Boolean)
      .join(" · ");
  return (
    <Link className="card" to={`/tin/${item.id}`}>
      <div className="image">
        {visual(item)}
        <span className="condition-badge">{conditions[item.conditionId]}</span>
      </div>
      <b>{item.title}</b>
      <strong>{item.priceAmount.toLocaleString("vi-VN")} đ</strong>
      <small>
        {vehicleLabel ? `${vehicleLabel} · ` : ""}
        {item.addressDetail ? `${item.addressDetail} · ` : ""}
        {location} · {timeAgo(item.publishedAt)}
      </small>
    </Link>
  );
}

export function ListingSkeleton() {
  return (
    <div className="card skeleton-card" aria-label="Đang tải tin đăng">
      <div className="image skeleton" />
      <i className="skeleton line" />
      <i className="skeleton line short" />
      <i className="skeleton line medium" />
    </div>
  );
}
export function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state panel">
      <div aria-hidden="true">⌕</div>
      <b>{title}</b>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Page({ title, children }) {
  useEffect(() => {
    document.title = `${title} | CarX`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        `${title} trên CarX – mua bán xe rõ ràng, minh bạch và gần bạn.`,
      );
  }, [title]);
  return (
    <main id="main-content" tabIndex="-1">
      <div className="page-heading">
        <h1>{title}</h1>
      </div>
      {children}
    </main>
  );
}

const categoryIcons = {
  21: "🚘",
  22: "🚙",
  23: "🚗",
  24: "🚐",
  25: "🛻",
  26: "🏎️",
  27: "🌤️",
  28: "⚡",
  29: "✨",
  30: "🚘",
};
export const visual = (item) =>
  item.coverImageUrl ? (
    <img
      src={item.coverImageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    categoryIcons[item.categoryId] || "📦"
  );
export const conditions = {
  1: "Mới",
  2: "Đã sử dụng (chưa sửa chữa)",
  3: "Đã sử dụng (qua sửa chữa)",
  4: "Khác",
};
