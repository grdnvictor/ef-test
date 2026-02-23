# Test technique EF

Application de gestion de tâches (CRUD) avec une API Symfony / API Platform et un front Next.js. Le tout tourne dans Docker via `docker compose`.

## Stack

- **API** : PHP 8.4, Symfony 6.4, API Platform 4, FrankenPHP
- **Front** : Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Base de données** : PostgreSQL
- **Infra** : Docker Compose

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose

## Lancement

1. Cloner le repo :

```bash
git clone https://github.com/grdnvictor/ef-test.git
cd ef-test
```

2. Premier démarrage (copie le `.env.example`, installe les dépendances, lance les services et exécute les migrations) :

```bash
make first-start
```

3. Accepter le certificat SSL auto-signé : ouvrir [https://localhost/docs](https://localhost/docs) dans le navigateur et accepter le certificat. Sans ça, les requêtes du front vers l'API seront bloquées.

4. Accéder à l'application :

| Service          | URL                          |
|------------------|------------------------------|
| Front (Next.js)  | http://localhost:3000        |
| API (docs)       | https://localhost/docs       |

## Commandes utiles

```bash
make first-start   # Premier lancement complet (env + deps + up + migrations)
make up            # Lance tous les services
make down          # Stoppe tous les services
make migrate       # Exécute les migrations (attend que l'API soit prête)
```

## Choix techniques

### API Platform

L'API est générée automatiquement à partir de l'entité Doctrine `Task`. Les opérations exposées (`Get`, `GetCollection`, `Post`, `Delete`) sont déclarées via des attributs PHP directement sur l'entité, sans contrôleur custom. API Platform gère la sérialisation JSON-LD, la validation (via les contraintes Symfony) et la documentation OpenAPI.

### Zod (validation front)

Les schémas de validation sont centralisés dans `lib/contracts.ts`. Zod permet de valider les données du formulaire côté client avant l'envoi à l'API, avec des messages d'erreur typés par champ. Le type `TaskFormData` est inféré directement du schéma, ce qui évite la duplication entre validation et typage.

## Structure du projet

```
ef-test/
├── api/            # API Symfony + API Platform
│   └── api/
│       ├── src/
│       │   ├── Entity/        # Entité Task
│       │   └── Repository/
│       └── migrations/
├── app/            # Front Next.js
│   ├── app/
│   │   ├── page.tsx           # Page d'accueil
│   │   └── tasks/page.tsx     # Page CRUD des tâches
│   ├── lib/
│   │   ├── types.ts           # Types partagés (Task)
│   │   ├── contracts.ts       # Schémas Zod de validation
│   │   └── utils.ts           # Utilitaires (cn)
│   └── components/ui/         # Composants shadcn/ui
├── compose.yaml
├── Makefile
└── .env.example
```