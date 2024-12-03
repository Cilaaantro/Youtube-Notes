export async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export function getVideoId(tab) {
  const queryParameters= tab.url.split("?")[1];
  const urlParameters= new URLSearchParams(queryParameters);
  return urlParameters.get('v');

}