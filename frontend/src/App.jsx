import { cloneElement, Component, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  adminArchive,
  adminArchiveReport,
  adminDismissReport,
  adminReports,
  adminStats,
  archiveListing,
  categories,
  changePassword,
  confirmReceipt,
  confirmTransaction,
  conversationMessages,
  conversations,
  createListing,
  createReview,
  deleteImage,
  followSeller,
  hasSession,
  images,
  listing,
  listingRecommendations,
  locations,
  login,
  logout,
  markSession,
  me,
  myListings,
  myTransactions,
  newestListings,
  notifications,
  openConversation,
  readNotification,
  register,
  reportListing,
  requestPasswordReset,
  saveListing,
  savedListingIds,
  searchListings,
  sellerTrust,
  sendMessage,
  unsaveListing,
  updateListing,
  updateUser,
  uploadImage,
  user,
  vehicleCatalog,
  vehicleModels,
} from "./api.js";
import AdminConsole from "./AdminConsole.jsx";
import { viewedPreferences } from "./recommendationPreferences.js";
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
const visual = (item) =>
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
const conditions = {
  1: "Mới",
  2: "Đã sử dụng (chưa sửa chữa)",
  3: "Đã sử dụng (qua sửa chữa)",
  4: "Khác",
};
const withDetails = (_unused, description) => (description || "").trim();
const MAX_IMAGES = 3,
  MAX_IMAGE_SIZE = 5_000_000,
  validImage = (file) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
    file.size <= MAX_IMAGE_SIZE;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const emptyVehicleCatalog = {
  brands: [],
  origins: [],
  transmissions: [],
  fuels: [],
  colors: [],
  bodyTypes: [],
  drivelines: [],
};
const recommendationFields = [
  "brandId",
  "modelId",
  "minPrice",
  "maxPrice",
  "locationId",
];
const numericPreference = (value) =>
  /^\d+(\.\d+)?$/.test(String(value ?? "")) ? String(value) : "";
const readPreferences = (key) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (!saved || typeof saved !== "object") return null;
    const preferences = Object.fromEntries(
      recommendationFields
        .map((field) => [field, numericPreference(saved[field])])
        .filter(([, value]) => value),
    );
    return Object.keys(preferences).length ? preferences : null;
  } catch {
    return null;
  }
};
const savePreferences = (key, params) => {
  try {
    const preferences = Object.fromEntries(
      recommendationFields
        .map((field) => [field, numericPreference(params[field])])
        .filter(([, value]) => value),
    );
    if (Object.keys(preferences).length)
      localStorage.setItem(key, JSON.stringify(preferences));
    else localStorage.removeItem(key);
  } catch {
    // Private browsing may disable storage; search still works without it.
  }
};
const readLastSearch = () => readPreferences("carx:last-search");
const readLastViewed = () => readPreferences("carx:last-viewed");
const saveLastSearch = (params) => savePreferences("carx:last-search", params);
const saveLastViewed = (item) => {
  const preferences = viewedPreferences(item);
  if (preferences) savePreferences("carx:last-viewed", preferences);
};
const vehicleCatalogReady = (vehicle) =>
  Object.values(vehicle).every((options) => options.length > 0);
const flattenTree = (items, parent = "", parentId = null) =>
  items.flatMap((item) => [
    {
      ...item,
      parentId,
      label: parent ? `${parent} · ${item.name}` : item.name,
    },
    ...flattenTree(
      item.children || [],
      parent ? `${parent} · ${item.name}` : item.name,
      item.id,
    ),
  ]);
const categoryGroups = (items) =>
  items
    .map((group) => ({
      ...group,
      children: flattenTree(group.children || [], group.name).filter(
        (item) => item.leaf,
      ),
    }))
    .filter((group) => group.children.length);
function locationCatalog(items) {
  const flat = flattenTree(items),
    provinces = flat
      .filter((item) => item.level === 2)
      .map((item) => ({ ...item, label: item.name })),
    wards = flat
      .filter((item) => item.level === 3)
      .map((item) => ({ ...item, label: item.name }));
  return {
    provinces,
    wards,
    locations: [
      ...provinces,
      ...wards.map((ward) => ({
        ...ward,
        label: `${ward.name} · ${provinces.find((province) => province.id === ward.parentId)?.name || ""}`,
      })),
    ],
  };
}
function useCatalog() {
  const [catalog, setCatalog] = useState({
    categories: [],
    categoryGroups: [],
    provinces: [],
    wards: [],
    locations: [],
    vehicle: emptyVehicleCatalog,
    error: "",
  });
  useEffect(() => {
    Promise.all([categories(), locations(), vehicleCatalog()])
      .then(([categoryTree, locationTree, vehicleData]) => {
        const locationData = locationCatalog(locationTree);
        setCatalog({
          categories: flattenTree(categoryTree).filter((item) => item.leaf),
          categoryGroups: categoryGroups(categoryTree),
          ...locationData,
          vehicle: vehicleData,
          error: "",
        });
      })
      .catch((error) =>
        setCatalog({
          categories: [],
          categoryGroups: [],
          provinces: [],
          wards: [],
          locations: [],
          vehicle: emptyVehicleCatalog,
          error: error.message,
        }),
      );
  }, []);
  return catalog;
}
const timeAgo = (value) => {
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
function ListingCard({ item, categories, locations, vehicleOptions }) {
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
function Recommendations({ catalog, viewedListing, excludeId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const preferences = viewedPreferences(viewedListing) || readLastViewed() || readLastSearch();
    if (!preferences) {
      setItems([]);
      return;
    }
    listingRecommendations({ ...preferences, excludeId, size: 4 })
      .then((page) => setItems(page.content || []))
      .catch(() => setItems([]));
  }, [excludeId, viewedListing?.vehicle?.brandId, viewedListing?.priceAmount]);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="section-title">
        <div>
          <p className="eyebrow">DÀNH CHO BẠN</p>
          <h2>Xe có thể bạn quan tâm</h2>
        </div>
        <Link to="/tim-kiem">Xem thêm</Link>
      </div>
      <div className="grid">
        {items.map((item) => (
          <ListingCard
            item={item}
            categories={catalog.categories}
            locations={catalog.locations}
            vehicleOptions={catalog.vehicle}
            key={item.id}
          />
        ))}
      </div>
    </section>
  );
}
function ListingSkeleton() {
  return (
    <div className="card skeleton-card" aria-label="Đang tải tin đăng">
      <div className="image skeleton" />
      <i className="skeleton line" />
      <i className="skeleton line short" />
      <i className="skeleton line medium" />
    </div>
  );
}
function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state panel">
      <div aria-hidden="true">⌕</div>
      <b>{title}</b>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
function CategoryOptions({ catalog }) {
  return catalog.categoryGroups.length
    ? catalog.categoryGroups.map((group) => (
        <optgroup label={group.name} key={group.id}>
          {group.children.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </optgroup>
      ))
    : catalog.categories.map((category) => (
        <option value={category.id} key={category.id}>
          {category.label}
        </option>
      ));
}
function CatalogFields({ catalog, item }) {
  const [category, setCategory] = useState(String(item?.categoryId || "")),
    [province, setProvince] = useState(""),
    [ward, setWard] = useState(String(item?.locationId || "")),
    wards = catalog.wards.filter(
      (value) => String(value.parentId) === province,
    );
  useEffect(() => {
    if (province || !item?.locationId || !catalog.locations.length) return;
    const location = catalog.locations.find(
      (value) => value.id === item.locationId,
    );
    setProvince(
      String(location?.level === 3 ? location.parentId : location?.id || ""),
    );
  }, [catalog.locations, item?.locationId, province]);
  return (
    <section className="details-fields">
      <h2>Thông tin chi tiết</h2>
      {catalog.error && (
        <p className="error">Không tải được danh mục: {catalog.error}</p>
      )}
      <label>
        Danh mục *
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled={!catalog.categories.length}
        >
          <option value="" disabled>
            Chọn danh mục
          </option>
          <CategoryOptions catalog={catalog} />
        </select>
      </label>
      <label>
        Tình trạng *
        <select name="condition" defaultValue={item?.conditionId || 2} required>
          {Object.entries(conditions).map(([id, name]) => (
            <option value={id} key={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tỉnh/thành *
        <select
          value={province}
          onChange={(e) => {
            setProvince(e.target.value);
            setWard("");
          }}
          required
          disabled={!catalog.provinces.length}
        >
          <option value="" disabled>
            Chọn tỉnh/thành
          </option>
          {catalog.provinces.map((location) => (
            <option value={location.id} key={location.id}>
              {location.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Xã/phường *
        <select
          name="location"
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          required
          disabled={!province || !wards.length}
        >
          <option value="" disabled>
            Chọn xã/phường
          </option>
          {wards.map((location) => (
            <option value={location.id} key={location.id}>
              {location.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Địa chỉ chi tiết *
        <input
          name="addressDetail"
          defaultValue={item?.addressDetail || ""}
          maxLength="255"
          placeholder="Số nhà, tên đường, toà nhà..."
          required
        />
      </label>
    </section>
  );
}
const vehicleFieldNames = {
  brandId: "vehicleBrandId",
  modelId: "vehicleModelId",
  manufactureYear: "manufactureYear",
  transmissionId: "vehicleTransmissionId",
  fuelId: "vehicleFuelId",
  originId: "vehicleOriginId",
  colorId: "vehicleColorId",
  bodyTypeId: "vehicleBodyTypeId",
  seatCount: "vehicleSeatCount",
  drivelineId: "vehicleDrivelineId",
  mileageKm: "mileageKm",
};
function VehicleFields({ catalog, item, search = false, values = {}, onChange }) {
  const initial = item?.vehicle || {},
    vehicle = catalog.vehicle || emptyVehicleCatalog,
    [brandId, setBrandId] = useState(String(initial.brandId || "")),
    [modelId, setModelId] = useState(String(initial.modelId || "")),
    [models, setModels] = useState([]),
    selectedBrand = search ? String(values.brandId || "") : brandId,
    name = (field) => (search ? field : vehicleFieldNames[field]),
    value = (field) => (search ? values[field] || "" : initial[field] || ""),
    required = !search;
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      return;
    }
    vehicleModels(selectedBrand)
      .then(setModels)
      .catch(() => setModels([]));
  }, [selectedBrand]);
  const selectProps = (field) => {
    if (search)
      return {
        value: value(field),
        onChange: (event) => onChange(field, event.target.value),
      };
    if (field === "brandId")
      return {
        value: brandId,
        onChange: (event) => {
          setBrandId(event.target.value);
          setModelId("");
        },
      };
    if (field === "modelId")
      return {
        value: modelId,
        onChange: (event) => setModelId(event.target.value),
      };
    return { defaultValue: value(field) };
  };
  const options = (items, placeholder) => (
    <>
      <option value="">{placeholder}</option>
      {items.map((item) => (
        <option value={item.id} key={item.id}>
          {item.name}
        </option>
      ))}
    </>
  );
  const fields = (
    <>
      <label>
        Hãng xe {required ? "*" : ""}
        <select
          name={name("brandId")}
          {...selectProps("brandId")}
          required={required}
          disabled={!vehicle.brands.length}
        >
          {options(vehicle.brands, "Chọn hãng xe")}
        </select>
      </label>
      <label>
        Mẫu xe {required ? "*" : ""}
        <select
          name={name("modelId")}
          {...selectProps("modelId")}
          required={required}
          disabled={!selectedBrand || !models.length}
        >
          {options(models, "Chọn mẫu xe")}
        </select>
      </label>
      {search ? (
        <>
          <label>
            Năm từ
            <input name="minYear" type="number" min="1886" max="2100" value={values.minYear || ""} onChange={(event) => onChange("minYear", event.target.value)} />
          </label>
          <label>
            Năm đến
            <input name="maxYear" type="number" min="1886" max="2100" value={values.maxYear || ""} onChange={(event) => onChange("maxYear", event.target.value)} />
          </label>
        </>
      ) : (
        <label>
          Năm sản xuất *
          <input name={name("manufactureYear")} type="number" min="1886" max="2100" defaultValue={value("manufactureYear")} required />
        </label>
      )}
      {[
        ["transmissionId", "Hộp số", vehicle.transmissions, "Chọn hộp số"],
        ["fuelId", "Nhiên liệu", vehicle.fuels, "Chọn nhiên liệu"],
        ["originId", "Xuất xứ", vehicle.origins, "Chọn xuất xứ"],
        ["colorId", "Màu xe", vehicle.colors, "Chọn màu xe"],
        ["bodyTypeId", "Kiểu dáng", vehicle.bodyTypes, "Chọn kiểu dáng"],
        ["drivelineId", "Dẫn động", vehicle.drivelines, "Chọn hệ dẫn động"],
      ].map(([field, label, items, placeholder]) => (
        <label key={field}>
          {label} {required ? "*" : ""}
          <select
            name={name(field)}
            {...selectProps(field)}
            required={required}
            disabled={!items.length}
          >
            {options(items, placeholder)}
          </select>
        </label>
      ))}
      <label>
        Số chỗ {required ? "*" : ""}
        <input name={search ? "seatCount" : name("seatCount")} type="number" min="1" max="50" {...(search ? { value: values.seatCount || "", onChange: (event) => onChange("seatCount", event.target.value) } : { defaultValue: value("seatCount") })} required={required} />
      </label>
      {search ? (
        <>
          <label>
            Km tối thiểu
            <input name="minMileageKm" type="number" min="0" value={values.minMileageKm || ""} onChange={(event) => onChange("minMileageKm", event.target.value)} />
          </label>
          <label>
            Km tối đa
            <input name="maxMileageKm" type="number" min="0" value={values.maxMileageKm || ""} onChange={(event) => onChange("maxMileageKm", event.target.value)} />
          </label>
        </>
      ) : (
        <label>
          Số km đã đi
          <input name={name("mileageKm")} type="number" min="0" defaultValue={value("mileageKm")} />
        </label>
      )}
    </>
  );
  return search ? fields : <section className="details-fields vehicle-fields"><h2>Thông tin xe</h2>{fields}</section>;
}
function Protected({ children }) {
  return hasSession() ? children : <Navigate to="/dang-nhap" replace />;
}
function AdminOnly({ children }) {
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
function Captcha() {
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
class AppErrorBoundary extends Component {
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
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function Shell({ children }) {
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
function Page({ title, children }) {
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
function Home() {
  const [listings, setListings] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    catalog = useCatalog();
  useEffect(() => {
    document.title = "CarX | Mua bán xe minh bạch";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "CarX – tìm và bán xe rõ ràng, nhanh chóng và gần bạn.",
      );
    newestListings()
      .then((page) => setListings(page.content))
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <main id="main-content" tabIndex="-1">
      <section className="hero">
        <div className="hero-main">
          <p className="eyebrow">CARX · MARKETPLACE Ô TÔ</p>
          <h1>Tìm chiếc xe phù hợp, rõ ràng hơn.</h1>
          <p className="hero-copy">
            Thông tin xe đầy đủ, giá và lịch sử tin rõ ràng. Người mua tìm xe
            nhanh hơn, người bán đăng tin trong vài bước.
          </p>
          <div className="hero-actions">
            <Link className="primary" to="/tim-kiem">
              Tìm xe
            </Link>
            <Link className="hero-link" to="/dang-tin">
              Đăng tin miễn phí →
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <b>Luồng mua bán minh bạch</b>
          <span>1 · Chọn hãng và mẫu xe</span>
          <span>2 · Kiểm tra thông số, giá, khu vực</span>
          <span>3 · Chat và hẹn xem xe</span>
        </div>
      </section>
      <section className="trust-rail" aria-label="Cam kết CarX">
        <span>Thông số xe rõ ràng</span>
        <span>Lọc theo nhu cầu</span>
        <span>Không tin VIP</span>
        <span>Chat an toàn</span>
      </section>
      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">THƯƠNG HIỆU PHỔ BIẾN</p>
            <h2>Tìm xe theo hãng</h2>
          </div>
          <Link to="/tim-kiem">Xem tất cả</Link>
        </div>
        <div className="category-grid">
          {catalog.vehicle.brands.slice(0, 6).map((brand) => (
            <Link to={`/tim-kiem?brandId=${brand.id}`} key={brand.id}>
              <span>🚘</span>
              {brand.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">CẬP NHẬT LIÊN TỤC</p>
            <h2>Tin mới nhất</h2>
          </div>
          <Link to="/tim-kiem">Xem tất cả</Link>
        </div>
        {error && (
          <EmptyState title="Chưa tải được tin đăng">{error}</EmptyState>
        )}
        {loading ? (
          <div className="grid">
            {Array.from({ length: 4 }, (_, index) => (
              <ListingSkeleton key={index} />
            ))}
          </div>
        ) : listings.length ? (
          <div className="grid">
            {listings.map((item) => (
              <ListingCard
                item={item}
                categories={catalog.categories}
                locations={catalog.locations}
                vehicleOptions={catalog.vehicle}
                key={item.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có tin đăng phù hợp"
            action={
              <Link className="primary" to="/dang-tin">
                Đăng tin đầu tiên
              </Link>
            }
          >
            Hãy quay lại sau hoặc là người đầu tiên đăng món đồ của bạn.
          </EmptyState>
        )}
      </section>
      <Recommendations catalog={catalog} />
    </main>
  );
}
function SellerTrust({ sellerId }) {
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
          ★ {score?.averageRating || "Chưa có đánh giá"} ·{" "}
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
function Detail() {
  const { id } = useParams(),
    navigate = useNavigate(),
    [item, setItem] = useState(),
    [photos, setPhotos] = useState([]),
    [selected, setSelected] = useState(0),
    [saved, setSaved] = useState(false),
    [models, setModels] = useState([]),
    [error, setError] = useState(""),
    catalog = useCatalog();
  useEffect(() => {
    listing(id)
      .then((value) => {
        setItem(value);
        saveLastViewed(value);
      })
      .catch((error) => setError(error.message));
    images(id)
      .then(setPhotos)
      .catch(() => {});
    if (hasSession())
      savedListingIds()
      .then((ids) => setSaved(ids.includes(Number(id))))
        .catch(() => {});
  }, [id]);
  useEffect(() => {
    if (!item?.vehicle?.brandId) {
      setModels([]);
      return;
    }
    vehicleModels(item.vehicle.brandId)
      .then(setModels)
      .catch(() => setModels([]));
  }, [item?.vehicle?.brandId]);
  async function chat() {
    if (!hasSession()) {
      navigate(
        `/dang-nhap?returnTo=/tin/${id}&message=${encodeURIComponent("Vui lòng đăng nhập để nhắn người bán.")}`,
      );
      return;
    }
    try {
      navigate(`/chat?conversation=${await openConversation(id)}`);
    } catch (error) {
      setError(
        error.status === 401 || error.status === 403
          ? "Vui lòng đăng nhập để nhắn người bán."
          : error.message,
      );
    }
  }
  async function toggleSaved() {
    if (!hasSession()) {
      navigate(
        `/dang-nhap?returnTo=/tin/${id}&message=${encodeURIComponent("Vui lòng đăng nhập để lưu tin.")}`,
      );
      return;
    }
    try {
      if (saved) await unsaveListing(id);
      else await saveListing(id);
      setSaved(!saved);
    } catch (error) {
      setError(error.message);
    }
  }
  if (error)
    return (
      <Page title="Tin đăng">
        <p className="error" role="alert">
          {error}
        </p>
      </Page>
    );
  if (!item) return <Page title="Tin đăng">Đang tải...</Page>;
  const category = catalog.categories.find(
    (value) => value.id === item.categoryId,
  )?.label;
  const location = catalog.locations.find(
    (value) => value.id === item.locationId,
  )?.label;
  const address = [item.addressDetail, location].filter(Boolean).join(" · ");
  const vehicle = item.vehicle,
    optionName = (items, optionId) =>
      items.find((value) => value.id === optionId)?.name,
    vehicleBrand = optionName(catalog.vehicle.brands, vehicle?.brandId),
    vehicleModel = models.find((value) => value.id === vehicle?.modelId)?.name,
    vehicleDetails = vehicle
      ? [
          ["Hãng / mẫu", [vehicleBrand, vehicleModel].filter(Boolean).join(" ")],
          ["Năm sản xuất", vehicle.manufactureYear],
          ["Hộp số", optionName(catalog.vehicle.transmissions, vehicle.transmissionId)],
          ["Nhiên liệu", optionName(catalog.vehicle.fuels, vehicle.fuelId)],
          ["Xuất xứ", optionName(catalog.vehicle.origins, vehicle.originId)],
          ["Màu xe", optionName(catalog.vehicle.colors, vehicle.colorId)],
          ["Kiểu dáng", optionName(catalog.vehicle.bodyTypes, vehicle.bodyTypeId)],
          ["Số chỗ", vehicle.seatCount],
          ["Dẫn động", optionName(catalog.vehicle.drivelines, vehicle.drivelineId)],
          ["Số km", vehicle.mileageKm != null ? `${vehicle.mileageKm.toLocaleString("vi-VN")} km` : "Chưa cập nhật"],
        ].filter(([, value]) => value)
      : [];
  const photo = photos[selected];
  return (
    <Page title={item.title}>
      <div className="detail">
        <div>
          <div className="detail-image">
            {photo ? (
              <img src={photo.url} alt={item.title} decoding="async" />
            ) : (
              visual(item)
            )}
          </div>
          {photos.length > 1 && (
            <div className="thumbs">
              {photos.map((image, index) => (
                <button
                  className={selected === index ? "selected" : ""}
                  onClick={() => setSelected(index)}
                  key={image.id}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img src={image.url} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2>{item.title}</h2>
          <h2 className="price">
            {item.priceAmount.toLocaleString("vi-VN")} đ
          </h2>
          <p className="listing-meta">
            {conditions[item.conditionId]} · {category || "Danh mục"} ·{" "}
            {address || "Khu vực"} · {timeAgo(item.publishedAt)}
          </p>
          <p>{item.description}</p>
          {vehicleDetails.length > 0 && (
            <dl className="vehicle-summary">
              {vehicleDetails.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="actions">
            <button className="primary" onClick={chat}>
              Nhắn người bán
            </button>
            <button
              className="secondary"
              onClick={toggleSaved}
              aria-pressed={saved}
            >
              {saved ? "Đã lưu" : "Lưu tin"}
            </button>
            <Link className="secondary" to={`/bao-cao?listing=${id}`}>
              Báo cáo tin
            </Link>
          </div>
        </div>
      </div>
      <SellerTrust sellerId={item.sellerUserId} />
      <SellerListings sellerId={item.sellerUserId} excludeId={item.id} />
      <Recommendations catalog={catalog} viewedListing={item} excludeId={item.id} />
    </Page>
  );
}
function SellerListings({ sellerId, excludeId }) {
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
            categories={catalog.categories}
            locations={catalog.locations}
            vehicleOptions={catalog.vehicle}
            key={item.id}
          />
        ))}
      </div>
    </section>
  ) : null;
}
function SellerProfile() {
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
            categories={catalog.categories}
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
function Login() {
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
        query.get("returnTo") ||
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
function OAuthSuccess() {
  const navigate = useNavigate(), [error, setError] = useState("");
  useEffect(() => { me().then(() => { markSession(); window.dispatchEvent(new Event("auth-changed")); navigate("/", { replace: true }); }).catch((e) => setError(e.message || "Không thể hoàn tất đăng nhập.")); }, [navigate]);
  return <Page><p>{error || "Đang hoàn tất đăng nhập…"}</p></Page>;
}
function Register() {
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
function Forgot() {
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
function Post() {
  const navigate = useNavigate(),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false),
    [newFiles, setNewFiles] = useState([]),
    catalog = useCatalog();
  function removeNewFile(index) {
    setNewFiles((previous) => {
      const next = previous.filter((_, position) => position !== index);
      const removedFile = previous[index];
      if (removedFile) URL.revokeObjectURL(removedFile.previewUrl);
      return next;
    });
  }
  function chooseFiles(e) {
    const files = [...e.target.files];
    if (newFiles.length + files.length > MAX_IMAGES) {
      setError("Mỗi tin đăng chỉ được tối đa 3 ảnh.");
      e.target.value = "";
      return;
    }
    if (files.some((file) => !validImage(file))) {
      setError("Chỉ nhận ảnh JPEG, PNG hoặc WEBP, dưới 5 MB mỗi ảnh.");
      e.target.value = "";
      return;
    }
    setError("");
    setNewFiles((previous) => [
      ...previous,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  }
  async function submit(e) {
    e.preventDefault();
    if (!newFiles.length) {
      setError("Vui lòng thêm ít nhất 1 ảnh xe.");
      return;
    }
    setSubmitting(true);
    setError("");
    const f = new FormData(e.currentTarget);
    let listingItem;
    try {
      listingItem = await createListing({
        title: f.get("title"),
        description: withDetails(f.get("deviceType"), f.get("description")),
        priceAmount: Number(f.get("price")),
        categoryId: Number(f.get("category")),
        conditionId: Number(f.get("condition")),
        locationId: Number(f.get("location")),
        addressDetail: f.get("addressDetail"),
        vehicle: {
          brandId: Number(f.get("vehicleBrandId")),
          modelId: Number(f.get("vehicleModelId")),
          manufactureYear: Number(f.get("manufactureYear")),
          transmissionId: Number(f.get("vehicleTransmissionId")),
          fuelId: Number(f.get("vehicleFuelId")),
          originId: Number(f.get("vehicleOriginId")),
          colorId: Number(f.get("vehicleColorId")),
          bodyTypeId: Number(f.get("vehicleBodyTypeId")),
          seatCount: Number(f.get("vehicleSeatCount")),
          drivelineId: Number(f.get("vehicleDrivelineId")),
          mileageKm: f.get("mileageKm") ? Number(f.get("mileageKm")) : null,
        },
        captchaToken: window.turnstile?.getResponse?.(),
      });
      await Promise.all(
        newFiles.map((image) => uploadImage(listingItem.id, image.file)),
      );
      navigate(`/tin/${listingItem.id}`);
    } catch (error) {
      if (listingItem?.id) archiveListing(listingItem.id).catch(() => {});
      setError(error.message);
      setSubmitting(false);
    }
  }
  return (
    <Page title="Đăng tin">
      <form className="panel form" onSubmit={submit}>
        <input name="title" placeholder="Tiêu đề" maxLength="180" required />
        <textarea name="description" placeholder="Mô tả xe" required />
        <input
          name="price"
          type="number"
          min="0"
          placeholder="Giá (VND)"
          required
        />
        <CatalogFields catalog={catalog} />
        <VehicleFields catalog={catalog} />
        <section className="image-manager">
          <div>
            <b>Ảnh xe</b>
            <small>{newFiles.length}/3 ảnh</small>
          </div>
          {newFiles.length > 0 && (
            <div className="edit-images new-files">
              {newFiles.map((item, index) => (
                <figure key={`${item.file.name}-${index}`}>
                  <img src={item.previewUrl} alt={item.file.name} />
                  <button
                    type="button"
                    aria-label={`Bỏ ${item.file.name}`}
                    onClick={() => removeNewFile(index)}
                  >
                    Xóa
                  </button>
                </figure>
              ))}
            </div>
          )}
          <label className="upload">
            ＋ Thêm ảnh
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={chooseFiles}
            />
          </label>
          <small>JPEG, PNG hoặc WEBP, dưới 5 MB mỗi ảnh.</small>
        </section>
        <Captcha />
        <button
          className="primary"
          disabled={
            submitting ||
            !catalog.categories.length ||
            !catalog.locations.length ||
            !vehicleCatalogReady(catalog.vehicle)
          }
        >
          {submitting ? "Đang đăng..." : "Đăng tin"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </Page>
  );
}
function EditPost() {
  const { id } = useParams(),
    navigate = useNavigate(),
    [item, setItem] = useState(),
    [photos, setPhotos] = useState([]),
    [removed, setRemoved] = useState([]),
    [newFiles, setNewFiles] = useState([]),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false),
    catalog = useCatalog();
  useEffect(() => {
    Promise.all([listing(id), images(id)])
      .then(([listingItem, listingPhotos]) => {
        setItem(listingItem);
        setPhotos(listingPhotos);
      })
      .catch((error) => setError(error.message));
  }, [id]);
  function removePhoto(photo) {
    setPhotos(photos.filter((value) => value.id !== photo.id));
    setRemoved([...removed, photo.id]);
  }
  function removeNewFile(index) {
    setNewFiles((previous) => {
      const next = previous.filter((_, position) => position !== index);
      const removedFile = previous[index];
      if (removedFile) URL.revokeObjectURL(removedFile.previewUrl);
      return next;
    });
  }
  function chooseFiles(e) {
    const files = [...e.target.files];
    if (photos.length + newFiles.length + files.length > MAX_IMAGES) {
      setError("Mỗi tin đăng chỉ được tối đa 3 ảnh.");
      e.target.value = "";
      return;
    }
    if (files.some((file) => !validImage(file))) {
      setError("Chỉ nhận ảnh JPEG, PNG hoặc WEBP, dưới 5 MB mỗi ảnh.");
      e.target.value = "";
      return;
    }
    setError("");
    setNewFiles((previous) => [
      ...previous,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  }
  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await updateListing(id, {
        title: f.get("title"),
        description: withDetails(f.get("deviceType"), f.get("description")),
        priceAmount: Number(f.get("price")),
        categoryId: Number(f.get("category")),
        conditionId: Number(f.get("condition")),
        locationId: Number(f.get("location")),
        addressDetail: f.get("addressDetail"),
        vehicle: {
          brandId: Number(f.get("vehicleBrandId")),
          modelId: Number(f.get("vehicleModelId")),
          manufactureYear: Number(f.get("manufactureYear")),
          transmissionId: Number(f.get("vehicleTransmissionId")),
          fuelId: Number(f.get("vehicleFuelId")),
          originId: Number(f.get("vehicleOriginId")),
          colorId: Number(f.get("vehicleColorId")),
          bodyTypeId: Number(f.get("vehicleBodyTypeId")),
          seatCount: Number(f.get("vehicleSeatCount")),
          drivelineId: Number(f.get("vehicleDrivelineId")),
          mileageKm: f.get("mileageKm") ? Number(f.get("mileageKm")) : null,
        },
      });
      await Promise.all(removed.map((mediaId) => deleteImage(id, mediaId)));
      await Promise.all(newFiles.map((item) => uploadImage(id, item.file)));
      navigate(`/tin/${id}`);
    } catch (error) {
      setError(error.message);
      setSubmitting(false);
    }
  }
  if (!item)
    return (
      <Page title="Chỉnh sửa tin">
        {error ? <p className="error">{error}</p> : "Đang tải..."}
      </Page>
    );
  return (
    <Page title="Chỉnh sửa tin">
      <form className="panel form" onSubmit={submit}>
        <input
          name="title"
          defaultValue={item.title}
          maxLength="180"
          required
        />
        <textarea
          name="description"
          defaultValue={stripDetails(item.description)}
          required
        />
        <input
          name="price"
          type="number"
          min="0"
          defaultValue={item.priceAmount}
          required
        />
        <CatalogFields catalog={catalog} item={item} />
        <VehicleFields catalog={catalog} item={item} />
        <section className="image-manager">
          <div>
            <b>Ảnh xe</b>
            <small>{photos.length + newFiles.length}/3 ảnh</small>
          </div>
          {photos.length > 0 && (
            <div className="edit-images">
              {photos.map((photo) => (
                <figure key={photo.id}>
                  <img src={photo.url} alt="Ảnh xe" />
                  <button type="button" onClick={() => removePhoto(photo)}>
                    Xóa
                  </button>
                </figure>
              ))}
            </div>
          )}
          {newFiles.length > 0 && (
            <div className="edit-images new-files">
              {newFiles.map((item, index) => (
                <figure key={`${item.file.name}-${index}`}>
                  <img src={item.previewUrl} alt={item.file.name} />
                  <button
                    type="button"
                    aria-label={`Bỏ ${item.file.name}`}
                    onClick={() => removeNewFile(index)}
                  >
                    Xóa
                  </button>
                </figure>
              ))}
            </div>
          )}
          <label className="upload">
            ＋ Thêm hoặc thay ảnh
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={chooseFiles}
            />
          </label>
          <small>JPEG, PNG hoặc WEBP, dưới 5 MB mỗi ảnh.</small>
        </section>
        <button
          className="primary"
          disabled={
            submitting ||
            !catalog.categories.length ||
            !catalog.locations.length ||
            !vehicleCatalogReady(catalog.vehicle)
          }
        >
          {submitting ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </Page>
  );
}
function Search() {
  const [query, setQuery] = useSearchParams(),
    syncParams = () => ({
      keyword: query.get("keyword") || "",
      categoryId: query.get("categoryId") || "",
      conditionId: query.get("conditionId") || "",
      locationId: query.get("locationId") || "",
      minPrice: query.get("minPrice") || "",
      maxPrice: query.get("maxPrice") || "",
      brandId: query.get("brandId") || "",
      modelId: query.get("modelId") || "",
      minYear: query.get("minYear") || "",
      maxYear: query.get("maxYear") || "",
      transmissionId: query.get("transmissionId") || "",
      fuelId: query.get("fuelId") || "",
      originId: query.get("originId") || "",
      colorId: query.get("colorId") || "",
      bodyTypeId: query.get("bodyTypeId") || "",
      seatCount: query.get("seatCount") || "",
      drivelineId: query.get("drivelineId") || "",
      minMileageKm: query.get("minMileageKm") || "",
      maxMileageKm: query.get("maxMileageKm") || "",
    }),
    [params, setParams] = useState(syncParams),
    [result, setResult] = useState(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    catalog = useCatalog();
  async function load(page = 0, append = false, filters = params) {
    setLoading(true);
    setError("");
    try {
      const next = await searchListings({ ...filters, page, size: 20 });
      setResult((previous) =>
        append
          ? {
              ...next,
              content: [...(previous?.content || []), ...next.content],
            }
          : next,
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const next = syncParams();
    setParams(next);
    load(0, false, next);
  }, [query.toString()]);
  function submit(e) {
    e.preventDefault();
    const next = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value),
    );
    saveLastSearch(params);
    setQuery(next);
    load(0, false, params);
  }
  function changeVehicleParam(field, value) {
    setParams((previous) => ({ ...previous, [field]: value }));
  }
  function reset() {
    const next = {
      keyword: "",
      categoryId: "",
      conditionId: "",
      locationId: "",
      minPrice: "",
      maxPrice: "",
      brandId: "",
      modelId: "",
      minYear: "",
      maxYear: "",
      transmissionId: "",
      fuelId: "",
      originId: "",
      colorId: "",
      bodyTypeId: "",
      seatCount: "",
      drivelineId: "",
      minMileageKm: "",
      maxMileageKm: "",
    };
    saveLastSearch(next);
    setParams(next);
    setQuery({});
    load(0, false, next);
  }
  return (
    <Page title="Tìm kiếm">
      <div className="search-intro">
        <div>
          <p className="eyebrow">MARKETPLACE Ô TÔ</p>
          <h2>Tìm xe đúng nhu cầu</h2>
          <p>Lọc theo hãng, thông số, khu vực và mức giá.</p>
        </div>
        <button className="text-button" onClick={reset}>
          Xóa bộ lọc
        </button>
      </div>
      <form className="panel filters" onSubmit={submit}>
        <label className="filter-keyword">
          <span>Từ khóa</span>
          <input
            value={params.keyword}
            onChange={(e) => setParams({ ...params, keyword: e.target.value })}
            placeholder="Ví dụ: Toyota Vios, SUV, xe gia đình..."
          />
        </label>
        <label>
          <span>Danh mục</span>
          <select
            value={params.categoryId}
            onChange={(e) =>
              setParams({ ...params, categoryId: e.target.value })
            }
          >
            <option value="">Tất cả danh mục</option>
            {catalog.categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tình trạng</span>
          <select
            value={params.conditionId}
            onChange={(e) =>
              setParams({ ...params, conditionId: e.target.value })
            }
          >
            <option value="">Tất cả tình trạng</option>
            {Object.entries(conditions).map(([id, name]) => (
              <option value={id} key={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Khu vực</span>
          <select
            value={params.locationId}
            onChange={(e) =>
              setParams({ ...params, locationId: e.target.value })
            }
          >
            <option value="">Tất cả khu vực</option>
            {catalog.provinces.map((location) => (
              <option value={location.id} key={location.id}>
                {location.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Giá từ</span>
          <input
            type="number"
            min="0"
            value={params.minPrice}
            onChange={(e) => setParams({ ...params, minPrice: e.target.value })}
            placeholder="0 đ"
          />
        </label>
        <label>
          <span>Giá đến</span>
          <input
            type="number"
            min="0"
            value={params.maxPrice}
            onChange={(e) => setParams({ ...params, maxPrice: e.target.value })}
            placeholder="Không giới hạn"
          />
        </label>
        <VehicleFields
          catalog={catalog}
          search
          values={params}
          onChange={changeVehicleParam}
        />
        <button className="primary">Áp dụng bộ lọc</button>
      </form>
      {catalog.error && <p className="error">{catalog.error}</p>}
      {error && <EmptyState title="Có lỗi khi tìm kiếm">{error}</EmptyState>}
      <div className="result-heading" aria-live="polite">
        <div>
          <h2>
            {loading
              ? "Đang tìm tin..."
              : `${result?.totalElements || 0} tin đăng`}
          </h2>
          <p>Tin xe mới nhất luôn được ưu tiên hiển thị.</p>
        </div>
      </div>
      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }, (_, index) => (
            <ListingSkeleton key={index} />
          ))}
        </div>
      ) : result?.content?.length ? (
        <>
          <div className="grid">
            {result.content.map((item) => (
              <ListingCard
                item={item}
                categories={catalog.categories}
                locations={catalog.locations}
                vehicleOptions={catalog.vehicle}
                key={item.id}
              />
            ))}
          </div>
          {!result.last && (
            <div className="load-more">
              <button
                className="secondary"
                onClick={() => load(result.number + 1, true)}
              >
                Xem thêm tin đăng
              </button>
            </div>
          )}
        </>
      ) : (
        !error && (
          <EmptyState
            title="Không tìm thấy tin đăng phù hợp"
            action={
              <button className="secondary" onClick={reset}>
                Xóa bộ lọc và xem tất cả
              </button>
            }
          >
            Thử đổi từ khóa, khu vực hoặc mức giá để xem thêm kết quả.
          </EmptyState>
        )
      )}
    </Page>
  );
}
function Chat() {
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
function MyPosts() {
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
          ＋ Đăng tin
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
                categories={catalog.categories}
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
function Saved() {
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
                categories={catalog.categories}
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
function Profile() {
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
          ▦ Quản lý tin đăng <span>›</span>
        </Link>
        <Link to="/tin-da-luu">
          ♡ Tin đã lưu <span>›</span>
        </Link>
        <Link to="/danh-gia">
          ★ Giao dịch & đánh giá <span>›</span>
        </Link>
        <Link to="/cai-dat">
          ⚙ Cài đặt tài khoản <span>›</span>
        </Link>
      </div>
    </Page>
  );
}
function Settings() {
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
                ▦ Quản lý tin đăng <span>›</span>
              </Link>
              <Link to="/tin-da-luu">
                ♡ Tin đã lưu <span>›</span>
              </Link>
              <Link to="/danh-gia">
                ★ Giao dịch & đánh giá <span>›</span>
              </Link>
              <Link to="/chat">
                💬 Tin nhắn <span>›</span>
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
function Notifications() {
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
              <i>›</i>
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
function Reviews() {
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
                    <option value="5">★★★★★ Rất tốt</option>
                    <option value="4">★★★★ Tốt</option>
                    <option value="3">★★★ Bình thường</option>
                    <option value="2">★★ Cần cải thiện</option>
                    <option value="1">★ Không hài lòng</option>
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
function Report() {
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
function Admin() {
  const [reports, setReports] = useState([]),
    [stats, setStats] = useState(),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([adminStats(), adminReports()])
      .then(([summary, items]) => {
        setStats(summary);
        setReports(items);
      })
      .catch((error) => setError(error.message));
  }, []);
  async function resolve(report, archive) {
    try {
      if (archive) await adminArchiveReport(report.id);
      else await adminDismissReport(report.id);
      setReports((current) =>
        current.map((item) =>
          item.id === report.id
            ? { ...item, status: archive ? "ARCHIVED" : "DISMISSED" }
            : item,
        ),
      );
      setStats((current) =>
        current
          ? {
              ...current,
              openReports: Math.max(0, current.openReports - 1),
              totalReports: current.totalReports,
              archivedListings: archive
                ? current.archivedListings + 1
                : current.archivedListings,
            }
          : current,
      );
    } catch (error) {
      setError(error.message);
    }
  }
  const openReports = reports.filter((report) => report.status === "OPEN"),
    resolvedReports = reports.filter((report) => report.status !== "OPEN"),
    listingIds = new Set(reports.map((report) => report.listingId));
  return (
    <Page title="Quản trị">
      <div className="admin-shell">
        <section className="admin-hero panel">
          <div>
            <p className="eyebrow">ADMIN CONSOLE</p>
            <h2>Giám sát tin xấu và xử lý vi phạm</h2>
            <p>
              Trang này dành cho vận hành: xem báo cáo mới, ẩn tin vi phạm và
              theo dõi lịch sử xử lý theo thời gian thực.
            </p>
          </div>
          <div className="admin-kpis">
            <div>
              <b>{stats?.totalUsers ?? "—"}</b>
              <span>Người dùng</span>
            </div>
            <div>
              <b>{stats?.totalListings ?? "—"}</b>
              <span>Tin đăng</span>
            </div>
            <div>
              <b>{stats?.publishedToday ?? "—"}</b>
              <span>Tin đăng hôm nay</span>
            </div>
            <div>
              <b>{stats?.activeListings ?? "—"}</b>
              <span>Tin đang bán</span>
            </div>
            <div>
              <b>{stats?.archivedListings ?? "—"}</b>
              <span>Tin đã ẩn</span>
            </div>
            <div>
              <b>{stats?.openReports ?? "—"}</b>
              <span>Báo cáo chờ xử lý</span>
            </div>
          </div>
        </section>
        <div className="admin-layout">
          <aside className="admin-sidebar panel">
            <b>Điều phối</b>
            <a href="#admin-queue">
              Hàng đợi báo cáo <span>{openReports.length}</span>
            </a>
            <a href="#admin-history">
              Lịch sử xử lý <span>{resolvedReports.length}</span>
            </a>
            <a href="/tim-kiem">Xem tin đăng</a>
            <a href="/thong-bao">Mở thông báo</a>
            <p>
              Chỉ dùng cho quản trị viên. Ưu tiên xử lý tin vi phạm trước để bảo
              vệ người mua.
            </p>
          </aside>
          <div className="admin-content">
            {error && <p className="error">{error}</p>}
            <section className="panel" id="admin-queue">
              <div className="section-title">
                <div>
                  <p className="eyebrow">BÁO CÁO MỚI</p>
                  <h2>Hàng đợi xử lý</h2>
                </div>
                <span className="admin-chip">{openReports.length} mục</span>
              </div>
              {openReports.length ? (
                openReports.map((report) => (
                  <article className="admin-report" key={report.id}>
                    <div className="admin-report-head">
                      <div>
                        <b>#{report.listingId}</b>
                        <span
                          className={`admin-status status-${report.status.toLowerCase()}`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <small>
                        Báo cáo #{report.id} · lý do #{report.reasonId} ·{" "}
                        {timeAgo(report.createdAt)}
                      </small>
                    </div>
                    <p>{report.details || "Không có chi tiết"}</p>
                    <div className="actions">
                      <button
                        className="secondary"
                        onClick={() => resolve(report, false)}
                      >
                        Bỏ qua
                      </button>
                      <button
                        className="primary"
                        onClick={() => resolve(report, true)}
                      >
                        Ẩn tin
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Không có báo cáo cần xử lý">
                  Mọi báo cáo mới sẽ xuất hiện ở đây. Hiện tại hàng đợi đang
                  trống.
                </EmptyState>
              )}
            </section>
            <section className="panel" id="admin-history">
              <div className="section-title">
                <div>
                  <p className="eyebrow">ĐÃ XỬ LÝ</p>
                  <h2>Lịch sử gần đây</h2>
                </div>
              </div>
              {resolvedReports.length ? (
                resolvedReports.map((report) => (
                  <article
                    className="admin-report admin-report-muted"
                    key={report.id}
                  >
                    <div className="admin-report-head">
                      <div>
                        <b>#{report.listingId}</b>
                        <span
                          className={`admin-status status-${report.status.toLowerCase()}`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <small>
                        Cập nhật{" "}
                        {report.resolvedAt
                          ? timeAgo(report.resolvedAt)
                          : timeAgo(report.createdAt)}
                      </small>
                    </div>
                    <p>
                      {report.resolutionNote ||
                        report.details ||
                        "Không có chi tiết"}
                    </p>
                  </article>
                ))
              ) : (
                <p className="page-description">Chưa có lịch sử xử lý.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </Page>
  );
}
function NotFound() {
  return (
    <Page title="Không tìm thấy trang">
      <Link className="primary" to="/">
        Về trang chủ
      </Link>
    </Page>
  );
}
export default function App() {
  const guarded = (component) => <Protected>{component}</Protected>;
  const admin = (component) => (
    <Protected>
      <AdminOnly>{component}</AdminOnly>
    </Protected>
  );
  return (
    <AppErrorBoundary>
      <ScrollToTop />
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tim-kiem" element={<Search />} />
          <Route path="/tin/:id" element={<Detail />} />
          <Route path="/tin/:id/sua" element={guarded(<EditPost />)} />
          <Route path="/nguoi-ban/:id" element={<SellerProfile />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/quen-mat-khau" element={<Forgot />} />
          <Route path="/dang-tin" element={guarded(<Post />)} />
          <Route path="/chat" element={guarded(<Chat />)} />
          <Route path="/tin-cua-toi" element={guarded(<MyPosts />)} />
          <Route path="/tin-da-luu" element={guarded(<Saved />)} />
          <Route path="/ho-so" element={guarded(<Profile />)} />
          <Route path="/cai-dat" element={guarded(<Settings />)} />
          <Route path="/thong-bao" element={guarded(<Notifications />)} />
          <Route path="/danh-gia" element={guarded(<Reviews />)} />
          <Route path="/bao-cao" element={guarded(<Report />)} />
          <Route path="/admin" element={admin(<AdminConsole />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </AppErrorBoundary>
  );
}
