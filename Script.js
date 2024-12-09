let rgbDevice = null;

let audioContext;

let analyserNode;

let frequencyData;

let sensitivity = 5;




// Bluetooth connection

async function connectBluetooth() {

  try {

    const device = await navigator.bluetooth.requestDevice({

      filters: [{ services: ['service_uuid'] }]  // Replace with your device's service UUID

    });

    const server = await device.gatt.connect();

    rgbDevice = server.getPrimaryService('service_uuid'); // Replace with actual UUID

    document.getElementById('status').textContent = "Bluetooth device connected!";

  } catch (error) {

    console.log('Bluetooth connection failed: ', error);

    document.getElementById('status').textContent = "Failed to connect Bluetooth device.";

  }

}




// Music Sync - Frequency Analyzer

function startMusicSync() {

  const fileInput = document.getElementById('audio-file');

  const audioFile = fileInput.files[0];

  if (!audioFile) {

    alert("Please select an audio file.");

    return;

  }




  const audioElement = new Audio(URL.createObjectURL(audioFile));

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const analyser = audioContext.createAnalyser();

  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;

  frequencyData = new Uint8Array(bufferLength);

  analyserNode = analyser;

  

  const sourceNode = audioContext.createMediaElementSource(audioElement);

  sourceNode.connect(analyser);

  analyser.connect(audioContext.destination);

  

  audioElement.play();

  updateRGBSync();

}




function updateRGBSync() {

  analyserNode.getByteFrequencyData(frequencyData);

  

  // Implement syncing logic (e.g., map frequency data to RGB colors)

  let averageFrequency = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length;

  let intensity = averageFrequency / sensitivity;




  // Send the intensity value to the Bluetooth device to adjust RGB strip colors

  if (rgbDevice) {

    sendColorDataToRGB(intensity);

  }




  requestAnimationFrame(updateRGBSync);

}




// Send RGB Data

function sendColorDataToRGB(intensity) {

  const red = Math.min(255, intensity * 2);

  const green = Math.min(255, intensity * 1.5);

  const blue = Math.min(255, intensity);




  // Send RGB values to the Bluetooth RGB device (pseudo-code, update with actual Bluetooth communication)

  rgbDevice.writeValue(new Uint8Array([red, green, blue]))

    .catch(error => console.log('Error sending RGB data: ', error));

}




// Event Listeners

document.getElementById('connect').addEventListener('click', connectBluetooth);

document.getElementById('toggle-sync').addEventListener('click', startMusicSync);

document.getElementById('sensitivi

ty').addEventListener('input', (e) => {

  sensitivity = e.target.value;

});