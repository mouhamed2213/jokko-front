import React, { useState } from 'react';
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
  Play,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

// Structure de données pour nos modules d'aide — un module = une fonctionnalité réelle de l'application
interface HelpModule {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  highlights: string[];
  videoPlaceholderText: string;
}

export default function HelpPage() {
  // État pour gérer quelle section est ouverte
  const [activeModule, setActiveModule] = useState<string | null>('dashboard');

  const modules: HelpModule[] = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      shortDescription: 'Toute votre activité en un coup d\'œil, à l\'ouverture de l\'application.',
      description:
        'Le tableau de bord réunit les chiffres essentiels de votre boutique : ventes, chiffre d\'affaires, état du stock et situation financière, sans avoir à naviguer entre plusieurs pages.',
      icon: <LayoutDashboard className="w-6 h-6 text-indigo-600" />,
      color: 'border-indigo-500 bg-indigo-50/50',
      highlights: [
        'Chiffre d\'affaires du mois et chiffre d\'affaires global mis à jour automatiquement.',
        'Alerte visible si la caisse n\'est pas encore ouverte, pour éviter toute vente enregistrée par erreur.',
        'Totaux de produits, clients et fournisseurs enregistrés, en un seul endroit.',
        'Sur le plan Gratuit, certaines statistiques (stock faible, rupture, valeur du stock, top produits, dettes fournisseurs) apparaissent floutées avec une indication du plan nécessaire pour les débloquer.',
      ],
      videoPlaceholderText: 'Vidéo : Comprendre les informations du tableau de bord (Prochainement)',
    },
    {
      id: 'caisse',
      title: 'Caisse',
      shortDescription: 'Sécurisez vos recettes quotidiennes et évitez les écarts de caisse.',
      description:
        'La caisse doit être ouverte chaque jour, avec un montant de départ déclaré, avant toute vente ou tout paiement. Cette étape garantit que chaque mouvement d\'argent est tracé du matin au soir.',
      icon: <Wallet className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-500 bg-emerald-50/50',
      highlights: [
        'Ouverture avec un fond de caisse (montant de départ) et une note optionnelle.',
        'Encaissements et décaissements manuels, classés par moyen de paiement (Espèces, Wave, Orange Money, Free Money, Virement, Autre).',
        'Fermeture de caisse avec génération automatique d\'un rapport : total encaissé, décaissé et répartition par moyen de paiement.',
        'Historique journalier des sessions passées, avec consultation détaillée et export PDF réservés aux abonnements payants.',
      ],
      videoPlaceholderText: 'Vidéo : Ouvrir, gérer et clôturer sa caisse sans erreur (Prochainement)',
    },
    {
      id: 'produits',
      title: 'Produits',
      shortDescription: 'Organisez votre catalogue avec des images et plusieurs niveaux de prix.',
      description:
        'Le catalogue centralise tous vos articles : prix, photo, catégorie et éventuellement plusieurs paliers de tarifs, pour retrouver et vendre rapidement ce que vous proposez.',
      icon: <Package className="w-6 h-6 text-amber-600" />,
      color: 'border-amber-500 bg-amber-50/50',
      highlights: [
        'Jusqu\'à trois niveaux de prix par article (détail, demi-gros, gros), appliqués automatiquement selon la quantité vendue.',
        'Ajout d\'une photo par produit pour une identification visuelle rapide, surtout utile avec un grand catalogue.',
        'Classement par catégories personnalisées.',
        'Lien optionnel à un fournisseur dès l\'ajout du stock initial, avec création automatique d\'une dette si l\'achat est partiellement ou totalement à crédit.',
        'Le nombre maximum de produits dépend de votre abonnement ; une alerte apparaît en approchant la limite.',
      ],
      videoPlaceholderText: 'Vidéo : Ajouter un produit avec ses prix et sa photo (Prochainement)',
    },
    {
      id: 'clients',
      title: 'Clients',
      shortDescription: 'Gardez une fiche à jour pour chaque client et ses dettes éventuelles.',
      description:
        'Chaque client possède une fiche avec ses coordonnées et l\'historique complet de ses achats, pour savoir en un instant ce qu\'il a acheté, payé, et ce qu\'il reste à encaisser.',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50/50',
      highlights: [
        'Suivi du total acheté, du total payé et du reste à payer, par client.',
        'Recherche rapide par nom ou numéro de téléphone.',
        'Export Excel de la liste des clients, réservé aux abonnements payants.',
        'Le nombre de clients pouvant être enregistrés dépend de votre abonnement.',
      ],
      videoPlaceholderText: 'Vidéo : Suivre les achats et les dettes d\'un client (Prochainement)',
    },
    {
      id: 'fournisseurs',
      title: 'Fournisseurs',
      shortDescription: 'Suivez vos dettes fournisseurs et réglez-les directement depuis la caisse.',
      description:
        'Cette fonctionnalité, réservée aux abonnements Pro et Premium, centralise vos fournisseurs et les dettes liées à vos approvisionnements, avec un paiement qui se répercute automatiquement sur votre caisse.',
      icon: <Truck className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-500 bg-purple-50/50',
      highlights: [
        'Enregistrement d\'une dette fournisseur avec montant total et acompte déjà versé.',
        'Paiement total ou partiel d\'une dette existante, décaissé automatiquement de la caisse si elle est ouverte.',
        'Vue d\'ensemble du montant total dû à l\'ensemble de vos fournisseurs.',
      ],
      videoPlaceholderText: 'Vidéo : Gérer un fournisseur et régler une dette (Prochainement)',
    },
    {
      id: 'stock',
      title: 'Stock',
      shortDescription: 'Un inventaire toujours juste, entrée par entrée, sortie par sortie.',
      description:
        'Chaque mouvement de marchandise — entrée, sortie ou vente — est enregistré, pour que la quantité affichée pour chaque produit corresponde toujours à la réalité de votre boutique.',
      icon: <Boxes className="w-6 h-6 text-orange-600" />,
      color: 'border-orange-500 bg-orange-50/50',
      highlights: [
        'Entrée de stock avec possibilité de lier un fournisseur et de créer une dette si l\'approvisionnement est à crédit.',
        'Sortie de stock avec motif (casse, perte, retour client...) pour ne jamais perdre la trace d\'un écart d\'inventaire.',
        'Historique complet des mouvements, avec export Excel réservé aux abonnements payants.',
      ],
      videoPlaceholderText: 'Vidéo : Enregistrer une entrée ou une sortie de stock (Prochainement)',
    },
    {
      id: 'ventes',
      title: 'Ventes',
      shortDescription: 'Enregistrez une vente en quelques clics, avec les bons tarifs appliqués.',
      description:
        'Le point de vente permet de constituer un panier multi-produits et d\'enregistrer une vente rapidement, avec suggestion automatique du tarif adapté à la quantité choisie.',
      icon: <ShoppingCart className="w-6 h-6 text-cyan-600" />,
      color: 'border-cyan-500 bg-cyan-50/50',
      highlights: [
        'Suggestion automatique du tarif détail, demi-gros ou gros selon la quantité, sans calcul manuel.',
        'Vente à un client déjà enregistré ou à un client passager, en saisissant simplement son nom.',
        'Paiement total ou partiel à la vente, avec possibilité d\'ajouter un paiement complémentaire plus tard.',
        'Impression du ticket ou de la facture juste après la vente.',
        'La caisse doit être ouverte pour enregistrer une vente, et le plan Gratuit est limité à 100 ventes par mois, renouvelées chaque mois.',
      ],
      videoPlaceholderText: 'Vidéo : Réaliser une vente et appliquer un tarif de gros (Prochainement)',
    },
    {
      id: 'factures',
      title: 'Factures',
      shortDescription: 'Toutes vos ventes facturées, avec leur statut de paiement en un coup d\'œil.',
      description:
        'Cette page centralise l\'ensemble de vos factures, avec leur statut de règlement, pour suivre facilement ce qui est payé, partiellement payé, ou encore en attente.',
      icon: <FileText className="w-6 h-6 text-rose-600" />,
      color: 'border-rose-500 bg-rose-50/50',
      highlights: [
        'Filtrage par statut (payée, partielle, non réglée) et par période.',
        'Encaissement d\'un paiement directement depuis une facture, avec mise à jour automatique de la caisse.',
        'Impression au format ticket thermique (80mm) pour tous les plans, ou au format A4 professionnel pour les abonnements payants.',
      ],
      videoPlaceholderText: 'Vidéo : Suivre et encaisser une facture (Prochainement)',
    },
    {
      id: 'utilisateurs',
      title: 'Utilisateurs',
      shortDescription: 'Ajoutez vos employés avec un rôle adapté à leurs responsabilités.',
      description:
        'Le propriétaire de la boutique peut créer des comptes pour son équipe et attribuer à chacun un rôle Administrateur ou Employé, pour partager le travail sans donner accès à tout.',
      icon: <UserCog className="w-6 h-6 text-teal-600" />,
      color: 'border-teal-500 bg-teal-50/50',
      highlights: [
        'Un compte Administrateur a accès à l\'ensemble de l\'application ; un compte Employé a un accès limité aux actions sensibles (suppressions, paramètres de la boutique).',
        'Le nombre de comptes pouvant être créés dépend de votre abonnement : un seul (le propriétaire) sur le plan Gratuit, jusqu\'à illimité sur Premium.',
      ],
      videoPlaceholderText: 'Vidéo : Ajouter un employé et choisir son rôle (Prochainement)',
    },
    {
      id: 'parametres',
      title: 'Paramètres',
      shortDescription: 'Les informations de votre boutique et l\'état de votre abonnement.',
      description:
        'Cette page réunit l\'identité de votre boutique — logo, coordonnées — ainsi qu\'un suivi clair de votre abonnement en cours.',
      icon: <Settings className="w-6 h-6 text-slate-600" />,
      color: 'border-slate-500 bg-slate-50/50',
      highlights: [
        'Logo de la boutique, visible dans le menu latéral et sur vos factures.',
        'Nom de la boutique, propriétaire, téléphone et adresse — modifiables uniquement par un administrateur.',
        'Affichage du plan actuel, de ses limites, et du nombre de jours restants en cas de période d\'essai.',
      ],
      videoPlaceholderText: 'Vidéo : Personnaliser sa boutique et suivre son abonnement (Prochainement)',
    },
  ];

  const toggleModule = (id: string) => {
    setActiveModule(activeModule === id ? null : id);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Section En-tête / Hero */}
      <div className="  bg-emerald-600 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2  text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Centre d'Accompagnement Jokko Business
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Comment fonctionne Jokko Business ?
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Découvrez chaque fonctionnalité de l'application, ce qu'elle permet de faire et comment elle vous aide au quotidien.
          </p>
        </div>
      </div>

      {/* Zone Principale de Contenu */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Menu de Gauche / Navigation Rapide (Desktop) */}
          <div className="hidden lg:block space-y-1 sticky top-6 h-fit bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Fonctionnalités
            </h3>
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-3 ${
                  activeModule === mod.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {mod.icon}
                <span>{mod.title}</span>
              </button>
            ))}
          </div>

          {/* Section Droite / Les Dropdowns Interactifs */}
          <div className="lg:col-span-2 space-y-4">
            {modules.map((mod) => {
              const isOpen = activeModule === mod.id;
              return (
                <div
                  key={mod.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                    isOpen ? `border-l-4 ${mod.color}` : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Bouton d'entête du Dropdown */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-start sm:items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                        {mod.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                          {mod.title}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                          {mod.shortDescription}
                        </p>
                      </div>
                    </div>
                    <div className="text-slate-400 p-1 rounded-lg hover:bg-slate-50 mt-1 sm:mt-0">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Contenu Déroulant */}
                  {isOpen && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-white space-y-6 animate-fadeIn">

                      {/* 1. Description */}
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {mod.description}
                      </p>

                      {/* 2. Ce que vous pouvez faire */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Ce que vous pouvez faire
                        </h4>
                        <ul className="space-y-2">
                          {mod.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. Placeholder de la Vidéo */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Démonstration Visuelle
                        </h4>
                        <div className="relative group rounded-2xl overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center text-center p-6 border border-slate-800 shadow-inner">
                          {/* Couche d'effet visuel en fond */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />

                          {/* Bouton Play stylisé */}
                          <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 cursor-pointer z-10">
                            <Play className="w-6 h-6 fill-current translate-x-0.5" />
                          </div>

                          {/* Texte explicatif sous le bouton */}
                          <p className="text-slate-300 text-sm font-medium mt-4 max-w-sm z-10">
                            {mod.videoPlaceholderText}
                          </p>
                          <span className="text-xs text-slate-500 mt-1 z-10 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700">
                            Vidéo explicative bientôt disponible
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}