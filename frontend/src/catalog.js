import { useEffect, useState } from "react";
import { categories, locations, vehicleCatalog } from "./api.js";
import { viewedPreferences } from "./recommendationPreferences.js";

export const emptyVehicleCatalog = {
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
export const readLastSearch = () => readPreferences("carx:last-search");
export const readLastViewed = () => readPreferences("carx:last-viewed");
export const saveLastSearch = (params) => savePreferences("carx:last-search", params);
export const saveLastViewed = (item) => {
  const preferences = viewedPreferences(item);
  if (preferences) savePreferences("carx:last-viewed", preferences);
};
export const vehicleCatalogReady = (vehicle) =>
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
export function useCatalog() {
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
