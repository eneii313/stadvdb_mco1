import { startTimer, endTimer, getRows, createChart } from './script.js';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const colorArray = [ "#0d5b11","#187c19","#69b41e","#8dc71e","#b8d53d"];
var colorIndex = 0;

export function getTextSupportAll() {
    startTimer(); 
    colorIndex = 0;
    var yearArray = []; // language, year, count
    var languageArray = []; // language, total count
    
    $.get('/get-text-support-rollup', function(data) {
        $.columns = data.columns
        $.rows = data.rows
        
        $('#tableHeaders').empty();

        if (data.rows.length == 0) {
            $("#queryProgress").text("The query returned no results.");
            return;
        }

        // Generate table headers
        $.each($.columns, function(index, col) {
            $('#tableHeaders').append(`<th>`+col+`</th>`);
        });

        // Generate first table rows
        getRows(1);

        
        //  GENERATE SUMMARY
        var mostSupportedLanguage = {game_count: -1};
        var secondSupportedLanguage = {game_count: -1};

        $("#title1").text("Total Text Support Across All Languages");
        $("#title2").text("Most Supported Language");
        $("#title3").text("Second Most Supported Language");

        $.rows.forEach(row => {
            if (row.release_year === null) {
                if (row.supported_language === null)
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

        $("#value2").text(mostSupportedLanguage.supported_language + " - " + mostSupportedLanguage.game_count);
        $("#value3").text(secondSupportedLanguage.supported_language + " - " + secondSupportedLanguage.game_count);
    

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
                    text: 'Total Game Count with Text Support by Language'
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
                    text: 'Total Game Count with Text Support by Language by Year'
                }
             },

        }

        const chartAll = createChart("bar", "textSupportAllTime", data1, options1);
        const chartYear = createChart("bar", "textSupportByYear", data2, options2);


        // create Toggle language buttons
        createLanguageButtons(languageArray, function toggleLanguage(row) {
                const labels = chartAll.data.labels;
                const dataset = chartAll.data.datasets[0].data;

                const languageIndex = labels.indexOf(row.supported_language);
                
                if (languageIndex == -1) {
                    labels.push(row.supported_language);
                    dataset.push(row.game_count);

                    // Create a new data array initialized to 0 for each year in chartYear's labels
                    const yearData = chartYear.data.labels.map(yearLabel => {
                        const match = yearArray.find(item => 
                            item.supported_language === row.supported_language &&
                            parseInt(item.release_year) === parseInt(yearLabel)
                        );
                        return match ? match.game_count : 0;
                    });

                    // Push a new dataset for this language in chartYear
                    chartYear.data.datasets.push({
                        label: row.supported_language,
                        backgroundColor: colorArray[colorIndex],
                        data: yearData
                    });

                    colorIndex = (colorIndex + 1) % colorArray.length;

                } else {
                    labels.splice(languageIndex, 1);
                    dataset.splice(languageIndex, 1);

                    // Remove data from chartYear
                    const datasetIndex = chartYear.data.datasets.findIndex(ds => ds.label === row.supported_language);
                    if (datasetIndex !== -1) {
                        chartYear.data.datasets.splice(datasetIndex, 1);
                    }

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

export function getTextSupportYear(year) {
    startTimer(); 
    var languageArray = [];
    var monthArray = [];
    
    $.get('/get-text-support-drilldown', {year: year}, function(data) {
        $.columns = data.columns
        $.rows = data.rows
        
        $('#tableHeaders').empty();

        if (data.rows.length == 0) {
            $("#queryProgress").text("The query returned no results.");
            return;
        }

        // Generate table headers
        $.each($.columns, function(index, col) {
            $('#tableHeaders').append(`<th>`+col+`</th>`);
        });

        // Generate first table rows
        getRows(1);

        //  GENERATE SUMMARY
        var mostSupportedLanguage = {game_count: -1};
        var secondSupportedLanguage = {game_count: -1};

        $("#title1").text("Total Text Support Across All Languages in " + year);
        $("#title2").text("Most Supported Language in " + year);
        $("#title3").text("Second Most Supported Language in " + year);

        $.rows.forEach(row => {
            if (row.release_month === null) {
                if (row.supported_language === null)
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

        $("#value2").text(mostSupportedLanguage.supported_language + " - " + mostSupportedLanguage.game_count);
        $("#value3").text(secondSupportedLanguage.supported_language + " - " + secondSupportedLanguage.game_count);
    

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
                    text: 'Total Game Count with Text Support by Language in ' + year
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
                    text: 'Total Game Count with Text Support by Language by Month'
                }
             },

        }

        const chartAll = createChart("bar", "textSupportInYear", data1, options1);
        const chartMonth = createChart("bar", "textSupportByMonth", data2, options2);


        createLanguageButtons(languageArray, function toggleLanguage(row) {
            const labels = chartAll.data.labels;
            const dataset = chartAll.data.datasets[0].data;

            const languageIndex = labels.indexOf(row.supported_language);
            
            if (languageIndex == -1) {
                labels.push(row.supported_language);
                dataset.push(row.game_count);

                // Create a new data array initialized to 0 for each month
                const monthData = chartMonth.data.labels.map(monthLabel => {
                    const match = monthArray.find(item => 
                        item.supported_language === row.supported_language &&
                        parseInt(item.release_month) === months.indexOf(monthLabel)
                    );
                    return match ? match.game_count : 0;
                });

                // Push a new dataset for this language in chartMonth
                chartMonth.data.datasets.push({
                    label: row.supported_language,
                    backgroundColor: colorArray[colorIndex],
                    data: monthData
                });

                colorIndex = (colorIndex + 1) % colorArray.length;

            } else {
                labels.splice(languageIndex, 1);
                dataset.splice(languageIndex, 1);

                // Remove data from chartMonth
                const datasetIndex = chartMonth.data.datasets.findIndex(ds => ds.label === row.supported_language);
                if (datasetIndex !== -1) {
                    chartMonth.data.datasets.splice(datasetIndex, 1);
                }

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

export function getTextSupportGenre(genre) {
    startTimer(); 
    colorIndex = 0;
    var yearArray = []; // language, year, count
    var languageArray = []; // language, total count
    
    $.get('/get-text-support-slice', {genre: genre}, function(data) {
        $.columns = data.columns
        $.rows = data.rows
        
        $('#tableHeaders').empty();

        if (data.rows.length == 0) {
            $("#queryProgress").text("The query returned no results.");
            return;
        }

        // Generate table headers
        $.each($.columns, function(index, col) {
            $('#tableHeaders').append(`<th>`+col+`</th>`);
        });

        // Generate first table rows
        getRows(1);

        
        //  GENERATE SUMMARY
        var mostSupportedLanguage = {game_count: -1};
        var secondSupportedLanguage = {game_count: -1};

        $("#title1").text("Total Text Support Across All Languages in " + genre);
        $("#title2").text("Most Supported Language in " + genre);
        $("#title3").text("Second Most Supported Language in " + genre);

        $.rows.forEach(row => {
            if (row.release_year === null) {
                if (row.supported_language === null)
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

        $("#value2").text(mostSupportedLanguage.supported_language + " - " + mostSupportedLanguage.game_count);
        $("#value3").text(secondSupportedLanguage.supported_language + " - " + secondSupportedLanguage.game_count);
    

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
                    text: 'Total Game Count with Text Support by Language in ' + genre
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
                    text: 'Total Game Count with Text Support by Language by Year in ' + genre
                }
             },

        }

        const chartAll = createChart("bar", "textSupportInGenre", data1, options1);
        const chartYear = createChart("bar", "textSupportInGenreByYear", data2, options2);


        // // create Toggle language buttons
        createLanguageButtons(languageArray, function toggleLanguage(row) {
                const labels = chartAll.data.labels;
                const dataset = chartAll.data.datasets[0].data;

                const languageIndex = labels.indexOf(row.supported_language);
                
                if (languageIndex == -1) {
                    labels.push(row.supported_language);
                    dataset.push(row.game_count);

                    // Create a new data array initialized to 0 for each year in chartYear's labels
                    const yearData = chartYear.data.labels.map(yearLabel => {
                        const match = yearArray.find(item => 
                            item.supported_language === row.supported_language &&
                            parseInt(item.release_year) === parseInt(yearLabel)
                        );
                        return match ? match.game_count : 0;
                    });

                    // Push a new dataset for this language in chartYear
                    chartYear.data.datasets.push({
                        label: row.supported_language,
                        backgroundColor: colorArray[colorIndex],
                        data: yearData
                    });

                    colorIndex = (colorIndex + 1) % colorArray.length;

                } else {
                    labels.splice(languageIndex, 1);
                    dataset.splice(languageIndex, 1);

                    // Remove data from chartYear
                    const datasetIndex = chartYear.data.datasets.findIndex(ds => ds.label === row.supported_language);
                    if (datasetIndex !== -1) {
                        chartYear.data.datasets.splice(datasetIndex, 1);
                    }
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

export function getTextSupportGenreOnYear(genre, year) {
    startTimer(); 
    var languageArray = [];
    var monthArray = [];
    
    $.get('/get-text-support-dice', {genre: genre, year: year}, function(data) {
        $.columns = data.columns
        $.rows = data.rows
        
        $('#tableHeaders').empty();

        if (data.rows.length == 0) {
            $("#queryProgress").text("The query returned no results.");
            return;
        }

        // Generate table headers
        $.each($.columns, function(index, col) {
            $('#tableHeaders').append(`<th>`+col+`</th>`);
        });

        // Generate first table rows
        getRows(1);

        //  GENERATE SUMMARY
        var mostSupportedLanguage = {game_count: -1};
        var secondSupportedLanguage = {game_count: -1};

        $("#title1").text("Total Text Support Across All Languages in " + genre + " - " + year);
        $("#title2").text("Most Supported Language in " + genre + " - " + year);
        $("#title3").text("Second Most Supported Language in " + genre + " - " + year);

        $.rows.forEach(row => {
            if (row.release_month === null) {
                if (row.supported_language === null)
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

        $("#value2").text(mostSupportedLanguage.supported_language + " - " + mostSupportedLanguage.game_count);
        $("#value3").text(secondSupportedLanguage.supported_language + " - " + secondSupportedLanguage.game_count);
    

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
                    text: 'Total Game Count with Text Support by Language in ' + year
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
                    text: 'Total Game Count with Text Support by Language by Month'
                }
             },

        }

        const chartAll = createChart("bar", "textSupportInYear", data1, options1);
        const chartMonth = createChart("bar", "textSupportByMonth", data2, options2);


        createLanguageButtons(languageArray, function toggleLanguage(row) {
            const labels = chartAll.data.labels;
            const dataset = chartAll.data.datasets[0].data;

            const languageIndex = labels.indexOf(row.supported_language);
            
            if (languageIndex == -1) {
                labels.push(row.supported_language);
                dataset.push(row.game_count);

                // Create a new data array initialized to 0 for each month
                const monthData = chartMonth.data.labels.map(monthLabel => {
                    const match = monthArray.find(item => 
                        item.supported_language === row.supported_language &&
                        parseInt(item.release_month) === months.indexOf(monthLabel)
                    );
                    return match ? match.game_count : 0;
                });

                // Push a new dataset for this language in chartMonth
                chartMonth.data.datasets.push({
                    label: row.supported_language,
                    backgroundColor: colorArray[colorIndex],
                    data: monthData
                });

                colorIndex = (colorIndex + 1) % colorArray.length;

            } else {
                labels.splice(languageIndex, 1);
                dataset.splice(languageIndex, 1);

                // Remove data from chartMonth
                const datasetIndex = chartMonth.data.datasets.findIndex(ds => ds.label === row.supported_language);
                if (datasetIndex !== -1) {
                    chartMonth.data.datasets.splice(datasetIndex, 1);
                }

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
        button.innerText = row.supported_language;
        button.classList.add('language-button');
        button.onclick = () => {  onClickFunction(row); }
        buttonDiv.appendChild(button);
    });

    $("#charts").append(buttonDiv);

}