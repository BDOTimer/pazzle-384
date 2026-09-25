import { createEl, setHidden } from "../utils/dom.js";

export function createLoader(root) {
  const element = createEl("div", { className: "ui-loader", role: "status", "aria-live": "polite" }, [
    createEl("div", { className: "ui-loader__mark", text: "E//8" }),
    createEl("div", { className: "ui-loader__title", text: "ELITE // ZX REMASTER" }),
    createEl("div", { className: "ui-loader__track" }, [createEl("i", { className: "ui-loader__bar" })]),
    createEl("div", { className: "ui-loader__status", text: "ИНИЦИАЛИЗАЦИЯ СИСТЕМ" })
  ]);
  const bar = element.querySelector(".ui-loader__bar");
  const status = element.querySelector(".ui-loader__status");
  let progress = 0;
  root.append(element);
  setHidden(element, true);

  const render = () => {
    bar.style.width = `${Math.round(progress * 100)}%`;
  };

  return {
    show(label = "ЗАГРУЗКА") {
      progress = 0;
      status.textContent = label;
      render();
      setHidden(element, false);
    },
    setProgress(value, label) {
      progress = Math.max(progress, Math.max(0, Math.min(1, Number(value) || 0)));
      if (label) status.textContent = label;
      render();
    },
    fail(message = "ОШИБКА ЗАГРУЗКИ") {
      progress = 1;
      status.textContent = message;
      bar.style.background = "var(--red)";
      render();
      setHidden(element, false);
    },
    hide() {
      setHidden(element, true);
    },
    dispose() {
      element.remove();
    }
  };
}
