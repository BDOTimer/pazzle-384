import { createEl, setHidden } from "../utils/dom.js";
import { createGalaxy, routesFrom, systemDistance } from "../data/galaxyData.js";
import { APP_CONFIG } from "../config.js";

const svgNamespace = "http://www.w3.org/2000/svg";

export function createGalaxyScreen({ root, getState, dispatch, actions, navigate, audio, onCommander = () => {} } = {}) {
  const map = createEl("div", { className: "galaxy-map" });
  const details = createEl("section", { className: "galaxy-details" });
  const launchButton = createEl("button", { className: "ui-button ui-button--primary galaxy-launch", type: "button", text: "ГИПЕРПЕРЕХОД" });
  const backButton = createEl("button", { className: "ui-button", type: "button", text: "НАЗАД" });
  const screen = createEl("section", { className: "galaxy-screen", "aria-label": "Карта галактики" }, [
    createEl("header", { className: "galaxy-header" }, [
      createEl("div", {}, [
        createEl("span", { className: "galaxy-header__eyebrow", text: "ГАЛАКТИЧЕСКИЙ ИНДЕКС" }),
        createEl("h1", { text: "КАРТА ГАЛАКТИКИ" })
      ]),
      createEl("div", { className: "galaxy-header__actions" }, [
        createEl("button", { className: "ui-button", type: "button", text: "КОМАНДИР", onClick: onCommander }),
        backButton
      ])
    ]),
    createEl("div", { className: "galaxy-layout" }, [map, details]),
    createEl("footer", { className: "galaxy-footer" }, [
      createEl("span", { text: "ЖЕЛТЫЙ — ТЕКУЩАЯ СИСТЕМА" }),
      createEl("span", { text: "БЕЛЫЙ — ВЫБРАННАЯ" }),
      createEl("span", { text: "ЛИНИЯ — ПРЯМОЙ МАРШРУТ" }),
      launchButton
    ])
  ]);
  root.append(screen);
  setHidden(screen, true);
  let galaxy = null;
  let current = null;
  let selected = null;
  let origin = "station";
  let abortController = null;

  const reachable = (systemId) => routesFrom(galaxy, current.id).some((system) => system.id === systemId);

  const renderDetails = () => {
    details.replaceChildren(
      createEl("div", { className: "galaxy-details__code", text: selected.short || "---" }),
      createEl("p", { className: "galaxy-details__name", text: selected.name }),
      createEl("div", { className: "galaxy-details__tags" }, [
        createEl("span", { text: selected.government }),
        createEl("span", { text: selected.economy }),
        createEl("span", { className: selected.danger >= 4 ? "is-danger" : "", text: `ОПАСНОСТЬ ${selected.danger}/5` }),
        createEl("span", { text: `ТЕХНО ${selected.tech}/5` })
      ]),
      createEl("dl", { className: "galaxy-details__stats" }, [
        createEl("div", {}, [createEl("dt", { text: "НАСЕЛЕНИЕ" }), createEl("dd", { text: `${selected.population.toLocaleString("ru-RU")} млн` })]),
        createEl("div", {}, [createEl("dt", { text: "НАЛОГ" }), createEl("dd", { text: `${selected.tax}%` })]),
        createEl("div", {}, [createEl("dt", { text: "СТАНЦИЯ" }), createEl("dd", { text: selected.station.name })]),
        createEl("div", {}, [createEl("dt", { text: "ПЛАНЕТЫ" }), createEl("dd", { text: String(selected.planets.length) })])
      ]),
      createEl("div", { className: "galaxy-details__planets" }, selected.planets.map((planet) => createEl("span", { text: planet.name })))
    );
  };

  const renderMap = () => {
    map.replaceChildren();
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    galaxy.routeList.forEach(([a, b]) => {
      const from = galaxy.systems[a];
      const to = galaxy.systems[b];
      const active = (from.id === current.id && to.id === selected.id) || (to.id === current.id && from.id === selected.id);
      const line = document.createElementNS(svgNamespace, "line");
      line.setAttribute("x1", from.x);
      line.setAttribute("y1", from.y);
      line.setAttribute("x2", to.x);
      line.setAttribute("y2", to.y);
      line.setAttribute("class", active ? "galaxy-route is-active" : "galaxy-route");
      svg.append(line);
    });
    map.append(svg);
    galaxy.systems.forEach((system) => {
      const node = createEl("button", {
        type: "button",
        className: `galaxy-node${system.id === current.id ? " is-current" : ""}${system.id === selected.id ? " is-selected" : ""}`,
        style: `left:${system.x}%;top:${system.y}%`,
        title: system.name,
        text: system.short
      });
      node.dataset.systemId = system.id;
      map.append(node);
    });
    renderDetails();
    updateLaunch();
  };

  const updateLaunch = () => {
    const state = getState();
    const same = selected.id === current.id;
    const connected = same || reachable(selected.id);
    const fuel = state.run.ship.fuel;
    launchButton.disabled = same || !connected || fuel < APP_CONFIG.hyperspace.fuelCost;
    if (same) {
      launchButton.textContent = "ВЫ НА ЗДЕСЬ";
    } else if (!connected) {
      launchButton.textContent = "НЕТ ПРЯМОГО МАРШРУТА";
    } else if (fuel < APP_CONFIG.hyperspace.fuelCost) {
      launchButton.textContent = "НЕДОСТАТОЧНО ТОПЛИВА";
    } else {
      launchButton.textContent = `ПЕРЕХОД · ${APP_CONFIG.hyperspace.fuelCost} F`;
    }
  };

  const selectSystem = (id) => {
    const next = galaxy.systemById[id];
    if (!next) return;
    selected = next;
    renderMap();
  };

  map.addEventListener("click", (event) => {
    const id = event.target.closest("[data-system-id]")?.dataset.systemId;
    if (id) selectSystem(id);
  });
  launchButton.addEventListener("click", () => {
    if (launchButton.disabled || selected.id === current.id) return;
    dispatch({
      type: actions.HYPERSPACE,
      payload: {
        targetSystemId: selected.id,
        fuelCost: APP_CONFIG.hyperspace.fuelCost,
        distance: APP_CONFIG.hyperspace.baseDistance + systemDistance(current, selected)
      }
    });
    audio.play("jump");
    navigate("space", { hyperspace: true });
  });
  backButton.addEventListener("click", () => {
    navigate(origin === "space" ? "space" : "station", { launch: origin === "station" });
  });

  return {
    id: "galaxy",
    mount() {
      setHidden(screen, false);
    },
    enter(params = {}) {
      abortController?.abort();
      abortController = new AbortController();
      const state = getState();
      if (!state.run) {
        navigate("menu");
        return;
      }
      galaxy = createGalaxy(state.run.seed);
      current = galaxy.systemById[state.run.currentSystemId] || galaxy.systems[0];
      selected = galaxy.systemById[state.run.targetSystemId] || current;
      origin = params.origin === "space" ? "space" : "station";
      setHidden(screen, false);
      renderMap();
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
