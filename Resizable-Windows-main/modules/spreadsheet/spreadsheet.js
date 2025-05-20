// Get the container where the spreadsheet and controls will be inserted
const spreadsheetContainer = document.getElementById('spreadsheet-container');

// HTML structure for the controls and the table
const controlsHTML = `
    <div class="controls">
        <span>Current Delimiter: <span id="detected-delimiter">N/A</span></span>
        <input type="file" id="fileInput" accept=".csv,.tsv,.txt">
        <button id="saveButton">Save</button>
    </div>
    <table id="spreadsheetTable">
        <thead></thead>
        <tbody></tbody>
    </table>
`;

// Insert the controls and table into the container
spreadsheetContainer.innerHTML = controlsHTML;

// Get references to the file input, save button, and table
const fileInput = document.getElementById('fileInput');
const saveButton = document.getElementById('saveButton');
const detectedDelimiter = document.getElementById('detected-delimiter');
const spreadsheetTable = document.getElementById('spreadsheetTable');

// Function to parse text into a 2D array based on the delimiter
function parseText(text, delimiter = ',') {
    const rows = text.trim().split('\n');
    return rows.map(row => row.split(delimiter));
}

// Function to detect the delimiter used in the CSV file
function detectDelimiter(text) {
    const firstLine = text.split('\n')[0];

    const delimiters = [',', ';', '|'];
    let bestDelimiter = delimiters[0];
    let maxCount = 0;

    delimiters.forEach(delimiter => {
        const count = (firstLine.split(delimiter).length - 1);
        if (count > maxCount) {
            maxCount = count;
            bestDelimiter = delimiter;
        }
    });

    return bestDelimiter;
}

// Function to generate the table from a 2D array
function generateTable(data) {
    const tHead = spreadsheetTable.querySelector('thead');
    const tBody = spreadsheetTable.querySelector('tbody');

    tHead.innerHTML = '';
    tBody.innerHTML = '';

    const headerRow = document.createElement('tr');

    if (data.length > 0) {
        const th = document.createElement('th');
        headerRow.appendChild(th);

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

    tHead.appendChild(headerRow);

    data.slice(1).forEach((row, rowIndex) => {
        const tableRow = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.textContent = rowIndex + 1;
        tableRow.appendChild(numberCell);

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

            tableCell.appendChild(inputField);
            tableRow.appendChild(tableCell);
        });

        tBody.appendChild(tableRow);
    });
}

// Function to handle file input change
function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const content = event.target.result;

            const delimiter = detectDelimiter(content);

            detectedDelimiter.textContent = delimiter === '|' ? '|' : delimiter;
            const data = parseText(content, delimiter);
            generateTable(data);
        };
        fileReader.readAsText(file);
    }
}

// Function to save the table data as a delimited file
function saveToFile() {
    const currentDelimiter = detectedDelimiter.textContent === '|' ? '|' : detectedDelimiter.textContent;
    let data = [];

    spreadsheetTable.querySelectorAll('thead tr th:nth-child(n+2) input').forEach(input => {
        data.push(input.value);
    });
    const headerRow = data.join(currentDelimiter);
    let rows = [headerRow];

    spreadsheetTable.querySelectorAll('tbody tr').forEach(row => {
        let rowData = [];
        row.querySelectorAll('td:nth-child(n+2) input').forEach(cell => {
            rowData.push(cell.value);
        });
        rows.push(rowData.join(currentDelimiter));
    });

    const content = rows.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    const extension = currentDelimiter === '|' ? '.txt' : '.csv';
    downloadLink.download = 'spreadsheet' + extension;
    downloadLink.click();
    URL.revokeObjectURL(url);
}

// Drag-and-drop event handlers
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

// Add drag-and-drop file loading feature
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

            const delimiter = detectDelimiter(content);

            detectedDelimiter.textContent = delimiter === '|' ? '|' : delimiter;
            const data = parseText(content, delimiter);
            generateTable(data);
        };
        fileReader.readAsText(file);
    }
});
