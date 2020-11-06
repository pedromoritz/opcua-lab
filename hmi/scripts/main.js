$(function() {

    document.getElementById("query-temperature").addEventListener("click", function() {
        $("#query-temperature").prop('disabled', true);
        $("#temperature-text").html(" - ");
        $("#temperature-timestamp").html(" - ");

        $.get(
            "http://localhost:8081/temperature",
            function(data) {
                $("#query-temperature").prop('disabled', false);
                $("#temperature-text").html(data.value);
                $("#temperature-timestamp").html(data.timestamp);
            }
        ).fail(function() {
            $("#query-temperature").prop('disabled', false);
        });
    });

    document.getElementById("query-humidity").addEventListener("click", function() {
        $("#query-humidity").prop('disabled', true);
        $("#humidity-text").html(" - ");
        $("#humidity-timestamp").html(" - ");

        $.get(
            "http://localhost:8081/humidity",
            function(data) {
                $("#query-humidity").prop('disabled', false);
                $("#humidity-text").html(data.value);
                $("#humidity-timestamp").html(data.timestamp);
            }
        ).fail(function() {
            $("#query-humidity").prop('disabled', false);
        });
    });

    var lineChartData = {
        labels: [],
        datasets: [{
            label: 'Temperature',
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgb(54, 162, 235)',
            fill: false,
            data: []
        }, {
            label: 'Humidity',
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgb(255, 99, 132)',
            fill: false,
            data: []
        }]
    };

    var lineChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        hoverMode: 'index',
        stacked: false,
        scales: {
            yAxes: [{
                position: 'right',
                ticks: {
                    beginAtZero: true,
                    steps: 10,
                    stepValue: 5,
                    max: 100
                }
            }]
        }
    };

    var lineChartCanvas = document.getElementById('graph').getContext('2d');
    lineChartData.datasets[0].fill = false;
    lineChartData.datasets[1].fill = false;
    lineChartOptions.datasetFill = false

    var lineChart = new Chart(lineChartCanvas, {
        type: 'line',
        data: lineChartData,
        options: lineChartOptions
    })

    const numvalues = 60;

    for (let i = 0; i < numvalues; ++i) {
        lineChart.data.datasets[0].data.push('');
        lineChart.data.datasets[1].data.push('');
        lineChart.data.labels.push('');
    }

    setInterval(function() {
        $.get(
            "http://localhost:8082/sensor",
            function(data) {
                lineChart.data.datasets[0].data.push(parseFloat(data.temperature));
                lineChart.data.datasets[0].data.shift();
                lineChart.data.datasets[1].data.push(parseFloat(data.humidity));
                lineChart.data.datasets[1].data.shift();
                lineChart.data.labels.push('');
                lineChart.data.labels.shift();
                lineChart.update();
            }
        );
    }, 2000);
})