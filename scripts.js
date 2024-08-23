// Menghasilkan ID klien acak
function generateClientId() {
    return `client_${Math.random().toString(36).substr(2, 9)}`;
}

// URL broker MQTT untuk koneksi WebSocket
const brokerUrl = 'ws://broker.emqx.io:8083/mqtt';
const sensorTopic = 'sensor/12918212291/data';

// Opsi klien MQTT
const mqttOptions = {
    clean: true,                // Sesi bersih
    connectTimeout: 4000,       // Waktu tunggu koneksi (dalam ms)
    clientId: generateClientId(), // Gunakan ID klien acak
    username: 'public',         // Nama pengguna
    password: 'public'          // Kata sandi
};

// Membuat instance klien MQTT
const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

// Inisialisasi ECharts
const chartContainer = document.getElementById('chart-container');
const chart = echarts.init(chartContainer);

const chartOptions = {
    title: {
        text: 'Sensor Data Over Time'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: ['Sensor Data']
    },
    xAxis: {
        type: 'time',
        name: 'Time',
        splitLine: { show: false }
    },
    yAxis: {
        type: 'value',
        name: 'Value'
    },
    series: [{
        name: 'Sensor Data',
        type: 'line',
        data: [] // Data awal kosong
    }]
};

// Set initial options for the chart
chart.setOption(chartOptions);

// Data untuk chart
const data = [];

// Menangani event koneksi
mqttClient.on('connect', () => {
    console.log(`Terhubung ke broker MQTT: ${brokerUrl}`);

    // Berlangganan ke topik
    mqttClient.subscribe(sensorTopic, (err) => {
        if (err) {
            console.error('Error berlangganan:', err);
        } else {
            console.log(`Berlangganan ke topik: ${sensorTopic}`);
        }
    });
});

// Menangani pesan yang diterima
mqttClient.on('message', (topic, message) => {
    const timestamp = new Date();
    const value = parseFloat(message.toString());

    // Tambahkan data baru
    data.push({
        name: timestamp,
        value: [timestamp, value]
    });

    // Update chart dengan data terbaru
    chart.setOption({
        series: [{
            data: data
        }]
    });

    // Format waktu
    const timeString = timestamp.toLocaleTimeString();

    // Tampilkan pesan terbaru di div dengan waktu
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = `<p>Pesan diterima pada topik "<strong>${topic}</strong>" pada ${timeString}: ${value}</p>`;
});

// Menangani error koneksi
mqttClient.on('error', (error) => {
    console.error('Error koneksi:', error);
});
