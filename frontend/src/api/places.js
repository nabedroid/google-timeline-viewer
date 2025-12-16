// フィールドに使用可能な項目
// 項目ごとに料金が異なり、複数項目を指定すると一番高い料金が設定される
// Essentials は10000回/月、Pro は5000回/月、Enterprice は1000回/月 の無料枠がある
//
// # [Free] Place Details Essentials IDs Only SKU
// attributions, id, moved_place, moved_place_id, name, photos
// # [Essentials] Place Details Essentials SKU
// addressComponents, addressDescriptor, adrFormatAddress, formattedAddress, location, plusCode, postalAddress, shortFormattedAddress, types, viewport
// # [Pro] Place Details Pro SKU
// accessibilityOptions, businessStatus, containingPlaces, displayName, googleMapsLinks, googleMapsUri, iconBackgroundColor, iconMaskBaseUri, primaryType, primaryTypeDisplayName, pureServiceAreaBusiness, subDestinations, utcOffsetMinutes
// # [Enterprise] Place Details Enterprise SKU
// currentOpeningHours, currentSecondaryOpeningHours, internationalPhoneNumber, nationalPhoneNumber, priceLevel, priceRange, rating, regularOpeningHours, regularSecondaryOpeningHours, userRatingCount, websiteUri
// # [Enterprise] Place Details Enterprise + Atmosphere SKU
// allowsDogs, curbsidePickup, delivery, dineIn, editorialSummary, evChargeAmenitySummary, evChargeOptions, fuelOptions, generativeSummary, goodForChildren, goodForGroups, goodForWatchingSports, liveMusic, menuForChildren, neighborhoodSummary, parkingOptions, paymentOptions, outdoorSeating, reservable, restroom, reviews, reviewSummary, routingSummaries, servesBeer, servesBreakfast, servesBrunch, servesCocktails, servesCoffee, servesDessert, servesDinner, servesLunch, servesVegetarianFood, servesWine, takeout

const cache = {};

// export async function getPlaceDetailsRestAPI(placeId, fields = ["displayName", "formattedAddress"], signal) {
//   if (!placeId) return null;

//   if (cache[placeId]) return cache[placeId];

//   const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
//   url.searchParams.set("fields", fields.join(","));
//   url.searchParams.set("key", import.meta.env.VITE_GOOGLE_API_KEY);

//   let res;
//   try {
//     res = await fetch(url, { signal });
//   } catch (err) {
//     if (err.name === "AbortError") {
//       throw err;
//     }
//     console.error("Network error calling Place Details:", err);
//     throw new Error("Network error");
//   }

//   if (!res.ok) {
//     // 使用上限エラーはここ
//     const txt = await res.text();
//     console.error("Places API error:", res.status, txt);
//     throw new Error(`Places API returned ${res.status}`);
//   }

//   const data = await res.json();
//   cache[placeId] = data;
//   return data;
// }

export async function getPlaceDetails(placeId) {
  if (!placeId) return null;
  if (cache[placeId]) return cache[placeId];
  const { Place } = (await google.maps.importLibrary('places'));
  const place = new Place({ id: placeId });
  await place.fetchFields({ fields: ["displayName", "formattedAddress"] });
  const data = {
    id: place.id,
    displayName: place.displayName,
    formattedAddress: place.formattedAddress,
  }
  cache[placeId] = data;
  return data;
}