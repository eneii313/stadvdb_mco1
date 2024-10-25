import { startTimer, endTimer, getRows, createChart } from './script.js';

var yearArray = []; // language, year, count
var languageArray = []; // language, total count
var colorArray = [ "#03045e","#0077b6","#00b4d8","#90e0ef","#caf0f8"];
var colorIndex = 0;

export function getAudioSupportAll() {
    startTimer(); 
    
    $.get('/get-audio-support-rollup', function(data) {
        $.columns = data.columns
        $.rows = data.rows
        
        $('#tableHeaders').empty();

        // Generate table headers
        $.each($.columns, function(index, col) {
            $('#tableHeaders').append(`<th>`+col+`</th>`);
        });

        // Generate first table rows
        getRows(1);

        
        //  GENERATE SUMMARY
        var mostSupportedLanguage = $.rows[1];
        var secondSupportedLanguage = $.rows[1];

        $("#title1").text("Total Audio Support Across All Languages");
        $("#title2").text("Most Supported Language");
        $("#title3").text("Second Most Supported Language");

        $.rows.forEach(row => {
            if (row.release_year === null) {
                if (row.fullaudio_language == "GRAND TOTAL")
                    $("#value1").text(row.game_count);
                else {
                    let { release_year, ...newRow } = row;
                    languageArray.push(newRow);

                    if (row.game_count > mostSupportedLanguage.game_count){
                        secondSupportedLanguage = mostSupportedLanguage;
                        mostSupportedLanguage = row;
                    } else if (row.game_count > secondSupportedLanguage.game_count) {
                        secondSupportedLanguage = row;
                    }
                }
            }
            else yearArray.push(row);
        });

        $("#value2").text(mostSupportedLanguage.fullaudio_language + " - " + mostSupportedLanguage.game_count);
        $("#value3").text(secondSupportedLanguage.fullaudio_language + " - " + secondSupportedLanguage.game_count);
    

        // generate charts
        var data1 = {
            labels: [],
            datasets : [
                {
                    label: 'Language',
                    backgroundColor: colorArray,
                    data: [],
                }
            ]
        };

        var options1 = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Total Game Count with Audio Support by Language'
                }
             },

        }

        var data2 = {
            labels: $.years,
            datasets : [
                // {
                //     label: 'A',
                //     backgroundColor: ["#0077b6"],
                //     data: [1, 2, 3],
                // },
                // {
                //     label: 'B',
                //     backgroundColor: ["#00b4d8"],
                //     data: [2, 4, 6],
                // }
            ]
        };

        var options2 = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    beginAtZero: true,
                    stacked: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Total Game Count with Audio Support by Language by Year'
                }
             },

        }

        const chartAll = createChart("bar", "audioSupportAllTime", data1, options1);
        const chartYear = createChart("bar", "audioSupportByYear", data2, options2);


        // create Toggle language buttons
        var buttonDiv = document.createElement('div');
        buttonDiv.id = "buttonDiv";

        languageArray.forEach((row, index) => {
            const button = document.createElement('button');
            button.innerText = row.fullaudio_language;
            button.classList.add('language-button');
            button.onclick = () => {
                const labels = chartAll.data.labels;
                const dataset = chartAll.data.datasets[0].data;

                const languageIndex = labels.indexOf(row.fullaudio_language);
                
                if (languageIndex == -1) {
                    labels.push(row.fullaudio_language);
                    dataset.push(row.game_count);

                    // Create a new data array initialized to 0 for each year in chartYear's labels
                    const yearData = chartYear.data.labels.map(yearLabel => {
                        const match = yearArray.find(item => 
                            item.fullaudio_language === row.fullaudio_language &&
                            parseInt(item.release_year) === parseInt(yearLabel)
                        );
                        return match ? match.game_count : 0;
                    });

                    // Push a new dataset for this language in chartYear
                    chartYear.data.datasets.push({
                        label: row.fullaudio_language,
                        backgroundColor: colorArray[colorIndex],
                        data: yearData
                    });

                    colorIndex = (colorIndex + 1) % colorArray.length;

                } else {
                    labels.splice(languageIndex, 1);
                    dataset.splice(languageIndex, 1);

                    // Remove data from chartYear
                    const datasetIndex = chartYear.data.datasets.findIndex(ds => ds.label === row.fullaudio_language);
                    if (datasetIndex !== -1) {
                        chartYear.data.datasets.splice(datasetIndex, 1);
                    }

                    colorIndex = Math.max(colorIndex - 1, 0);
                }

                chartAll.update();
                chartYear.update();

            }
            buttonDiv.appendChild(button);
        });
        
        // $("#audioSupportAllTime").parent().append(buttonDiv);
        $("#charts").append(buttonDiv);

        endTimer();
        $('#options').show();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}