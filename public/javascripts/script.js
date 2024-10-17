
$(document).ready(function() {

    $.get('/get-options', function(data) {
        // console.log("SUCCESS getting options");

        const $select = $('#optionSelect');

        $select.empty();

        // create <option> elements and append them to <select>
        $.each(data, function(index, item) {
          $select.append(`<option value="${item.tag_name}">${item.tag_name}</option>`);
        });
    })
    .fail(function(xhr, status, error) {
        console.error('Error:', error);
    });

    let columns = []
    let currentPage = 1;
    const limit = 10;

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
    
            console.log("Page: ", data.page);
    
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


});