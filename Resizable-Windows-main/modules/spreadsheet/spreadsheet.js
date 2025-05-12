// Get the container where the spreadsheet and controls will be inserted
const spreadsheetContainer = document.getElementById('spreadsheet-container');

// HTML structure for the controls and the table
const controlsHTML = `
    <div class="controls">
        <input type="file" id="fileInput" accept=".csv">
        <button id="saveButton">Save</button>
    </div>
    <table id="spreadsheetTable"></table>
`;

// Insert the controls and table into the container
spreadsheetContainer.innerHTML = controlsHTML;

// Get references to the file input, save button, and table
const fileInput = document.getElementById('fileInput');
const saveButton = document.getElementById('saveButton');
const spreadsheetTable = document.getElementById('spreadsheetTable');

// Function to parse CSV text into a 2D array
function parseCSV(csvText) {
    const rows = csvText.trim().split('\n');
    return rows.map(row => row.split(','));
}

// Function to generate the table from a 2D array
function generateTable(data) {
    // Clear any existing table content
    spreadsheetTable.innerHTML = '';

    // Create the table header
    const tableHead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Ensure there is data and create a header row using the first row
    if (data.length > 0) {
        data[0].forEach((header, index) => {
            const th = document.createElement('th');
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = header;
            inputField.setAttribute('data-row', 0);
            inputField.setAttribute('data-col', index);
            
            inputField.setAttribute('draggable', true);
            inputField.addEventListener('dragstart', handleDragStart, false);
            inputField.addEventListener('dragover', handleDragOver, false);
            inputField.addEventListener('drop', handleDrop, false);

            th.appendChild(inputField);
            headerRow.appendChild(th);
        });
    }

    tableHead.appendChild(headerRow);
    spreadsheetTable.appendChild(tableHead);

    // Create a table body element
    const tableBody = document.createElement('tbody');

    // Iterate over each row of data starting from the second row (since first row is header)
    data.slice(1).forEach((row, rowIndex) => {
        const tableRow = document.createElement('tr');

        // Iterate over each cell of the row
        row.forEach((cell, cellIndex) => {
            const tableCell = document.createElement('td');
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = cell;
            inputField.setAttribute('data-row', rowIndex + 1);
            inputField.setAttribute('data-col', cellIndex);
            
            inputField.setAttribute('draggable', true);
            inputField.addEventListener('dragstart', handleDragStart, false);
            inputField.addEventListener('dragover', handleDragOver, false);
            inputField.addEventListener('drop', handleDrop, false);

            // Append the input field to the table cell
            tableCell.appendChild(inputField);
            // Append the table cell to the table row
            tableRow.appendChild(tableCell);
        });

        // Append the table row to the table body
        tableBody.appendChild(tableRow);
    });

    // Append the table body to the table
    spreadsheetTable.appendChild(tableBody);
}

// Function to handle file input change
function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const content = event.target.result;
            const data = parseCSV(content);
            generateTable(data);
        };
        fileReader.readAsText(file);
    }
}

// Function to save the table data as a CSV file
function saveToFile() {
    let data = [];
    
    // Get all table rows
    const tableRows = spreadsheetTable.querySelectorAll('tr');
    
    // Iterate over each row
    tableRows.forEach((tableRow) => {
        let row = [];
        
        // Get all input fields in the row
        tableRow.querySelectorAll('input').forEach((inputField) => {
            row.push(inputField.value);
        });
        
        // Join the cell values with commas and add the row to the data array
        data.push(row.join(','));
    });
    
    // Convert the data array to CSV format
    const csvContent = data.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to initiate the download
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'spreadsheet.csv';
    downloadLink.click();
    
    // Revoke the object URL
    URL.revokeObjectURL(url);
}

// Drag and Drop event handlers
let dragged;

function handleDragStart(event) {
    dragged = event.target;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', event.target.value);
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function handleDrop(event) {
    event.preventDefault();
    if (event.target.tagName === 'INPUT') {
        event.target.value = event.dataTransfer.getData('text/plain');
    }
}

// Add event listeners
fileInput.addEventListener('change', handleFileInputChange);
saveButton.addEventListener('click', saveToFile);

// Add drag and drop file loading feature
// Prevent default behavior for dragover and drop
spreadsheetContainer.addEventListener('dragover', function(event) {
    event.preventDefault();
    event.stopPropagation();
});

spreadsheetContainer.addEventListener('drop', function(event) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const content = event.target.result;
            const data = parseCSV(content);
            generateTable(data);
        };
        fileReader.readAsText(file);
    }
});
