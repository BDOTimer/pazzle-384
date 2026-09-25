import * as THREE from "three";
import { createEl, setHidden } from "../utils/dom.js";
import { APP_CONFIG } from "../config.js";
import { createGalaxy } from "../data/galaxyData.js";
import { getShipType } from "../data/shipTypes.js";
import { createRng } from "../utils/rng.js";
import { createStars } from "../world/stars.js";
import { createDust } from "../world/dust.js";
import { createPlanets } from "../world/planets.js";
import { createStations } from "../world/stations.js";
import { createMeteors } from "../world/meteors.js";
import { createEnemies } from "../world/enemies.js";
import { createPlayer } from "../entities/player.js";
import { createLaserSystem } from "../entities/lasers.js";
import { createHitEffects } from "../entities/hitEffects.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const relative = new THREE.Vector3();
const radarForward = new THREE.Vector3();
const radarRight = new THREE.Vector3();
const radarUp = new THREE.Vector3();
const collisionDirection = new THREE.Vector3();

export function createSpaceScreen({ root, renderContext, input, audio, getState, dispatch, actions, navigate, onDeath = () => {}, onCommander = () => {} } = {}) {
  const worldRoot = new THREE.Group();
  const entityRoot = new THREE.Group();
  const effectRoot = new THREE.Group();
  const scene = renderContext.scene;
  const systemName = createEl("strong", { text: "НЕИЗВЕСТНАЯ СИСТЕМА" });
  const stationName = createEl("span", { text: "СТАНЦИЯ: НЕТ ДАННЫХ" });
  const credits = createEl("strong", { text: "0 CR" });
  const shieldText = createEl("span", { text: "0/0" });
  const hullText = createEl("span", { text: "0/0" });
  const shieldBar = createEl("i");
  const hullBar = createEl("i");
  const speedValue = createEl("strong", { text: "0" });
  const throttleValue = createEl("span", { text: "0%" });
  const fuelValue = createEl("strong", { text: "0/0" });
  const fuelBar = createEl("i");
  const cargoValue = createEl("strong", { text: "0/0" });
  const targetText = createEl("span", { text: "ЦЕЛЬ: НЕТ" });
  const targetDistance = createEl("strong", { text: "" });
  const message = createEl("div", { className: "hud-message" });
  const dockPrompt = createEl("div", { className: "hud-dock" }, [createEl("kbd", { text: "SPACE" }), createEl("span", { text: "СТЫКОВКА" })]);
  const stationMarker = createEl("div", { className: "hud-marker hud-marker--station" }, [createEl("i"), createEl("span", { text: "СТАНЦИЯ" })]);
  const enemyMarker = createEl("div", { className: "hud-marker hud-marker--enemy" }, [createEl("i"), createEl("span", { text: "ПИРАТ" })]);
  const damageFlash = createEl("div", { className: "hud-damage" });
  const radar = createEl("canvas", { className: "hud-radar__canvas", width: "120", height: "120" });
  const radarContext = radar.getContext("2d");
  const hud = createEl("section", { className: "hud", "aria-label": "Игровой интерфейс" }, [
    createEl("div", { className: "hud-top" }, [
      createEl("div", { className: "hud-panel hud-system" }, [systemName, stationName]),
      createEl("div", { className: "hud-top__right" }, [credits, createEl("button", { className: "ui-button ui-button--small", type: "button", text: "КОМАНДИР", onClick: onCommander })])
    ]),
    createEl("div", { className: "hud-left" }, [
      createEl("div", { className: "hud-status" }, [createEl("span", { text: "ЩИТ" }), shieldText, createEl("i", { className: "hud-bar hud-bar--cyan" }, [shieldBar])]),
      createEl("div", { className: "hud-status" }, [createEl("span", { text: "КОРПУС" }), hullText, createEl("i", { className: "hud-bar hud-bar--yellow" }, [hullBar])]),
      createEl("div", { className: "hud-target" }, [targetText, targetDistance])
    ]),
    createEl("div", { className: "hud-reticle" }, [createEl("i"), createEl("i"), createEl("i"), createEl("i"), createEl("b")]),
    createEl("div", { className: "hud-radar" }, [radar, createEl("span", { text: "РАДАР" })]),
    createEl("div", { className: "hud-bottom" }, [
      createEl("div", { className: "hud-panel hud-flight" }, [
        createEl("div", { className: "hud-flight__speed" }, [createEl("span", { text: "ХОД" }), speedValue, createEl("i", { text: "U/S" })]),
        createEl("div", { className: "hud-flight__throttle" }, [createEl("span", { text: "ТЯГА" }), throttleValue]),
        createEl("div", { className: "hud-fuel" }, [createEl("span", { text: "ТОПЛИВО" }), fuelValue, createEl("i", { className: "hud-bar hud-bar--yellow" }, [fuelBar])]),
        createEl("div", { className: "hud-cargo" }, [createEl("span", { text: "ТРЮМ" }), cargoValue])
      ]),
      message,
      dockPrompt
    ]),
    stationMarker,
    enemyMarker,
    damageFlash,
    createEl("div", { className: "hud-help", text: "W/S ТЯГА · A/D НАКУРС · Q/E КРЕН · F ОГОНЬ · G ГАЛАКТИКА · ESC ПАУЗА" })
  ]);
  root.append(hud);
  setHidden(hud, true);

  const stars = createStars({ rng: createRng(73421), count: APP_CONFIG.world.starCount, radius: 2650 });
  const dust = createDust({ rng: createRng(91273), count: APP_CONFIG.world.dustCount, radius: 1050 });
  const planets = createPlanets();
  const stations = createStations();
  const meteors = createMeteors({ rng: createRng(44109), count: APP_CONFIG.world.meteorCount });
  const lasers = createLaserSystem();
  const effects = createHitEffects({ rng: createRng(88117) });
  const player = createPlayer({
    ship: { typeId: "courier", hull: 1, maxHull: 1, shield: 1, maxShield: 1, laserPower: 1, laserCooldown: 0.2, maxSpeed: 100 },
    onFire: (spec) => {
      lasers.fire(spec);
      audio.play("laser");
    }
  });
  const enemies = createEnemies({
    rng: createRng(12387),
    onFire: (spec) => {
      lasers.fire(spec);
      audio.play("enemyLaser");
    },
    onDestroyed: (position, level) => {
      effects.emit(position, { color: level > 2 ? 0xed2f91 : 0xff3b30, count: 22, power: 28, size: 1.35 });
      effects.emit(position, { color: 0xffe14a, count: 12, power: 18 });
      audio.play("destroy");
      dispatch({ type: actions.ADD_STAT, payload: { key: "kills", amount: 1, credits: 280 + level * 160 } });
      showMessage("ПИРАТ УНИЧТОЖЕН · +КРЕДИТЫ", 2.4);
    }
  });
  const ambient = new THREE.HemisphereLight(0x8ab4ff, 0x160b24, 1.55);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(400, 600, 300);
  worldRoot.add(stars.object3D, dust.object3D, planets.object3D, stations.object3D, meteors.object3D);
  entityRoot.add(player.object3D, enemies.object3D, lasers.object3D);
  effectRoot.add(effects.object3D);
  scene.add(ambient, keyLight, worldRoot, entityRoot, effectRoot);

  let active = false;
  let mounted = false;
  let system = null;
  let galaxy = null;
  let elapsed = 0;
  let hudTimer = 0;
  let messageTimer = 0;
  let flashTimer = 0;
  let collisionCooldown = 0;
  let enemyTimer = 12;
  let playTimeAccumulator = 0;
  let deathSent = false;
  let currentSnapshot = null;
  let dockTarget = null;
  let dockingReady = false;

  const showMessage = (text, duration = 3) => {
    message.textContent = text;
    message.classList.add("is-visible");
    messageTimer = duration;
  };

  const flashDamage = () => {
    flashTimer = 0.34;
    damageFlash.classList.remove("is-active");
    void damageFlash.offsetWidth;
    damageFlash.classList.add("is-active");
  };

  const applyDamage = (amount) => {
    if (!getState().run || getState().run.gameOver) return;
    dispatch({ type: actions.DAMAGE, payload: { amount } });
    const ship = getState().run.ship;
    player.setStatus(ship);
    effects.emit(player.object3D.position, { color: 0xff3b30, count: 9, power: 12, size: 0.75 });
    flashDamage();
    audio.play("hit");
    if (ship.hull <= 0) triggerDeath();
  };

  const onLaserHit = ({ laser, collider, position }) => {
    if (laser.team === "player") {
      effects.emit(position, { color: collider.kind === "enemy" ? 0x00d5df : 0xffe14a, count: collider.kind === "enemy" ? 10 : 5, power: collider.kind === "enemy" ? 14 : 8, size: 0.8 });
      if (collider.kind === "enemy") {
        const destroyed = enemies.hit(collider.id, laser.damage);
        if (!destroyed) audio.play("hit");
      } else {
        audio.play("hit");
      }
      return;
    }
    if (collider.kind === "player") applyDamage(laser.damage);
  };

  const resolveWorldCollisions = (snapshot) => {
    if (collisionCooldown > 0) return;
    const playerCollider = player.getCollider();
    const colliders = [...planets.getColliders(), ...stations.getColliders(), ...meteors.getColliders(), ...enemies.getColliders()];
    const hit = colliders.find((collider) => playerCollider.center.distanceTo(collider.center) < playerCollider.radius + collider.radius);
    if (!hit) return;
    collisionCooldown = 0.72;
    collisionDirection.copy(playerCollider.center).sub(hit.center);
    if (collisionDirection.lengthSq() < 0.001) collisionDirection.set(0, 0, 1);
    collisionDirection.normalize();
    player.object3D.position.addScaledVector(collisionDirection, playerCollider.radius + hit.radius + 1.5);
    applyDamage(Math.max(2, Math.round(Math.abs(snapshot.speed) / 10)));
    showMessage("СТОЛКНОВЕНИЕ · КОРПУС ПОВРЕЖДЁН", 2.4);
  };

  const drawRadar = (snapshot) => {
    if (!radarContext) return;
    const context = radarContext;
    const size = radar.width;
    const range = 420 + (getState().run.upgrades.radar || 0) * 240;
    const rangeScale = Math.min(1.35, range / 720);
    context.clearRect(0, 0, size, size);
    context.fillStyle = "rgba(0, 20, 28, 0.72)";
    context.fillRect(0, 0, size, size);
    context.strokeStyle = "rgba(0, 213, 223, 0.24)";
    context.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((scale) => {
      context.beginPath();
      context.arc(size * 0.5, size * 0.5, size * scale * 0.5, 0, Math.PI * 2);
      context.stroke();
    });
    context.beginPath();
    context.moveTo(size * 0.5, 0);
    context.lineTo(size * 0.5, size);
    context.moveTo(0, size * 0.5);
    context.lineTo(size, size * 0.5);
    context.stroke();
    player.getForward(radarForward);
    radarRight.crossVectors(radarForward, new THREE.Vector3(0, 1, 0)).normalize();
    radarUp.crossVectors(radarRight, radarForward).normalize();
    const plot = (position, color, sizeValue) => {
      relative.copy(position).sub(snapshot.position);
      const forwardDistance = relative.dot(radarForward);
      if (forwardDistance <= 1) return;
      const x = size * 0.5 + (relative.dot(radarRight) / forwardDistance) * size * 0.46 * rangeScale;
      const y = size * 0.5 - (relative.dot(radarUp) / forwardDistance) * size * 0.46 * rangeScale;
      if (x < 2 || x > size - 2 || y < 2 || y > size - 2) return;
      context.fillStyle = color;
      context.fillRect(x - sizeValue, y - sizeValue, sizeValue * 2, sizeValue * 2);
    };
    planets.getColliders().forEach((collider) => plot(collider.center, "#00d5df", 2));
    if (dockTarget) plot(dockTarget.position, "#ffe14a", 2.4);
    enemies.getColliders().forEach((collider) => plot(collider.center, "#ff3b30", 3));
    context.fillStyle = "#f4f4ed";
    context.beginPath();
    context.moveTo(size * 0.5, size * 0.44);
    context.lineTo(size * 0.46, size * 0.57);
    context.lineTo(size * 0.54, size * 0.57);
    context.closePath();
    context.fill();
    context.strokeStyle = "rgba(0, 213, 223, 0.24)";
    context.beginPath();
    context.moveTo(size * 0.5, size * 0.5);
    const sweep = (elapsed * 1.4) % (Math.PI * 2);
    context.lineTo(size * 0.5 + Math.cos(sweep) * size * 0.48, size * 0.5 + Math.sin(sweep) * size * 0.48);
    context.stroke();
  };

  const updateMarker = (element, position, label) => {
    const projected = renderContext.project(position);
    if (!projected || projected.x < 2 || projected.x > 98 || projected.y < 4 || projected.y > 94) {
      element.hidden = true;
      return;
    }
    element.hidden = false;
    element.style.left = `${projected.x}%`;
    element.style.top = `${projected.y}%`;
    element.querySelector("span").textContent = label;
  };

  const updateHud = (snapshot) => {
    const state = getState();
    if (!state.run) return;
    const ship = state.run.ship;
    const nearestEnemy = enemies.getClosest(snapshot.position, 1800);
    const target = nearestEnemy || dockTarget;
    const targetName = nearestEnemy ? "ПИРАТ" : dockTarget?.name || "НЕТ";
    const targetRange = target ? snapshot.position.distanceTo(target.position) : 0;
    systemName.textContent = system.name.toUpperCase();
    stationName.textContent = `СТАНЦИЯ ${system.station.name} · ${system.government.toUpperCase()}`;
    credits.textContent = `${state.run.credits.toLocaleString("ru-RU")} CR`;
    shieldText.textContent = `${Math.ceil(ship.shield)}/${ship.maxShield}`;
    hullText.textContent = `${Math.ceil(ship.hull)}/${ship.maxHull}`;
    shieldBar.style.width = `${ship.maxShield ? (ship.shield / ship.maxShield) * 100 : 0}%`;
    hullBar.style.width = `${ship.maxHull ? (ship.hull / ship.maxHull) * 100 : 0}%`;
    speedValue.textContent = Math.round(Math.abs(snapshot.speed));
    throttleValue.textContent = `${Math.round(Math.abs(snapshot.throttle) * 100)}%`;
    fuelValue.textContent = `${Math.floor(ship.fuel)}/${ship.maxFuel}`;
    fuelBar.style.width = `${ship.maxFuel ? (ship.fuel / ship.maxFuel) * 100 : 0}%`;
    cargoValue.textContent = `${ship.cargoUsed || state.run.cargo.reduce((sum, item) => sum + item.quantity, 0)}/${ship.cargoCapacity}`;
    targetText.textContent = `ЦЕЛЬ: ${targetName}`;
    targetDistance.textContent = target ? `${Math.round(targetRange)} U` : "";
    dockPrompt.classList.toggle("is-visible", Boolean(dockTarget && snapshot.position.distanceTo(dockTarget.position) < dockTarget.radius));
    hud.classList.toggle("is-damaged", ship.hull / ship.maxHull < 0.3);
    if (dockTarget) updateMarker(stationMarker, dockTarget.position, dockTarget.name);
    if (nearestEnemy) updateMarker(enemyMarker, nearestEnemy.position, "PIRATE");
    else enemyMarker.hidden = true;
    drawRadar(snapshot);
  };

  const triggerDeath = () => {
    if (deathSent) return;
    deathSent = true;
    active = false;
    input.setEnabled(false);
    renderContext.setVisible(true);
    audio.stopEngine();
    audio.play("gameover");
    const run = getState().run;
    dispatch({ type: actions.SET_GAME_OVER, payload: { value: true } });
    onDeath({
      credits: run.credits,
      kills: run.stats.kills,
      distance: run.stats.distance,
      hyperspaces: run.stats.hyperspaces
    });
  };

  const enter = (params = {}) => {
    const state = getState();
    if (!state.run) {
      navigate("menu");
      return;
    }
    galaxy = createGalaxy(state.run.seed);
    system = galaxy.systemById[state.run.currentSystemId] || galaxy.systems[0];
    elapsed = 0;
    hudTimer = 0;
    messageTimer = 0;
    flashTimer = 0;
    collisionCooldown = 0;
    playTimeAccumulator = 0;
    enemyTimer = 11;
    deathSent = false;
    active = true;
    planets.load(system.planets);
    stations.load([system.station]);
    meteors.reset(new THREE.Vector3());
    enemies.reset();
    lasers.reset();
    effects.reset();
    const stationPosition = new THREE.Vector3(system.station.position.x, system.station.position.y, system.station.position.z);
    const spawn = params.hyperspace
      ? new THREE.Vector3(0, 40, 420)
      : stationPosition.clone().add(new THREE.Vector3(0, 14, 135));
    player.reset(spawn, state.run.ship);
    player.object3D.visible = true;
    stars.setOrigin(spawn);
    currentSnapshot = player.getSnapshot();
    const pose = player.getViewPose();
    renderContext.setCameraPose(pose.position, pose.quaternion);
    setHidden(hud, false);
    renderContext.setVisible(true);
    input.setEnabled(true);
    audio.resume();
    audio.setEngine(currentSnapshot.throttle, true);
    if (params.hyperspace) showMessage("ГИПЕРПРОХОД ЗАВЕРШЁН · НОВАЯ СИСТЕМА", 4.5);
    else if (params.launch) showMessage("СТЫКОВКА ОТМЕНЕНА · СВОБОДНЫЙ ПОЛЁТ", 3.2);
    else showMessage("СИСТЕМА ЗАГРУЖЕНА · ПРИГОТОВЬТЕСЬ К ВЫХОДУ", 3.5);
    updateHud(currentSnapshot);
  };

  const update = (dt) => {
    if (!active) return;
    const state = getState();
    if (!state.run) return;
    if (state.run.gameOver) {
      triggerDeath();
      return;
    }
    elapsed += dt;
    collisionCooldown -= dt;
    messageTimer -= dt;
    flashTimer -= dt;
    playTimeAccumulator += dt;
    if (playTimeAccumulator >= 1) {
      dispatch({ type: actions.ADD_STAT, payload: { key: "playTime", amount: Math.floor(playTimeAccumulator) } });
      playTimeAccumulator %= 1;
    }
    const inputSample = input.sample();
    const playerResult = player.update(dt, inputSample);
    currentSnapshot = player.getSnapshot();
    const pose = player.getViewPose();
    renderContext.setCameraPose(pose.position, pose.quaternion);
    if (playerResult.boundaryHit && messageTimer <= 0) showMessage("ГРАНИЦА СИСТЕМЫ · СМЕНИТЕ КУРС", 2.4);
    dust.update(dt, currentSnapshot.position, Math.abs(currentSnapshot.speed));
    planets.update(dt);
    stations.update(dt, elapsed);
    meteors.update(dt);
    dockTarget = stations.getDockTarget();
    const staticColliders = [...planets.getColliders(), ...stations.getColliders(), ...meteors.getColliders()];
    enemies.update(dt, { playerPosition: currentSnapshot.position, elapsed }, staticColliders);
    lasers.update(dt, [...staticColliders, ...enemies.getColliders(), player.getCollider()], onLaserHit);
    effects.update(dt);
    resolveWorldCollisions(currentSnapshot);
    enemyTimer -= dt;
    if (enemyTimer <= 0 && enemies.getCount() < 4 + system.danger) {
      const count = 1 + Math.floor(system.danger / 3);
      const level = Math.max(1, Math.ceil(system.danger / 2));
      enemies.spawn(count, currentSnapshot.position, level);
      showMessage("РАДАР: КОНТАКТ С ПИРАТАМИ", 3);
      audio.play("alarm");
      enemyTimer = 24 + Math.random() * 14;
    }
    const dockDistance = dockTarget ? currentSnapshot.position.distanceTo(dockTarget.position) : Infinity;
    dockingReady = dockDistance < dockTarget?.radius && Math.abs(currentSnapshot.speed) <= APP_CONFIG.world.safeSpeed;
    if (input.consumePressed("dock")) {
      if (dockDistance < dockTarget?.radius && dockingReady) {
        dispatch({ type: actions.SET_LOCATION, payload: { stationId: system.station.id, targetSystemId: null } });
        audio.play("dock");
        navigate("station");
      } else if (dockDistance < dockTarget?.radius) {
        showMessage("СЛИШКОМ ВЫСОКАЯ СКОРОСТЬ ДЛЯ СТЫКОВКИ", 2.6);
        audio.play("alarm");
      } else {
        showMessage("СТЫКОВОЧНЫЙ МАЯК ВНЕ РАДИУСА", 1.8);
      }
    }
    if (input.consumePressed("galaxy")) {
      dispatch({ type: actions.SET_TARGET, payload: { targetSystemId: state.run.targetSystemId } });
      navigate("galaxy", { origin: "space" });
      return;
    }
    audio.setEngine(currentSnapshot.throttle, true);
    if (messageTimer <= 0) message.classList.remove("is-visible");
    if (flashTimer <= 0) damageFlash.classList.remove("is-active");
    hudTimer -= dt;
    if (hudTimer <= 0) {
      hudTimer = 0.08;
      updateHud(currentSnapshot);
    }
  };

  return {
    id: "space",
    mount() {
      if (mounted) return;
      mounted = true;
      setHidden(hud, false);
    },
    enter,
    update,
    render() {
      renderContext.render();
    },
    pause() {
      if (!active) return;
      input.setEnabled(false);
      audio.stopEngine();
    },
    resume() {
      if (!active) return;
      input.setEnabled(true);
      audio.setEngine(currentSnapshot?.throttle || 0, true);
    },
    exit() {
      active = false;
      input.setEnabled(false);
      input.releasePointer();
      audio.stopEngine();
      renderContext.setVisible(false);
      setHidden(hud, true);
    },
    dispose() {
      active = false;
      input.setEnabled(false);
      player.dispose();
      lasers.dispose();
      effects.dispose();
      enemies.dispose();
      meteors.dispose();
      planets.dispose();
      stations.dispose();
      dust.dispose();
      stars.dispose();
      scene.remove(ambient, keyLight, worldRoot, entityRoot, effectRoot);
      hud.remove();
      mounted = false;
    }
  };
}
