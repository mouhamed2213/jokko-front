import type { LucideIcon } from "lucide-react";
import {
  BarChart3, Bell, Building2, FileText, Package, ShoppingCart, Truck, Users, Wallet,
  ShoppingBasket, Store, Pill, Hammer, UtensilsCrossed,
} from "lucide-react";
import { images } from "./publicImages";

export interface Sector { name: string; icon: LucideIcon; image: string; gradient: string; text: string; }

export const sectors: Sector[] = [
  { name: "Boutiques & magasins", icon: Store, image: images.sectors.boutique, gradient: "linear-gradient(135deg,#065f46,#0f172a)", text: "Catalogue, ventes au comptoir et dettes clients suivis au même endroit." },
  { name: "Supermarchés", icon: ShoppingBasket, image: images.sectors.supermarche, gradient: "linear-gradient(135deg,#1e40af,#0f172a)", text: "Gros volumes de produits, alertes de rupture et valeur du stock." },
  { name: "Pharmacies", icon: Pill, image: images.sectors.pharmacie, gradient: "linear-gradient(135deg,#0f766e,#0f172a)", text: "Suivez les références en stock et anticipez les ruptures." },
  { name: "Quincailleries", icon: Hammer, image: images.sectors.quincaillerie, gradient: "linear-gradient(135deg,#9a3412,#0f172a)", text: "Prix détail, demi-gros et gros selon la quantité vendue." },
  { name: "Restaurants", icon: UtensilsCrossed, image: images.sectors.restaurant, gradient: "linear-gradient(135deg,#9f1239,#0f172a)", text: "Encaissez vite, suivez la caisse et les achats fournisseurs." },
  { name: "Multi-boutiques", icon: Building2, image: images.sectors.multiboutiques, gradient: "linear-gradient(135deg,#4c1d95,#0f172a)", text: "Plusieurs points de vente pilotés depuis un seul compte." },
];

export interface Feature { icon: LucideIcon; title: string; description: string; points: string[]; }

export const features: Feature[] = [
  { icon: Package, title: "Produits & stock", description: "Un catalogue clair, un stock fiable.", points: ["Photo et catégorie par produit", "Jusqu'à 3 niveaux de prix : détail, demi-gros, gros", "Alertes de stock faible et de rupture"] },
  { icon: ShoppingCart, title: "Ventes & facturation", description: "Vendez vite, justifiez chaque vente.", points: ["Tickets de caisse et factures", "Historique des ventes", "Exports PDF / Excel"] },
  { icon: Wallet, title: "Caisse journalière", description: "Chaque mouvement d'argent est tracé.", points: ["Ouverture avec fond de caisse", "Espèces, Wave, Orange Money, Free Money, virement", "Rapport automatique à la fermeture"] },
  { icon: Users, title: "Clients", description: "Connaissez vos clients et leurs dettes.", points: ["Fiches clients", "Historique d'achats", "Suivi des soldes"] },
  { icon: Truck, title: "Fournisseurs", description: "Gardez la main sur vos achats.", points: ["Approvisionnements", "Dettes et paiements fournisseurs", "Analyse par fournisseur"] },
  { icon: BarChart3, title: "Statistiques", description: "Décidez avec des chiffres.", points: ["Chiffre d'affaires", "Produits les plus vendus", "Rapports avancés selon la formule"] },
  { icon: Building2, title: "Multi-boutiques & équipe", description: "Faites grandir votre commerce.", points: ["Plusieurs boutiques, un seul compte", "Rôles et permissions par utilisateur"] },
  { icon: Bell, title: "Notifications", description: "Ne ratez plus l'essentiel.", points: ["Stocks faibles", "Factures impayées", "Échéances importantes"] },
];

export const workflow = [
  { time: "Matin", title: "J'ouvre la caisse", text: "Je déclare mon fond de caisse : la journée commence sur des bases claires.", icon: Wallet },
  { time: "Journée", title: "Je vends", text: "J'enregistre mes ventes, j'imprime un ticket ou une facture, je note les dettes clients.", icon: ShoppingCart },
  { time: "Au fil de l'eau", title: "Je suis mon stock", text: "Les quantités se mettent à jour et les alertes me préviennent avant la rupture.", icon: Package },
  { time: "Soir", title: "Je ferme et je vérifie", text: "Je ferme la caisse : le rapport donne l'encaissé et le décaissé par moyen de paiement.", icon: FileText },
];

export const paymentMethods = ["Espèces", "Wave", "Orange Money", "Free Money", "Virement"];

export const faqs = [
  { q: "Faut-il installer un logiciel ?", a: "Non. Jokko Business est accessible depuis un navigateur web, sur ordinateur, tablette ou smartphone." },
  { q: "Puis-je gérer ma boutique depuis mon téléphone ?", a: "Oui. Vous pouvez accéder à votre espace depuis un navigateur mobile pour consulter et gérer votre activité." },
  { q: "Puis-je commencer sans payer ?", a: "Oui. Un plan Gratuit est disponible pour démarrer et découvrir les fonctions essentielles de gestion commerciale." },
  { q: "Puis-je faire évoluer mon abonnement ?", a: "Oui. Les offres permettent de choisir un niveau adapté à la taille de votre activité et à vos besoins." },
  { q: "Puis-je gérer plusieurs boutiques ?", a: "Oui, avec les formules qui incluent la gestion multi-boutiques (voir la page Tarifs)." },
  { q: "Comment payer mon abonnement ?", a: "Les abonnements payants se règlent notamment par Wave ou Orange Money." },
];
