import { createEl, setHidden } from "../utils/dom.js";
import { APP_CONFIG } from "../config.js";
import { getCommodity } from "../data/commodities.js";
import { createGalaxy } from "../data/galaxyData.js";
import { getShipType, SHIP_TYPES, UPGRADE_TYPES, getUpgradeCost, getUpgradeRefund } from "../data/shipTypes.js";
import { getCargoQuantity } from "../state.js";

const formatCredits = (value) => Math.floor(value).toLocaleString("ru-RU");

export function createStationScreen({ root, getState, dispatch, actions, navigate, audio, onCommander = () => {} } = {}) {
  const title = createEl("h1", { text: "ОРБИТАЛЬНАЯ СТАНЦИЯ" });
  const subtitle = createEl("p", { className: "station-header__subtitle", text: "" });
  const credits = createEl("strong", { className: "station-header__credits", text: "0 CR" });
  const tabs = createEl("nav", { className: "station-tabs", "aria-label": "Станция" });
  const content = createEl("section", { className: "station-content" });
  const screen = createEl("section", { className: "station-screen", "aria-label": "Станция" }, [
    createEl("header", { className: "station-header" }, [
      createEl("div", { className: "station-header__mark", text: "S" }),
      createEl("div", {}, [title, subtitle]),
      createEl("div", { className: "station-header__right" }, [credits, createEl("button", { className: "ui-button", type: "button", text: "КОМАНДИР", onClick: onCommander })])
    ]),
    tabs,
    content
  ]);
  root.append(screen);
  setHidden(screen, true);
  let galaxy = null;
  let system = null;
  let market = [];
  let mode = "market";
  let abortController = null;

  const setMode = (nextMode) => {
    mode = nextMode;
    refresh();
  };

  const renderTabs = () => {
    const items = [
      ["market", "РЫНОК"],
      ["upgrades", "МОДИФИКАЦИИ"],
      ["hangar", "АНГАР И ТОПЛИВО"],
      ["departure", "ПОЛЁТ"]
    ];
    tabs.replaceChildren(...items.map(([id, label]) => {
      const button = createEl("button", { type: "button", className: `station-tab${mode === id ? " is-active" : ""}`, text: label });
      button.dataset.mode = id;
      return button;
    }));
  };

  const renderHeader = () => {
    const state = getState();
    const ship = getShipType(state.run.ship.typeId);
    title.textContent = system.station.name;
    subtitle.textContent = `${system.name.toUpperCase()} · ${system.government.toUpperCase()} · ${ship.name.toUpperCase()}`;
    credits.textContent = `${formatCredits(state.run.credits)} CR`;
  };

  const cargoUsed = () => getState().run.cargo.reduce((sum, item) => sum + item.quantity, 0);
  const cargoLeft = () => Math.max(0, getState().run.ship.cargoCapacity - cargoUsed());

  const renderMarket = () => {
    const state = getState();
    const header = createEl("div", { className: "station-section__header" }, [
      createEl("div", {}, [
        createEl("span", { text: "КОММЕРЧЕСКИЙ БЛОК" }),
        createEl("h2", { text: "ТОВАРЫ И ЦЕНЫ" })
      ]),
      createEl("div", { className: "cargo-gauge" }, [
        createEl("span", { text: `ТРЮМ ${cargoUsed()}/${state.run.ship.cargoCapacity}` }),
        createEl("i", {}, [createEl("b", { style: `width:${state.run.ship.cargoCapacity ? (cargoUsed() / state.run.ship.cargoCapacity) * 100 : 0}%` })])
      ])
    ]);
    const list = createEl("div", { className: "market-grid" }, market.map((entry) => {
      const commodity = getCommodity(entry.commodityId);
      const held = getCargoQuantity(state, entry.commodityId);
      const canBuy = state.run.credits >= entry.buyPrice * 5 && cargoLeft() >= 5 && entry.stock >= 5;
      const canSell = held >= 1;
      const buy = createEl("button", { type: "button", className: "ui-button ui-button--primary", text: "КУПИТЬ 5", disabled: !canBuy });
      const sell = createEl("button", { type: "button", className: "ui-button", text: held > 0 ? `ПРОДАТЬ ${Math.min(5, held)}` : "НЕТ", disabled: !canSell });
      buy.dataset.action = "buy";
      buy.dataset.commodity = entry.commodityId;
      sell.dataset.action = "sell";
      sell.dataset.commodity = entry.commodityId;
      return createEl("article", { className: `market-card${commodity.legal ? "" : " is-illegal"}` }, [
        createEl("div", { className: "market-card__head" }, [
          createEl("strong", { text: commodity.name }),
          createEl("span", { className: entry.trend >= 0 ? "is-positive" : "is-negative", text: `${entry.trend >= 0 ? "+" : ""}${entry.trend}%` })
        ]),
        createEl("div", { className: "market-card__price" }, [
          createEl("span", { text: "ПОКУПКА" }), createEl("strong", { text: `${entry.buyPrice} CR` })
        ]),
        createEl("div", { className: "market-card__price" }, [
          createEl("span", { text: "ПРОДАЖА" }), createEl("strong", { text: `${entry.sellPrice} CR` })
        ]),
        createEl("div", { className: "market-card__stock" }, [
          createEl("span", { text: `СКЛАД ${entry.stock}` }),
          createEl("span", { text: `В ТРЮМЕ ${held}` })
        ]),
        createEl("div", { className: "market-card__actions" }, [buy, sell])
      ]);
    }));
    content.replaceChildren(header, list);
  };

  const renderUpgrades = () => {
    const state = getState();
    const header = createEl("div", { className: "station-section__header" }, [
      createEl("div", {}, [createEl("span", { text: "СЛУЖБА ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ" }), createEl("h2", { text: "МОДИФИКАЦИИ" })]),
      createEl("p", { text: `УРОВЕНЬ ТЕХНОЛОГИЙ: ${system.tech}/5` })
    ]);
    const grid = createEl("div", { className: "upgrade-grid" }, UPGRADE_TYPES.map((upgrade) => {
      const level = state.run.upgrades[upgrade.id] || 0;
      const maxed = level >= upgrade.maxLevel;
      const cost = getUpgradeCost(upgrade.id, level);
      const refund = getUpgradeRefund(upgrade.id, level);
      const buy = createEl("button", { type: "button", className: "ui-button ui-button--primary", text: maxed ? "МАКС." : `${formatCredits(cost)} CR`, disabled: maxed || state.run.credits < cost });
      const sell = createEl("button", { type: "button", className: "ui-button", text: `ПРОДАТЬ +${formatCredits(refund)}`, disabled: !level });
      buy.dataset.action = "upgrade-buy";
      buy.dataset.upgrade = upgrade.id;
      sell.dataset.action = "upgrade-sell";
      sell.dataset.upgrade = upgrade.id;
      return createEl("article", { className: "upgrade-card" }, [
        createEl("div", { className: "upgrade-card__code", text: upgrade.short }),
        createEl("h3", { text: upgrade.name }),
        createEl("p", { text: upgrade.description }),
        createEl("div", { className: "upgrade-card__level", text: "▰".repeat(level) + "▱".repeat(upgrade.maxLevel - level) }),
        createEl("div", { className: "upgrade-card__actions" }, [buy, sell])
      ]);
    }));
    content.replaceChildren(header, grid);
  };

  const renderHangar = () => {
    const state = getState();
    const ship = getShipType(state.run.ship.typeId);
    const repairHull = state.run.ship.maxHull - state.run.ship.hull;
    const repairShield = state.run.ship.maxShield - state.run.ship.shield;
    const repairCost = repairHull * APP_CONFIG.economy.repairPrice + repairShield * APP_CONFIG.economy.shieldPrice;
    const fuelMissing = state.run.ship.maxFuel - state.run.ship.fuel;
    const fuelCost = fuelMissing * APP_CONFIG.economy.fuelPrice;
    const repair = createEl("button", { type: "button", className: "ui-button ui-button--primary", text: `РЕМОНТ · ${formatCredits(repairCost)} CR`, disabled: repairCost <= 0 || state.run.credits < repairCost });
    const refuel = createEl("button", { type: "button", className: "ui-button", text: `ЗАПРАВИТЬ · ${formatCredits(fuelCost)} CR`, disabled: fuelMissing <= 0 || state.run.credits < fuelCost });
    repair.dataset.action = "repair";
    refuel.dataset.action = "refuel";
    const currentStats = createEl("div", { className: "hangar-stats" }, [
      createEl("div", {}, [createEl("span", { text: "КОРПУС" }), createEl("strong", { text: `${state.run.ship.hull}/${state.run.ship.maxHull}` })]),
      createEl("div", {}, [createEl("span", { text: "ЩИТ" }), createEl("strong", { text: `${state.run.ship.shield}/${state.run.ship.maxShield}` })]),
      createEl("div", {}, [createEl("span", { text: "ТОПЛИВО" }), createEl("strong", { text: `${state.run.ship.fuel}/${state.run.ship.maxFuel}` })]),
      createEl("div", {}, [createEl("span", { text: "СКОРОСТЬ" }), createEl("strong", { text: `${ship.maxSpeed} U/S` })])
    ]);
    const shipGrid = createEl("div", { className: "ship-grid" }, SHIP_TYPES.map((candidate) => {
      const owned = candidate.id === state.run.ship.typeId;
      const button = createEl("button", { type: "button", className: `ship-card${owned ? " is-current" : ""}`, disabled: owned || state.run.credits < candidate.price });
      button.dataset.action = "ship";
      button.dataset.ship = candidate.id;
      button.append(
        createEl("span", { className: "ship-card__wire", text: candidate.short.slice(0, 1) }),
        createEl("strong", { text: candidate.name }),
        createEl("span", { text: candidate.description }),
        createEl("i", { text: owned ? "УСТАНОВЛЕН" : `${formatCredits(candidate.price)} CR` })
      );
      return button;
    }));
    content.replaceChildren(
      createEl("div", { className: "station-section__header" }, [
        createEl("div", {}, [createEl("span", { text: `Ангар ${system.station.name}` }), createEl("h2", { text: ship.name.toUpperCase() })]),
        createEl("div", { className: "hangar-actions" }, [repair, refuel])
      ]),
      currentStats,
      createEl("h3", { className: "hangar-subtitle", text: "ТОРГОВЫЙ ПОРТ" }),
      shipGrid
    );
  };

  const renderDeparture = () => {
    const state = getState();
    const next = state.run.targetSystemId;
    const launch = createEl("button", { type: "button", className: "station-departure__launch", text: "ОТСТОРОНИТЬСЯ" });
    const galaxy = createEl("button", { type: "button", className: "station-departure__galaxy", text: "КАРТА ГАЛАКТИКИ" });
    launch.dataset.action = "launch";
    galaxy.dataset.action = "galaxy";
    content.replaceChildren(
      createEl("div", { className: "departure-grid" }, [
        createEl("div", { className: "departure-visual" }, [
          createEl("span", { text: "СЕКТОР" }),
          createEl("strong", { text: system.short }),
          createEl("i", { text: "///" })
        ]),
        createEl("div", { className: "station-departure" }, [
          createEl("span", { text: next ? "МАРШРУТ ЗАРЕЗЕРВИРОВАН" : "ПУТЬ СВОБОДЕН" }),
          createEl("h2", { text: "КУДА ДАЛЬШЕ?" }),
          createEl("p", { text: "Покидайте станцию или выберите соседнюю систему на карте галактики." }),
          createEl("div", { className: "station-departure__actions" }, [launch, galaxy])
        ])
      ])
    );
  };

  function refresh() {
    renderTabs();
    renderHeader();
    if (mode === "market") renderMarket();
    if (mode === "upgrades") renderUpgrades();
    if (mode === "hangar") renderHangar();
    if (mode === "departure") renderDeparture();
  }

  tabs.addEventListener("click", (event) => {
    const next = event.target.closest("[data-mode]")?.dataset.mode;
    if (next) setMode(next);
  });

  content.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const state = getState();
    const action = button.dataset.action;
    if (action === "buy" || action === "sell") {
      const entry = market.find((item) => item.commodityId === button.dataset.commodity);
      if (!entry) return;
      if (action === "buy") {
        dispatch({ type: actions.BUY_CARGO, payload: { commodityId: entry.commodityId, quantity: 5, unitPrice: entry.buyPrice } });
      } else {
        const quantity = Math.min(5, getCargoQuantity(state, entry.commodityId));
        dispatch({ type: actions.SELL_CARGO, payload: { commodityId: entry.commodityId, quantity, unitPrice: entry.sellPrice } });
      }
      audio.play("coin");
      refresh();
    }
    if (action === "upgrade-buy" || action === "upgrade-sell") {
      const upgrade = UPGRADE_TYPES.find((item) => item.id === button.dataset.upgrade);
      const level = state.run.upgrades[upgrade.id];
      if (action === "upgrade-buy") {
        dispatch({ type: actions.BUY_UPGRADE, payload: { id: upgrade.id, maxLevel: upgrade.maxLevel, cost: getUpgradeCost(upgrade.id, level) } });
      } else {
        dispatch({ type: actions.SELL_UPGRADE, payload: { id: upgrade.id, refund: getUpgradeRefund(upgrade.id, level) } });
      }
      audio.play("coin");
      refresh();
    }
    if (action === "repair") {
      const repairHull = state.run.ship.maxHull - state.run.ship.hull;
      const repairShield = state.run.ship.maxShield - state.run.ship.shield;
      const cost = repairHull * APP_CONFIG.economy.repairPrice + repairShield * APP_CONFIG.economy.shieldPrice;
      if (cost <= 0 || state.run.credits < cost) return;
      dispatch({ type: actions.ADD_CREDITS, payload: { amount: -cost } });
      dispatch({ type: actions.REPAIR_AND_RECHARGE });
      audio.play("refuel");
      refresh();
    }
    if (action === "refuel") {
      const missing = state.run.ship.maxFuel - state.run.ship.fuel;
      const cost = missing * APP_CONFIG.economy.fuelPrice;
      if (missing <= 0 || state.run.credits < cost) return;
      dispatch({ type: actions.BUY_FUEL, payload: { quantity: missing } });
      audio.play("refuel");
      refresh();
    }
    if (action === "ship") {
      const ship = getShipType(button.dataset.ship);
      dispatch({ type: actions.CHANGE_SHIP, payload: { typeId: ship.id } });
      dispatch({ type: actions.REPAIR_AND_RECHARGE });
      audio.play("coin");
      refresh();
    }
    if (action === "launch") {
      dispatch({ type: actions.SET_LOCATION, payload: { stationId: null } });
      audio.play("dock");
      navigate("space", { launch: true });
    }
    if (action === "galaxy") {
      navigate("galaxy", { origin: "station" });
    }
  });

  return {
    id: "station",
    mount() {
      setHidden(screen, false);
    },
    enter() {
      abortController?.abort();
      abortController = new AbortController();
      const state = getState();
      if (!state.run) {
        navigate("menu");
        return;
      }
      galaxy = createGalaxy(state.run.seed);
      system = galaxy.systemById[state.run.currentSystemId] || galaxy.systems[0];
      market = system.market;
      mode = "market";
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
