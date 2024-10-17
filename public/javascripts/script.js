
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

    $.get('/get-orders', function(data) {
        console.log("SUCCESS getting orders");

        let columns = data.columns;
        let rows = data.rows;
        console.log("Columns: ", columns);
        console.log("Rows: ", rows);
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
    

});