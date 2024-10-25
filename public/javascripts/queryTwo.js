import { startTimer, endTimer, getRows, createChart } from './script.js';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const colorArray = [ "#03045e","#0077b6","#00b4d8","#90e0ef","#caf0f8"];
var colorIndex = 0;

export function getAudioSupportAll() {
    startTimer(); 
    colorIndex = 0;
    var yearArray = []; // language, year, count
    var languageArray = []; // language, total count
    
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
            datasets : []
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
        createLanguageButtons(languageArray, function toggleLanguage(row) {
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
        });
        
        $("#charts").append(buttonDiv);

        endTimer();
        $('#options').show();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}

export function getAudioSupportYear(year) {
    startTimer(); 
    var languageArray = [];
    var monthArray = [];
    
    $.get('/get-audio-support-drilldown', {year: year}, function(data) {
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

        $("#title1").text("Total Audio Support Across All Languages in " + year);
        $("#title2").text("Most Supported Language in " + year);
        $("#title3").text("Second Most Supported Language in " + year);

        $.rows.forEach(row => {
            if (row.release_month === null) {
                if (row.fullaudio_language === null)
                    $("#value1").text(row.game_count);
                else {
                    let { release_month, ...newRow } = row;
                    languageArray.push(newRow);
                    if (row.game_count > mostSupportedLanguage.game_count){
                        secondSupportedLanguage = mostSupportedLanguage;
                        mostSupportedLanguage = row;
                    } else if (row.game_count > secondSupportedLanguage.game_count) {
                        secondSupportedLanguage = row;
                    }           
                }
            }
            else monthArray.push(row);
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
                    text: 'Total Game Count with Audio Support by Language in ' + year
                }
             },

        }

        var data2 = {
            labels: months,
            datasets : []
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
                    text: 'Total Game Count with Audio Support by Language by Month'
                }
             },

        }

        const chartAll = createChart("bar", "audioSupportInYear", data1, options1);
        const chartMonth = createChart("bar", "audioSupportByMonth", data2, options2);


        createLanguageButtons(languageArray, function toggleLanguage(row) {
            const labels = chartAll.data.labels;
            const dataset = chartAll.data.datasets[0].data;

            const languageIndex = labels.indexOf(row.fullaudio_language);
            
            if (languageIndex == -1) {
                labels.push(row.fullaudio_language);
                dataset.push(row.game_count);

                // Create a new data array initialized to 0 for each month
                const monthData = chartMonth.data.labels.map(monthLabel => {
                    const match = monthArray.find(item => 
                        item.fullaudio_language === row.fullaudio_language &&
                        parseInt(item.release_month) === months.indexOf(monthLabel)
                    );
                    return match ? match.game_count : 0;
                });

                // Push a new dataset for this language in chartMonth
                chartMonth.data.datasets.push({
                    label: row.fullaudio_language,
                    backgroundColor: colorArray[colorIndex],
                    data: monthData
                });

                colorIndex = (colorIndex + 1) % colorArray.length;

            } else {
                labels.splice(languageIndex, 1);
                dataset.splice(languageIndex, 1);

                // Remove data from chartMonth
                const datasetIndex = chartMonth.data.datasets.findIndex(ds => ds.label === row.fullaudio_language);
                if (datasetIndex !== -1) {
                    chartMonth.data.datasets.splice(datasetIndex, 1);
                }

                colorIndex = Math.max(colorIndex - 1, 0);
            }

            chartAll.update();
            chartMonth.update();
        });

        endTimer();
        $('#options').show();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}



// create Toggle language buttons
function createLanguageButtons(languageArray, onClickFunction) {
    var buttonDiv = document.createElement('div');
    buttonDiv.id = "buttonDiv";

    languageArray.forEach((row, index) => {
        const button = document.createElement('button');
        button.innerText = row.fullaudio_language;
        button.classList.add('language-button');
        button.onclick = () => {  onClickFunction(row); }
        buttonDiv.appendChild(button);
    });

    $("#charts").append(buttonDiv);

}