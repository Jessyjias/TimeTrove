const main = async (event) => {
  event.preventDefault();
  // get user inputs 
  var timeInputFieldValue = document.getElementById("timeInputField").value;
  var selected_mood = document.getElementById('moodOptions').value;
  var selected_loc = document.getElementById('locOptions').value;
  var selected_topic = document.getElementById('topicOptions').value;
  var added_info = document.getElementById('addInfoInputField').value;

  console.log("Input Field Value:", timeInputFieldValue);
  console.log("Selected Option:", selected_mood, selected_loc, selected_topic);
  console.log("additional info:", added_info);
  const tab = chrome.tabs.query({ active: true, currentWindow: true });

  console.log("tab", tab.url), tab;

  var userInput = `I have ${timeInputFieldValue} time available, my location is ${selected_loc}, my current topic of interest: ${selected_topic}, 
  my mood is ${selected_mood}, and ${added_info},  Please suggest 3 bullet points on the creative, personalized, and actionable ways that I can spend my time. 
  Limit your response to 150 words max and start the response by a phrase summary. `
  // }

  // document.getElementById("content").textContent = 'Loading ...'; 
  var loader = document.getElementById("status");
  console.log("clicked");
  loader.style.display = 'block';

  const response = await chrome.runtime.sendMessage({
    message: "generate",
    userPrompt: userInput
  });

  console.log('userInput: ', userInput);

  if (response.ok) {
    if (response.body.promptFeedback?.blockReason) {
      // The prompt was blocked
      content = `${chrome.i18n.getMessage("popup_prompt_blocked")} ` +
        `Reason: ${response.body.promptFeedback.blockReason}`;
    } else if (response.body.candidates?.[0].finishReason !== "STOP") {
      // The response was blocked
      content = `${chrome.i18n.getMessage("popup_response_blocked")} ` +
        `Reason: ${response.body.candidates[0].finishReason}`;
    } else if (response.body.candidates?.[0].content) {
      // A normal response was returned
      content = `${response.body.candidates[0].content.parts[0].text}\n\n`;
      // console.log(content)
      const div = document.createElement("div");
      div.textContent = content;
      document.getElementById("content").innerHTML = marked.parse(div.innerHTML);
      // document.getElementById("status").textContent = ''; 
      loader.style.display = 'none';

      // Save the current generated content to the local storage
      const {pastContents} = await chrome.storage.local.get({
        pastContents: "",
      });
      console.log('pastContents saved!')
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      const curr_inputs = `##### Current time: ${currentDate}
                          \n Timestamp: ${timestamp} 
                          \n Available Time: ${timeInputFieldValue}
                          \n Location: ${selected_loc} 
                          \n Mood: ${selected_mood} 
                          \n Topic: ${selected_topic} 
                          \n Additional Info: ${added_info} \n`; 
      await chrome.storage.local.set({ pastContents: pastContents+curr_inputs+'Contents: \n'+content });

      // Scroll to the bottom of the page
      window.scrollTo(0, document.body.scrollHeight);
    } else {
      // The expected response was not returned
      content = chrome.i18n.getMessage("popup_unexpected_response");
    }
  } else {
    // A response error occurred
    content = `Error: ${response.status}\n\n${response.body.error.message}`;
  }; 

    // Convert the content from Markdown to HTML
    var contentcard = document.getElementById("contentCard");
    contentcard.style.display = 'block';
    const div = document.createElement("div");
    div.textContent = content;
    document.getElementById("content").innerHTML = marked.parse(div.innerHTML); 

};

document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("userForm").addEventListener("submit", main);
});

document.getElementById("options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});