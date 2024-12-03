import {getCurrentTab} from "./utils.js"
import { getVideoId } from "./utils.js";

const addNewBookmark=(bookmarksElement,bookmark)=>{
  const newBookmarkElement=document.createElement('div');
  const controlsElement=document.createElement("div");
  const infoElement=document.createElement("div");
  const bookmarkTitleElement=document.createElement("p");
  const timestampElement=document.createElement("p");

  infoElement.className="info";
  bookmarkTitleElement.className="bookmark-title";
  timestampElement.className="timestamp";
  infoElement.appendChild(bookmarkTitleElement);
  infoElement.appendChild(timestampElement);
  console.log("hi, the name is "+bookmark.name+"and my time is "+bookmark.time);
  console.log(bookmark);
  bookmarkTitleElement.textContent=bookmark.name;
  timestampElement.textContent=''+bookmark.desc;

  controlsElement.className="bookmark-controls";

  newBookmarkElement.id="bookmark-"+bookmark.time;
  newBookmarkElement.className="bookmark";
  newBookmarkElement.setAttribute("timestamp",bookmark.time);
  newBookmarkElement.setAttribute("notes",bookmark.notes);

  bookmarkTitleElement.addEventListener('click',editTitle);
  setBookmarkAttributes("play",onPlay,controlsElement);
  setBookmarkAttributes("delete",onDelete,controlsElement)
  setBookmarkAttributes('dropdown',dropDown, controlsElement );
  const bookmarkContainer =document.createElement('div');

  newBookmarkElement.appendChild(infoElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarkContainer.appendChild(newBookmarkElement);
  bookmarksElement.appendChild(bookmarkContainer);
  console.log(bookmark.notes);

}

const loadBookmarks=()=>{
  const bookmarksElement = document.getElementsByClassName('scrollbox')[0];
  bookmarksElement.innerHTML="";

  if(currentVideoBookmarks.length>0){
    if(search!=="")
      currentVideoBookmarks=currentVideoBookmarks.filter(b=>b.name.includes(search));

     if(sort==="Time")
       currentVideoBookmarks.sort((a,b)=>a.time-b.time)
     if(sort==="ABC")
      currentVideoBookmarks.sort((a,b)=>a.name.localeCompare(b.name));

    for(let bookmark of currentVideoBookmarks){
      addNewBookmark(bookmarksElement,bookmark);
    }
  }else{
    bookmarksElement.innerHTML='<p class="noVideoFound">no bookmarks to show</p>';
  }
  
}

const setBookmarkAttributes= (src,eventListener,controlParentElement)=>{
  const controlElement=document.createElement("img");
  controlElement.src="images/"+src+".png";
  controlElement.title=src;
  controlElement.className=src;
  controlElement.addEventListener("click",eventListener);
  controlParentElement.appendChild(controlElement);

}

const onPlay=async e=>{
  console.log('play');
  const timestamp=e.target.parentNode.parentNode.getAttribute('timestamp');
  const currentTab= await getCurrentTab();

  chrome.tabs.sendMessage(currentTab.id,{
    type:"PLAY",
    value:timestamp
  });

  
}

const onSave=async e=>{
  const text=e.target.parentNode.getElementsByClassName('notes')[0].value;
  console.log(text);
  const timestamp=e.target.parentNode.getElementsByClassName('bookmark')[0].getAttribute('timestamp');
  console.log(timestamp);
  const currentTab= await getCurrentTab();
  console.log(currentTab.id);
  console.log(e.target.parentNode);
  e.target.parentNode.getElementsByClassName('bookmark')[0].setAttribute('notes',text);

  chrome.tabs.sendMessage(currentTab.id,
    {
      type:"SAVE",
      value:timestamp,
      notes:text
    });
    console.log('save sent');

  
}

const dropDown = async e=>{
  const input= document.createElement('textarea');
  const saveButton= document.createElement('button');
  const text=e.target.parentNode.parentNode.getAttribute('notes');
  console.log(e.target.parentNode.parentNode);
  input.placeholder="please type to start your notes";
  input.className='notes';


  input.value=text;
  e.target.parentNode.parentNode.setAttribute('notes',text);

  
  saveButton.className='save-button';
  saveButton.textContent="Save";
  saveButton.addEventListener('click',onSave);
  e.target.parentNode.parentNode.parentNode.appendChild(input);
  e.target.parentNode.parentNode.parentNode.appendChild(saveButton);
  e.target.removeEventListener('click',dropDown);
  e.target.addEventListener('click',closeDropDown);

}

const closeDropDown=e=>{
  console.log(e.target.parentNode.parentNode.parentNode.getElementsByClassName('notes')[0]);
  console.log(e.target.parentNode.parentNode.parentNode.getElementsByClassName('notes')[0].remove());
  e.target.parentNode.parentNode.parentNode.getElementsByClassName('save-button')[0].remove();
  e.target.removeEventListener('click',closeDropDown);
  e.target.addEventListener('click',dropDown);
}

const editTitle=async e=>{
  console.log(e.target.innerHTML);
  const titleInput=document.createElement("input");
  titleInput.addEventListener('keypress',enterTitle);
  titleInput.value=e.target.textContent;
  e.target.parentNode.replaceChild(titleInput,e.target);
}
const enterTitle= async e=>{
  console.log('enter title');
  if(e.key==="Enter"){
    const title=document.createElement("p");
    const currentTab= await getCurrentTab();
    title.className="bookmark-title";
    title.textContent=e.target.value==="" ? "bookmark":e.target.value;
    e.target.parentNode.replaceChild(title,e.target);
    const timestamp=title.parentNode.parentNode.getAttribute('timestamp');
    console.log('enter titel '+e.target.value );
    chrome.tabs.sendMessage(currentTab.id,
    {
      name: e.target.value ,
      type:"EDIT",
      value:title.parentNode.parentNode.getAttribute('timestamp')
    });
    currentVideoBookmarks.find(b=>b.time==timestamp).name=e.target.value;
  
  }
  
}

const onDelete=async e=>{
  const timestamp=e.target.parentNode.parentNode.getAttribute('timestamp');
  const currentTab= await getCurrentTab();
  e.target.parentNode.parentNode.parentNode.remove();

  chrome.tabs.sendMessage(currentTab.id,
    {
      type:"DELETE",
      value:timestamp
    });
    console.log(timestamp);
  

}

const sortABC= e=>{
  e.target.textContent="ABC";
  e.target.removeEventListener('click',sortABC);
  e.target.addEventListener('click',sortTime);
  sort="ABC";
  loadBookmarks();

}
const sortTime= e=>{
  e.target.textContent="Time";
  e.target.removeEventListener('click',sortTime);
  e.target.addEventListener('click',sortABC);
  sort="Time";
  loadBookmarks();

}

document.addEventListener("DOMContentLoaded",async ()=>{
  let activeTab=await getCurrentTab();
  let currentVideo= getVideoId(activeTab);

  if(activeTab.url.includes("youtube.com/watch")&& currentVideo){
    chrome.storage.sync.get([currentVideo],data=>{
      currentVideoBookmarks= data[currentVideo]?JSON.parse(data[currentVideo]):[];
      loadBookmarks();
      console.log(currentVideoBookmarks);


      const searchButton= document.getElementsByClassName('search-button')[0];
      searchButton.addEventListener('click',e=>{
        const searchBar=document.getElementsByClassName('search-bar')[0];
        search=searchBar.value;
        loadBookmarks();
      })

      const sortButton= document.getElementsByClassName('sort')[0];
      sortButton.addEventListener('click',sortABC);


    })
  }else{
    const container= document.getElementsByClassName("container")[0];
    container.innerHTML=`<p class="noVideoFound">This is not a valid Youtube video page</p>`;
  }

})

let search="";
let sort="Time";
let currentVideoBookmarks=[];
