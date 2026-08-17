import { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  adminUpdateListing,
  archiveListing,
  createListing,
  deleteImage,
  hasSession,
  images,
  listing,
  listingRecommendations,
  newestListings,
  openConversation,
  saveListing,
  savedListingIds,
  searchListings,
  unsaveListing,
  updateListing,
  uploadImage,
  vehicleModels,
} from "./api.js";
import AdminConsole from "./AdminConsole.jsx";
import {
  AdminOnly,
  AppErrorBoundary,
  Protected,
  ScrollToTop,
  Shell,
} from "./app/AppChrome.jsx";
import {
  readLastSearch,
  readLastViewed,
  saveLastSearch,
  saveLastViewed,
  useCatalog,
  vehicleCatalogReady,
} from "./catalog.js";
import {
  conditions,
  EmptyState,
  ListingCard,
  ListingSkeleton,
  Page,
  timeAgo,
  visual,
} from "./components/MarketplaceUi.jsx";
import { Profile, Settings, Notifications } from "./features/account/AccountPages.jsx";
import { MyPosts, Saved } from "./features/account/MyListingPages.jsx";
import { Report, Reviews } from "./features/account/TrustPages.jsx";
import {
  Captcha,
  Forgot,
  Login,
  OAuthSuccess,
  Register,
} from "./features/auth/AuthPages.jsx";
import Chat from "./features/chat/ChatPage.jsx";
import {
  CatalogFields,
  VehicleFields,
} from "./features/listings/ListingFormFields.jsx";
import {
  SellerListings,
  SellerProfile,
  SellerTrust,
} from "./features/sellers/SellerPages.jsx";
import { viewedPreferences } from "./recommendationPreferences.js";
const normalizedDescription = (description) => (description || "").trim();
const MAX_IMAGES = 3,
  MAX_IMAGE_SIZE = 5_000_000,
  validImage = (file) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
    file.size <= MAX_IMAGE_SIZE;
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
            locations={catalog.locations}
            vehicleOptions={catalog.vehicle}
            key={item.id}
          />
        ))}
      </div>
    </section>
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
        description: normalizedDescription(f.get("description")),
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
function EditPost({ adminMode = false }) {
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
    Promise.all([listing(id), adminMode ? Promise.resolve([]) : images(id)])
      .then(([listingItem, listingPhotos]) => {
        setItem(listingItem);
        setPhotos(listingPhotos);
      })
      .catch((error) => setError(error.message));
  }, [adminMode, id]);
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
      const payload = {
        title: f.get("title"),
        description: normalizedDescription(f.get("description")),
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
      };
      await (adminMode ? adminUpdateListing(id, payload) : updateListing(id, payload));
      if (!adminMode) {
        await Promise.all(removed.map((mediaId) => deleteImage(id, mediaId)));
        await Promise.all(newFiles.map((item) => uploadImage(id, item.file)));
      }
      navigate(adminMode ? "/admin" : `/tin/${id}`);
    } catch (error) {
      setError(error.message);
      setSubmitting(false);
    }
  }
  if (!item)
    return (
      <Page title={adminMode ? "Quản trị chỉnh sửa tin" : "Chỉnh sửa tin"}>
        {error ? <p className="error">{error}</p> : "Đang tải..."}
      </Page>
    );
  return (
    <Page title={adminMode ? "Quản trị chỉnh sửa tin" : "Chỉnh sửa tin"}>
      <form className="panel form" onSubmit={submit}>
        <input
          name="title"
          defaultValue={item.title}
          maxLength="180"
          required
        />
        <textarea
          name="description"
          defaultValue={item.description}
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
        {!adminMode && <section className="image-manager">
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
        </section>}
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
          <Route path="/admin/tin/:id/sua" element={admin(<EditPost adminMode />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </AppErrorBoundary>
  );
}
