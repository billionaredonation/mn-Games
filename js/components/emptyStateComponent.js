export function createEmptyState(title, text) {
  const section = document.createElement("section");
  section.className = "empty";

  section.innerHTML = `
    <strong>${title}</strong>
    <p>${text}</p>
  `;

  return section;
}
