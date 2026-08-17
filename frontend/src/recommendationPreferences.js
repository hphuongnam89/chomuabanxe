export function viewedPreferences(item) {
  const price = Number(item?.priceAmount);
  if (!item?.vehicle?.brandId || !(price > 0)) return null;
  return {
    brandId: item.vehicle.brandId,
    minPrice: Math.floor(price * 0.8),
    maxPrice: Math.ceil(price * 1.2),
  };
}
