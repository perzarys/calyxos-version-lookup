const url = 'https://raw.githubusercontent.com/perzarys/calyxos-versiondb/main/calyxosdb.json'; // Replace with your JSON URL

// Select elements
const buildSelect = document.getElementById('buildSelect');
const deviceSelect = document.getElementById('deviceSelect');
const detailsTable = document.getElementById('detailsTable');
const deviceIdDisplay = document.getElementById('deviceId');
const buildNumberDisplay = document.getElementById('buildNumber');
const androidVersionDisplay = document.getElementById('androidVersion');
const securityPatchDisplay = document.getElementById('securityPatch');
const deviceDetailsTable = document.getElementById('deviceDetailsTable');
const lastUpdateDisplay = document.getElementById('lastUpdate');
const issueUrlDisplay = document.getElementById('issueUrl');

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

    // Update details in HTML table
    deviceIdDisplay.textContent = selectedDevice;
    buildNumberDisplay.textContent = selectedObject.build;
    androidVersionDisplay.textContent = selectedObject.android_version;
    securityPatchDisplay.textContent = selectedObject.security_patch;
    issueUrlDisplay.href = selectedObject.issue_url
    issueUrlDisplay.textContent = selectedBuild

    // Construct table for device details
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Build Type</th>
            <th>URL</th>
            <th>SHA256</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Factory</td>
            <td><a class="link" href="${deviceDetails.factory.zip}" target="_blank">${deviceDetails.factory.zip}</a></td>
            <td><a class="link" href="${deviceDetails.factory.sha256}" target="_blank">${deviceDetails.factory.sha256}</a></td>
          </tr>
          <tr>
            <td>Full OTA</td>
            <td><a class="link" href="${deviceDetails.full_ota.zip}" target="_blank">${deviceDetails.full_ota.zip}</a></td>
            <td><a class="link" href="${deviceDetails.full_ota.sha256}" target="_blank">${deviceDetails.full_ota.sha256}</a></td>
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
  deviceIdDisplay.textContent = '';
  buildNumberDisplay.textContent = '';
  deviceDetailsTable.innerHTML = '';

  // Hide details section
  detailsTable.classList.remove('active');
}

// Automatically fetch builds and populate options when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAndPopulateBuilds();
});
