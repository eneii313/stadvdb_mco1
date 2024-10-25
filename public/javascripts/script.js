
import {getAveragePriceAll, getAveragePriceGenre, getAveragePriceYear, getAveragePriceGenreOnYear} from './queryOne.js';
import { getAudioSupportAll, getAudioSupportYear, getAudioSupportGenre, getAudioSupportGenreOnYear } from './queryTwo.js';

$(document).ready(function() {

    $.get('/get-genres', function(data) {

        // create <option> elements and append them to <select>
        $.each(data, function(index, item) {
            $('#genreSelect').append(`<option value="${item.genre}">${item.genre}</option>`);
            $.genres.push(item.genre);
        });
    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });

    $.get('/get-languages', function(data) {

        // create <option> elements and append them to <select>
        $.each(data, function(index, item) {
            $('#languageSelect').append(`<option value="${item.language}">${item.language}</option>`);
        });
    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });

    $.get('/get-years', function(data) {

        // create <option> elements and append them to <select>
        $.each(data, function(index, item) {
            $('#yearSelect').append(`<option value="${item.release_year}">${item.release_year}</option>`);
            $.years.push(item.release_year);
        });
    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });


    // hide table and charts on startup
    $(".hideOnStart").hide();
    $("#options").hide();

    $('#querySelect').on('change', function() {
        currentPage = 1;
        $("#currentPage").text(currentPage);
        $(".optionDiv").hide();
        $(".option").val("all");
        $("#prevBtn").prop("disabled", true );

        // generate report base on selected query
        switch ($('#querySelect').val()) { 
            case "1":
                $("#genreSelectDiv").show();
                $("#yearSelectDiv").show();
                getAveragePriceAll();
                break;
            case "2": 
                $("#genreSelectDiv").show();
                $("#yearSelectDiv").show();
                getAudioSupportAll();
                break;
            default:
                console.log("Invalid Query Number")
                return;

        }
    });

    $('.option').on('change', function() {
        currentPage = 1;
        $("#prevBtn").prop("disabled", true );

        // generate report base on selected query
        var query = $("#querySelect").val();
        var genre = $("#genreSelect").val();
        var year = $("#yearSelect").val();

        switch (query) {
            case "1":
                if (genre == "all" && year == "all")
                    getAveragePriceAll(); //rollup
                else if (genre == "all" && year != "all")
                    getAveragePriceYear(year); // drilldown
                else if (genre != "all" && year == "all")
                    getAveragePriceGenre(genre); // slice
                else if (genre != "all" && year != "all")
                    getAveragePriceGenreOnYear(genre, year); // dice
                break;
            case "2":
                if (genre == "all" && year == "all")
                    getAudioSupportAll(); // rollup
                else if (genre == "all" && year != "all")
                    getAudioSupportYear(year); //drilldown
                else if (genre != "all" && year == "all")
                    getAudioSupportGenre(genre); //slice
                else if (genre != "all" && year != "all")
                    getAudioSupportGenreOnYear(genre, year); // dice
                break;
            default:
                console.log("Invalid Query Configuration")
                return;
        }

    });


    // "Next" rows
    $('#nextBtn').on('click', function() {
        currentPage += 1;
        getRows(currentPage);
        $("#currentPage").text(currentPage);
        $("#prevBtn").prop("disabled", false );

    });

    // "Previous" rows
    $('#prevBtn').on('click', function() {
        if (currentPage > 1) {
            currentPage -= 1;
            getRows(currentPage);
            $("#currentPage").text(currentPage);
            $("#nextBtn").prop("disabled", false );
        }

        if (currentPage == 1) {
            $("#prevBtn").prop("disabled", true );
        }
    });


});

$.columns = []
$.rows = []

$.years = []
$.genres = []

var currentPage = 1;
const row_limit = 15;

// use for timing queries
var startTime = 0;
export function startTimer() {
    $(".hideOnStart").hide();
    $("#charts").empty();
    $("#queryProgress").text("Generating query report...");
    startTime = performance.now();
}

export function endTimer() {
    let endTime = performance.now();
    let timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Time in seconds

    $("#queryProgress").text("Report finished. Time taken: " + timeTaken + " seconds");
    $(".hideOnStart").show();
}

// ---------------------------- TABLE FUNCTIONS ---------------------------- 
// show the resulting query table rows by increments of row_limit
export function getRows(page) {        
    $('#tableBody').empty();

    // Generate table rows
    let startIndex = (page - 1) * row_limit;
    let endIndex = Math.min(startIndex + row_limit, $.rows.length);

    for (let i = startIndex; i < endIndex; i++) {
        let rowHtml = '<tr>';

        for (let j = 0; j < $.columns.length; j++) {
            let cellValue = $.rows[i][$.columns[j]];
            if (cellValue === null)
                cellValue = "-"
            rowHtml += `<td>`+cellValue+`</td>`;
        }

        rowHtml += '</tr>';
        $('#tableBody').append(rowHtml);
    }

    if (endIndex % row_limit != 0 || startIndex == endIndex) {
        $("#nextBtn").prop("disabled", true );
    }

    
}

// ---------------------------- CHART FUNCTIONS & CONFIGS ---------------------------- 

export function createChart (chartType, chartName, data, options) {

    let chartDiv = document.createElement('div');
    chartDiv.classList.add('chart');

    let canvas = document.createElement('canvas');
    canvas.id = chartName;
    chartDiv.appendChild(canvas); // Append canvas to div

    document.getElementById('charts').appendChild(chartDiv);

    let ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
        type: chartType,
        data: data,
        options: options,
    });

    return chart;

}
