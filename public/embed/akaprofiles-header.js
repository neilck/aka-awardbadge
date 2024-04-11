(async function renderHeader() {
  const contentElement = document.getElementById("akaprofiles-header");

  // Get the text and image data from the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  let name = "";
  let image = "";
  let description = "";

  let url = "";
  if (code && code != "") {
    url = `https://api.akaprofiles.com/getSessionDisplay?code=${code}`;
  }

  if (url != "") {
    const response = await fetch(url, { cache: "no-cache" });
    if (response.status == 200) {
      const data = await response.json();
      if (data) {
        name = data.title || "";
        description = data.description || "";
        image = data.image || "";
      }
    }
  }

  if (name.length > 80) {
    name = name.substring(0, 80) + "...";
  }

  if (description.length > 80) {
    description = description.substring(0, 80) + "...";
  }

  // Check if text and imageUrl are present
  if (name != "") {
    contentElement.innerHTML = `
      <div class="akah-container">
      <img src="${image}" alt="Image description" class="akah-image">
      <div class="akah-content">
        <p class="akah-title">${name}</p>
        <p class="akah-text">${description}</p>
      </div>
    </div>
      `;
  } else {
    contentElement.innerHTML = "not found";
  }
})();
