# 📊 Dashboard WAHA Personalizado

## 🎯 O que foi feito

✅ **Dashboard baixado e configurado localmente**
- Baixamos o dashboard oficial do repositório `devlikeapro/dashboard`
- Configuramos para usar nossa versão local ao invés de baixar do GitHub
- Fizemos modificações de exemplo para demonstrar personalização

## 🔧 Configurações Aplicadas

### 1. **Modificação do Caminho do Dashboard**
```typescript
// Em src/core/app.module.core.ts
{
  rootPath: join(__dirname, '..', '..', 'dashboard'), // Caminho para nossa pasta local
  serveRoot: dashboardConfig.dashboardUri,
}
```

### 2. **Modificações no Dashboard**
- **Título**: Alterado para "Dashboard | WAHA - Versão Personalizada"
- **Texto de carregamento**: Traduzido para português
- **Arquivo**: `dashboard/index.html`

### 3. **Arquivo de Configuração**
```bash
# config.env
WAHA_DASHBOARD_ENABLED=true
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=admin
WHATSAPP_DEFAULT_ENGINE=NOWEB
PORT=3000
WAHA_DEBUG_MODE=false
```

## 🚀 Como Usar

### **Opção 1: Teste Rápido**
```bash
# Servidor de teste simples
node test-dashboard.js

# Acesse: http://localhost:3001/dashboard
```

### **Opção 2: Com Aplicação WAHA Completa**
```bash
# 1. Instalar dependências (se necessário)
npm install

# 2. Build da aplicação
npm run build

# 3. Executar
npm start

# 4. Acessar dashboard
# http://localhost:3000/dashboard
```

### **Opção 3: Com Docker**
```bash
# Build da imagem
docker build . -t waha-personalizado

# Executar
docker run -p 3000:3000 --env-file config.env waha-personalizado

# Acessar
http://localhost:3000/dashboard
```

## 📁 Estrutura do Dashboard

```
dashboard/
├── index.html              # Página principal (modificada)
├── _nuxt/                  # Assets do Nuxt.js
├── themes/                 # Temas do PrimeVue
├── layout/                 # Layouts e imagens
├── Sessions/               # Página de sessões
├── Workers/                # Página de workers
├── event-monitor/          # Monitor de eventos
└── demo/                   # Dados de demonstração
```

## 🎨 Personalizações Possíveis

### **1. Modificar Interface**
- Editar `dashboard/index.html`
- Alterar temas em `dashboard/themes/`
- Modificar layouts em `dashboard/layout/`

### **2. Adicionar Funcionalidades**
- Criar novas páginas em `dashboard/`
- Modificar componentes existentes
- Adicionar novos estilos CSS

### **3. Configurar Autenticação**
```bash
# No config.env
WAHA_DASHBOARD_USERNAME=seu_usuario
WAHA_DASHBOARD_PASSWORD=sua_senha
```

## 🔄 Atualizações

### **Para Atualizar o Dashboard:**
```bash
cd dashboard
git fetch origin
git checkout <nova_versao>
cd ..
```

### **Para Resetar Modificações:**
```bash
cd dashboard
git reset --hard HEAD
git clean -fd
```

## 🛠️ Desenvolvimento

### **Estrutura do Projeto Original**
O dashboard é uma aplicação **Nuxt.js** com:
- **Vue 3** + **Composition API**
- **PrimeVue** para componentes UI
- **Tailwind CSS** para estilos
- **TypeScript** para tipagem

### **Para Desenvolvimento Completo**
1. Baixar código fonte do `waha-hub` (repositório privado)
2. Configurar ambiente de desenvolvimento
3. Fazer modificações no código fonte
4. Build e deploy

## 📝 Próximos Passos

1. **Testar com aplicação WAHA completa**
2. **Fazer modificações mais significativas**
3. **Adicionar funcionalidades personalizadas**
4. **Configurar para produção**

## 🎉 Resultado

✅ **Dashboard funcionando localmente**
✅ **Modificações aplicadas com sucesso**
✅ **Configuração para desenvolvimento**
✅ **Pronto para personalizações**

---

**Nota**: Este dashboard é uma versão estática (build de produção). Para desenvolvimento completo, seria necessário acesso ao código fonte original.
