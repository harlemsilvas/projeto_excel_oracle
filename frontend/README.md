# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Se não adicionou dependências, pode reiniciar apenas o container:

# Reinicia o container da API (sem reconstruir)

docker-compose restart app

# Mas se modificou package.json ou instalou algo novo

# Reconstrói o container da API (necessário se houve mudanças nas dependências)

docker-compose up --build --no-deps app

# e for a primeira vez ou quiser garantir tudo limpo

# Para e remove os containers, redes e volumes definidos

docker-compose down

# Reconstrói tudo e sobe novamente

docker-compose up --build -d

# Acompanhe os logs para verificar se subiu certo

# Ver logs da API

docker-compose logs -f app

# Ver logs do banco

docker-compose logs -f postgres
