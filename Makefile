.PHONY: up down first-start migrate wait-php

help: ## Affiche les commandes disponibles
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

up: ## Lance tous les services
	docker compose up -d --build

down: ## Stoppe tous les services
	docker compose down

wait-php: ## Attend que le container php soit healthy
	@echo "⏳ En attente du container php..."
	@until docker compose exec php curl --silent --insecure --fail https://localhost/docs > /dev/null 2>&1; do \
		sleep 2; \
	done
	@echo "✅ Container php prêt"

migrate: wait-php ## Exécute les migrations Doctrine
	docker compose exec php bin/console doctrine:migrations:migrate --no-interaction

first-start: ## Premier lancement : env, dépendances, services et migrations
	@if [ ! -f .env ]; then cp .env.example .env; fi
	cd app && npm install
	$(MAKE) up
	$(MAKE) migrate