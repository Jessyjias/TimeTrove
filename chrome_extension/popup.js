const main = async (event) => {
  event.preventDefault();

  const { apiKey } = await chrome.storage.local.get({ apiKey: "" });
  if (!apiKey) {
    // if no API provided in settings - provide api key for hackathon purposes  
    const options = {
      apiKey: 'AIzaSyD65uumvB0XuW6NHVn0QrkJk6NVeEE7o8k'
    };
    await chrome.storage.local.set(options);
  }

  
  var promptRegenerate = document.getElementById("promptRegenerate");
  promptRegenerate.style.display = 'none';
  var timeSlider = document.getElementById("slider").value; 
  var selected_mood = document.getElementById('moodOptions').value;
  var selected_loc = document.getElementById('locOptions').value;
  var selected_topic = document.getElementById('topicOptions').value;
  var added_info = document.getElementById('addInfoInputField').value;

  console.log("Input Field Value:", timeSlider);
  console.log("Selected Option:", selected_mood, selected_loc, selected_topic);
  console.log("additional info:", added_info);
  const tab = chrome.tabs.query({ active: true, currentWindow: true });

  console.log("tab", tab.url), tab;

  var userInput = `I have ${timeSlider} time available, my location is ${selected_loc}, my current topic of interest: ${selected_topic}, 
  my mood is ${selected_mood}, and ${added_info},  Please suggest 3 ideas on the creative, personalized, and actionable ways that I can spend my time. 
  Limit your response to 150 words max and leave a line between each idea. `

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
                          \n Available Time (min): ${timeSlider}
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
    content = `Please check Settings. Error: ${response.status}, ${response.body.error.message}`;
  }; 

    // separate the contents into separate points 
    let contentIdeas = content.split("\n");
    let filtered_ideas = contentIdeas.filter(function (el) {
      return el != null && el != "";
    });
    console.log('content: ', content)

    // show regenerate info prompt to users
    var promptRegenerate = document.getElementById("promptRegenerate");
    promptRegenerate.style.display = 'block';

    // show generated contents 
    var contentcards = document.getElementById("contentCards");
    contentcards.style.display = 'block';
    
    // get all response idea cards 
    for (const element of filtered_ideas) {
      var ideaCard = getIdeaCard(element);
      contentcards.insertBefore(ideaCard, contentcards.firstChild);
    }

};

const getIdeaCard = (ideaPoint) => {
  const card_body_p = document.createElement("p");
  const div = document.createElement("div");
  div.textContent = ideaPoint;
  card_body_p.innerHTML = marked.parse(div.innerHTML);

  const card_body = document.createElement('div');
  card_body.classList.add('card-body');
  card_body.appendChild(card_body_p); 

  const element_card = document.createElement('div');
  element_card.classList.add('card', 'text-white', 'bg-primary', 'mb-4');
  element_card.appendChild(card_body); 

  return element_card; 
}; 

document.addEventListener("DOMContentLoaded", function(){
  var slider = document.getElementById("slider");
  var output = document.getElementById("demo");
  output.innerHTML = slider.value+" (min)"; // Display the default slider value

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    output.innerHTML = this.value+" (min)";
  }; 

  // Listen for submission of inputs 
  document.getElementById("userForm").addEventListener("submit", main);
});

document.getElementById("options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});