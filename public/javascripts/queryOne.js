import { startTimer, endTimer, getRows, createChart } from './script.js';

// ---------------------------- QUERY 1: Average Video Game Prices Over Time ----------------------------     
export function getAveragePriceAll() {
    startTimer(); 
    
    $.get('/get-avg-price-rollup', function(data) {
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
        var yearArray = [];
        var highestYear = $.rows[0];

        $("#title1").text("All Time Average Game Price");
        $("#title2").text("Last Year Average");
        $("#title3").text("Highest Average Year");

        $.rows.forEach(row => {
            // overall average price
            if (row.release_year === null) {
                $("#value1").text(row.average_price);
            }
            if (row.release_year == 2024) {
                $("#value2").text(row.release_year + " - " + row.average_price);
            }
            
            if (row.genre == "YEAR AVE") {
                let { genre, ...newRow } = row;
                yearArray.push(newRow)

                if (parseFloat(row.average_price) > parseFloat(highestYear.average_price)){
                    highestYear = newRow;
                }
                    
            }
        });

        $("#value3").text(highestYear.release_year + " - " + highestYear.average_price);

        // generate charts
        var data = {
            labels: yearArray.map(item => item.release_year),
            datasets: [
                {
                label: 'Average Price',
                data: yearArray.map(item => item.average_price),
                yAxisID: 'y',
                },
                {
                label: 'Game Count',
                data: yearArray.map(item => item.game_count),
                yAxisID: 'y1',
                }
            ]
        };
        
        var options = {
            responsive: true,
            interaction: {
            mode: 'index',
            intersect: false,
            },
            stacked: false,
            plugins: {
            title: {
                display: true,
                text: 'Average Price in Relation to Number of Released Titles - All Genres'
            }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Price',
                    },
                    min: 0,
                    max: 16,
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Game Count',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    min: 0,
                    max: 45000,
                }
            }
        }

        createChart("line", "avePriceAllTime", data, options);


        endTimer();
        $('#options').show();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}


export function getAveragePriceGenre(genre) {
    startTimer();
    
    $.get('/get-avg-price-slice', {genre: genre}, function(data) {
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
        var highestYear = $.rows[0];

        $("#title1").text("All Time Average Game Price with " + genre + " Genre");
        $("#title2").text("Last Year Average");
        $("#title3").text("Highest Average Year");

        $.rows.forEach(row => {
            if (row.release_year == 2024) {
                $("#value2").text(row.release_year + " - " + row.average_price);
            }
            if (parseFloat(row.average_price) > parseFloat(highestYear.average_price)){
                highestYear = row;
            }
        });

        $("#value3").text(highestYear.release_year + " - " + highestYear.average_price);

        // generate charts
        var average_price = $.rows.map(item => item.average_price).map(Number);
        var game_count = $.rows.map(item => item.game_count);

        var total = average_price.reduce((sum, value) => sum + value, 0)
        $("#value1").text((total / $.rows.length).toFixed(2));

        var data = {
            labels: $.rows.map(item => item.release_year),
            datasets: [
                {
                label: 'Average Price',
                data: average_price,
                yAxisID: 'y',
                },
                {
                label: 'Game Count',
                data: game_count,
                yAxisID: 'y1',
                }
            ]
        };
        
        var options = {
            responsive: true,
            interaction: {
            mode: 'index',
            intersect: false,
            },
            stacked: false,
            plugins: {
            title: {
                display: true,
                text: 'Average Price in Relation to Number of Released Titles - ' + genre,
            }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Price',
                    },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Game Count',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    max: Math.max(...game_count),
                }
            }
        }

        createChart("line", "avePriceGenre", data, options);
        endTimer();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getAveragePriceYear(year) {
    startTimer();

    $.get('/get-avg-price-drilldown', {year: year}, function(data) {
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

        $("#title1").text(year + " Average Price");
        $("#title2").text("Month with Highest Average Price");
        $("#title3").text("Month with Most Released Titles");

        
        //  GENERATE SUMMARY
        var highestYear = $.rows[0];
        var highestCount = $.rows[0];


        $.rows.forEach(row => {
            if (parseFloat(row.average_price) > parseFloat(highestYear.average_price)){
                highestYear = row;
            }
            if(row.game_count > highestCount.game_count) {
                highestCount = row;
            }
        });

        $("#value2").text(months[highestYear.release_month - 1] + " - " + highestYear.average_price);
        $("#value3").text(months[highestCount.release_month - 1] + " - " + highestCount.game_count);

        // fill in any missing years
        var fullYear = Array.from({ length: 12 }, (_, index) => ({
            release_month: index + 1,
            average_price: 0,
            game_count: 0
        }));

        $.rows.forEach(item => {
            fullYear[item.release_month - 1].average_price = item.average_price;
            fullYear[item.release_month - 1].game_count = item.game_count;
        });

            // generate charts
            var average_price = fullYear.map(item => item.average_price).map(Number);
            var game_count = fullYear.map(item => item.game_count);

        var total = average_price.reduce((sum, value) => sum + value, 0)
        $("#value1").text((total / $.rows.length).toFixed(2));

        var data = {
            labels: months,
            datasets: [
                {
                label: 'Average Price',
                data: average_price,
                yAxisID: 'y',
                },
                {
                label: 'Game Count',
                data: game_count,
                yAxisID: 'y1',
                }
            ]
        };
        
        var options = {
            responsive: true,
            interaction: {
            mode: 'index',
            intersect: false,
            },
            stacked: false,
            plugins: {
            title: {
                display: true,
                text: 'Average Price in Relation to Number of Released Titles - ' + year,
            }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Price',
                    },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Game Count',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    max: Math.max(...game_count),
                }
            }
        }

        createChart("line", "avePriceYear", data, options);
        endTimer();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}


export function getAveragePriceGenreOnYear(genre, year) {
    startTimer();

    $.get('/get-avg-price-dice', {year: year, genre, genre}, function(data) {
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

        $("#title1").text(year + " Average Game Price with the " + genre + " Genre");
        $("#title2").text("Month with Highest Average Price");
        $("#title3").text("Month with Most Released Titles");

        
        //  GENERATE SUMMARY
        var highestYear = $.rows[0];
        var highestCount = $.rows[0];


        $.rows.forEach(row => {
            if (parseFloat(row.average_price) > parseFloat(highestYear.average_price)){
                highestYear = row;
            }
            if(row.game_count > highestCount.game_count) {
                highestCount = row;
            }
        });

        $("#value2").text(months[highestYear.release_month - 1] + " - " + highestYear.average_price);
        $("#value3").text(months[highestCount.release_month - 1] + " - " + highestCount.game_count);

        // fill in any missing years
        var fullYear = Array.from({ length: 12 }, (_, index) => ({
            release_month: index + 1,
            average_price: 0,
            game_count: 0
        }));

        $.rows.forEach(item => {
            fullYear[item.release_month - 1].average_price = item.average_price;
            fullYear[item.release_month - 1].game_count = item.game_count;
        });

            // generate charts
            var average_price = fullYear.map(item => item.average_price).map(Number);
            var game_count = fullYear.map(item => item.game_count);

        var total = average_price.reduce((sum, value) => sum + value, 0)
        $("#value1").text((total / $.rows.length).toFixed(2));

        var data = {
            labels: months,
            datasets: [
                {
                label: 'Average Price',
                data: average_price,
                yAxisID: 'y',
                },
                {
                label: 'Game Count',
                data: game_count,
                yAxisID: 'y1',
                }
            ]
        };
        
        var options = {
            responsive: true,
            interaction: {
            mode: 'index',
            intersect: false,
            },
            stacked: false,
            plugins: {
            title: {
                display: true,
                text: 'Average Price in Relation to Number of Released Titles - ' + genre + " in " + year,
            }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Price',
                    },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Game Count',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    max: Math.max(...game_count),
                }
            }
        }

        createChart("line", "avePriceGenreOnYear", data, options);
        endTimer();

    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });
}