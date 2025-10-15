# 🚀 WAHA Personalizado - WhatsApp HTTP API

## 📋 Visão Geral

Este é um fork personalizado do [WAHA (WhatsApp HTTP API)](https://github.com/devlikeapro/waha) com modificações e melhorias específicas.

### ✨ Principais Modificações

- ✅ **Dashboard Personalizado**: Interface customizada em português
- ✅ **Engine NOWEB**: Configurado por padrão para melhor performance
- ✅ **Deploy Ready**: Configurado para Railway e outras plataformas
- ✅ **Documentação Completa**: Guias em português

## 🎯 Funcionalidades

- 📱 **API REST Completa** para WhatsApp
- 🖥️ **Dashboard Web** personalizado
- 🔧 **Múltiplos Engines** (NOWEB, WEBJS, GOWS)
- 📊 **Monitoramento** em tempo real
- 🔐 **Autenticação** configurável
- 🚀 **Deploy Automático** no Railway

## 🚀 Quick Start

### 1. Clone o Repositório
```bash
git clone https://github.com/CloudBlackhand/WahaP.git
cd WahaP
```

### 2. Configurar Variáveis
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### 3. Executar com Docker
```bash
docker-compose up -d
```

### 4. Acessar
- **Dashboard**: http://localhost:3000/dashboard
- **API Docs**: http://localhost:3000/
- **Health**: http://localhost:3000/health

## 📚 Documentação

- [📊 Dashboard Personalizado](./DASHBOARD_PERSONALIZADO.md)
- [🚀 Deploy e Configuração](./DEPLOY_DASHBOARD.md)
- [📖 API Completa](./WAHA_NOWEB_API_DOCUMENTATION.md)

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Dashboard
WAHA_DASHBOARD_ENABLED=true
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=admin

# Engine
WHATSAPP_DEFAULT_ENGINE=NOWEB

# API
WHATSAPP_API_KEY=seu_api_key
PORT=3000
```

### Engines Disponíveis

- **NOWEB** (Recomendado): Sem browser, mais estável
- **WEBJS**: Com Puppeteer, funcionalidades completas
- **GOWS**: Engine em Go, alta performance

## 🎨 Dashboard Personalizado

O dashboard foi modificado com:
- ✅ Interface em português
- ✅ Título personalizado
- ✅ Textos traduzidos
- ✅ Configuração local (sem dependência externa)

## 🚀 Deploy

### Railway
```bash
# 1. Conectar repositório ao Railway
# 2. Configurar variáveis de ambiente
# 3. Deploy automático
```

### Docker
```bash
docker build -t waha-personalizado .
docker run -p 3000:3000 waha-personalizado
```

## 📊 Estrutura do Projeto

```
WahaP/
├── dashboard/           # Dashboard personalizado
├── src/                # Código fonte
├── docker-compose.yaml # Configuração Docker
├── Dockerfile         # Build da imagem
├── railway.toml       # Configuração Railway
└── docs/              # Documentação
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é baseado no WAHA original. Consulte a licença original para mais detalhes.

## 🙏 Agradecimentos

- [devlikeapro](https://github.com/devlikeapro) - Projeto WAHA original
- Comunidade WhatsApp HTTP API

---

**🎉 Desenvolvido com ❤️ para a comunidade brasileira**
