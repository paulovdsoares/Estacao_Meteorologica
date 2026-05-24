const BASE_URL = 'http://localhost:8080';

// 1. Faz a autenticação via GET
$.ajax({
    url: `${BASE_URL}/aut`,
    method: 'GET',
    data: { usuario: 'admin', senha: '123456' },
    dataType: 'text',
    success: function(respostaAut) {
        // 2. Extrai o token usando a Expressão Regular
        const tokenMatch = respostaAut.match(/TOKEN=(.+)/);
        
        if (tokenMatch) {
            const token = tokenMatch[1].trim();
            console.log('Autenticado com sucesso! Token:', token);

            // Dispara a leitura dos sensores passando o token extraído
            lerSensores(token);
        } else {
            console.error('Não foi possível extrair o token da resposta.');
        }
    }
});

// Função para buscar os dados e injetar nos IDs do seu HTML
function lerSensores(token) {
    
    // Sensor a1 - Temperatura
    $.ajax({
        url: `${BASE_URL}/get`,
        method: 'GET',
        data: { token: token, sensor: 'a1' },
        dataType: 'text',
        success: function(res) {
            const valorBruto = parseInt(res.substring(1), 10);
            const temp = ((valorBruto / 4095) * 60) - 10;
            
            // Atualiza o <span id="temperatura">
            $('#temperatura').text(temp.toFixed(1));
            console.log('Temperatura (a1) atualizada:', temp.toFixed(1));
        }
    });

    // Sensor a2 - Umidade
    $.ajax({
        url: `${BASE_URL}/get`,
        method: 'GET',
        data: { token: token, sensor: 'a2' },
        dataType: 'text',
        success: function(res) {
            const valorBruto = parseInt(res.substring(1), 10);
            const umidade = (valorBruto / 4095) * 100;
            
            // Atualiza o <span id="umidade">
            $('#umidade').text(umidade.toFixed(0));
            console.log('Umidade (a2) atualizada:', umidade.toFixed(0));
        }
    });

    // Sensor a3 - Velocidade do Vento
    $.ajax({
        url: `${BASE_URL}/get`,
        method: 'GET',
        data: { token: token, sensor: 'a3' },
        dataType: 'text',
        success: function(res) {
            const valorBruto = parseInt(res.substring(1), 10);
            const vento = (valorBruto / 4095) * 100;
            
            // Atualiza o <span id="vento">
            $('#vento').text(vento.toFixed(1));
            console.log('Vento (a3) atualizado:', vento.toFixed(1));
        }
    });

    // Sensor a4 - Pressão
    $.ajax({
        url: `${BASE_URL}/get`,
        method: 'GET',
        data: { token: token, sensor: 'a4' },
        dataType: 'text',
        success: function(res) {
            const valorBruto = parseInt(res.substring(1), 10);
            const pressao = 950 + (valorBruto / 4095) * 100;
            
            // Atualiza o <span id="pressao">
            $('#pressao').text(pressao.toFixed(0));
            console.log('Pressão (a4) atualizada:', pressao.toFixed(0));
        }
    });
}