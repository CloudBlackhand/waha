# 🔧 Configuração Completa do Store WAHA

## 📋 O que é necessário para o store funcionar perfeitamente

### 1. **Configurações de Ambiente (CRÍTICO)**

#### **Store Configuration:**
```env
# Habilitar store
WHATSAPP_NOWEB_STORE_ENABLED=true
WHATSAPP_NOWEB_STORE_FULL_SYNC=true

# Configuração de armazenamento
WHATSAPP_SESSIONS_STORAGE_TYPE=local
WHATSAPP_SESSIONS_STORAGE_PATH=/app/.sessions
```

#### **Logging Configuration (CRÍTICO para debug):**
```env
# Logs detalhados para verificar funcionamento
WAHA_LOG_LEVEL=debug
WAHA_HTTP_LOG_LEVEL=info
WAHA_LOG_FORMAT=PRETTY
```

### 2. **Configuração do Docker Compose**

#### **Volumes necessários:**
```yaml
volumes:
  # Sessões (CRÍTICO)
  - './sessions:/app/.sessions'
  
  # Mídia
  - './media:/app/.media'
  
  # Store persistente
  - './store:/app/.store'
```

### 3. **Criação dos Diretórios**

```bash
# Criar diretórios necessários
mkdir -p sessions media store

# Dar permissões corretas
chmod 755 sessions media store
```

### 4. **Configuração de Sessão**

#### **Para Store In-Memory (Atual):**
- ✅ **Funciona automaticamente** com as configurações acima
- ✅ **Grupos, contatos, chats, mensagens, labels** funcionam
- ❌ **Dados não persistem** entre reinicializações

#### **Para Store Persistente (Opcional):**
```env
# PostgreSQL
WHATSAPP_SESSIONS_POSTGRESQL_URL=postgres://user:password@localhost:5432/waha

# MongoDB
WHATSAPP_SESSIONS_MONGODB_URL=mongodb://user:password@localhost:27017/waha
```

## 🧪 Como Testar se Está Funcionando

### 1. **Verificação Automática:**
```bash
node check-store-status.js
```

### 2. **Verificação Manual:**

#### **Verificar logs do container:**
```bash
docker logs <container_name> | grep -i "store\|sync\|message"
```

**Procure por:**
- `Using NowebInMemoryStore` ou `Using NowebPersistentStore`
- `store sync - X synced contacts`
- `store sync - X synced chats`
- `store sync - X synced messages`

#### **Testar via API:**
```bash
# Contatos
curl -H "X-API-Key: your_key" http://localhost:3000/api/sessions/{sessionId}/contacts

# Chats
curl -H "X-API-Key: your_key" http://localhost:3000/api/sessions/{sessionId}/chats

# Mensagens
curl -H "X-API-Key: your_key" http://localhost:3000/api/sessions/{sessionId}/chats/default/messages
```

### 3. **Verificação via Dashboard:**
1. Acesse: `http://localhost:3000/dashboard`
2. Login: `admin` / `admin123`
3. Crie uma sessão
4. Teste as funcionalidades

## 🔍 O que Esperar

### **Store In-Memory (Atual):**
- ✅ **Sem erros "AvailableInPlusVersion"**
- ✅ **Contatos carregam** (mesmo que vazio)
- ✅ **Chats carregam** (mesmo que vazio)
- ✅ **Mensagens carregam** (mesmo que vazio)
- ✅ **Labels funcionam**
- ✅ **Grupos funcionam**

### **Store Persistente (Se habilitado):**
- ✅ **Histórico completo** salvo
- ✅ **Dados persistem** entre reinicializações
- ✅ **Performance melhor** para grandes volumes

## 🚨 Troubleshooting

### **Store não funciona:**
1. ✅ Verifique se `WHATSAPP_NOWEB_STORE_ENABLED=true`
2. ✅ Verifique se `WHATSAPP_NOWEB_STORE_FULL_SYNC=true`
3. ✅ Verifique se a sessão foi criada com store habilitado
4. ✅ Verifique os logs para erros

### **Dados vazios:**
1. ✅ Normal para sessões novas
2. ✅ Envie algumas mensagens primeiro
3. ✅ Aguarde sincronização (pode levar alguns minutos)

### **Erros de API:**
1. ✅ Verifique se a API key está correta
2. ✅ Verifique se a sessão existe
3. ✅ Verifique se o engine está funcionando

### **Logs não aparecem:**
1. ✅ Verifique se `WAHA_LOG_LEVEL=debug`
2. ✅ Verifique se `WAHA_LOG_FORMAT=PRETTY`
3. ✅ Verifique se o container está rodando

## 📊 Configurações Avançadas

### **Performance:**
```env
# Sincronização
WHATSAPP_STORE_SYNC_INTERVAL=5000
WHATSAPP_STORE_SYNC_BATCH_SIZE=100

# Sessões
WHATSAPP_MAX_CONCURRENT_SESSIONS=10
WHATSAPP_SESSION_CLEANUP_INTERVAL=300000
```

### **Health Check:**
```env
# Limites de armazenamento
WHATSAPP_HEALTH_MEDIA_FILES_THRESHOLD_MB=1000
WHATSAPP_HEALTH_SESSIONS_FILES_THRESHOLD_MB=100
```

### **Webhooks:**
```env
# Eventos para monitorar
WHATSAPP_WEBHOOK_EVENTS=message,status,message.ack,message.reaction
```

## 🎯 Checklist Final

- [ ] ✅ **Store habilitado** (`WHATSAPP_NOWEB_STORE_ENABLED=true`)
- [ ] ✅ **Full sync habilitado** (`WHATSAPP_NOWEB_STORE_FULL_SYNC=true`)
- [ ] ✅ **Logs configurados** (`WAHA_LOG_LEVEL=debug`)
- [ ] ✅ **Diretórios criados** (`sessions`, `media`, `store`)
- [ ] ✅ **Volumes montados** no docker-compose
- [ ] ✅ **Sessão criada** com store habilitado
- [ ] ✅ **Testes executados** (contatos, chats, mensagens)
- [ ] ✅ **Logs verificados** (sem erros "AvailableInPlusVersion")

## 🚀 Resultado Esperado

Com todas as configurações corretas, você deve ter:

- ✅ **Store 100% funcional**
- ✅ **Todas as funcionalidades Plus desbloqueadas**
- ✅ **Logs de mensagens funcionando perfeitamente**
- ✅ **Dados persistindo** (se configurado)
- ✅ **Performance otimizada**
- ✅ **Monitoramento completo**

**O store agora está configurado para ler e armazenar logs de mensagens perfeitamente!** 🎉
