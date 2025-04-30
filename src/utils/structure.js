src/
├── index.js             # Point d'entrée principal
├── modules/
│   ├── wordManager.js   # Gestion des mots et de leur sélection
│   ├── generator.js     # Génération de combinaisons
│   ├── rating.js        # Système de notation et feedback
│   ├── history.js       # Gestion de l'historique et des statistiques
│   ├── export.js        # Fonctions d'exportation
│   ├── sharing.js       # Fonctions de partage sur réseaux sociaux
│   └── ui.js            # Utilitaires UI et notifications
└── utils/
    └── storage.js       # Abstraction du localStorage
```

Cette organisation:
1. Sépare clairement les responsabilités
2. Facilite la maintenance (correction de bugs ou ajout de fonctionnalités)
3. Permet de charger seulement ce qui est nécessaire
4. Facilite le testing unitaire