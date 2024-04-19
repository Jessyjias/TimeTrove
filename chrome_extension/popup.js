console.log('This is a popup!');



document.addEventListener("DOMContentLoaded", function() {
  console.log('This is a popup! aa');
  document.getElementById("userForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting
    console.log('aaa');
    // Get input field value
    var timeInputFieldValue = document.getElementById("timeInputField").value;

    // Get selected radio button value
    var selected_mood = document.querySelector('input[name="moodOptions"]:checked').value;
    var selected_loc = document.querySelector('input[name="locOptions"]:checked').value;
    var selected_topic = document.querySelector('input[name="topicOptions"]:checked').value;

    // Log the values
    console.log("Input Field Value:", timeInputFieldValue);
    console.log("Selected Option:", selected_mood, selected_loc, selected_topic);

    chrome.action.setBadgeText({ text: 'ON' });

    // // Send data to background script using Chrome Extension API
    // chrome.runtime.sendMessage({ inputField: timeInputFieldValue, option: selectedOption }, function(response) {
    //   console.log("Data sent to background script.");
    // });
  });
});
