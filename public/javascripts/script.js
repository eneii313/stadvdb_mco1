
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


    let currentPage = 1;
    const limit = 10;

    $("#prevBtn").prop("disabled", true );

    function getColumns() {

    }

    function getRows(page) {
        $.get('/get-rows', {page: page, limit: limit}, function(data) {
            console.log("SUCCESS getting orders");
    
            let columns = data.columns;
            let rows = data.rows;

            $('#tableBody').empty();
    
    
            console.log("Page: ", data.page);
            console.log("Row Count: ", data.limit);
            // Generate table headers
            $.each(columns, function(index, column) {
                $('#tableHeaders').append(`<th>${column.COLUMN_NAME}</th>`);
            });
    
            // Generate table rows
            $.each(rows, function(index, row) {
                let rowHtml = '<tr>';
                $.each(columns, function(i, column) {
                    rowHtml += `<td>${row[column.COLUMN_NAME]}</td>`;
                });
                rowHtml += '</tr>';
                $('#tableBody').append(rowHtml);
            });
    
        })
        .fail(function(xhr, status, error) {
            console.error('Error:', error);
        });
        
    }

    // initial rows
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
        }

        if (currentPage = 1)
            $("#prevBtn").prop("disabled", true );
    });


});