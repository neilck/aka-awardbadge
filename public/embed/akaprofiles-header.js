(async function () {
  const contentElement = document.getElementById("akaprofiles-header");

  // Get the text and image data from the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const badge = urlParams.get("badge");
  const group = urlParams.get("group");
  let name = "";
  let image = "";
  let description = "";

  let url = "";
  if (badge && badge != "") {
    url = `http://api.akaprofiles.com/badges?id=${badge}`;
  }

  if (url == "") {
    url = `https://api.akaprofiles.com/groups?id=${group}`;
  }

  if (url != "") {
    const response = await fetch(url, { cache: "no-cache" });
    if (response.status == 200) {
      const data = await response.json();
      if (data) {
        name = data.name || "";
        description = data.description || "";
        image = data.thumbnail || "";
        if (image == "") {
          image = data.image || "";
        }
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
  if (name) {
    contentElement.innerHTML = `
      <div class="akah-container">
      <img src="${image}" alt="Image description" class="akah-image">
      <div class="akah-content">
        <h2 class="akah-title">${name}</h2>
        <p class="akah-text">${description}</p>
      </div>
    </div>
      `;
  } else {
    contentElement.textContent = "not found";
  }
})();
