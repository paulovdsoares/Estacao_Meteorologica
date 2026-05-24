// script.js
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
async function autenticar() {
    try {
        const response = await fetch(`${SERVER_URL}/aut?usuario=admin&senha=123456`);
        const texto = await response.text();
        
        if (texto.startsWith('1')) {
            const match = texto.match(/TOKEN=(.+)/);
            if (match) {
                TOKEN = match[1];
                console.log('✅ Autenticado com sucesso');
                return true;
            }
        }
        console.error('❌ Falha na autenticação');
        return false;
    } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        return false;
    }
}

// Ler um sensor específico
async function lerSensor(sensorId) {
    if (!TOKEN) {
        console.error('Não autenticado');
        return null;
    }
    
    try {
        const response = await fetch(`${SERVER_URL}/get?token=${TOKEN}&sensor=${sensorId}`);
        const texto = await response.text();
        
        if (texto.startsWith('v')) {
            return parseInt(texto.substring(1));
        } else {
            console.error(`Erro ao ler sensor ${sensorId}: ${texto}`);
            return null;
        }
    } catch (error) {
        console.error(`Erro na leitura do sensor ${sensorId}:`, error);
        return null;
    }
}

// Buscar todos os dados climáticos
async function buscarDadosClimaticos() {
    // Verificar se está autenticado
    if (!TOKEN) {
        const autenticado = await autenticar();
        if (!autenticado) {
            return;
        }
    }
    
    try {
        // Ler todos os 4 sensores em paralelo
        const [tempRaw, umidRaw, ventoRaw, pressaoRaw] = await Promise.all([
            lerSensor('a1'),
            lerSensor('a2'),
            lerSensor('a3'),
            lerSensor('a4')
        ]);
        
        // Atualizar a interface
        if (tempRaw !== null) {
            const temperatura = converterTemperatura(tempRaw);
            document.getElementById('temperatura').textContent = temperatura.toFixed(1);
        }
        
        if (umidRaw !== null) {
            const umidade = converterUmidade(umidRaw);
            document.getElementById('umidade').textContent = umidade.toFixed(1);
        }
        
        if (ventoRaw !== null) {
            const vento = converterVento(ventoRaw);
            document.getElementById('vento').textContent = vento.toFixed(1);
        }
        
        if (pressaoRaw !== null) {
            const pressao = converterPressao(pressaoRaw);
            document.getElementById('pressao').textContent = pressao.toFixed(1);
        }
        
        console.log('✅ Dados atualizados');
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
    }
}

// Iniciar atualização automática (a cada 5 segundos)
setInterval(buscarDadosClimaticos, 5000);

// Buscar dados imediatamente ao carregar a página
buscarDadosClimaticos();