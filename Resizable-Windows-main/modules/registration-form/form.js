const registrationFormHTML = `
<div id="registration-container">
        <h2>Registration Form</h2>
        <button id="save-form">Save Form Data</button>
        <button id="restore-form">Restore Form Data</button>
        <button id="add-field-button">Add Field</button>
        <button id="remove-field-button">Remove Field</button>
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
        <form id="registration-form">
        </form>
        <input type="submit" value="Register">
    </div>
`;

document.body.innerHTML = registrationFormHTML;

const form = document.getElementById('registration-form');

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

    const newFieldHTML = `
    <div class="form-field">
        <label for="${fieldId}">${fieldLabel}:</label>
        <input type="${fieldType}" id="${fieldId}" name="${fieldId}" required>
    </div>
    `;

    form.insertAdjacentHTML('beforeend', newFieldHTML);
});
    // Function to remove the last added field from the form
    document.getElementById('remove-field-button').addEventListener('click', function() {
        const lastField = form.querySelector('.form-field:last-of-type');
        if (lastField) {
            lastField.remove();
        }
    });

// Function to save form data to local storage
document.getElementById('save-form').addEventListener('click', function() {
    const formData = new FormData(form);
    const formEntries = {};
    for (let [key, value] of formData.entries()) {
        formEntries[key] = value;
    }
    localStorage.setItem('formData', JSON.stringify(formEntries));
    alert('Form data saved.');
});

// Function to restore form data from local storage
document.getElementById('restore-form').addEventListener('click', function() {
    const savedData = JSON.parse(localStorage.getItem('formData'));
    if (savedData) {
        for (let key in savedData) {
            let input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = savedData[key];
            } else {
                // Create missing fields dynamically
                const fieldType = 'text'; // Default to text type for restored fields
                const fieldLabel = document.getElementById('field-type').selectedOptions[0].text;
                const newFieldHTML = `
                    <label for="${key}">${fieldLabel}:</label>
                    <input type="${fieldType}" id="${key}" name="${key}" required value="${savedData[key]}">
                `;
                form.insertAdjacentHTML('beforeend', newFieldHTML);
            }
        }
        alert('Form data restored.');
    } else {
        alert('No saved form data found.');
    }
});
