const BOOLEAN_ATTRIBUTES = new Set(["checked", "disabled", "hidden", "multiple", "open", "readonly", "required", "selected"]);

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

export function createEl(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([name, value]) => {
    if (name === "className") {
      element.className = value;
    } else if (name === "dataset") {
      Object.assign(element.dataset, value);
    } else if (name === "text") {
      element.textContent = value;
    } else if (name === "html") {
      element.innerHTML = value;
    } else if (name.startsWith("on") && typeof value === "function") {
      element.addEventListener(name.slice(2).toLowerCase(), value);
    } else if (BOOLEAN_ATTRIBUTES.has(name)) {
      if (value) element.setAttribute(name, "");
      else element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  });
  const list = Array.isArray(children) ? children : [children];
  list.filter(Boolean).forEach((child) => {
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return element;
}

export function clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function setHidden(element, hidden = true) {
  if (!element) return;
  element.hidden = hidden;
  element.classList.toggle("is-hidden", hidden);
}
