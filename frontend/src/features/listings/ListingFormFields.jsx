import { useEffect, useState } from "react";
import { vehicleModels } from "../../api.js";
import { emptyVehicleCatalog } from "../../catalog.js";
import { conditions } from "../../components/MarketplaceUi.jsx";

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
export function CatalogFields({ catalog, item }) {
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
export function VehicleFields({ catalog, item, search = false, values = {}, onChange }) {
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
