
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

    let columns = []
    let currentPage = 1;
    const limit = 10;
    const top_count = 10;


    $('#querySelect').on('change', function() {
        generateReport();
    });


    function generateReport() {
        $("#queryProgress").text("Generating query report...");
        let startTime = performance.now();
       
        callSQL(() => {
            let endTime = performance.now();
            let timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Time in seconds

            $("#queryProgress").text("Report finished. Time taken: " + timeTaken + " seconds");
        });
    }

    function callSQL(callback) {
        getAll(callback);
    }

    function getAll(callback) {
        $.get('/get-all', function(data) {

            console.log("DONE ALL GAMES");
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
        $.get('/get-rows', {page: page, limit: limit}, function(data) {
    
            let rows = data.rows;

            $('#tableBody').empty();
    
            // Generate table rows
            $.each(rows, function(index, row) {
                let rowHtml = '<tr>';
                $.each(columns, function(i) {
                    rowHtml += `<td>${row[columns[i]]}</td>`;
                });
                rowHtml += '</tr>';
                $('#tableBody').append(rowHtml);
            });

            if (rows.length < limit) {
                $("#nextBtn").prop("disabled", true );
            }
    
        })
        .fail(function(xhr, status, error) {
            console.error('Error:', error);
        });
        
    }

    // initial table
    getColumns();
    getRows(currentPage);

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


    function fillBarGraph() {
        let barLabels = []
        let barValues = []

        $.get('/get-genres', function(data) {
            $.each(data, function(index, item) {

                if (index >= top_count) {
                    return false;
                }

              barLabels.push(item.genre)
              barValues.push(item.count)
            });

            new Chart(barChart, {
                type: 'bar',
                data: {
                labels: barLabels,
                datasets: [{
                    label: 'Top Counts per Genre',
                    data: barValues,
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
                labels: barLabels,
                datasets: [{
                    label: 'Top Counts per Genre',
                    data: barValues,
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

            
        })
        .fail(function(xhr, status, error) {
            console.error('Error:', error);
        });


    }

    fillBarGraph();

    


    


});