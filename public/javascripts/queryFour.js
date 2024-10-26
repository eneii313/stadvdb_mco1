
import { startTimer, endTimer, getRows, createChart } from './script.js';

const colorArray = [ "#0f0529","#924d8f","#7338a0","#924dbf","#9e72c3"];
var colorIndex = 0;

export function getScoreRankAll() {
    startTimer(); 
    var categoryArray = [];
    var yearArray = [];
    
    $.get('/get-score-rank-rollup', function(data) {
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
        var highestCategory = {avg_metacritic_score: -1};
        var highestYear = {avg_metacritic_score: -1};

        $("#title1").text("All Time Average Metacritic Score");
        $("#title2").text("Category with Highest Average Metacritic Score");
        $("#title3").text("Category with Highest Average Metacritic Score in a Year");

        $.rows.forEach(row => {
            if (row.release_year === null) {
                if (row.category == "total")
                    $("#value1").text(row.avg_metacritic_score);
                else {
                    let { release_year, rnk, ...newRow } = row;
                    categoryArray.push(newRow);
                    if (parseFloat(row.avg_metacritic_score) > parseFloat(highestCategory.avg_metacritic_score)){
                        highestCategory = row;
                    }           
                }
            }
            else  {
                yearArray.push(row);
                if (row.rnk == 1 && parseFloat(row.avg_metacritic_score) > parseFloat(highestYear.avg_metacritic_score)){
                    highestYear = row;
                }
            }
        });

        $("#value2").text(highestCategory.category + " - " + highestCategory.avg_metacritic_score);
        $("#value3").text(highestYear.category + " (" + highestYear.release_year + ") - " + highestYear.avg_metacritic_score);

        // generate charts
        var data1 = {
            labels: [],
            datasets : [
                {
                    label: 'Category',
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
                beginAtZero: true,
                min: 0,
                max: 100,
              }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Average Metacritic Score'
                }
             },

        }

        var data2 = {
            labels: $.years,
            datasets : []
        };

        var options2 = {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Average Metacritic Score' // Title for the y-axis
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Average Metacritic Score by Category by Year'
                },
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },

        }

        const chartAll = createChart("bar", "scoreAllTime", data1, options1);
        const chartYear = createChart("line", "scoreByMonth", data2, options2);


        createCategoryButtons(categoryArray, function toggleCategory(row) {
            const labels = chartAll.data.labels;
            const dataset = chartAll.data.datasets[0].data;

            const languageIndex = labels.indexOf(row.category);
            
            if (languageIndex == -1) {
                labels.push(row.category);
                dataset.push(row.avg_metacritic_score);

                // Create a new data array initialized to 0 for each year
                const yearData = chartYear.data.labels.map(yearLabel => {
                    const match = yearArray.find(item => 
                        item.category === row.category &&
                        parseInt(item.release_year) == yearLabel
                    );
                    return match ? match.avg_metacritic_score : 0;
                });

                // Push a new dataset for this language in chartYear
                chartYear.data.datasets.push({
                    label: row.category,
                    borderColor: colorArray[colorIndex],
                    borderWidth: 0.8,
                    fill: true,
                    data: yearData
                });

                colorIndex = (colorIndex + 1) % colorArray.length;

            } else {
                labels.splice(languageIndex, 1);
                dataset.splice(languageIndex, 1);

                // Remove data from chartYear
                const datasetIndex = chartYear.data.datasets.findIndex(ds => ds.label === row.category);
                if (datasetIndex !== -1) {
                    chartYear.data.datasets.splice(datasetIndex, 1);
                }

            }

            chartAll.update();
            chartYear.update();
        });

        endTimer();
        $('#options').show();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}


// create Toggle category buttons
function createCategoryButtons(categoryArray, onClickFunction) {
    var buttonDiv = document.createElement('div');
    buttonDiv.id = "buttonDiv";

    categoryArray.forEach((row, index) => {
        const button = document.createElement('button');
        button.innerText = row.category;
        button.classList.add('category-button');
        button.onclick = () => {  onClickFunction(row); }
        buttonDiv.appendChild(button);
    });

    $("#charts").append(buttonDiv);

}