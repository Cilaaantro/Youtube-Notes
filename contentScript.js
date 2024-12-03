(()=>{
  let youtubeLeftControls,youtubePlayer;
  let currentVideo="";
  let currentVideoBookmarks=[];
  chrome.runtime.onMessage.addListener((obj,sender,response)=>{
    const {name,type,value,videoId,notes}=obj; //destructuring
    console.log('message recieved');
    
    if(type==="NEW"){
      currentVideo=videoId;
      console.log('new video');
      newVideoLoaded();
    }else if(type==="PLAY"){
      youtubePlayer.currentTime=value;
    }else if(type==="DELETE"){
      console.log(currentVideoBookmarks);
      currentVideoBookmarks= currentVideoBookmarks.filter((b)=>b.time!=value);
      console.log('delete message');
      chrome.storage.sync.set({[currentVideo]:JSON.stringify(currentVideoBookmarks)});
    }else if(type==="EDIT"){
      const bookmark= currentVideoBookmarks.find(b=>b.time==value);
      bookmark.name=name;
      chrome.storage.sync.set({[currentVideo]:JSON.stringify(currentVideoBookmarks)});
    }else if(type==="SAVE"){
      console.log('before4');
      const bookmark= currentVideoBookmarks.find(b=>b.time==value);
      console.log(currentVideoBookmarks[0]);
      console.log(value);

      bookmark.notes=notes;
      console.log('after notes');
      console.log(bookmark.notes);
      chrome.storage.sync.set({[currentVideo]:JSON.stringify(currentVideoBookmarks)});
      console.log('saved');
    }
  })

  const fetchBookmarks=()=>{
    return new Promise((resolve)=>{
      chrome.storage.sync.get([currentVideo],(obj)=>{
        resolve(obj[currentVideo]?JSON.parse(obj[currentVideo]):[]);
      })
    })
  }

   const newVideoLoaded=async()=>{
    const bookmarkBtnExists= document.getElementsByClassName("bookmark-btn")[0];
    currentVideoBookmarks=await fetchBookmarks();
    console.log(currentVideoBookmarks);
    console.log('new vid loaded')
    if(!bookmarkBtnExists){
      const bookmarkBtn= document.createElement("img");

      bookmarkBtn.src= chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.title="bookmark timestamp";
      bookmarkBtn.className="bookmark-btn";
      youtubeLeftControls= document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer=document.getElementsByClassName("video-stream")[0];
      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click",addNewBookmarkEventHandler);

    }
   }
   newVideoLoaded();//fix myself
   const addNewBookmarkEventHandler = async()=>{
    const currentTime=youtubePlayer.currentTime;
    const newBookmark={
      name:"bookmark",
      time:currentTime,
      desc:getTime(currentTime),
      notes:"test"
    }
    console.log("hi, i was just created and my name is 2 "+newBookmark.name);

    //currentVideoBookmarks=await fetchBookmarks();
    console.log('awaited');
    currentVideoBookmarks=[...currentVideoBookmarks,newBookmark]
    chrome.storage.sync.set({
      [currentVideo]:JSON.stringify(currentVideoBookmarks)
    })

   }


})();

const getTime =t=>{
  let date= new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11,8);
 }

 
