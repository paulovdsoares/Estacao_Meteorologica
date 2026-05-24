const BASE_URL = 'http://localhost:8080';
let tokenGlobal = null;

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

            atualizarGraficoBarras();

            // --- INTEGRAÇÃO COM O HISTOGRAMA CORRETA (temperatura) ---
            historicoSensores.temperatura.push(temp); 
            if(historicoSensores.temperatura.length > 24) {
                historicoSensores.temperatura.shift(); 
            }
            
            // Atualiza a renderização do histograma caso ele esteja selecionado em tela
            atualizarHistograma();

            historicoComparativoTemp.push(temp);
        if (historicoComparativoTemp.length > 24) { historicoComparativoTemp.shift(); }
        
        desenharHistogramaComparativo();
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

            atualizarGraficoBarras();

            // --- INTEGRAÇÃO COM O HISTOGRAMA CORRETA (umidade) ---
            historicoSensores.umidade.push(umidade); 
            if(historicoSensores.umidade.length > 24) {
                historicoSensores.umidade.shift(); 
            }
            
            atualizarHistograma();

            historicoComparativoUmid.push(umidade);
        if (historicoComparativoUmid.length > 24) { historicoComparativoUmid.shift(); }
        
        desenharHistogramaComparativo();
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

            atualizarGraficoBarras();

            // --- INTEGRAÇÃO COM O HISTOGRAMA CORRETA (vento) ---
            historicoSensores.vento.push(vento); 
            if(historicoSensores.vento.length > 24) {
                historicoSensores.vento.shift(); 
            }
            
            atualizarHistograma();
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
            console.log('Pressão (a4) updated:', pressao.toFixed(0));

            atualizarGraficoBarras();

            // --- INTEGRAÇÃO COM O HISTOGRAMA CORRETA (pressão) ---
            historicoSensores.pressao.push(pressao); 
            if(historicoSensores.pressao.length > 24) {
                historicoSensores.pressao.shift(); 
            }
            
            atualizarHistograma();
        }
    });
}

let meuGraficoBarras = null;

// Função que lê os valores injetados nos spans e gera/atualiza o gráfico
function atualizarGraficoBarras() {
    // Captura os valores diretamente dos elementos HTML (spans) do seu DOM
    const temp = parseFloat($('#temperatura').text()) || 0;
    const umidade = parseFloat($('#umidade').text()) || 0;
    const vento = parseFloat($('#vento').text()) || 0;
    const pressao = parseFloat($('#pressao').text()) || 0;


    // 2. Calcula o percentual de preenchimento baseado nos limites reais de cada sensor
    
    // Temperatura: vai de -10°C a 50°C (escala total de 60 graus)
    let pctTemp = ((temp - (-10)) / 60) * 100;
    
    // Umidade: vai de 0% a 100%
    let pctUmid = umidade;
    
    // Vento: vai de 0 a 100 km/h
    let pctVento = vento;
    
    // Pressão: vai de 950 a 1050 hPa (escala total de 100 hPa)
    let pctPressao = ((pressao - 950) / 100) * 100;

    // Limitadores de segurança (impede que valores saiam da faixa de 0% a 100%)
    pctTemp = Math.min(Math.max(pctTemp, 0), 100);
    pctUmid = Math.min(Math.max(pctUmid, 0), 100);
    pctVento = Math.min(Math.max(pctVento, 0), 100);
    pctPressao = Math.min(Math.max(pctPressao, 0), 100);

    // 3. Aplica os estilos de altura dinamicamente utilizando o jQuery (.css)
    $('#bar-temperatura').css('height', pctTemp + '%');
    $('#bar-umidade').css('height', pctUmid + '%');
    $('#bar-vento').css('height', pctVento + '%');
    $('#bar-pressao').css('height', pctPressao + '%');
    
    $('#valor-temp').text(temp.toFixed(1) + ' °C');
    $('#valor-umid').text(umidade.toFixed(0) + ' %');
    $('#valor-vento').text(vento.toFixed(1) + ' km/h');
    $('#valor-pressao').text(pressao.toFixed(0) + ' hPa');


    console.log('[Gráfico Customizado] Alturas aplicadas:', 
        { temp: pctTemp.toFixed(1) + '%', umidade: pctUmid + '%', vento: pctVento + '%', pressao: pctPressao.toFixed(1) + '%' }
    );
} 


// Variável global para rastrear o sensor ativo
let sensorAtivo = 'temperatura'; 

// Objeto global para armazenar o histórico de 24 amostras de cada sensor
const historicoSensores = {
    temperatura: [],
    umidade: [],
    vento: [],
    pressao: []
};

// Função auxiliar para inicializar os históricos com dados simulados coerentes
function inicializarDadosHistoricos() {
    for (let i = 0; i < 24; i++) {
        historicoSensores.temperatura.push(15 + Math.random() * 25); // 15°C a 40°C
        historicoSensores.umidade.push(40 + Math.random() * 50);     // 40% a 90%
        historicoSensores.vento.push(5 + Math.random() * 45);        // 5 a 50 km/h
        historicoSensores.pressao.push(980 + Math.random() * 50);    // 980 a 1030 hPa
    }
}

// Executa a inicialização assim que o script carregar
inicializarDadosHistoricos();

// Função principal que desenha o Histograma no Canvas baseado no sensor selecionado
function atualizarHistograma() {
    const canvas = document.getElementById('histogramaCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dados = historicoSensores[sensorAtivo];

    // Configurações de limites e estilo baseados no sensor ativo
    let minEixoY, maxEixoY, sufixo, corBarra, labelSensor;
    
    switch (sensorAtivo) {
        case 'temperatura':
            minEixoY = -10; maxEixoY = 50; sufixo = '°C'; corBarra = '#ef4444'; labelSensor = 'Temperatura';
            break;
        case 'umidade':
            minEixoY = 0; maxEixoY = 100; sufixo = '%'; corBarra = '#2563eb'; labelSensor = 'Umidade';
            break;
        case 'vento':
            minEixoY = 0; maxEixoY = 100; sufixo = ' km/h'; corBarra = '#94a3b8'; labelSensor = 'Velocidade do Vento';
            break;
        case 'pressao':
            minEixoY = 950; maxEixoY = 1050; sufixo = ' hPa'; corBarra = '#10b981'; labelSensor = 'Pressão';
            break;
    }

    // Configurações geométricas de margens do Canvas
    const margemEsq = 55;
    const margemDir = 15;
    const margemSup = 40;
    const margemInf = 35;
    const largUtil = canvas.width - margemEsq - margemDir;
    const altUtil = canvas.height - margemSup - margemInf;

    // Limpa o Canvas para o novo desenho
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. DESENHAR LINHAS DE GRADE HORIZONTAIS E RÓTULOS DO EIXO Y
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const qtdDivisoes = 4;
    for (let i = 0; i <= qtdDivisoes; i++) {
        const valorEixo = minEixoY + ((maxEixoY - minEixoY) / qtdDivisoes) * i;
        const yPixel = margemSup + altUtil - (i / qtdDivisoes) * altUtil;

        ctx.beginPath();
        ctx.moveTo(margemEsq, yPixel);
        ctx.lineTo(canvas.width - margemDir, yPixel);
        ctx.stroke();

        ctx.fillText(valorEixo.toFixed(0) + sufixo, margemEsq - 8, yPixel);
    }

    // 2. DESENHAR AS BARRAS DO HISTOGRAMA (Coladas umas nas outras ou com gap mínimo)
    const qtdBarras = dados.length;
    const largBarra = largUtil / qtdBarras;

    dados.forEach((valor, index) => {
        // Mapeia o valor analógico para a coordenada Y do Canvas
        const pct = (valor - minEixoY) / (maxEixoY - minEixoY);
        const yTopo = margemSup + altUtil - (pct * altUtil);
        const xPos = margemEsq + (index * largBarra);
        const altBarra = (margemSup + altUtil) - yTopo;

        // Desenha o preenchimento da barra (com 0.5px de recuo para criar uma linha divisória sutil)
        ctx.fillStyle = corBarra;
        ctx.fillRect(xPos, yTopo, largBarra - 0.5, altBarra);
    });

    // 3. DESENHAR LINHA DO EIXO X
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margemEsq, margemSup + altUtil);
    ctx.lineTo(canvas.width - margemDir, margemSup + altUtil);
    ctx.stroke();

    // 4. DESENHAR TÍTULO E LEGENDAS
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Distribuição Histórica: ${labelSensor}`, margemEsq, 10);
}

// Ouvinte de eventos (Click) para alternar os botões do sensor ativo
$(document).on('click', '.btn-sensor', function() {
    $('.btn-sensor').removeClass('active');
    $(this).addClass('active');

    sensorAtivo = $(this).data('sensor');
    
    // Atualiza o gráfico de forma instantânea na troca de abas
    atualizarHistograma();
});

// === NOVAS VARIÁVEIS GLOBAIS PARA O COMPARATIVO ===
// Armazenam as últimas 24 leituras em paralelo
const historicoComparativoTemp = [];
const historicoComparativoUmid = [];







// Função auxiliar para preencher dados simulados iniciais para o gráfico comparativo
function inicializarHistoricoComparativo() {
    for (let i = 0; i < 24; i++) {
        historicoComparativoTemp.push(15 + Math.random() * 25); // Simula 15°C a 40°C
        historicoComparativoUmid.push(40 + Math.random() * 50); // Simula 40% a 90%
    }
}
inicializarHistoricoComparativo(); // Executa ao carregar o script

// === FUNÇÃO PRINCIPAL DE DESENHO MANUAL NO CANVAS ===
function desenharHistogramaComparativo() {
    const canvas = document.getElementById('histogramaComparativoCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Configurações geométricas de margens
    const margemEsq = 60;
    const margemDir = 40;
    const margemSup = 50;
    const margemInf = 40;
    const largUtil = canvas.width - margemEsq - margemDir;
    const altUtil = canvas.height - margemSup - margemInf;

    // Limpa a área de desenho
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. DESENHO DAS LINHAS DE GRADE HORIZONTAIS
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const yPixel = margemSup + altUtil - (i / 4) * altUtil;
        ctx.beginPath();
        ctx.moveTo(margemEsq, yPixel);
        ctx.lineTo(canvas.width - margemDir, yPixel);
        ctx.stroke();
    }

    // Definição da amostragem (24 colunas de tempo)
    const totalAmostras = historicoComparativoTemp.length;
    const largGrupo = largUtil / totalAmostras; // Espaço reservado para cada "par" de colunas
    const paddingInterno = 2; // Espaço entre as duas colunas do mesmo grupo
    const largBarraIndividual = (largGrupo / 2) - paddingInterno; // Largura exata de cada barra

    // 2. RENDERIZAÇÃO DAS BARRAS LADO A LADO POR INTERVALO (HISTOGRAMA)
    for (let i = 0; i < totalAmostras; i++) {
        const xGrupoBase = margemEsq + (i * largGrupo);

        // --- BARRA 1: TEMPERATURA (Vermelha) ---
        // Escala Lógica: -10°C a 50°C (Amplitude de 60 unidades)
        const valTemp = historicoComparativoTemp[i];
        const pctTemp = (valTemp - (-10)) / 60;
        const yTopoTemp = margemSup + altUtil - (pctTemp * altUtil);
        const altBarraTemp = (margemSup + altUtil) - yTopoTemp;
        const xBarraTemp = xGrupoBase + (paddingInterno / 2);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)'; // Vermelho com opacidade sutil
        ctx.fillRect(xBarraTemp, yTopoTemp, largBarraIndividual, altBarraTemp);

        // --- BARRA 2: UMIDADE (Azul) ---
        // Escala Lógica: 0% a 100%
        if (historicoComparativoUmid[i] !== undefined) {
            const valUmid = historicoComparativoUmid[i];
            const pctUmid = valUmid / 100;
            const yTopoUmid = margemSup + altUtil - (pctUmid * altUtil);
            const altBarraUmid = (margemSup + altUtil) - yTopoUmid;
            const xBarraUmid = xBarraTemp + largBarraIndividual + paddingInterno;

            ctx.fillStyle = 'rgba(37, 99, 235, 0.85)'; // Azul com opacidade sutil
            ctx.fillRect(xBarraUmid, yTopoUmid, largBarraIndividual, altBarraUmid);
        }
    }

    // 3. DESENHO DA LINHA DO EIXO X
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margemEsq, margemSup + altUtil);
    ctx.lineTo(canvas.width - margemDir, margemSup + altUtil);
    ctx.stroke();

    // Rótulos do Eixo X (t-23, t-22 ... t-0)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < totalAmostras; i += 2) { // Pula de 2 em 2 para não amontoar o texto
        const xTexto = margemEsq + (i * largGrupo) + (largGrupo / 2);
        ctx.fillText(`t-${totalAmostras - 1 - i}`, xTexto, margemSup + altUtil + 8);
    }

    // 4. CABEÇALHO, TÍTULO E LEGENDAS VISUAIS
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 15px Segoe UI, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Histograma Comparativo: Temp. vs Umidade (24h)', margemEsq, 10);

    // Quadrado da legenda de Temperatura
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.fillRect(canvas.width - margemDir - 150, 15, 12, 12);
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Temperatura', canvas.width - margemDir - 132, 14);

    // Quadrado da legenda de Umidade
    ctx.fillStyle = 'rgba(37, 99, 235, 0.9)';
    ctx.fillRect(canvas.width - margemDir - 260, 15, 12, 12);
    ctx.fillStyle = '#475569';
    ctx.fillText('Umidade', canvas.width - margemDir - 242, 14);
}

// Inicializa a primeira renderização após o carregamento do Canvas no DOM
$(document).ready(function() {
    desenharHistogramaComparativo();
});