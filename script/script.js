const url = 'https://raw.githubusercontent.com/perzarys/calyxos-versiondb/main/calyxosdb.json'; // Replace with your JSON URL

// Select elements
const buildSelect = document.getElementById('buildSelect');
const deviceSelect = document.getElementById('deviceSelect');
const detailsTable = document.getElementById('detailsTable');
const deviceDetailsTable = document.getElementById('deviceDetailsTable');
const lastUpdateDisplay = document.getElementById('lastUpdate');

// Initialize empty object to hold JSON data
let jsonData = {};

// Function to fetch JSON data from URL and populate build options
function fetchAndPopulateBuilds() {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      jsonData = data; // Store fetched JSON data in jsonData variable
      const lastUpdate = data.last_update;
      lastUpdateDisplay.textContent = `Last Updated: ${lastUpdate}`;

      // Clear existing options
      buildSelect.innerHTML = '<option value="">Select a build...</option>';
      deviceSelect.innerHTML = '<option value="">Select a device...</option>';

      // Populate build options
      Object.keys(jsonData).forEach(buildId => {
        if (buildId !== 'last_update') {
          const option = document.createElement('option');
          option.value = buildId;
          option.textContent = buildId;
          buildSelect.appendChild(option);
        }
      });

      // Automatically trigger selection of the first build
      if (buildSelect.options.length > 1) {
        buildSelect.selectedIndex = 1; // Select the first build option (index 1)
        populateDevices(); // Populate devices for the selected build
      } else {
        clearDetails();
      }
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

// Function to populate device options based on selected build
function populateDevices() {
  const selectedBuild = buildSelect.value;
  const selectedObject = jsonData[selectedBuild];

  // Clear existing options
  deviceSelect.innerHTML = '<option value="">Select a device...</option>';

  // Populate device options
  if (selectedObject && selectedObject.devices) {
    Object.keys(selectedObject.devices).forEach(device => {
      const option = document.createElement('option');
      option.value = device;
      option.textContent = device;
      deviceSelect.appendChild(option);
    });

    // Automatically trigger display of details when a device is selected
    deviceSelect.addEventListener('change', displayDetails);
  } else {
    clearDetails();
  }
}

// Event listener for build select change
buildSelect.addEventListener('change', () => {
  populateDevices();
  clearDetails(); // Clear details whenever build selection changes
});

// Function to display details for selected build and device
function displayDetails() {
  const selectedBuild = buildSelect.value;
  const selectedDevice = deviceSelect.value;

  if (!selectedBuild || !selectedDevice) {
    clearDetails();
    return;
  }

  const selectedObject = jsonData[selectedBuild];
  if (selectedObject && selectedObject.devices && selectedObject.devices[selectedDevice]) {
    const deviceDetails = selectedObject.devices[selectedDevice];

    // Construct table for device details
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th colspan="3">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
          <tr>
            <td>GitLab</td>
            <td colspan="2"><a href=${selectedObject.issue_url}>${selectedBuild}</a></td>
          </tr>
          <tr>
            <td>Android version</td>
            <td colspan="2">${selectedObject.android_version}</td>
          </tr>
          <tr>
            <td>Security patch</td>
            <td colspan="2">${selectedObject.security_patch}</td>
          </tr>
          <tr>
            <td>Build number</td>
            <td colspan="2">${selectedObject.build}</td>
          </tr>
          <tr>
            <td><b>Factory</b</td>
            <td><a class="link" href="${deviceDetails.factory.zip}" target="_blank">ZIP</a></td>
            <td><a class="link" href="${deviceDetails.factory.sha256}" target="_blank">SHA256</a></td>
          </tr>
          <tr>
            <td><b>Full OTA</b></td>
            <td><a class="link" href="${deviceDetails.full_ota.zip}" target="_blank">ZIP</a><br></td>
            <td><a class="link" href="${deviceDetails.full_ota.sha256}" target="_blank">SHA256</a></td>
          </tr>
        </tbody>
      </table>
    `;

    deviceDetailsTable.innerHTML = tableHtml;

    // Show details section
    detailsTable.classList.add('active');
  } else {
    clearDetails();
  }
}

// Function to clear details in HTML
function clearDetails() {
  deviceDetailsTable.innerHTML = '';

  // Hide details section
  detailsTable.classList.remove('active');
}

// Automatically fetch builds and populate options when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAndPopulateBuilds();
});
