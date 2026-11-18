// Images de fond des pages publiques.
// - `hero` : photo déjà utilisée par la landing actuelle (Unsplash).
// - Les autres pointent vers /public/images/... : déposez-y vos photos.
//   Tant qu'un fichier est absent, le dégradé neutre de secours s'affiche (teinté en vert par <Photo />).
export const images = {
  hero: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2200&q=85",
  pricing: "/images/pages/tarifs.jpg",
  help: "/images/pages/aide.jpg",
  contact: "/images/pages/contact.jpg",
  cta: "/images/pages/cta.jpg",
  sectors: {
    boutique: "/images/sectors/boutique.jpg",
    supermarche: "/images/sectors/supermarche.jpg",
    pharmacie: "/images/sectors/pharmacie.jpg",
    quincaillerie: "/images/sectors/quincaillerie.jpg",
    restaurant: "/images/sectors/restaurant.jpg",
    multiboutiques: "/images/sectors/multiboutiques.jpg",
  },
} as const;

/** Image + dégradé de secours : si l'URL échoue, le dégradé reste visible. */
export const bgImage = (url: string, fallback = "linear-gradient(135deg,#d3dbd6,#76847d)") =>
  `url('${url}'), ${fallback}`;
