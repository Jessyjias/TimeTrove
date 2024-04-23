const main = async (event) => {
  event.preventDefault();
  // get user inputs 
  var timeInputFieldValue = document.getElementById("timeInputField").value;
  var selected_mood = document.querySelector('input[name="moodOptions"]:checked').value;
  var selected_loc = document.querySelector('input[name="locOptions"]:checked').value;
  var selected_topic = document.querySelector('input[name="topicOptions"]:checked').value;
  var added_info = document.getElementById('addInfoInputField').value;

  console.log("Input Field Value:", timeInputFieldValue);
  console.log("Selected Option:", selected_mood, selected_loc, selected_topic);
  console.log("additional info:", added_info);
  const tab = chrome.tabs.query({ active: true, currentWindow: true });

  console.log("tab", tab.url), tab;

  var userInput = `I have ${timeInputFieldValue} time available, my location is ${selected_loc}, my current topic of interest: ${selected_topic}, 
  my mood is ${selected_mood}, and ${added_info},  Please suggest 3 bullet points on the creative, personalized, and actionable ways that I can spend my time. 
  Limit your response to 150 words max.`
  // }

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
      console.log(content)
      const div = document.createElement("div");
      div.textContent = content;
      document.getElementById("content").innerHTML = marked.parse(div.innerHTML);

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
    const div = document.createElement("div");
    div.textContent = content;
    document.getElementById("content").innerHTML = marked.parse(div.innerHTML);

    // Save the content to the session storage
    await chrome.storage.session.set({ [`c_${contentIndex}`]: content });


};

document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("userForm").addEventListener("submit", main);
});
// document.addEventListener("DOMContentLoaded", initialize);
// document.getElementById("run").addEventListener("click", main);

// document.getElementById("results").addEventListener("click", async () => {
//   await chrome.tabs.create({ url: chrome.runtime.getURL(`results.html?i=${contentIndex}`) });
// });

// document.getElementById("options").addEventListener("click", () => {
//   chrome.runtime.openOptionsPage();
// }); --> construct options pages 