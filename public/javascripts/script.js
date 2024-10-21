
$(document).ready(function() {

    // $.get('/get-options', function(data) {
    //     // console.log("SUCCESS getting options");

    //     const $select = $('#optionSelect');

    //     $select.empty();

    //     // create <option> elements and append them to <select>
    //     $.each(data, function(index, item) {
    //       $select.append(`<option value="${item.tag_name}">${item.tag_name}</option>`);
    //     });
    // })
    // .fail(function(xhr, status, error) {
    //     console.error('Error:', error);
    // });

    var columns = []
    var rows = []
    var currentPage = 1;
    const limit = 10;
    const top_count = 10;

    // hide table and charts on startup
    $(".hideOnStart").hide();

    $('#querySelect').on('change', function() {
        currentPage = 1;
        generateReport($('#querySelect').val());
    });


    function generateReport(queryNum) {
        var queryRoute = "";
        switch (queryNum) {
            case "1": 
                queryRoute = "/get-avg-price-all";
                break;
            default: 
                console.log("Invalid query number.");
                return;
        } 

        $("#queryProgress").text("Generating query report...");
        let startTime = performance.now();
       
        callSQLQuery(queryRoute, function() {
            let endTime = performance.now();
            let timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Time in seconds

            $("#queryProgress").text("Report finished. Time taken: " + timeTaken + " seconds");
            $(".hideOnStart").show();
        });
    }

    function callSQLQuery(queryRoute, callback) {
        $.get(queryRoute, function(data) {
            columns = data.columns
            rows = data.rows
            
            $('#tableHeaders').empty();
    
            // Generate table headers
            $.each(columns, function(index, col) {
                $('#tableHeaders').append(`<th>`+col+`</th>`);
            });

            // generate first 10 rows
            getRows(currentPage);
            // generate charts
            fillBarGraph();

            callback();
    
        })
        .fail(function(xhr, status, error) {
            console.error('Error:', error);
            callback();
        });
    }

    $("#prevBtn").prop("disabled", true );

    function getColumns() {
        columns = []

        $.get('/get-columns', function(data) {
    
            let cols = data.columns;

            $('#tableHeaders').empty();
    
            // Generate table headers
            $.each(cols, function(index, col) {
                $('#tableHeaders').append(`<th>${col.COLUMN_NAME}</th>`);
                columns.push(col.COLUMN_NAME);
            });
    
        })
        .fail(function(xhr, status, error) {
            console.error('Error:', error);
        });
    }


    function getRows(page) {
        let counter = 0;
        let stopLoop = false;
        
        $('#tableBody').empty();
    
        // Generate table rows
        $.each(rows, function(index, row) {
            if (stopLoop) return false;
            let rowHtml = '<tr>';
            $.each(columns, function(i) {
                let cellValue = row[columns[i]];
                if (cellValue === null)
                    cellValue = "-"

                rowHtml += `<td>`+cellValue+`</td>`;
            });
            rowHtml += '</tr>';
            $('#tableBody').append(rowHtml);

            counter++;
            if (counter == limit) {
                stopLoop = true;
            }
        });


        if (rows.length < limit) {
            $("#nextBtn").prop("disabled", true );
        }
        
        // $.get('/get-rows', {page: page, limit: limit}, function(data) {
    
        //     let rows = data.rows;

        //     $('#tableBody').empty();
    
        //     // Generate table rows
        //     $.each(rows, function(index, row) {
        //         let rowHtml = '<tr>';
        //         $.each(columns, function(i) {
        //             rowHtml += `<td>${row[columns[i]]}</td>`;
        //         });
        //         rowHtml += '</tr>';
        //         $('#tableBody').append(rowHtml);
        //     });

        //     if (rows.length < limit) {
        //         $("#nextBtn").prop("disabled", true );
        //     }
    
        // })
        // .fail(function(xhr, status, error) {
        //     console.error('Error:', error);
        // });
        
    }

    // initial table
    // getColumns();
    // getRows(currentPage);

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

    
    // CHART CONFIGS
    const barChart = $('#barChart');
    const pieChart = $('#pieChart');
    const lineChart = $('#lineChart');

    var barLabel = "Bar Graph";
    var pieLabel = "Pie Chart";
    var lineLabel = "Line Graph";


    function fillBarGraph() {
        console.log("COLUMNS: ", columns[0])
        console.log("ROWS: ", rows)
        //console.log("test : ", data.map(game => game.columns[0]))
        console.log("test : ", rows.map(game => game[columns[0]]))

        let labels = rows.map(game => game[columns[0]]);
        let data = rows.map(game => game[columns[1]]);

        new Chart(barChart, {
            type: 'bar',
            data: {
            labels: labels,
            datasets: [{
                label: barLabel,
                data: data,
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });

        new Chart(pieChart, {
            type: 'pie',
            data: {
            labels: labels,
            datasets: [{
                label: pieLabel,
                data: data,
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });

        new Chart(lineChart, {
            type: 'line',
            data: {
            labels: labels,
            datasets: [{
                label: lineLabel,
                data: data,
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });


    }

    


    


});