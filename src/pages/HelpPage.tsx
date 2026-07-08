import React, { useState } from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  Package, 
  Users, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

// Structure de données pour nos modules d'aide
interface HelpModule {
  id: string;
  title: string;
  shortDescription: string;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
  useCases: { situation: string; solution: string }[];
  videoPlaceholderText: string;
}

export default function HelpPage() {
  // État pour gérer quel accordéon/dropdown est ouvert
  const [activeModule, setActiveModule] = useState<string | null>('caisse');

  const modules: HelpModule[] = [
    {
      id: 'caisse',
      title: 'Gestion de la Caisse & Sécurité',
      shortDescription: 'Sécurisez vos recettes quotidiennes et évitez les écarts de caisse.',
      icon: <Wallet className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-500 bg-emerald-50/50',
      benefits: [
        'Blocage strict de l’application si la caisse n’est pas officiellement ouverte[cite: 13, 15].',
        'Suivi transparent du fond de caisse du matin et du solde de fermeture le soir.',
        'Historique complet de qui a ouvert ou fermé la caisse pour éviter les contestations.'
      ],
      useCases: [
        {
          situation: 'Le matin à l’ouverture de la boutique.',
          solution: 'Vous ou votre employé enregistrez le "Fond de caisse" (l’argent liquide disponible pour rendre la monnaie).'
        },
        {
          situation: 'Un employé tente de faire une vente ou de payer un fournisseur sans ouvrir la caisse.',
          solution: 'Jokko Business bloque l’action instantanément pour forcer la traçabilité de l’argent[cite: 13, 15].'
        },
        {
          situation: 'En fin de journée au moment de fermer.',
          solution: 'L’application calcule automatiquement le montant théorique attendu. Vous n’avez plus qu’à compter les billets physiques.'
        }
      ],
      videoPlaceholderText: 'Vidéo : Comment ouvrir, gérer et clôturer sa caisse sans erreur (Prochainement)'
    },
    {
      id: 'ventes',
      title: 'Point de Vente (POS) & Facturation',
      shortDescription: 'Enregistrez vos ventes en 3 clics et gérez les crédits clients.',
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50/50',
      benefits: [
        'Calcul automatique des prix de gros et demi-gros selon les quantités[cite: 13].',
        'Gestion des paiements partiels (reliquats) pour suivre les clients à crédit[cite: 13].',
        'Impression de tickets de caisse de 80mm ou de factures professionnelles A4[cite: 13].'
      ],
      useCases: [
        {
          situation: 'Un client fidèle achète un gros volume d’articles.',
          solution: 'Dès que la quantité minimale est franchie, l’application applique automatiquement le tarif de gros ou demi-gros sans calculatrice[cite: 13].'
        },
        {
          situation: 'Un client ne paie qu’une partie de sa facture aujourd’hui.',
          solution: 'Vous enregistrez l’acompte, et l’application calcule automatiquement le reste à payer (crédit)[cite: 13].'
        }
      ],
      videoPlaceholderText: 'Vidéo : Faire une vente, appliquer un tarif de gros et imprimer un ticket (Prochainement)'
    },
    {
      id: 'produits',
      title: 'Catalogue Articles & Tarification',
      shortDescription: 'Organisez vos produits avec des images pour une recherche rapide.',
      icon: <Package className="w-6 h-6 text-amber-600" />,
      color: 'border-amber-500 bg-amber-50/50',
      benefits: [
        'Ajout de photos pour permettre aux employés de scanner ou d’identifier visuellement le bon produit[cite: 12].',
        'Configuration de 3 niveaux de prix pour chaque article (Détail, Demi-gros, Gros)[cite: 12].',
        'Alertes intelligentes selon votre abonnement pour ne jamais bloquer votre commerce[cite: 12].'
      ],
      useCases: [
        {
          situation: 'Vous vendez un produit qui a plusieurs tarifs selon le type de client.',
          solution: 'Enregistrez le produit une seule fois, configurez ses trois prix, et laissez le système gérer le reste[cite: 12].'
        },
        {
          situation: 'Vous avez des centaines d’articles dans votre boutique.',
          solution: 'Classez-les par catégories (ex: Boissons, Électronique, Cosmétiques) pour les retrouver en un clin d’œil[cite: 12].'
        }
      ],
      videoPlaceholderText: 'Vidéo : Ajouter un produit avec ses différents prix et sa photo (Prochainement)'
    },
    {
      id: 'stocks',
      title: 'Stocks & Dettes Fournisseurs',
      shortDescription: 'Évitez les ruptures de stock et contrôlez ce que vous devez.',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-500 bg-purple-50/50',
      benefits: [
        'Suivi en temps réel des entrées, sorties pour pertes/casse, et ventes[cite: 14].',
        'Génération automatique de dettes fournisseurs lors d’un approvisionnement à crédit[cite: 14, 15].',
        'Historique complet des mouvements pour comprendre où va votre marchandise[cite: 14].'
      ],
      useCases: [
        {
          situation: 'Vous recevez un nouvel arrivage mais vous ne payez le fournisseur que la semaine prochaine.',
          solution: 'Enregistrez l’entrée de stock en spécifiant l’acompte de 0 FCFA. Le système crée automatiquement une dette envers ce fournisseur[cite: 14, 15].'
        },
        {
          situation: 'Un sac de marchandise est abîmé ou périmé.',
          solution: 'Enregistrez une "Sortie pour perte" avec le motif correspondant pour garder un inventaire parfaitement juste[cite: 14].'
        }
      ],
      videoPlaceholderText: 'Vidéo : Enregistrer un arrivage de stock et suivre ses dettes fournisseurs (Prochainement)'
    }
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
            Découvrez nos guides simplifiés et cas concrets pour maîtriser votre application et propulser la gestion de votre commerce.
          </p>
        </div>
      </div>

      {/* Zone Principale de Contenu */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Menu de Gauche / Navigation Rapide (Optionnel mais très pro sur Desktop) */}
          <div className="hidden lg:block space-y-3 sticky top-6 h-fit bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Les Modules du Guide
            </h3>
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                  activeModule === mod.id 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {/* <div className="flex items-center gap-3"> */}
                  {mod.icon}
                  <span>{mod.title.split(' & ')[0]}</span>
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
                      
                      {/* 1. Avantages Clés */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Ce que ça vous apporte
                        </h4>
                        <ul className="space-y-2">
                          {mod.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 2. Exemples et Cas Concrets */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Exemples pratiques au quotidien
                        </h4>
                        <div className="space-y-3">
                          {mod.useCases.map((useCase, i) => (
                            <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm">
                              <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                                <HelpCircle className="w-4 h-4 text-amber-500" /> Si : {useCase.situation}
                              </div>
                              <p className="text-slate-600 pl-5 leading-relaxed">
                                <span className="font-medium text-blue-600">Réponse de l'app :</span> {useCase.solution}
                              </p>
                            </div>
                          ))}
                        </div>
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