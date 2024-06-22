const url = 'https://raw.githubusercontent.com/perzarys/calyxos-versiondb/main/calyxosdb.json'; // Replace with your JSON URL

// Select elements
const buildSelect = document.getElementById('buildSelect');
const deviceSelect = document.getElementById('deviceSelect');
const detailsTable = document.getElementById('detailsTable');
const deviceDetailsTable = document.getElementById('deviceDetailsTable');
const lastUpdateDisplay = document.getElementById('lastUpdate');

// Initialize empty array to hold JSON data
let jsonData = [];

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
      if (!Array.isArray(data)) {
        throw new Error('Fetched data is not an array');
      }
      jsonData = data; // Store fetched JSON data in jsonData array
      if (data.length == 0) {
        lastUpdateDisplay.textContent = 'No data available';
      }

      // Clear existing options
      buildSelect.innerHTML = '<option value="">Select a build...</option>';
      deviceSelect.innerHTML = '<option value="">Select a device...</option>';

      // Populate build options
      jsonData.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = item.build_number; // Using index as the value to reference the array position
        option.textContent = item.calyxos_version + " (" + item.build_number + ")"; // Assuming each dictionary has a 'version' key
        if (index !== jsonData.length-1) {
          buildSelect.appendChild(option);
        }
        else {
          lastUpdateDisplay.textContent = `Last Updated: ${item.last_update}`;
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
  const selectedObject = jsonData.find(obj => {
    return obj.build_number === selectedBuild
  })
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
  const deviceCodename = selectedDevice.split(" | ")[0];

  if (!selectedBuild || !selectedDevice) {
    clearDetails();
    return;
  }

  const selectedObject = jsonData.find(obj => {
    return obj.build_number === selectedBuild
  })
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
            <td colspan="2"><a href=${selectedObject.issue_url}>CalyxOS ${selectedObject.calyxos_version}</a></td>
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
            <td colspan="2">${buildSelect.value}</td>
          </tr>
          <tr>
            <td><b>Factory ${deviceCodename}</b</td>
            <td><a class="link" href="${deviceDetails.factory.zip}" target="_blank"><b>zip ↓</b></a></td>
            <td><a class="link" href="${deviceDetails.factory.sha256}" target="_blank"><b>zip.sha256sum ↓</b></a></td>
          </tr>
          <tr>
            <td><b>Full OTA ${deviceCodename}</b></td>
            <td><a class="link" href="${deviceDetails.full_ota.zip}" target="_blank"><b>zip ↓</b></a><br></td>
            <td><a class="link" href="${deviceDetails.full_ota.sha256}" target="_blank"><b>zip.sha256sum ↓</b></a></td>
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
