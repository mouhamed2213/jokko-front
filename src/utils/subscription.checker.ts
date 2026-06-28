import type { FeatureCode, SubscriptionInfo } from "../types";

// feature checks
export const hasFeature = (
  subscription: SubscriptionInfo,
  feature: FeatureCode,
) => {
  return subscription?.features.includes(feature) ?? false;
};
export const hasFeatures = (subscription: SubscriptionInfo) => {
  const features = subscription?.features;

  const planFeatures: Record<string, FeatureCode> = {
    exportPdf: "EXPORT_PDF",
    lowStockAlert: "LOW_STOCK_ALERT",
    topProducts: "TOP_PRODUCTS",
    stockValues: "STOCK_VALUE",
    test: "TEST",
    // Other featur
  };

  if (!features) {
    return;
  }
  const isInclude = Object.keys(planFeatures);

const entries = features.map((f, i) => {
  const val = f === planFeatures[isInclude[i]];
  const k = isInclude[i];
  return [k, val]; 
});

const result = Object.fromEntries(entries);
  console.log(result);
  return result
};
