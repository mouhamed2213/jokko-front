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
    outOfStockAlert: "OUT_OF_STOCK_ALERT",
    supplierDept: "TOTAL_SUPPLIER_DEPT",
    stockValues: "STOCK_VALUES",
    supplierManagement: "SUPPLIER_MANAGEMENT",
    exportExcel: "EXPORT_EXCEL",
    advancedReports: "ADVANCED_REPORTS",
    accounting: "ACCOUNTING",
    multiStore: "MULTI_STORE",
    apiAccess: "API_ACCESS",
   };

  if (!features) {
    return {}; 
  }

  // 1. On transforme les paires [clé, code] de planFeatures
  const entries = Object.entries(planFeatures).map(([key, featureCode]) => {
    // 2. On vérifie si le tableau 'features' contient le 'featureCode'
    const isIncluded = features.includes(featureCode);
    return [key, isIncluded];
  });

  return Object.fromEntries(entries);
};