# Guia de Configuração de Projeto React com Tailwind CSS

## Pré-requisitos
- Node.js (versão 18 ou superior)
- npm (geralmente instalado com o Node.js)

## Passo a Passo Completo

### 1. Criar Novo Projeto React

Abra o terminal e execute:

```bash
# Criar novo projeto com Vite (opção recomendada)
npm create vite@latest meu-projeto-react -- --template react

# Ou usar Create React App (método tradicional)
npx create-react-app meu-projeto-react
```

### 2. Navegar para o Diretório do Projeto

```bash
cd meu-projeto-react
```

### 3. Instalar Tailwind CSS e Dependências

Para projetos Vite:
```bash
# Instalar Tailwind e dependências complementares
npm install -D tailwindcss postcss autoprefixer

# Gerar arquivos de configuração do Tailwind
npx tailwindcss init -p
```

Para projetos Create React App:
```bash
# Instalar Tailwind e dependências complementares
npm install -D tailwindcss postcss autoprefixer

# Gerar arquivos de configuração do Tailwind
npx tailwindcss init -p
```

### 4. Configurar Tailwind CSS

Edite o arquivo `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 5. Adicionar Diretivas Tailwind

Crie ou edite o arquivo `./src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6. Limpar Estilos Padrão (Opcional)

No arquivo `./src/App.css`, remova todos os estilos padrão.

### 7. Testar Configuração

No arquivo `./src/App.jsx`, adicione algumas classes Tailwind para testar:

```jsx
function App() {
  return (
    <div className="container mx-auto p-4 text-center bg-blue-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600">
        Projeto React com Tailwind CSS
      </h1>
    </div>
  )
}

export default App
```

### 8. Instalar Dependências Adicionais (Opcional)

```bash
# React Router (para roteamento)
npm install react-router-dom

# Ícones
npm install lucide-react

# Componentes UI
npm install @shadcn/ui
```

### 9. Iniciar Servidor de Desenvolvimento

```bash
# Para projetos Vite
npm run dev

# Para projetos Create React App
npm start
```

## Dicas Adicionais

- Use a extensão "Tailwind CSS IntelliSense" no VSCode
- Consulte a documentação oficial: 
  - React: https://react.dev
  - Tailwind CSS: https://tailwindcss.com
  - Vite: https://vitejs.dev

## Estrutura de Diretórios Recomendada

```
meu-projeto-react/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── tailwind.config.js
└── vite.config.js (ou similar)
```

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Atualizar dependências
npm update

# Construir para produção
npm run build
```

## Solução de Problemas

- Se encontrar erros, verifique as versões do Node.js e npm
- Certifique-se de que todas as dependências estão corretamente instaladas
- Consulte a documentação oficial em caso de dúvidas específicas
```

### Observações Finais

- Este guia oferece uma configuração básica e flexível
- Adapte conforme as necessidades específicas do seu projeto
- Sempre consulte a documentação oficial para detalhes atualizados
