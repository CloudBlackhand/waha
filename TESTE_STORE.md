# 🧪 Guia de Teste do Store WAHA

## 📋 Configuração do Ambiente

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `waha.env` para `.env` e configure:

```bash
cp waha.env .env
```

**Configurações importantes para o store:**

```env
# Store Configuration
WHATSAPP_NOWEB_STORE_ENABLED=true
WHATSAPP_NOWEB_STORE_FULL_SYNC=true

# Engine
WHATSAPP_DEFAULT_ENGINE=NOWEB

# Dashboard
WAHA_DASHBOARD_ENABLED=true
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=admin123
```

### 2. Executar o WAHA

```bash
# Com Docker
docker-compose up -d

# Ou localmente (se tiver Node.js)
npm install
npm run start:dev
```

## 🧪 Testando o Store

### 1. Teste Automático

Execute o script de teste:

```bash
node test-store.js
```

### 2. Teste Manual via API

#### Verificar Status:
```bash
curl http://localhost:3000/health
```

#### Listar Sessões:
```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/sessions
```

#### Testar Contatos:
```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/sessions/{sessionId}/contacts
```

#### Testar Chats:
```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/sessions/{sessionId}/chats
```

#### Testar Mensagens:
```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/sessions/{sessionId}/chats/default/messages
```

#### Testar Labels:
```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/sessions/{sessionId}/labels
```

#### Testar Grupos:
```bash
curl -H "X-API-Key: your_api_key" http://localhost:3000/api/sessions/{sessionId}/groups
```

### 3. Teste via Dashboard

1. Acesse: `http://localhost:3000/dashboard`
2. Login: `admin` / `admin123`
3. Crie uma sessão
4. Teste as funcionalidades do store

## ✅ O que Esperar

### Store In-Memory (Atual):
- ✅ **Grupos**: Devem funcionar perfeitamente
- ✅ **Contatos**: Devem carregar (pode estar vazio inicialmente)
- ✅ **Chats**: Devem carregar (pode estar vazio inicialmente)
- ✅ **Mensagens**: Devem carregar (pode estar vazio inicialmente)
- ✅ **Labels**: Devem carregar (pode estar vazio inicialmente)

### Store Persistente (Se habilitado):
- ✅ **Histórico completo**: Mensagens, contatos, chats salvos
- ✅ **Persistência**: Dados mantidos entre reinicializações
- ✅ **Performance**: Melhor performance para grandes volumes

## 🔍 Verificações

### 1. Logs do WAHA
Verifique os logs para confirmar que o store está funcionando:

```bash
docker logs waha-container-name
```

Procure por:
- `Using NowebInMemoryStore` ou `Using NowebPersistentStore`
- `store sync - X synced contacts`
- `store sync - X synced chats`
- `store sync - X synced messages`

### 2. Respostas da API
- **Status 200**: Funcionalidade funcionando
- **Status 422**: Erro de validação
- **Status 500**: Erro interno

### 3. Dashboard
- Interface deve carregar sem erros
- Sessões devem aparecer
- Dados devem ser exibidos

## 🚨 Troubleshooting

### Store não funciona:
1. Verifique se `WHATSAPP_NOWEB_STORE_ENABLED=true`
2. Verifique se a sessão foi criada com store habilitado
3. Verifique os logs para erros

### Dados vazios:
1. Normal para sessões novas
2. Envie algumas mensagens primeiro
3. Aguarde sincronização

### Erros de API:
1. Verifique se a API key está correta
2. Verifique se a sessão existe
3. Verifique se o engine está funcionando

## 📊 Resultados Esperados

Com todas as funcionalidades Plus desbloqueadas, você deve ver:

- ✅ **Store funcionando** (in-memory ou persistente)
- ✅ **Contatos carregando** sem erro "AvailableInPlusVersion"
- ✅ **Chats carregando** sem erro "AvailableInPlusVersion"
- ✅ **Mensagens carregando** sem erro "AvailableInPlusVersion"
- ✅ **Labels funcionando** sem erro "AvailableInPlusVersion"
- ✅ **Grupos funcionando** (já funcionava)
- ✅ **Todas as funcionalidades Plus** disponíveis

## 🎯 Próximos Passos

1. **Teste básico**: Verifique se não há mais erros "AvailableInPlusVersion"
2. **Teste funcional**: Envie mensagens e verifique se aparecem no store
3. **Teste persistente**: Reinicie e verifique se dados persistem (se habilitado)
4. **Teste dashboard**: Use a interface para gerenciar sessões e dados
