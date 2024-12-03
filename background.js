//checks if it is a youtube page
import { getVideoId } from "./utils.js";
const detectTab= ((tabId,tab)=>{
  if(tab.url && tab.url.includes('youtube.com/watch')){
      chrome.tabs.sendMessage(tabId,{
        type:"NEW",
        videoId:getVideoId(tab)
    });
    console.log("tab detected");
  }
});

chrome.tabs.onUpdated.addListener(detectTab);
