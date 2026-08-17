import { useState } from "react";
import {
  adminActivateLocation,
  adminActivateVehicleOption,
  adminCreateCategory,
  adminCreateVehicleOption,
  adminDeactivateLocation,
  adminDeactivateVehicleOption,
  adminUpdateCategory,
  adminUpdateVehicleOption,
} from "../api.js";
import { Pager, Toolbar, statusClass } from "./AdminShared.jsx";

const emptyCategory = {
  parentId: "",
  name: "",
  slug: "",
  leaf: true,
  sortOrder: 0,
  active: true,
};
export function Categories({ items, reload, setError }) {
  const [form, setForm] = useState(emptyCategory),
    [saving, setSaving] = useState(false);
  const edit = (item) => setForm({ ...item, parentId: item.parentId ?? "" });
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      parentId: form.parentId ? Number(form.parentId) : null,
      sortOrder: Number(form.sortOrder),
    };
    try {
      await (form.id
        ? adminUpdateCategory(form.id, payload)
        : adminCreateCategory(payload));
      setForm(emptyCategory);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 3</span>
          <h2>Cây danh mục CarX</h2>
        </div>
        <small>{items?.length ?? "—"} danh mục</small>
      </div>
      <form className="admin-editor" onSubmit={submit}>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tên danh mục"
        />
        <input
          required
          pattern="[a-z0-9-]+"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="slug-khong-dau"
        />
        <select
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
        >
          <option value="">Danh mục gốc</option>
          {(items || [])
            .filter((x) => x.id !== form.id)
            .map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
        </select>
        <input
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          aria-label="Thứ tự"
        />
        <label>
          <input
            type="checkbox"
            checked={form.leaf}
            onChange={(e) => setForm({ ...form, leaf: e.target.checked })}
          />{" "}
          Cho phép đăng tin
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />{" "}
          Đang hoạt động
        </label>
        <button className="primary" disabled={saving}>
          {form.id ? "Lưu danh mục" : "Thêm danh mục"}
        </button>
        {form.id && (
          <button
            type="button"
            className="secondary"
            onClick={() => setForm(emptyCategory)}
          >
            Hủy
          </button>
        )}
      </form>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Slug</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{item.name}</b>
                    <small>
                      #{item.id}
                      {item.parentId ? ` · cha #${item.parentId}` : " · gốc"}
                    </small>
                  </td>
                  <td>{item.slug}</td>
                  <td>{item.leaf ? "Đăng tin" : "Nhóm"}</td>
                  <td>
                    <span
                      className={statusClass(item.active ? "active" : "hidden")}
                    >
                      {item.active ? "Hoạt động" : "Đã ẩn"}
                    </span>
                  </td>
                  <td>
                    <button className="secondary" onClick={() => edit(item)}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const vehicleResources = [
  ["brands", "Hãng xe"],
  ["models", "Mẫu xe"],
  ["origins", "Xuất xứ"],
  ["transmissions", "Hộp số"],
  ["fuels", "Nhiên liệu"],
  ["colors", "Màu xe"],
  ["body-types", "Kiểu dáng"],
  ["drivelines", "Dẫn động"],
];
const emptyVehicleOption = {
  code: "",
  name: "",
  sortOrder: 0,
  active: true,
  parentId: "",
};
export function VehicleCatalog({ items, reload, setError }) {
  const [resource, setResource] = useState("brands"),
    [form, setForm] = useState(emptyVehicleOption),
    [saving, setSaving] = useState(false),
    [busy, setBusy] = useState("");
  const responseResource = resource === "body-types" ? "bodyTypes" : resource,
    current = items?.[responseResource] || [],
    isModel = resource === "models",
    brands = items?.brands || [];
  function edit(item) {
    setForm({ ...item, parentId: item.parentId ?? "" });
  }
  function changeResource(value) {
    setResource(value);
    setForm(emptyVehicleOption);
  }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      code: form.code.trim().toLowerCase(),
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder),
      active: form.active,
      parentId: isModel && form.parentId ? Number(form.parentId) : null,
    };
    try {
      await (form.id
        ? adminUpdateVehicleOption(resource, form.id, data)
        : adminCreateVehicleOption(resource, data));
      setForm(emptyVehicleOption);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function toggle(item) {
    setBusy(`${resource}-${item.id}`);
    setError("");
    try {
      await (item.active
        ? adminDeactivateVehicleOption(resource, item.id)
        : adminActivateVehicleOption(resource, item.id));
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 3 · CARX</span>
          <h2>Quản trị catalog xe</h2>
        </div>
        <small>{current.length} mục trong nhóm đang chọn</small>
      </div>
      <div className="admin-toolbar">
        <label>
          Nhóm dữ liệu
          <select value={resource} onChange={(e) => changeResource(e.target.value)}>
            {vehicleResources.map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <form className="admin-editor vehicle-editor" onSubmit={submit}>
        <input
          required
          pattern="[a-z0-9][a-z0-9-]*"
          maxLength="64"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="Mã dạng slug"
          aria-label="Mã catalog"
        />
        <input
          required
          maxLength="120"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tên hiển thị"
          aria-label="Tên hiển thị"
        />
        {isModel ? (
          <select
            required
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            aria-label="Hãng xe"
          >
            <option value="">Chọn hãng xe</option>
            {brands.map((brand) => (
              <option value={brand.id} key={brand.id} disabled={!brand.active}>
                {brand.name}{brand.active ? "" : " · đã ẩn"}
              </option>
            ))}
          </select>
        ) : <span className="admin-muted">Không có quan hệ cha</span>}
        <input
          type="number"
          min="0"
          max="32767"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          aria-label="Thứ tự"
        />
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />{" "}
          Đang hoạt động
        </label>
        <button className="primary" disabled={saving}>
          {form.id ? "Lưu thay đổi" : "Thêm mục"}
        </button>
        {form.id && (
          <button type="button" className="secondary" onClick={() => setForm(emptyVehicleOption)}>
            Hủy
          </button>
        )}
      </form>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                {isModel && <th>Hãng</th>}
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {current.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td><b>{item.name}</b><small>#{item.id}</small></td>
                  {isModel && <td>{brands.find((brand) => brand.id === item.parentId)?.name || `#${item.parentId}`}</td>}
                  <td>{item.sortOrder}</td>
                  <td>{item.active ? "Hoạt động" : "Đã ẩn"}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => edit(item)}>Sửa</button>{" "}
                    <button
                      type="button"
                      className={item.active ? "danger" : "secondary"}
                      disabled={busy === `${resource}-${item.id}`}
                      onClick={() => toggle(item)}
                    >
                      {item.active ? "Ẩn" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!current.length && <div className="admin-empty"><b>Chưa có dữ liệu</b></div>}
      </section>
    </>
  );
}

export function Locations({
  data,
  query,
  setQuery,
  level,
  setLevel,
  search,
  reload,
  setError,
}) {
  async function toggle(item) {
    try {
      await (item.active
        ? adminDeactivateLocation(item.id)
        : adminActivateLocation(item.id));
      await reload(data.number);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <div className="admin-section-head">
        <div>
          <span>PHASE 3</span>
          <h2>Quản lý địa giới</h2>
        </div>
        <small>{data?.totalElements ?? "—"} khu vực</small>
      </div>
      <Toolbar onSubmit={search}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tên hoặc mã khu vực"
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Tất cả cấp</option>
          <option value="1">Tỉnh / thành</option>
          <option value="2">Phường / xã</option>
        </select>
      </Toolbar>
      <section className="admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Khu vực</th>
                <th>Mã</th>
                <th>Cấp</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{item.name}</b>
                    <small>
                      #{item.id}
                      {item.parentId ? ` · thuộc #${item.parentId}` : ""}
                    </small>
                  </td>
                  <td>{item.code}</td>
                  <td>{item.level === 1 ? "Tỉnh / thành" : "Phường / xã"}</td>
                  <td>{item.active ? "Hoạt động" : "Đã ẩn"}</td>
                  <td>
                    <button
                      className={item.active ? "danger" : "secondary"}
                      onClick={() => toggle(item)}
                    >
                      {item.active ? "Ẩn" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager data={data} onPage={reload} />
      </section>
    </>
  );
}
