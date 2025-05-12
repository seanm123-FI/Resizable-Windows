import { validationRules } from './validationRules.js';

const registrationFormHTML = `
<div id="registration-container">
    <div class="header-container">
        <h2>Registration Form</h2>
        <select id="country-select">
            <option value="en-us">US</option>
            <option value="en-uk">UK</option>
            <option value="en-ie">Ireland</option>
            <option value="en-au">Australia</option>
            <option value="de-de">Germany</option>
            <option value="fr-fr">France</option>
        </select>
    </div>
    <label for="field-type">Select Field Type:</label>
    <select id="field-type">
        <option value="text">First Name</option>
        <option value="text">Last Name</option>
        <option value="email">Email</option>
        <option value="tel">Phone</option>
        <option value="address">Address Line 1</option>
        <option value="address">Address Line 2</option>
        <option value="town">Town</option>
        <option value="city">City</option>
        <option value="country">Country</option>
        <option value="postcode">Postcode</option>
    </select>
    <div>
        <button id="add-field-button">Add Field</button>
        <button id="remove-field-button">Remove Field</button>
        <div id="fields-container"></div>
        <button id="save-form">Save Form Data</button>
        <button id="restore-form">Restore Form Data</button>
    </div>
    <form id="registration-form"></form>
    <input type="submit" value="Register">
</div>
`;

document.body.innerHTML = registrationFormHTML;

const form = document.getElementById('registration-form');
const fieldsContainer = document.getElementById('fields-container');

// Array to hold dynamically added fields
let fieldsArray = [];

// Add event listener for form submission
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const formEntries = {};
    for (let [key, value] of formData.entries()) {
        formEntries[key] = value;
    }
    console.log('Form Data:', formEntries);

    // Save the form data to local storage
    localStorage.setItem('formData', JSON.stringify(formEntries));

    // Clear the form
    form.reset();
});

// Function to add a new field to the form
document.getElementById('add-field-button').addEventListener('click', function() {
    const fieldType = document.getElementById('field-type').value;
    const fieldId = `field-${Date.now()}`;
    const fieldLabel = document.getElementById('field-type').selectedOptions[0].text;

    const newField = { 
        name: fieldId,
        type: fieldType, 
        label: fieldLabel, 
        value: ''
    };

    fieldsArray.push(newField);
    renderFields();
});

// Function to remove the last added field from the form
document.getElementById('remove-field-button').addEventListener('click', function() {
    fieldsArray.pop();
    renderFields();
});

// Email validation function
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) ? '' : 'Invalid email address';
}

// Function to validate rules for the selected country
function validateField(type, value) {
    let errorMessage = '';

    switch (type) {
        case 'email':
            errorMessage = validateEmail(value);
            break;
        case 'tel':
            const selectedCountry = document.getElementById('country-select').value;
            const countryRules = validationRules[selectedCountry];
            if (!countryRules.testPattern.test(value)) {
                errorMessage = `Invalid phone number for ${selectedCountry}`;
            }
            break;
        // Add more cases if needed
        default:
            errorMessage = value.trim() === '' ? 'This field cannot be empty' : '';
    }

    return errorMessage;
}

// Function to render the fields
function renderFields() {
    fieldsContainer.innerHTML = '';  // Clear the fields container
    fieldsArray.forEach(field => {
        const fieldHTML = `
        <div class="form-field">
            <label for="${field.name}">${field.label}:</label>
            <input type="${field.type}" id="${field.name}" name="${field.name}" value="${field.value}" required>
            <span class="validation-message" id="validation-${field.name}"></span>
        </div>
        `;
        fieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);  // Insert the new field into the fields container

        document.getElementById(field.name).addEventListener('blur', function(event) {
            const validationMessage = document.getElementById(`validation-${field.name}`);
            const errorMessage = validateField(field.type, event.target.value);
            if (errorMessage) {
                validationMessage.innerText = errorMessage;
                validationMessage.style.display = "block";
            } else {
                validationMessage.style.display = "none";
            }
        });
    });
}

// Function to save form data to local storage
document.getElementById('save-form').addEventListener('click', function() {
    fieldsArray.forEach(field => {
        const fieldElement = document.getElementById(field.name);
        if (fieldElement) {
            field.value = fieldElement.value;
            console.log(`Saving field: ${field.name}, Value: ${field.value}`);
        }
    });
    localStorage.setItem('formFields', JSON.stringify(fieldsArray));
    alert('Form data saved.');
});

// Function to restore form data from local storage
document.getElementById('restore-form').addEventListener('click', function() {
    const savedFields = JSON.parse(localStorage.getItem('formFields'));
    if (savedFields) {
        console.log('Restoring fields:', savedFields);
        fieldsArray = savedFields;
        renderFields();
        alert('Form data restored.');
    } else {
        alert('No saved form data found.');
    }
});

// Initial Render
renderFields();
