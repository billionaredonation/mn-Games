export const appState = {
  currentFeed: "mine",
  selectedFile: null,
  user: {
    name: "Donation",
    username: "@owner",
    avatar: "D"
  }
};

export function setCurrentFeed(feedName) {
  appState.currentFeed = feedName;
}

export function setSelectedFile(file) {
  appState.selectedFile = file;
}

export function clearSelectedFile() {
  appState.selectedFile = null;
}
