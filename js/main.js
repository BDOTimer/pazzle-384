import { APP_CONFIG, STORAGE_CONFIG } from "./config.js";
import { ACTIONS, createStore } from "./state.js";
import { createRenderContext } from "./core/renderer.js";
import { createInput } from "./core/input.js";
import { createAudio } from "./core/audio.js";
import { createSaveGame } from "./core/saveGame.js";
import { createScreenManager } from "./core/sceneManager.js";
import { createLoader } from "./ui/loader.js";
import { createPauseMenu } from "./ui/pauseMenu.js";
import { createGameOver } from "./ui/gameOver.js";
import { createCommanderPanel } from "./ui/commanderPanel.js";
import { createMenuScreen } from "./screens/menuScreen.js";
import { createSpaceScreen } from "./screens/spaceScreen.js";
import { createStationScreen } from "./screens/stationScreen.js";
import { createGalaxyScreen } from "./screens/galaxyScreen.js";
import { getShipType } from "./data/shipTypes.js";

const RESUMABLE_SCREENS = new Set(["space", "station", "galaxy"]);

function validateSave(envelope) {
  if (!envelope || envelope.version !== STORAGE_CONFIG.version) return false;
  if (!envelope.state || typeof envelope.state !== "object") return false;
  if (!envelope.resume || !RESUMABLE_SCREENS.has(envelope.resume.screenId)) return false;
  if (!envelope.state.run) return true;
  const run = envelope.state.run;
  return Boolean(
    run.seed &&
    run.currentSystemId &&
    run.ship &&
    run.ship.maxHull > 0 &&
    run.ship.maxShield >= 0 &&
    Array.isArray(run.cargo) &&
    run.upgrades
  );
}

export async function boot(root = document) {
  const screenRoot = root.querySelector("#screen-root");
  const uiRoot = root.querySelector("#ui-root");
  const loadingRoot = root.querySelector("#loading-root");
  const canvas = root.querySelector("#game-canvas");
  if (!screenRoot || !uiRoot || !loadingRoot || !canvas) throw new Error("Application roots are missing");

  const loader = createLoader(loadingRoot);
  loader.show("ПОДГОТОВКА СИСТЕМЫ");
  const store = createStore();
  const saveGame = createSaveGame({
    key: STORAGE_CONFIG.key,
    version: STORAGE_CONFIG.version,
    validate: validateSave
  });
  const loadedSave = saveGame.load();
  if (loadedSave) store.dispatch({ type: ACTIONS.LOAD_SAVE, payload: loadedSave.state });
  loader.setProgress(0.2, "СОХРАНЕНИЕ КОМАНДИРА");

  let renderContext;
  try {
    renderContext = createRenderContext(canvas, APP_CONFIG.renderer);
  } catch (error) {
    loader.fail("WEBGL НЕДОСТУПЕН");
    throw error;
  }
  loader.setProgress(0.42, "КАЛИБРОВКА РЕНДЕРЕРА");
  const initialState = store.getState();
  const audio = createAudio(initialState.settings);
  let screenManager = null;
  let pauseMenu = null;
  let gameOver = null;
  let commanderPanel = null;
  let lastPlayableScreen = loadedSave?.resume?.screenId || "space";
  let disposed = false;

  const input = createInput({
    canvas,
    onPause: () => togglePause()
  });
  loader.setProgress(0.58, "ПОДКЛЮЧЕНИЕ УПРАВЛЕНИЯ");

  const getCommander = () => {
    const state = store.getState();
    const run = state.run;
    if (!run) {
      return {
        pilot: "НОВЫЙ КОМАНДИР",
        seed: 0,
        shipName: "НЕТ ДАННЫХ",
        stats: {}
      };
    }
    return {
      pilot: run.pilot,
      seed: run.seed,
      shipName: getShipType(run.ship.typeId).name,
      stats: run.stats
    };
  };

  const openCommander = (returnToPause = false) => {
    commanderPanel.open({
      commander: getCommander(),
      onClose: () => {
        if (returnToPause && screenManager?.isPaused()) {
          pauseMenu.open(store.getState().settings);
        }
      }
    });
  };

  const saveCurrent = () => {
    const state = store.getState();
    if (!state.run || state.run.gameOver) {
      saveGame.clear();
      return false;
    }
    const activeId = screenManager?.getActiveId();
    if (RESUMABLE_SCREENS.has(activeId)) lastPlayableScreen = activeId;
    return saveGame.save(state, { screenId: lastPlayableScreen, params: {} });
  };

  const navigate = (id, params = {}) => {
    const result = screenManager?.goTo(id, params) || false;
    if (result) {
      pauseMenu?.close();
      saveCurrent();
    }
    return result;
  };

  const startNewGame = (payload) => {
    store.dispatch({ type: ACTIONS.NEW_GAME, payload });
    lastPlayableScreen = "space";
    gameOver.hide();
    audio.play("jump");
    navigate("space", { hyperspace: false });
  };

  const continueGame = () => {
    const envelope = saveGame.load();
    if (!envelope?.state?.run) return;
    store.dispatch({ type: ACTIONS.LOAD_SAVE, payload: envelope.state });
    lastPlayableScreen = RESUMABLE_SCREENS.has(envelope.resume?.screenId) ? envelope.resume.screenId : "space";
    gameOver.hide();
    navigate(lastPlayableScreen, envelope.resume?.params || {});
  };

  const showGameOver = (summary) => {
    saveGame.clear();
    gameOver.show(summary);
  };

  const returnToMenu = () => {
    const state = store.getState();
    if (state.run?.gameOver) {
      store.dispatch({ type: ACTIONS.CLEAR_RUN });
      saveGame.clear();
    } else {
      saveCurrent();
    }
    gameOver.hide();
    screenManager?.setPaused(false);
    pauseMenu?.close();
    navigate("menu");
  };

  const togglePause = () => {
    if (!screenManager || screenManager.getActiveId() !== "space" || store.getState().run?.gameOver) return;
    if (!pauseMenu) return;
    if (screenManager.isPaused()) {
      screenManager.setPaused(false);
      pauseMenu.close();
      audio.resume();
    } else {
      screenManager.setPaused(true);
      pauseMenu.open(store.getState().settings);
    }
  };

  pauseMenu = createPauseMenu({
    root: uiRoot,
    onResume: togglePause,
    onSave: () => {
      saveCurrent();
      audio.play("ui");
    },
    onCommander: () => openCommander(true),
    onMenu: returnToMenu
  });
  gameOver = createGameOver({
    root: uiRoot,
    onRestart: () => {
      const pilot = store.getState().run?.pilot || "НОВЫЙ КОМАНДИР";
      startNewGame({ pilot, shipTypeId: "courier", seed: (Date.now() ^ 0x5f3759df) >>> 0, currentSystemId: "sys-01" });
    },
    onMenu: returnToMenu
  });
  commanderPanel = createCommanderPanel({ root: uiRoot });
  loader.setProgress(0.74, "СБОРКА ИНТЕРФЕЙСА");

  const menuScreen = createMenuScreen({
    root: screenRoot,
    getState: store.getState,
    onContinue: continueGame,
    onNewGame: startNewGame,
    onCommander: () => openCommander(false)
  });
  const spaceScreen = createSpaceScreen({
    root: screenRoot,
    renderContext,
    input,
    audio,
    getState: store.getState,
    dispatch: store.dispatch,
    actions: ACTIONS,
    navigate,
    onDeath: showGameOver,
    onCommander: () => openCommander(false)
  });
  const stationScreen = createStationScreen({
    root: screenRoot,
    getState: store.getState,
    dispatch: store.dispatch,
    actions: ACTIONS,
    navigate,
    audio,
    onCommander: () => openCommander(false)
  });
  const galaxyScreen = createGalaxyScreen({
    root: screenRoot,
    getState: store.getState,
    dispatch: store.dispatch,
    actions: ACTIONS,
    navigate,
    audio,
    onCommander: () => openCommander(false)
  });

  screenManager = createScreenManager({
    screens: {
      menu: menuScreen,
      space: spaceScreen,
      station: stationScreen,
      galaxy: galaxyScreen
    },
    initialId: "menu",
    onError: (error) => {
      console.error(error);
      loader.fail("НЕИЗВЕСТНАЯ ОШИБКА ИГРОВОГО ЯДРА");
    }
  });

  uiRoot.addEventListener("ui-volume", (event) => {
    const volume = Number(event.detail);
    store.dispatch({ type: ACTIONS.SET_SETTING, payload: { masterVolume: volume } });
    audio.setMasterVolume(volume);
  });
  uiRoot.addEventListener("ui-mute", (event) => {
    const muted = Boolean(event.detail);
    store.dispatch({ type: ACTIONS.SET_SETTING, payload: { muted } });
    audio.setMuted(muted);
  });

  const unlockAudio = () => {
    audio.unlock();
    audio.setMasterVolume(store.getState().settings.masterVolume);
    audio.setMuted(store.getState().settings.muted);
  };
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });

  const onVisibilityChange = () => {
    if (document.hidden && screenManager.getActiveId() === "space" && !screenManager.isPaused()) {
      screenManager.setPaused(true);
      pauseMenu.open(store.getState().settings);
    }
  };
  const onBeforeUnload = () => saveCurrent();
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("beforeunload", onBeforeUnload);

  loader.setProgress(0.9, "ЗАПУСК ГАЛАКТИКИ");
  screenManager.start("menu");
  loader.setProgress(1, "ГОТОВ К ПОЛЁТУ");
  window.setTimeout(() => loader.hide(), 180);

  let animationFrame = 0;
  let previousTime = performance.now();
  let accumulator = 0;
  let saveTimer = 0;
  const fixedStep = APP_CONFIG.flight.fixedStep;
  const frame = (time) => {
    if (disposed) return;
    const frameTime = Math.min(0.1, Math.max(0, (time - previousTime) / 1000));
    previousTime = time;
    saveTimer += frameTime;
    if (screenManager.getActiveId() === "space" && !screenManager.isPaused()) {
      accumulator = Math.min(accumulator + frameTime, fixedStep * APP_CONFIG.flight.maxSubSteps);
      let steps = 0;
      while (accumulator >= fixedStep && steps < APP_CONFIG.flight.maxSubSteps) {
        screenManager.update(fixedStep);
        accumulator -= fixedStep;
        steps += 1;
      }
    } else {
      screenManager.update(frameTime);
    }
    screenManager.render(accumulator / fixedStep);
    if (saveTimer >= APP_CONFIG.saveInterval / 1000) {
      saveTimer = 0;
      saveCurrent();
    }
    animationFrame = requestAnimationFrame(frame);
  };
  animationFrame = requestAnimationFrame(frame);

  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(animationFrame);
    saveCurrent();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("beforeunload", onBeforeUnload);
    screenManager.dispose();
    input.dispose();
    renderContext.dispose();
    audio.dispose();
    pauseMenu.dispose();
    gameOver.dispose();
    commanderPanel.dispose();
    loader.dispose();
  };
}

boot(document).catch((error) => {
  console.error(error);
});
