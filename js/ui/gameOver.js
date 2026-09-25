import { createEl, setHidden } from "../utils/dom.js";

export function createGameOver({ root, onRestart = () => {}, onMenu = () => {} } = {}) {
  const credits = createEl("strong", { text: "0" });
  const kills = createEl("strong", { text: "0" });
  const distance = createEl("strong", { text: "0" });
  const hyperspaces = createEl("strong", { text: "0" });
  const panel = createEl("section", { className: "ui-modal ui-gameover", role: "dialog", "aria-modal": "true", "aria-labelledby": "gameover-title" }, [
    createEl("div", { className: "ui-panel__eyebrow", text: "СИГНАЛ КОРАБЛЯ ПОТЕРЯН" }),
    createEl("h2", { id: "gameover-title", className: "ui-panel__title", text: "КОМАНДИР ПОГИБ" }),
    createEl("p", { className: "ui-gameover__text", text: "Обломки дрейфуют в пустоте. Начать новую экспедицию?" }),
    createEl("dl", { className: "ui-stats" }, [
      createEl("div", {}, [createEl("dt", { text: "КРЕДИТЫ" }), credits]),
      createEl("div", {}, [createEl("dt", { text: "УНИЧТОЖЕНО" }), kills]),
      createEl("div", {}, [createEl("dt", { text: "ПРОЙДЕНО" }), distance]),
      createEl("div", {}, [createEl("dt", { text: "ГИПЕРПЕРЕХОДЫ" }), hyperspaces])
    ]),
    createEl("div", { className: "ui-gameover__actions" }, [
      createEl("button", { className: "ui-button ui-button--primary", type: "button", text: "НОВЫЙ КОМАНДИР", onClick: onRestart }),
      createEl("button", { className: "ui-button", type: "button", text: "ГЛАВНОЕ МЕНЮ", onClick: onMenu })
    ])
  ]);
  root.append(panel);
  setHidden(panel, true);

  return {
    show(summary = {}) {
      credits.textContent = Math.floor(summary.credits || 0).toLocaleString("ru-RU");
      kills.textContent = Math.floor(summary.kills || 0);
      distance.textContent = `${Math.floor(summary.distance || 0).toLocaleString("ru-RU")} LY`;
      hyperspaces.textContent = Math.floor(summary.hyperspaces || 0);
      setHidden(panel, false);
      requestAnimationFrame(() => panel.querySelector("button")?.focus());
    },
    hide() {
      setHidden(panel, true);
    },
    dispose() {
      panel.remove();
    }
  };
}
