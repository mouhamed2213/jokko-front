import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { helpModules } from "../data/helpModules";

const SITE_URL = "https://jokko-business.com";

type SeoConfig = {
  title: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
};

const STATIC_ROUTES: Record<string, SeoConfig> = {
  "/": {
    title: "Jokko Business — Logiciel de gestion commerciale, ventes, stock et caisse",
    description:
      "Gérez vos ventes, stocks, factures, clients, fournisseurs et caisse (Espèces, Wave, Orange Money) depuis une seule application pensée pour les commerçants.",
    canonicalPath: "/",
  },
  "/tarifs": {
    title: "Tarifs & Abonnements — Jokko Business",
    description:
      "Découvrez les formules Jokko Business en FCFA : Gratuit, Starter, Pro et Signature. 14 jours d'essai gratuit sur les formules payantes.",
    canonicalPath: "/tarifs",
  },
  "/contact": {
    title: "Contact & Accompagnement — Jokko Business",
    description:
      "Contactez l'équipe Jokko Business pour une démonstration, un accompagnement ou toute question sur la gestion de votre boutique.",
    canonicalPath: "/contact",
  },
  "/help": {
    title: "Centre d'aide — Jokko Business",
    description:
      "Guides pratiques pour maîtriser votre tableau de bord, votre caisse, vos produits, vos ventes, vos factures et vos stocks sur Jokko Business.",
    canonicalPath: "/help",
  },
};

const NOINDEX_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/confirm-email-change",
  "/dashboard",
  "/analytics",
  "/products",
  "/clients",
  "/suppliers",
  "/stock",
  "/sales",
  "/sales-history",
  "/invoices",
  "/cash",
  "/users",
  "/settings",
  "/security",
  "/admin",
  "/super-admin",
];

function resolveSeo(pathname: string): SeoConfig {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";

  if (STATIC_ROUTES[normalized]) {
    return STATIC_ROUTES[normalized];
  }

  if (normalized.startsWith("/help/")) {
    const moduleId = normalized.slice("/help/".length);
    const mod = helpModules.find((m) => m.id === moduleId);
    if (mod) {
      return {
        title: `${mod.title} — Centre d'aide Jokko Business`,
        description: mod.shortDescription || mod.description,
        canonicalPath: `/help/${mod.id}`,
      };
    }
  }

  if (NOINDEX_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return {
      title: "Jokko Business — Espace boutique",
      description: "Accédez à votre espace de gestion Jokko Business.",
      noindex: true,
    };
  }

  return {
    title: "Page introuvable — Jokko Business",
    description: "La page demandée n'existe pas sur Jokko Business.",
    noindex: true,
  };
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolveSeo(pathname);
    document.title = seo.title;
    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "robots", seo.noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);

    const canonicalUrl = `${SITE_URL}${seo.canonicalPath ?? pathname}`;
    upsertCanonical(canonicalUrl);
    upsertMeta("property", "og:url", canonicalUrl);
  }, [pathname]);

  return null;
}
