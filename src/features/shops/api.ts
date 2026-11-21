import { api } from "../../services/api";
import type { NewShopForm, SubscriptionInfo } from "../../types/index";

let subscriptionCache: SubscriptionInfo | null = null;
let subscriptionPromise: Promise<SubscriptionInfo> | null = null;

export const getSubscription = async (): Promise<SubscriptionInfo> => {
  if (subscriptionCache) {
    return subscriptionCache;
  }
  if (subscriptionPromise) {
    return subscriptionPromise;
  }

  subscriptionPromise = api
    .get("subscription")
    .then((res) => {
      const subscription = res.data.subscription;
      subscriptionCache = subscription;
      return subscription;
    })
    .finally(() => {
      subscriptionPromise = null;
      subscriptionCache = null;
    });

  return subscriptionPromise;
};

export const createNewShop = async (shopData: NewShopForm) => {
  const payload = {
    shopName: shopData.shopName,
    ownerName: shopData.ownerName,
    address: shopData.address,
    phone: shopData.phone,
    email: shopData.email,
    manager: shopData.managerEnabled
      ? {
          name: shopData.managerName,
          email: shopData.managerEmail,
          password: shopData.managerPassword,
        }
      : null,
  };
  return api.post("/shop/create-second-shop", payload);
};

export const getShopList = async () => {
  const shops = await api.get("/shop/");
  return shops.data.shops;
};

export const switchShop = async (data: {
  targetShopId: number;
  password: string;
}) => {
  const res = await api.post("/shop/switch", data);
  return res.data;
};
