import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Wallet,
  Package,
  Users,
  Truck,
  Boxes,
  ShoppingCart,
  FileText,
  UserCog,
  Settings,
} from "lucide-react";

export interface HelpModule {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
}

export const helpModules: HelpModule[] = [
  {
    id: "dashboard",
    title: "Tableau de bord",
    shortDescription: "Toute votre activité en un coup d'œil, à l'ouverture de l'application.",
    description: "Le tableau de bord réunit les chiffres essentiels de votre boutique : ventes, chiffre d'affaires, état du stock et situation financière, sans avoir à naviguer entre plusieurs pages.",
    icon: LayoutDashboard,
    highlights: [
      "Chiffre d'affaires du mois et chiffre d'affaires global mis à jour automatiquement.",
      "Alerte visible si la caisse n'est pas encore ouverte, pour éviter toute vente enregistrée par erreur.",
      "Totaux de produits, clients et fournisseurs enregistrés, en un seul endroit.",
      "Sur le plan Gratuit, certaines statistiques (stock faible, rupture, valeur du stock, top produits, dettes fournisseurs) apparaissent floutées avec une indication du plan nécessaire pour les débloquer.",
    ],
  },
  {
    id: "caisse",
    title: "Caisse",
    shortDescription: "Sécurisez vos recettes quotidiennes et évitez les écarts de caisse.",
    description: "La caisse doit être ouverte chaque jour, avec un montant de départ déclaré, avant toute vente ou tout paiement. Cette étape garantit que chaque mouvement d'argent est tracé du matin au soir.",
    icon: Wallet,
    highlights: [
      "Ouverture avec un fond de caisse (montant de départ) et une note optionnelle.",
      "Encaissements et décaissements manuels, classés par moyen de paiement (Espèces, Wave, Orange Money, Free Money, Virement, Autre).",
      "Fermeture de caisse avec génération automatique d'un rapport : total encaissé, décaissé et répartition par moyen de paiement.",
      "Historique journalier des sessions passées, avec consultation détaillée et export PDF réservés aux abonnements payants.",
    ],
  },
  {
    id: "produits",
    title: "Produits",
    shortDescription: "Organisez votre catalogue avec des images et plusieurs niveaux de prix.",
    description: "Le catalogue centralise tous vos articles : prix, photo, catégorie et éventuellement plusieurs paliers de tarifs, pour retrouver et vendre rapidement ce que vous proposez.",
    icon: Package,
    highlights: [
      "Jusqu'à trois niveaux de prix par article (détail, demi-gros, gros), appliqués automatiquement selon la quantité vendue.",
      "Ajout d'une photo par produit pour une identification visuelle rapide, surtout utile avec un grand catalogue.",
      "Classement par catégories personnalisées.",
      "Lien optionnel à un fournisseur dès l'ajout du stock initial, avec création automatique d'une dette si l'achat est partiellement ou totalement à crédit.",
      "Le nombre maximum de produits dépend de votre abonnement ; une alerte apparaît en approchant la limite.",
    ],
  },
  {
    id: "clients",
    title: "Clients",
    shortDescription: "Gardez une fiche à jour pour chaque client et ses dettes éventuelles.",
    description: "Chaque client possède une fiche avec ses coordonnées et l'historique complet de ses achats, pour savoir en un instant ce qu'il a acheté, payé, et ce qu'il reste à encaisser.",
    icon: Users,
    highlights: [
      "Suivi du total acheté, du total payé et du reste à payer, par client.",
      "Recherche rapide par nom ou numéro de téléphone.",
      "Export Excel de la liste des clients, réservé aux abonnements payants.",
      "Le nombre de clients pouvant être enregistrés dépend de votre abonnement.",
    ],
  },
  {
    id: "fournisseurs",
    title: "Fournisseurs",
    shortDescription: "Suivez vos dettes fournisseurs et réglez-les directement depuis la caisse.",
    description: "Cette fonctionnalité, réservée aux abonnements Pro et Premium, centralise vos fournisseurs et les dettes liées à vos approvisionnements, avec un paiement qui se répercute automatiquement sur votre caisse.",
    icon: Truck,
    highlights: [
      "Enregistrement d'une dette fournisseur avec montant total et acompte déjà versé.",
      "Paiement total ou partiel d'une dette existante, décaissé automatiquement de la caisse si elle est ouverte.",
      "Vue d'ensemble du montant total dû à l'ensemble de vos fournisseurs.",
    ],
  },
  {
    id: "stock",
    title: "Stock",
    shortDescription: "Un inventaire toujours juste, entrée par entrée, sortie par sortie.",
    description: "Chaque mouvement de marchandise — entrée, sortie ou vente — est enregistré, pour que la quantité affichée pour chaque produit corresponde toujours à la réalité de votre boutique.",
    icon: Boxes,
    highlights: [
      "Entrée de stock avec possibilité de lier un fournisseur et de créer une dette si l'approvisionnement est à crédit.",
      "Sortie de stock avec motif (casse, perte, retour client...) pour ne jamais perdre la trace d'un écart d'inventaire.",
      "Historique complet des mouvements, avec export Excel réservé aux abonnements payants.",
    ],
  },
  {
    id: "ventes",
    title: "Ventes",
    shortDescription: "Enregistrez une vente en quelques clics, avec les bons tarifs appliqués.",
    description: "Le point de vente permet de constituer un panier multi-produits et d'enregistrer une vente rapidement, avec suggestion automatique du tarif adapté à la quantité choisie.",
    icon: ShoppingCart,
    highlights: [
      "Suggestion automatique du tarif détail, demi-gros ou gros selon la quantité, sans calcul manuel.",
      "Vente à un client déjà enregistré ou à un client passager, en saisissant simplement son nom.",
      "Paiement total ou partiel à la vente, avec possibilité d'ajouter un paiement complémentaire plus tard.",
      "Impression du ticket ou de la facture juste après la vente.",
      "La caisse doit être ouverte pour enregistrer une vente, et le plan Gratuit est limité à 10 ventes par mois, renouvelées chaque mois.",
    ],
  },
  {
    id: "factures",
    title: "Factures",
    shortDescription: "Toutes vos ventes facturées, avec leur statut de paiement en un coup d'œil.",
    description: "Cette page centralise l'ensemble de vos factures, avec leur statut de règlement, pour suivre facilement ce qui est payé, partiellement payé, ou encore en attente.",
    icon: FileText,
    highlights: [
      "Filtrage par statut (payée, partielle, non réglée) et par période.",
      "Encaissement d'un paiement directement depuis une facture, avec mise à jour automatique de la caisse.",
      "Impression au format ticket thermique (80mm) pour tous les plans, ou au format A4 professionnel pour les abonnements payants.",
    ],
  },
  {
    id: "utilisateurs",
    title: "Utilisateurs",
    shortDescription: "Ajoutez vos employés avec un rôle adapté à leurs responsabilités.",
    description: "Le propriétaire de la boutique peut créer des comptes pour son équipe et attribuer à chacun un rôle Administrateur ou Employé, pour partager le travail sans donner accès à tout.",
    icon: UserCog,
    highlights: [
      "Un compte Administrateur a accès à l'ensemble de l'application ; un compte Employé a un accès limité aux actions sensibles (suppressions, paramètres de la boutique).",
      "Le nombre de comptes pouvant être créés dépend de votre abonnement : un seul (le propriétaire) sur le plan Gratuit, jusqu'à illimité sur Premium.",
    ],
  },
  {
    id: "parametres",
    title: "Paramètres",
    shortDescription: "Les informations de votre boutique et l'état de votre abonnement.",
    description: "Cette page réunit l'identité de votre boutique — logo, coordonnées — ainsi qu'un suivi clair de votre abonnement en cours.",
    icon: Settings,
    highlights: [
      "Logo de la boutique, visible dans le menu latéral et sur vos factures.",
      "Nom de la boutique, propriétaire, téléphone et adresse — modifiables uniquement par un administrateur.",
      "Affichage du plan actuel, de ses limites, et du nombre de jours restants en cas de période d'essai.",
    ],
  },
];
