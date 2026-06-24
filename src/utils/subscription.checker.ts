import type { FeatureCode, SubscriptionInfo } from "../types";

  // feature checks
  export const hasFeature = ( subscription : SubscriptionInfo,  feature: FeatureCode) =>
    {
        return subscription?.features.includes(feature) ?? false};