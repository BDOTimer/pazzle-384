import { createEl, setHidden } from "../utils/dom.js";

export function createPauseMenu({ root, onResume = () => {}, onSave = () => {}, onCommander = () => {}, onMenu = () => {} } = {}) {
  const volume = createEl("input", { type: "range", min: "0", max: "1", step: "0.05", value: "0.55", className: "ui-range" });
  const mute = createEl("input", { type: "checkbox", className: "ui-checkbox" });
  const panel = createEl("section", { className: "ui-modal ui-pause", role: "dialog", "aria-modal": "true", "aria-labelledby": "pause-title" }, [
    createEl("div", { className: "ui-panel__eyebrow", text: "СИСТЕМА ПРИОСТАНОВЛЕНА" }),
    createEl("h2", { id: "pause-title", className: "ui-panel__title", text: "ПАУЗА" }),
    createEl("div", { className: "ui-pause__actions" }, [
      createEl("button", { className: "ui-button ui-button--primary", type: "button", text: "ПРОДОЛЖИТЬ", onClick: onResume }),
      createEl("button", { className: "ui-button", type: "button", text: "СОХРАНИТЬ", onClick: onSave }),
      createEl("button", { className: "ui-button", type: "button", text: "КОМАНДИР", onClick: onCommander }),
      createEl("button", { className: "ui-button ui-button--danger", type: "button", text: "В ГЛАВНОЕ МЕНЮ", onClick: onMenu })
    ]),
    createEl("div", { className: "ui-settings" }, [
      createEl("label", { className: "ui-settings__row" }, [createEl("span", { text: "ГРОМКОСТЬ" }), volume]),
      createEl("label", { className: "ui-settings__row" }, [createEl("span", { text: "ЗВУК" }), mute])
    ])
  ]);
  root.append(panel);
  setHidden(panel, true);
  let open = false;

  volume.addEventListener("input", () => {
    volume.dispatchEvent(new CustomEvent("ui-volume", { bubbles: true, detail: Number(volume.value) }));
  });
  mute.addEventListener("change", () => {
    mute.dispatchEvent(new CustomEvent("ui-mute", { bubbles: true, detail: mute.checked }));
  });

  return {
    open(model = {}) {
      open = true;
      if (Number.isFinite(model.volume)) volume.value = String(model.volume);
      mute.checked = Boolean(model.muted);
      setHidden(panel, false);
      requestAnimationFrame(() => panel.querySelector("button")?.focus());
    },
    close() {
      open = false;
      setHidden(panel, true);
    },
    toggle(model) {
      if (open) this.close();
      else this.open(model);
    },
    isOpen: () => open,
    setModel(model = {}) {
      if (Number.isFinite(model.volume)) volume.value = String(model.volume);
      mute.checked = Boolean(model.muted);
    },
    dispose() {
      panel.remove();
    }
  };
}
