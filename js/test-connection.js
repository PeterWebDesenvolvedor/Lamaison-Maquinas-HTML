// ============================================
// TESTE DE CONEXÃO COM O BACKEND
// ============================================
async function testBackendConnection() {
    console.log('🔍 Testando conexão com o backend...');
    console.log(`📡 URL: ${API_BASE_URL}`);
    
    try {
        // Teste 1: Verificar se o backend está respondendo
        console.log('📡 Teste 1: Verificando health check...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
        });
        
        if (healthResponse.ok) {
            console.log('✅ Backend está respondendo!');
        } else {
            console.warn('⚠️ Backend respondeu mas com status:', healthResponse.status);
        }
        
        // Teste 2: Tentar login
        console.log('📡 Teste 2: Tentando login...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'admin@lamaison.com', 
                senha: 'admin123' 
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log('✅ Login funcionando!');
            console.log('📦 Token recebido:', loginData.accessToken ? 'Sim' : 'Não');
            return true;
        } else {
            console.warn('⚠️ Erro no login:', loginData.message || 'Erro desconhecido');
            return false;
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ Timeout: O backend não respondeu dentro do tempo limite');
        } else if (error.message.includes('Failed to fetch')) {
            console.error('❌ Conexão recusada: Verifique se o backend está rodando na porta 8070');
            console.error('   Comando para iniciar: mvn spring-boot:run');
        } else {
            console.error('❌ Erro:', error.message);
        }
        return false;
    }
}

// Executar o teste automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando testes de conexão...');
    const connected = await testBackendConnection();
    
    if (connected) {
        console.log('✅ Backend conectado com sucesso!');
    } else {
        console.log('⚠️ Usando localStorage como fallback');
    }
});