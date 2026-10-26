/* ================================================================
   « Mon quotidien » — LA liste des apps.
   Lue à la fois par la coquille (index.html) et par le service worker (sw.js).

   Pour ajouter une app plus tard :
   1. mettre son dossier dans Myself/ (ex. Myself/budget/) ;
   2. copier un bloc ci-dessous et le remplir :
        id      : nom court, sans espace ni accent
        nom     : ce qui s'affiche dans la barre du bas
        dossier : le dossier de l'app, terminé par « / »
        base    : le nom de sa base IndexedDB (indexedDB.open('…'))
        — ou, si l'app range ses données dans localStorage :
        stockage: 'localStorage' et prefixe : le début commun de ses clés (ex. 'backstage_')
        icone   : le dessin de l'icône (contenu d'un <svg viewBox="0 0 24 24">, trait seulement)
        couleur : [couleur en mode clair, couleur en mode sombre] — carte de l'accueil
        accueil : place de sa carte sur l'accueil (la carte météo / Bientôt est toujours la 1re)
        toujoursAccueil : true pour que l'onglet ramène toujours à l'accueil de l'app
        cache   : true pour masquer une app (pas d'onglet, pas de carte), sans perdre ses données
   3. augmenter VERSION_QUOTIDIEN de 1 (l'app se mettra à jour toute seule sur le téléphone).

   La sauvegarde globale prend automatiquement toute la base de chaque app listée.
   Un bloc sur l'accueil est optionnel (voir LECTEURS dans index.html).
   ================================================================ */

self.VERSION_QUOTIDIEN = 30;

// Bouton « Noter une modif » (le crayon en bas à droite). Mettre false pour le retirer.
self.RETOURS = true;

self.APPS = [
  {
    id: 'garde-robe',
    nom: 'Garde-robe',
    dossier: 'garde-robe/',
    cache: true,             // masquée : plus d'onglet ni de carte (ses données restent dans les sauvegardes)
    accueil: 5,              // place de sa carte sur l'accueil
    couleur: ['#2F4C78', '#8FB0E3'],
    base: 'garde-robe',
    icone: '<path d="M9 3.5 4 6 2.5 10.5 6 12v8.5h12V12l3.5-1.5L20 6l-5-2.5a3 3 0 0 1-6 0Z"/>'
  },
  {
    id: 'organisation',
    nom: 'Organisation',
    dossier: 'organisation/',
    accueil: 2,
    couleur: ['#C26A12', '#F0A648'],
    base: 'organisation',
    icone: '<path d="M4 6.5l1.5 1.5L8.5 5M4 12.5l1.5 1.5 3-3M4 18.5l1.5 1.5 3-3M12 7h8M12 13h8M12 19h8"/>'
  },
  {
    id: 'courses',
    nom: 'Courses',
    dossier: 'courses/',
    accueil: 4,              // (sa liste s'affiche dans la carte Vêtements de l'accueil)
    toujoursAccueil: true,   // l'onglet ramène toujours à la liste de courses
    couleur: ['#2F7A4A', '#7CC992'],
    base: 'courses',
    icone: '<path d="M3 4h2.5l2.2 11h10.6L20.5 7.5H6.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'
  },
  {
    id: 'backstage',
    nom: 'Backstage',
    dossier: 'backstage/',
    accueil: 3,
    toujoursAccueil: true,   // l'onglet ramène toujours à l'accueil de Backstage
    couleur: ['#7B5CD6', '#A58CF0'],
    stockage: 'localStorage',
    prefixe: 'backstage_',
    icone: '<rect x="9" y="3" width="5" height="7.5" rx="2.5" transform="rotate(18 11.5 6.75)"/><path d="M13.3 9.3 11 21"/><path d="M7.5 21h7"/>'
  }
];
