import { createEl, setHidden } from "../utils/dom.js";
import { SHIP_TYPES, getShipType } from "../data/shipTypes.js";

export function createMenuScreen({ root, getState, onContinue, onNewGame, onCommander = () => {} } = {}) {
  const pilotInput = createEl("input", { className: "ui-input", name: "pilot", maxlength: "18", value: "НОВЫЙ КОМАНДИР", autocomplete: "off" });
  const shipSelect = createEl("select", { className: "ui-select", name: "ship" }, SHIP_TYPES.map((ship) => createEl("option", { value: ship.id, text: ship.name })));
  const continueButton = createEl("button", { className: "ui-button ui-button--primary menu-launch", type: "button", text: "ПРОДОЛЖИТЬ" });
  const createForm = createEl("form", { className: "menu-create" }, [
    createEl("div", { className: "menu-create__heading" }, [
      createEl("span", { text: "НОВЫЙ КОМАНДИР" }),
      createEl("i", { text: "REC" })
    ]),
    createEl("label", { className: "menu-field" }, [createEl("span", { text: "ПОЗЫВНОЙ" }), pilotInput]),
    createEl("label", { className: "menu-field" }, [createEl("span", { text: "КОРАБЛЬ" }), shipSelect]),
    createEl("button", { className: "ui-button ui-button--primary menu-launch", type: "submit", text: "НАЧАТЬ ПОЛЁТ" })
  ]);
  const savedBlock = createEl("div", { className: "menu-saved" });
  const screen = createEl("section", { className: "menu-screen", "aria-label": "Главное меню" }, [
    createEl("div", { className: "menu-screen__scanline" }),
    createEl("header", { className: "menu-header" }, [
      createEl("div", { className: "menu-header__sigil", text: "E8" }),
      createEl("div", {}, [
        createEl("p", { className: "menu-header__kicker", text: "SPECTRUM NAVIGATION SYSTEM // REV. 8" }),
        createEl("h1", { className: "menu-header__title" }, [createEl("span", { text: "ELITE" }), createEl("em", { text: "REMASTER" })])
      ]),
      createEl("button", { className: "ui-button menu-header__commander", type: "button", text: "КОМАНДИР", onClick: onCommander })
    ]),
    createEl("main", { className: "menu-main" }, [
      createEl("section", { className: "menu-hero" }, [
        createEl("p", { className: "menu-hero__eyebrow", text: "СВОБОДНЫЙ ТОРГОВЕЦ · 3251" }),
        createEl("h2", { className: "menu-hero__title", text: "БЕСКОНЕЧНОСТЬ\nНЕ ЗАКОНЧИТСЯ." }),
        createEl("p", { className: "menu-hero__text", text: "Пробирайте звёздные системы, торгуйте, собирайте осколки и держитесь дальше от закона." }),
        createEl("div", { className: "menu-controls" }, [
          createEl("span", { html: "<kbd>W S</kbd> тяга" }),
          createEl("span", { html: "<kbd>мышь</kbd> курс" }),
          createEl("span", { html: "<kbd>F / ЛКМ</kbd> огонь" }),
          createEl("span", { html: "<kbd>Space</kbd> стыковка" }),
          createEl("span", { html: "<kbd>G</kbd> галактика" }),
          createEl("span", { html: "<kbd>Esc</kbd> пауза" })
        ])
      ]),
      createEl("aside", { className: "menu-console" }, [savedBlock, continueButton, createForm])
    ]),
    createEl("footer", { className: "menu-footer" }, [
      createEl("span", { text: "THREE.JS // WEBGL" }),
      createEl("span", { text: "ORIGINAL PROCEDURAL VECTOR ASSETS" }),
      createEl("span", { text: "v1.0" })
    ])
  ]);
  root.append(screen);
  setHidden(screen, true);
  let abortController = null;

  const refresh = () => {
    const run = getState().run;
    continueButton.disabled = !run;
    savedBlock.replaceChildren();
    if (!run) return;
    const ship = getShipType(run.ship.typeId);
    savedBlock.append(
      createEl("span", { className: "menu-saved__label", text: "ПОСЛЕДНЯЯ ЗАПИСЬ" }),
      createEl("strong", { text: run.pilot }),
      createEl("span", { text: `${ship.short} · ${run.credits.toLocaleString("ru-RU")} CR` })
    );
  };

  createForm.addEventListener("submit", (event) => {
    event.preventDefault();
    onNewGame({
      pilot: pilotInput.value,
      shipTypeId: shipSelect.value,
      seed: (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0,
      currentSystemId: "sys-01"
    });
  });
  continueButton.addEventListener("click", onContinue);

  return {
    id: "menu",
    mount() {
      setHidden(screen, false);
    },
    enter() {
      abortController?.abort();
      abortController = new AbortController();
      setHidden(screen, false);
      refresh();
    },
    update() {},
    render() {},
    exit() {
      setHidden(screen, true);
    },
    dispose() {
      abortController?.abort();
      screen.remove();
    }
  };
}
