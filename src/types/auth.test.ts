import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  getStoredUser,
  isAdmin,
  isEmployee,
  isSuperAdmin,
  type AuthUser,
} from "./auth.ts";

function createMockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
}

describe("auth helpers", () => {
  const originalLocalStorage = (globalThis as any).localStorage;

  beforeEach(() => {
    (globalThis as any).localStorage = createMockStorage();
  });

  afterEach(() => {
    (globalThis as any).localStorage = originalLocalStorage;
  });

  it("returns null when no user is stored", () => {
    assert.equal(getStoredUser(), null);
    assert.equal(isAdmin(), false);
    assert.equal(isEmployee(), false);
    assert.equal(isSuperAdmin(), false);
  });

  it("returns null safely when localStorage contains malformed JSON", () => {
    localStorage.setItem("user", "{broken-json");
    assert.equal(getStoredUser(), null);
    assert.equal(isAdmin(), false);
  });

  it("identifies ADMIN role accurately", () => {
    const adminUser: AuthUser = {
      id: 1,
      name: "Fatou",
      email: "fatou@jokko.sn",
      role: "ADMIN",
      shopId: 10,
      plan: "PRO",
      shopName: "Boutique Fatou",
    };
    localStorage.setItem("user", JSON.stringify(adminUser));
    assert.deepEqual(getStoredUser(), adminUser);
    assert.equal(isAdmin(), true);
    assert.equal(isEmployee(), false);
    assert.equal(isSuperAdmin(), false);
  });

  it("identifies EMPLOYEE and SUPER_ADMIN roles accurately", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 2, role: "EMPLOYEE", shopId: 10 }),
    );
    assert.equal(isAdmin(), false);
    assert.equal(isEmployee(), true);
    assert.equal(isSuperAdmin(), false);

    localStorage.setItem(
      "user",
      JSON.stringify({ id: 3, role: "SUPER_ADMIN", shopId: 0 }),
    );
    assert.equal(isAdmin(), false);
    assert.equal(isEmployee(), false);
    assert.equal(isSuperAdmin(), true);
  });
});
