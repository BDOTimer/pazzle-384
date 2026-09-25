import { createEl, setHidden } from "../utils/dom.js";

export function createCommanderPanel({ root, onClose = () => {} } = {}) {
  const name = createEl("h2", { className: "ui-panel__title", text: "КОМАНДИР" });
  const rank = createEl("p", { className: "ui-commander__rank", text: "КАНОН" });
  const license = createEl("p", { className: "ui-commander__license", text: "ЛИЦЕНЗИЯ № 0000" });
  const vessel = createEl("p", { className: "ui-commander__vessel", text: "КОРАБЛЬ: НЕТ ДАННЫХ" });
  const progress = createEl("i", { className: "ui-meter__fill" });
  const points = createEl("span", { text: "0" });
  const panel = createEl("section", { className: "ui-modal ui-commander", role: "dialog", "aria-modal": "true", "aria-labelledby": "commander-title" }, [
    createEl("div", { className: "ui-panel__eyebrow", text: "ФЕДЕРАЛЬНЫЙ РЕЕСТР" }),
    name,
    rank,
    license,
    vessel,
    createEl("div", { className: "ui-meter" }, [progress]),
    createEl("div", { className: "ui-commander__points" }, [createEl("span", { text: "ОЧКИ КОМАНДИРА" }), points]),
    createEl("button", { className: "ui-button ui-button--primary", type: "button", text: "ЗАКРЫТЬ", onClick: onClose })
  ]);
  name.id = "commander-title";
  root.append(panel);
  setHidden(panel, true);
  let onCloseAction = onClose;

  return {
    open(model = {}) {
      onCloseAction = model.onClose || onCloseAction;
      this.update(model);
      setHidden(panel, false);
    },
    update(model = {}) {
      const commander = model.commander || {};
      const stats = commander.stats || {};
      const pointsValue = (stats.hyperspaces || 0) * 900 + (stats.kills || 0) * 450 + (stats.trades || 0) * 160 + (stats.cargoDelivered || 0) * 80;
      const ranks = ["КАНОН", "ПИЛОТ", "КОРПУС", "КОМАНДИР", "ЛЕГЕНДА", "ЗВЕЗДНЫЙ ЛОДЖИСТ"];
      const rankIndex = Math.min(ranks.length - 1, Math.floor(pointsValue / 18000));
      name.textContent = commander.pilot || "НОВЫЙ КОМАНДИР";
      rank.textContent = ranks[rankIndex];
      license.textContent = `ЛИЦЕНЗИЯ № ${String(commander.seed || 0).slice(-6).padStart(6, "0")}`;
      vessel.textContent = `КОРАБЛЬ: ${(commander.shipName || "НЕТ ДАННЫХ").toUpperCase()}`;
      points.textContent = pointsValue.toLocaleString("ru-RU");
      progress.style.width = `${Math.min(100, (pointsValue % 18000) / 180)}%`;
    },
    close() {
      setHidden(panel, true);
      onCloseAction();
    },
    dispose() {
      panel.remove();
    }
  };
}
