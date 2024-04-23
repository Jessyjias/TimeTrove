const restoreOptions = async () => {
    // display saved options
    const options = await chrome.storage.local.get({
      apiKey: "",
    });
  
    document.getElementById("apiKey").value = options.apiKey;
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
    // Set the text of elements with the data-i18n attribute
    // document.querySelectorAll("[data-i18n]").forEach(element => {
    //   element.textContent = chrome.i18n.getMessage(element.getAttribute("data-i18n"));
    // });
    restoreOptions();
  };
  
  document.addEventListener("DOMContentLoaded", initialize);
  document.getElementById("saveSettings").addEventListener("click", saveOptions);