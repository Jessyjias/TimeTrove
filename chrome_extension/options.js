const restoreOptions = async () => {
    // display saved options
    const options = await chrome.storage.local.get({
      apiKey: ''
    });
  
    document.getElementById("apiKey").value = options.apiKey;

    const {pastContents} = await chrome.storage.local.get({
        pastContents: "",
      });
    console.log(pastContents)

    const div = document.createElement("div");
    div.textContent = pastContents;
    document.getElementById("pastContents").innerHTML = marked.parse(div.innerHTML);
  };
  
const saveOptions = async () => {
    const options = {
        apiKey: document.getElementById("apiKey").value,
    };

    await chrome.storage.local.set(options);
    const status = document.getElementById("status");
    status.textContent = 'saved!'; 
    setTimeout(() => status.textContent = "", 10000);
    };

const initialize = () => {
    restoreOptions();
  };
  
  document.addEventListener("DOMContentLoaded", initialize);
  document.getElementById("saveSettings").addEventListener("click", saveOptions);