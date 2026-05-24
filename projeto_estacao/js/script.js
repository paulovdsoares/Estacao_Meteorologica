const SERVER_URL = 'http://localhost:8080';
let TOKEN = null;

// Funções de conversão
function converterTemperatura(valorSensor) {
    return ((valorSensor / 4095) * 60) - 10;
}

function converterUmidade(valorSensor) {
    return (valorSensor / 4095) * 100;
}

function converterVento(valorSensor) {
    return (valorSensor / 4095) * 100;
}

function converterPressao(valorSensor) {
    return 950 + (valorSensor / 4095) * 100;
}

// Autenticar no servidor
function autenticar() {
    return $.ajax({
        url: `${SERVER_URL}/aut`,
        method: 'GET',
        data: {
            usuario: 'admin',
            senha: '123456'
        }
    }).then(function(resposta) {
        if (resposta.startsWith('1')) {
            const match = resposta.match(/TOKEN=(.+)/);
            if (match) {
                TOKEN = match[1];
                console.log('✅ Autenticado com sucesso');
                return true;
            }
        }
        console.error('❌ Falha na autenticação');
        return false;
    }).catch(function(error) {
        console.error('❌ Erro na autenticação:', error);
        return false;
    });
}

// Ler um sensor específico
function lerSensor(sensorId) {
    if (!TOKEN) {
        return $.Deferred().reject('Não autenticado');
    }
    
    return $.ajax({
        url: `${SERVER_URL}/get`,
        method: 'GET',
        data: {
            token: TOKEN,
            sensor: sensorId
        }
    }).then(function(resposta) {
        if (resposta.startsWith('v')) {
            return parseInt(resposta.substring(1));
        } else {
            console.error(`Erro ao ler sensor ${sensorId}: ${resposta}`);
            return null;
        }
    });
}

// Buscar todos os dados climáticos
function buscarDadosClimaticos() {
    // Verificar se está autenticado
    if (!TOKEN) {
        autenticar().then(function() {
            buscarDadosClimaticos(); // Tenta novamente após autenticar
        });
        return;
    }
    
    // Ler todos os 4 sensores em paralelo
    $.when(
        lerSensor('a1'),
        lerSensor('a2'),
        lerSensor('a3'),
        lerSensor('a4')
    ).then(function(tempRaw, umidRaw, ventoRaw, pressaoRaw) {
        
        // Atualizar Temperatura
        if (tempRaw) {
            const temperatura = converterTemperatura(tempRaw);
            $('#temperatura').text(temperatura.toFixed(1));
        }
        
        // Atualizar Umidade
        if (umidRaw) {
            const umidade = converterUmidade(umidRaw);
            $('#umidade').text(umidade.toFixed(1));
        }
        
        // Atualizar Vento
        if (ventoRaw) {
            const vento = converterVento(ventoRaw);
            $('#vento').text(vento.toFixed(1));
        }
        
        // Atualizar Pressão
        if (pressaoRaw) {
            const pressao = converterPressao(pressaoRaw);
            $('#pressao').text(pressao.toFixed(1));
        }
        
        console.log('✅ Dados atualizados');
        
    }).fail(function(error) {
        console.error('❌ Erro ao buscar dados:', error);
    });
}

// Iniciar atualização automática a cada 5 segundos
let intervalo = setInterval(buscarDadosClimaticos, 5000);

// Buscar dados imediatamente ao carregar a página
$(document).ready(function() {
    buscarDadosClimaticos();
    
   
});