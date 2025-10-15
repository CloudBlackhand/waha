#!/usr/bin/env node

/**
 * Script para testar as funcionalidades do store WAHA
 * Execute: node test-store.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'your_api_key_here'; // Substitua pela sua API key

// Configuração do axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function testStore() {
  console.log('🧪 Testando funcionalidades do store WAHA...\n');

  try {
    // 1. Verificar se a API está funcionando
    console.log('1️⃣ Verificando status da API...');
    const health = await api.get('/health');
    console.log('✅ API Status:', health.data.status);
    console.log('📊 Engine:', health.data.engine);
    console.log('🔧 Version:', health.data.version);
    console.log('');

    // 2. Listar sessões
    console.log('2️⃣ Listando sessões...');
    const sessions = await api.get('/api/sessions');
    console.log('📱 Sessões encontradas:', sessions.data.length);
    
    if (sessions.data.length === 0) {
      console.log('⚠️  Nenhuma sessão encontrada. Crie uma sessão primeiro.');
      return;
    }

    const sessionId = sessions.data[0].id;
    console.log('🎯 Usando sessão:', sessionId);
    console.log('');

    // 3. Testar funcionalidades do store
    console.log('3️⃣ Testando funcionalidades do store...');

    // Testar contatos
    try {
      console.log('📞 Testando contatos...');
      const contacts = await api.get(`/api/sessions/${sessionId}/contacts`);
      console.log('✅ Contatos carregados:', contacts.data.length);
    } catch (error) {
      console.log('❌ Erro ao carregar contatos:', error.response?.data?.message || error.message);
    }

    // Testar chats
    try {
      console.log('💬 Testando chats...');
      const chats = await api.get(`/api/sessions/${sessionId}/chats`);
      console.log('✅ Chats carregados:', chats.data.length);
    } catch (error) {
      console.log('❌ Erro ao carregar chats:', error.response?.data?.message || error.message);
    }

    // Testar mensagens
    try {
      console.log('📨 Testando mensagens...');
      const messages = await api.get(`/api/sessions/${sessionId}/chats/default/messages`);
      console.log('✅ Mensagens carregadas:', messages.data.length);
    } catch (error) {
      console.log('❌ Erro ao carregar mensagens:', error.response?.data?.message || error.message);
    }

    // Testar labels
    try {
      console.log('🏷️  Testando labels...');
      const labels = await api.get(`/api/sessions/${sessionId}/labels`);
      console.log('✅ Labels carregados:', labels.data.length);
    } catch (error) {
      console.log('❌ Erro ao carregar labels:', error.response?.data?.message || error.message);
    }

    // Testar grupos
    try {
      console.log('👥 Testando grupos...');
      const groups = await api.get(`/api/sessions/${sessionId}/groups`);
      console.log('✅ Grupos carregados:', groups.data.length);
    } catch (error) {
      console.log('❌ Erro ao carregar grupos:', error.response?.data?.message || error.message);
    }

    console.log('');
    console.log('🎉 Teste do store concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar teste
testStore();
