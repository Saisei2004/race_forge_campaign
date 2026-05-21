const canvas = document.getElementById("raceCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  raceTime: document.getElementById("raceTime"),
  standings: document.getElementById("standings"),
  raceState: document.getElementById("raceState"),
  raceLog: document.getElementById("raceLog"),
  dayMeta: document.getElementById("dayMeta"),
  upgradePoints: document.getElementById("upgradePoints"),
  courseButtons: document.getElementById("courseButtons"),
  controlLevel: document.getElementById("controlLevel"),
  speedLevel: document.getElementById("speedLevel"),
  accelLevel: document.getElementById("accelLevel"),
  upgradeControl: document.getElementById("upgradeControl"),
  upgradeSpeed: document.getElementById("upgradeSpeed"),
  upgradeAccel: document.getElementById("upgradeAccel"),
  startRace: document.getElementById("startRace"),
  resetRace: document.getElementById("resetRace")
};

const MAX_LEVEL = 10;
const GAME_SPEED = 2;
const UPGRADE_COST_ETH = 0.003;
const COURSES = [
  {
    name: "Forest GP",
    trait: "Balanced",
    note: "初日。全Lv.1では届きにくいけど、数回強化すれば勝負になる基準コース。",
    bg: ["#76db81", "#46b45b"],
    width: 1,
    laps: 1,
    points: [
      [0.23, 0.72], [0.16, 0.44], [0.29, 0.25], [0.49, 0.25],
      [0.61, 0.39], [0.78, 0.25], [0.88, 0.48], [0.76, 0.72],
      [0.55, 0.78], [0.43, 0.58], [0.31, 0.66]
    ]
  },
  {
    name: "Hairpin Ridge",
    trait: "Control",
    note: "2日目。連続ヘアピン。速度を上げすぎると曲がれず、CONTROLがかなり効きます。",
    bg: ["#8fc46a", "#5fa45d"],
    width: 0.9,
    laps: 1,
    stopStart: 0.1,
    points: [
      [0.20, 0.74], [0.18, 0.50], [0.31, 0.36], [0.20, 0.23],
      [0.43, 0.18], [0.55, 0.34], [0.43, 0.49], [0.63, 0.58],
      [0.82, 0.32], [0.90, 0.56], [0.75, 0.75], [0.51, 0.80],
      [0.35, 0.63]
    ]
  },
  {
    name: "Coastal Oval",
    trait: "Speed",
    note: "3日目。長い高速区間が多いコース。ただし高速のまま曲がると膨らみます。",
    bg: ["#64d0b6", "#49a7c8"],
    width: 1.12,
    laps: 1,
    points: [
      [0.18, 0.70], [0.14, 0.40], [0.25, 0.22], [0.54, 0.18],
      [0.84, 0.25], [0.91, 0.49], [0.80, 0.73], [0.50, 0.82],
      [0.26, 0.79]
    ]
  },
  {
    name: "Metro Chicane",
    trait: "Accel",
    note: "4日目。短い直線と切り返しの連続。減速後の立ち上がり、ACCELが勝負です。",
    bg: ["#7ec7d4", "#60b079"],
    width: 0.94,
    laps: 1,
    stopStart: 0.18,
    points: [
      [0.20, 0.72], [0.21, 0.45], [0.34, 0.32], [0.50, 0.45],
      [0.38, 0.58], [0.55, 0.73], [0.72, 0.60], [0.60, 0.43],
      [0.78, 0.27], [0.90, 0.46], [0.80, 0.75], [0.50, 0.82],
      [0.32, 0.64]
    ]
  },
  {
    name: "Summit Spiral",
    trait: "Mixed",
    note: "5日目。高速進入からきつい複合コーナーへ。3能力の総合力が必要です。",
    bg: ["#93c97a", "#6aa56a"],
    width: 1.02,
    laps: 1,
    stopStart: 0.16,
    points: [
      [0.23, 0.75], [0.16, 0.52], [0.22, 0.31], [0.43, 0.20],
      [0.66, 0.22], [0.78, 0.39], [0.64, 0.53], [0.48, 0.44],
      [0.43, 0.60], [0.61, 0.73], [0.85, 0.66], [0.90, 0.42],
      [0.76, 0.25]
    ]
  },
  {
    name: "Boss Engineway",
    trait: "Final Boss",
    note: "6日目ラスボス戦。長い直線、深い複合コーナー、巨大ボス車が待っています。",
    bg: ["#35485d", "#253646"],
    width: 1.08,
    laps: 1,
    stopStart: 0.34,
    accelGate: 9,
    points: [
      [0.13, 0.78], [0.08, 0.53], [0.16, 0.28], [0.32, 0.15],
      [0.54, 0.17], [0.79, 0.12], [0.93, 0.28], [0.84, 0.43],
      [0.62, 0.36], [0.48, 0.49], [0.64, 0.60], [0.88, 0.52],
      [0.94, 0.70], [0.77, 0.83], [0.57, 0.76], [0.46, 0.62],
      [0.34, 0.79], [0.22, 0.66], [0.31, 0.47], [0.20, 0.35],
      [0.36, 0.25], [0.57, 0.30], [0.72, 0.42], [0.59, 0.55],
      [0.40, 0.52], [0.25, 0.67]
    ]
  }
];

const colors = {
  player: "#19c6ff",
  apex: "#ffcf3d",
  bolt: "#ef4b45",
  mint: "#55dd87",
  boss: "#2b2f3a",
  ember: "#ff7138"
};

const state = {
  running: false,
  finished: false,
  raceTime: 0,
  lastTime: 0,
  day: 0,
  ethSpent: 0,
  dayStart: { control: 1, speed: 1, accel: 1 },
  campaignComplete: false,
  control: 1,
  speed: 1,
  accel: 1,
  courseIndex: 0,
  cars: [],
  particles: [],
  skidMarks: [],
  rankEvents: [],
  finishBanners: [],
  rankMap: new Map(),
  startFlash: 0,
  goalFlash: 0,
  pendingAdvance: null,
  pendingRetry: null,
  track: [],
  segments: [],
  pathLength: 0,
  trackWidth: 120
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function angleDelta(target, current) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildTrack();
  setupRaceGrid();
}

function size() {
  return {
    width: canvas.width / (window.devicePixelRatio || 1),
    height: canvas.height / (window.devicePixelRatio || 1)
  };
}

function buildTrack() {
  const { width, height } = size();
  state.courseIndex = state.day;
  const course = currentCourse();
  state.trackWidth = clamp(Math.min(width, height) * 0.13 * course.width, 80, 148);
  state.track = course.points.map(([x, y]) => ({ x: x * width, y: y * height }));
  state.segments = [];
  state.pathLength = 0;

  for (let i = 0; i < state.track.length; i += 1) {
    const a = state.track[i];
    const b = state.track[(i + 1) % state.track.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    state.segments.push({
      a,
      b,
      dx,
      dy,
      length,
      angle,
      nx: -dy / length,
      ny: dx / length,
      startDistance: state.pathLength
    });
    state.pathLength += length;
  }
}

function currentCourse() {
  return COURSES[state.day];
}

function currentLaps() {
  return currentCourse().laps || 3;
}

function turnSeverity(index) {
  const prev = state.segments[(index - 1 + state.segments.length) % state.segments.length];
  const next = state.segments[index % state.segments.length];
  return Math.abs(angleDelta(next.angle, prev.angle)) / Math.PI;
}

function trackDistanceAt(car) {
  if (!car.hasCrossedStart) return 0;
  const target = state.track[car.targetIndex];
  const seg = state.segments[(car.targetIndex - 1 + state.segments.length) % state.segments.length];
  const distanceToTarget = Math.hypot(target.x - car.x, target.y - car.y);
  const segmentProgress = clamp((seg.length - distanceToTarget) / seg.length, 0, 1);
  return car.lap * state.pathLength + seg.startDistance + seg.length * segmentProgress;
}

function distanceFromTrack(x, y) {
  let best = Infinity;
  for (const seg of state.segments) {
    const px = x - seg.a.x;
    const py = y - seg.a.y;
    const t = clamp((px * seg.dx + py * seg.dy) / (seg.length * seg.length), 0, 1);
    const cx = seg.a.x + seg.dx * t;
    const cy = seg.a.y + seg.dy * t;
    best = Math.min(best, Math.hypot(x - cx, y - cy));
  }
  return best;
}

function makeCar(config) {
  const start = state.track[0];
  const seg = state.segments[0];
  const gridSeg = state.segments[state.segments.length - 1];
  const grid = config.grid || 0;
  return {
    name: config.name,
    color: config.color,
    isPlayer: Boolean(config.isPlayer),
    isBoss: Boolean(config.isBoss),
    control: config.control,
    speedLevel: config.speed,
    accelLevel: config.accel,
    lane: config.lane,
    scale: config.scale || 1,
    aggression: config.aggression || 1,
    x: start.x - gridSeg.dx / gridSeg.length * grid + gridSeg.nx * config.lane,
    y: start.y - gridSeg.dy / gridSeg.length * grid + gridSeg.ny * config.lane,
    angle: seg.angle,
    speed: 0,
    targetIndex: 0,
    lap: 0,
    hasCrossedStart: false,
    finishTime: null,
    finished: false,
    braking: false,
    slip: 0,
    exitBoost: 0,
    progress: 0,
    lastBrakeLog: 0,
    rankCooldown: 0
  };
}

function dayOpponents() {
  const lineups = [
    [
      { name: "APEX", color: colors.apex, control: 2, speed: 2, accel: 2, grid: 34 },
      { name: "BOLT", color: colors.bolt, control: 1, speed: 3, accel: 2, grid: 68 },
      { name: "MINT", color: colors.mint, control: 3, speed: 1, accel: 2, grid: 102 }
    ],
    [
      { name: "APEX", color: colors.apex, control: 4, speed: 3, accel: 3, grid: 34 },
      { name: "BOLT", color: colors.bolt, control: 3, speed: 4, accel: 3, grid: 68 },
      { name: "MINT", color: colors.mint, control: 5, speed: 2, accel: 4, grid: 102 }
    ],
    [
      { name: "APEX", color: colors.apex, control: 4, speed: 6, accel: 4, grid: 34 },
      { name: "BOLT", color: colors.bolt, control: 3, speed: 7, accel: 4, grid: 68 },
      { name: "MINT", color: colors.mint, control: 5, speed: 5, accel: 5, grid: 102 }
    ],
    [
      { name: "APEX", color: colors.apex, control: 6, speed: 5, accel: 7, grid: 34 },
      { name: "BOLT", color: colors.bolt, control: 5, speed: 6, accel: 6, grid: 68 },
      { name: "MINT", color: colors.mint, control: 7, speed: 4, accel: 7, grid: 102 }
    ],
    [
      { name: "APEX", color: colors.apex, control: 8, speed: 7, accel: 7, grid: 34 },
      { name: "BOLT", color: colors.bolt, control: 7, speed: 8, accel: 7, grid: 68 },
      { name: "MINT", color: colors.mint, control: 8, speed: 6, accel: 8, grid: 102 }
    ],
    [
      { name: "KRAKEN", color: colors.boss, control: 9, speed: 9, accel: 9, grid: 42, scale: 1.52, isBoss: true },
      { name: "FANG", color: colors.ember, control: 8, speed: 9, accel: 8, grid: 92, scale: 1.08 },
      { name: "NOVA", color: colors.apex, control: 9, speed: 8, accel: 8, grid: 132, scale: 1.08 }
    ]
  ];
  return lineups[state.day];
}

function setupRaceGrid() {
  state.running = false;
  state.finished = false;
  state.raceTime = 0;
  state.particles = [];
  state.skidMarks = [];
  state.rankEvents = [];
  state.finishBanners = [];
  state.startFlash = 0;
  state.goalFlash = 0;
  state.pendingAdvance = null;
  state.pendingRetry = null;
  if (!state.track.length || state.courseIndex !== state.day) buildTrack();
  const lane = state.trackWidth * 0.22;
  const lanes = [lane, -lane * 0.32, lane * 0.32];
  const rivals = dayOpponents().map((rival, index) => makeCar({
    ...rival,
    lane: lanes[index]
  }));
  state.cars = [
    makeCar({ name: "YOU", color: colors.player, isPlayer: true, control: state.control, speed: state.speed, accel: state.accel, lane: -lane, grid: 0 }),
    ...rivals
  ];
  state.rankMap = makeRankMap();
  ui.startRace.textContent = "START";
  updateUi();
}

function resetRace() {
  setupRaceGrid();
  const course = currentCourse();
  setStatus("READY", `DAY ${state.day + 1}: ${course.name}。ETH強化は保持したまま再レースできます。`);
}

function startNewDay() {
  state.dayStart = { control: state.control, speed: state.speed, accel: state.accel };
  state.courseIndex = state.day;
  buildTrack();
  setupRaceGrid();
  const course = currentCourse();
  setStatus("DAY READY", `DAY ${state.day + 1}: ${course.name}。必要ならETHで追加強化して1位を狙います。`);
}

function restartDayFromUpgrade(reason = "レベルは保持したまま再挑戦できます。") {
  setupRaceGrid();
  setStatus("RETRY DAY", `DAY ${state.day + 1}: ${reason}`);
}

function setStatus(title, text) {
  ui.raceState.textContent = title;
  ui.raceLog.textContent = text;
}

function makeRankMap() {
  const ranks = new Map();
  for (const [index, car] of sortedCars().entries()) {
    ranks.set(car.name, index + 1);
  }
  return ranks;
}

function emitStartBurst() {
  for (const car of state.cars) {
    for (let i = 0; i < 8; i += 1) {
      state.particles.push({
        type: "smoke",
        x: car.x - Math.cos(car.angle) * rand(18, 36),
        y: car.y - Math.sin(car.angle) * rand(18, 36),
        vx: rand(-18, 18),
        vy: rand(-20, 10),
        life: rand(0.45, 0.9),
        maxLife: 0.9,
        size: rand(10, 22),
        color: "rgba(235, 244, 239, 0.68)"
      });
    }
  }
}

function emitFinishBurst(car) {
  state.goalFlash = 1;
  state.finishBanners.push({
    text: car.isPlayer ? "FINISH!" : `${car.name} FINISH`,
    color: car.color,
    life: 1.25,
    maxLife: 1.25
  });

  for (let i = 0; i < 34; i += 1) {
    state.particles.push({
      type: "confetti",
      x: car.x + rand(-18, 18),
      y: car.y + rand(-18, 18),
      vx: rand(-165, 165),
      vy: rand(-190, -45),
      life: rand(0.95, 1.75),
      maxLife: 1.75,
      size: rand(5, 10),
      angle: rand(0, Math.PI * 2),
      spin: rand(-8, 8),
      color: ["#fff6a9", "#52ddff", "#ff5f5a", "#70f0a0", "#ffffff"][Math.floor(rand(0, 5))]
    });
  }
}

function pushRankEvent(car, previousRank, nextRank) {
  const improved = nextRank < previousRank;
  state.rankEvents.push({
    text: `${car.name} ${previousRank}→${nextRank}`,
    color: car.color,
    improved,
    life: 1.15,
    maxLife: 1.15
  });
  if (state.rankEvents.length > 5) state.rankEvents.shift();

  if (car.isPlayer) {
    setStatus(
      improved ? "POSITION UP" : "POSITION DOWN",
      improved ? `${previousRank}位から${nextRank}位へ浮上。` : `${previousRank}位から${nextRank}位へ後退。`
    );
  }
}

function detectRankChanges() {
  const nextRanks = makeRankMap();
  if (!state.rankMap || state.rankMap.size === 0) {
    state.rankMap = nextRanks;
    return;
  }

  for (const car of state.cars) {
    const previous = state.rankMap.get(car.name);
    const current = nextRanks.get(car.name);
    if (previous && current && previous !== current && car.rankCooldown <= 0) {
      pushRankEvent(car, previous, current);
      car.rankCooldown = 0.72;
    }
  }
  state.rankMap = nextRanks;
}

function startRace() {
  if (state.running || state.campaignComplete || state.pendingAdvance || state.pendingRetry) return;
  if (state.finished) setupRaceGrid();
  state.running = true;
  state.startFlash = 1.35;
  state.goalFlash = 0;
  state.rankMap = makeRankMap();
  emitStartBurst();
  ui.startRace.textContent = "RACING";
  setStatus("RACING", `DAY ${state.day + 1} スタート。1位だけが次の日へ進めます。`);
}

function upgradeStat(stat) {
  if (state.running || state.campaignComplete) return;
  if (state[stat] >= MAX_LEVEL) return;
  state[stat] += 1;
  state.ethSpent += UPGRADE_COST_ETH;
  setupRaceGrid();
  const labels = { control: "カーブ制御", speed: "最高速度", accel: "加速度" };
  setStatus("UPGRADED", `${UPGRADE_COST_ETH.toFixed(3)} ETHで${labels[stat]}を Lv.${state[stat]} に強化しました。`);
}

function selectCourse() {
  setStatus("SCHEDULE", "キャンペーン中は日程順に進みます。1位でゴールすると次の日が解放されます。");
}

function carStats(car) {
  return {
    maxSpeed: 118 + car.speedLevel * 13,
    acceleration: 28 + car.accelLevel * 23,
    braking: 132 + car.control * 18,
    turnRate: 1.28 + car.control * 0.21,
    grip: 0.44 + car.control * 0.078
  };
}

function aimPoint(car) {
  const target = state.track[car.targetIndex];
  const seg = state.segments[(car.targetIndex - 1 + state.segments.length) % state.segments.length];
  const nextSeverity = turnSeverity(car.targetIndex);
  const apexBias = nextSeverity > 0.35 ? car.lane * 0.45 : car.lane;
  return {
    x: target.x + seg.nx * apexBias,
    y: target.y + seg.ny * apexBias
  };
}

function updateCar(car, dt) {
  if (car.finished) return;

  const stats = carStats(car);
  const target = aimPoint(car);
  const targetDistance = Math.hypot(target.x - car.x, target.y - car.y);
  const desiredAngle = Math.atan2(target.y - car.y, target.x - car.x);
  const steerDiff = angleDelta(desiredAngle, car.angle);
  const course = currentCourse();
  const severity = turnSeverity(car.targetIndex);
  const seg = state.segments[(car.targetIndex - 1 + state.segments.length) % state.segments.length];
  const speedRatio = car.speed / Math.max(stats.maxSpeed, 1);
  const curveWindow = 128 + car.speed * 0.82 + severity * 120 - car.control * 5;
  const needsBraking = severity > 0.28 && targetDistance < curveWindow;
  const steeringDemand = Math.min(Math.abs(steerDiff), 1.45) / 1.45;
  const speedGripLoss = speedRatio * speedRatio * (0.78 - car.control * 0.035);
  const curveDemand = severity * 0.88 + steeringDemand * 0.24 + speedGripLoss;
  const controlRelief = car.control * 0.058;
  const stopStartPenalty = severity * (course.stopStart || 0) * clamp(1.15 - car.accelLevel / 9, 0.08, 1.1);
  const safeSpeed = stats.maxSpeed * clamp(1 - curveDemand + controlRelief - stopStartPenalty, 0.24, 0.98);
  const desiredSpeed = needsBraking ? safeSpeed : stats.maxSpeed;

  car.braking = car.speed > desiredSpeed + 3;
  if (car.speed < desiredSpeed) {
    const exitMultiplier = car.exitBoost > 0 ? 1 + car.accelLevel * 0.13 : 1;
    const gateShortfall = Math.max(0, (course.accelGate || 0) - car.accelLevel);
    const restartFactor = clamp(1 - gateShortfall * 0.18, 0.25, 1);
    car.speed += stats.acceleration * exitMultiplier * restartFactor * dt;
  } else {
    car.speed -= stats.braking * dt;
  }
  car.exitBoost = Math.max(0, car.exitBoost - dt);

  if (needsBraking && car.isPlayer && state.raceTime - car.lastBrakeLog > 2.2) {
    car.lastBrakeLog = state.raceTime;
    setStatus("BRAKING", "カーブ前で減速中。CONTROLが高いほど速度を残して曲がれます。");
  }

  const overspeed = Math.max(0, car.speed - safeSpeed);
  const lateralStress = (Math.abs(steerDiff) * car.speed) / Math.max(stats.maxSpeed * 1.05, 1);
  const gripLimit = stats.grip * (1.08 - speedRatio * 0.34);
  if ((needsBraking && overspeed > 10) || lateralStress > gripLimit) {
    car.slip = 0.24 + clamp((lateralStress - gripLimit) * 0.18, 0, 0.2);
    car.speed -= (24 + overspeed * 0.95 + Math.max(0, lateralStress - gripLimit) * 48) * dt;
    state.skidMarks.push({
      x: car.x,
      y: car.y,
      angle: car.angle,
      life: 1.6,
      color: "rgba(35, 42, 45, 0.34)"
    });
  }

  const highSpeedSteerLoss = speedRatio * (0.78 - car.control * 0.032);
  const turnLimit = stats.turnRate * clamp(1.12 - highSpeedSteerLoss, 0.28, 1.08);
  car.angle += clamp(steerDiff, -turnLimit * dt, turnLimit * dt);
  const offTrack = distanceFromTrack(car.x, car.y) - state.trackWidth * 0.48;
  if (offTrack > 0) {
    car.speed -= (40 + offTrack * 1.1) * dt;
    car.slip = Math.max(car.slip, 0.14);
  }

  car.speed = clamp(car.speed, 0, stats.maxSpeed * 1.06);
  car.x += Math.cos(car.angle) * car.speed * dt;
  car.y += Math.sin(car.angle) * car.speed * dt;
  car.slip = Math.max(0, car.slip - dt);

  const segmentProgress = ((car.x - seg.a.x) * seg.dx + (car.y - seg.a.y) * seg.dy) / (seg.length * seg.length);
  if (targetDistance < Math.max(54, state.trackWidth * 0.44) || segmentProgress > 1.02) {
    const clearedSeverity = turnSeverity(car.targetIndex);
    const crossedStart = car.targetIndex === 0;
    car.targetIndex = (car.targetIndex + 1) % state.track.length;
    if (clearedSeverity > 0.28) {
      car.exitBoost = 0.42 + car.accelLevel * 0.045;
    }
    if (crossedStart) {
      if (car.hasCrossedStart) {
        car.lap += 1;
        if (car.lap >= currentLaps()) {
          car.finished = true;
          car.finishTime = state.raceTime;
          if (!car.finishCelebrated) {
            car.finishCelebrated = true;
            emitFinishBurst(car);
          }
        }
      } else {
        car.hasCrossedStart = true;
      }
    }
  }

  car.progress = trackDistanceAt(car);
}

function completeDay(rank) {
  const clearedCourse = currentCourse();
  const clearTime = state.raceTime.toFixed(2);
  state.running = false;
  state.finished = true;

  if (rank !== 1) {
    state.pendingRetry = {
      timer: 1.65,
      reason: `${rank}位でゴール。レベルは保持しています。必要なら追加強化して再挑戦できます。`
    };
    ui.startRace.textContent = "FINISH";
    setStatus("FINISH", `${rank}位でゴール。少し待つとリトライできます。`);
    return;
  }

  if (state.day >= COURSES.length - 1) {
    state.campaignComplete = true;
    ui.startRace.textContent = "CLEARED";
    setStatus("CHAMPION", `ラスボス KRAKEN に勝利。6日間クリア、最終タイム ${clearTime} 秒。`);
    state.finishBanners.push({
      text: "CHAMPION!",
      color: colors.player,
      life: 4,
      maxLife: 4
    });
    updateUi();
    return;
  }

  state.pendingAdvance = {
    timer: 2.45,
    clearedCourseName: clearedCourse.name,
    nextDay: state.day + 2
  };
  ui.startRace.textContent = "WIN!";
  state.finishBanners.push({
    text: "WINNER!",
    color: colors.player,
    life: 2.45,
    maxLife: 2.45
  });
  setStatus("DAY CLEAR", `${clearedCourse.name}を1位通過。勝利の余韻のあと DAY ${state.day + 2} に進みます。`);
}

function updateRace(dt) {
  if (!state.running || state.finished) return;
  state.raceTime += dt;
  for (const car of state.cars) updateCar(car, dt);
  detectRankChanges();

  const player = state.cars[0];
  if (player.finished) {
    const rank = sortedCars().findIndex((car) => car === player) + 1;
    completeDay(rank);
  } else if (state.cars.every((car) => car.finished)) {
    state.running = false;
    state.finished = true;
    state.pendingRetry = {
      timer: 1.65,
      reason: "レース終了。1位を取れませんでした。レベルは保持されています。"
    };
    setStatus("FINISH", "レース終了。少し待つとリトライできます。");
  }
}

function advanceAfterWin() {
  const cleared = state.pendingAdvance;
  if (!cleared) return;
  state.pendingAdvance = null;
  state.day += 1;
  startNewDay();
  setStatus("NEXT DAY", `${cleared.clearedCourseName}を1位通過。DAY ${state.day + 1}、必要ならETHでさらに強化できます。`);
}

function updateEffects(dt) {
  state.startFlash = Math.max(0, state.startFlash - dt);
  state.goalFlash = Math.max(0, state.goalFlash - dt * 1.6);

  for (const mark of state.skidMarks) mark.life -= dt;
  state.skidMarks = state.skidMarks.filter((mark) => mark.life > 0);

  for (const p of state.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.type === "confetti") {
      p.vy += 260 * dt;
      p.angle += p.spin * dt;
    } else if (p.type === "smoke") {
      p.size += 16 * dt;
      p.vy -= 10 * dt;
    }
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  for (const event of state.rankEvents) event.life -= dt;
  state.rankEvents = state.rankEvents.filter((event) => event.life > 0);

  for (const car of state.cars) {
    car.rankCooldown = Math.max(0, car.rankCooldown - dt);
  }

  for (const banner of state.finishBanners) banner.life -= dt;
  state.finishBanners = state.finishBanners.filter((banner) => banner.life > 0);

  if (state.pendingAdvance) {
    state.pendingAdvance.timer -= dt;
    if (state.pendingAdvance.timer <= 0) advanceAfterWin();
  }

  if (state.pendingRetry) {
    state.pendingRetry.timer -= dt;
    if (state.pendingRetry.timer <= 0) {
      const reason = state.pendingRetry.reason;
      state.pendingRetry = null;
      restartDayFromUpgrade(reason);
    }
  }
}

function sortedCars() {
  return [...state.cars].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.progress - a.progress;
  });
}

function updateUi() {
  ui.controlLevel.textContent = `CONTROL Lv.${state.control}`;
  ui.speedLevel.textContent = `SPEED Lv.${state.speed}`;
  ui.accelLevel.textContent = `ACCEL Lv.${state.accel}`;
  ui.dayMeta.textContent = `DAY ${state.day + 1} / ${COURSES.length} - ${currentCourse().name}`;
  ui.upgradePoints.textContent = state.ethSpent.toFixed(3);
  const cannotUpgrade = state.running || state.campaignComplete;
  ui.upgradeControl.disabled = cannotUpgrade || state.control >= MAX_LEVEL;
  ui.upgradeSpeed.disabled = cannotUpgrade || state.speed >= MAX_LEVEL;
  ui.upgradeAccel.disabled = cannotUpgrade || state.accel >= MAX_LEVEL;
  const lockedByResultEffect = Boolean(state.pendingAdvance || state.pendingRetry);
  ui.startRace.disabled = state.running || state.campaignComplete || lockedByResultEffect;
  ui.resetRace.disabled = state.running || state.campaignComplete || lockedByResultEffect;
  ui.raceTime.textContent = state.raceTime.toFixed(2).padStart(5, "0");

  ui.standings.innerHTML = "";
  const laps = currentLaps();
  for (const [index, car] of sortedCars().entries()) {
    const item = document.createElement("li");
    const lapText = car.finished ? `${car.finishTime.toFixed(2)}s` : `L${Math.min(car.lap + 1, laps)}/${laps}`;
    const carLabel = car.isPlayer ? "YOU (PLAYER)" : car.name;
    item.innerHTML = `<b>${index + 1}</b><i style="background:${car.color}"></i><span>${carLabel}</span><em>${lapText}</em>`;
    ui.standings.appendChild(item);
  }
  renderCourseButtons();
}

function renderCourseButtons() {
  if (ui.courseButtons.children.length !== COURSES.length) {
    ui.courseButtons.innerHTML = "";
    for (const [index, course] of COURSES.entries()) {
      const button = document.createElement("button");
      button.className = "course-button";
      button.type = "button";
      button.dataset.course = String(index);
      button.innerHTML = `<b>DAY ${index + 1}</b><small>${course.trait}</small>`;
      button.addEventListener("click", () => selectCourse(index));
      ui.courseButtons.appendChild(button);
    }
  }

  for (const button of ui.courseButtons.children) {
    const index = Number(button.dataset.course);
    const active = index === state.day;
    const cleared = index < state.day;
    const locked = index > state.day;
    button.classList.toggle("active", active);
    button.classList.toggle("cleared", cleared);
    button.classList.toggle("locked", locked);
    button.disabled = state.running || locked || cleared;
    const course = COURSES[index];
    button.innerHTML = `<b>DAY ${index + 1}</b><small>${active ? course.name : course.trait}</small>`;
  }
}

function drawRoundedPath(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
}

function drawBackground() {
  const { width, height } = size();
  const course = currentCourse();
  const grass = ctx.createLinearGradient(0, 0, width, height);
  grass.addColorStop(0, course.bg[0]);
  grass.addColorStop(1, course.bg[1]);
  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let x = -40; x < width + 80; x += 88) {
    for (let y = -40; y < height + 80; y += 76) {
      if ((x + y) % 3 === 0) {
        ctx.beginPath();
        ctx.arc(x + Math.sin(y) * 12, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.font = "1000 74px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.translate(width * 0.5, height * 0.49);
  ctx.rotate(-0.08);
  ctx.fillText(course.trait.toUpperCase(), 0, 0);
  ctx.restore();
}

function drawTrack() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawRoundedPath(state.track);
  ctx.strokeStyle = "#26323a";
  ctx.lineWidth = state.trackWidth + 34;
  ctx.stroke();
  drawRoundedPath(state.track);
  ctx.strokeStyle = "#69747c";
  ctx.lineWidth = state.trackWidth + 16;
  ctx.stroke();
  drawRoundedPath(state.track);
  ctx.strokeStyle = "#343d44";
  ctx.lineWidth = state.trackWidth;
  ctx.stroke();

  drawRoundedPath(state.track);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 28]);
  ctx.stroke();
  ctx.setLineDash([]);

  drawCornerWarnings();
  drawFinishLine();
  ctx.restore();
}

function drawCornerWarnings() {
  for (let i = 0; i < state.track.length; i += 1) {
    const severity = turnSeverity(i);
    if (severity < 0.32) continue;
    const p = state.track[i];
    ctx.fillStyle = `rgba(255, 194, 64, ${0.18 + severity * 0.22})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, state.trackWidth * 0.36, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFinishLine() {
  const start = state.track[0];
  const seg = state.segments[0];
  const w = state.trackWidth * 0.9;
  const h = 15;
  ctx.save();
  ctx.translate(start.x, start.y);
  ctx.rotate(seg.angle + Math.PI / 2);
  if (state.goalFlash > 0) {
    ctx.fillStyle = `rgba(255, 230, 90, ${0.28 * state.goalFlash})`;
    roundRect(-w * 0.66, -h * 2.6, w * 1.32, h * 5.2, 16);
    ctx.fill();
  }
  for (let i = -4; i < 4; i += 1) {
    for (let j = -1; j <= 1; j += 1) {
      ctx.fillStyle = (i + j) % 2 === 0 ? "#f8f8f8" : "#171b20";
      ctx.fillRect(i * (w / 8), j * h, w / 8, h);
    }
  }
  ctx.restore();
}

function drawCar(car) {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  ctx.scale(car.scale, car.scale);
  const boss = car.isBoss;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(2, 4, boss ? 34 : 26, boss ? 20 : 15, 0, 0, Math.PI * 2);
  ctx.fill();

  if (car.braking) {
    ctx.fillStyle = "rgba(255, 60, 42, 0.36)";
    ctx.fillRect(-31, -13, 16, 5);
    ctx.fillRect(-31, 8, 16, 5);
  }
  if (car.slip > 0) {
    ctx.strokeStyle = "rgba(30, 35, 38, 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-26, -12);
    ctx.lineTo(-48, -17);
    ctx.moveTo(-26, 12);
    ctx.lineTo(-48, 17);
    ctx.stroke();
  }
  if (car.exitBoost > 0) {
    const flame = Math.min(1, car.exitBoost * 1.8);
    ctx.fillStyle = `rgba(255, 176, 44, ${0.62 * flame})`;
    ctx.beginPath();
    ctx.moveTo(-25, -10);
    ctx.lineTo(-48 - car.accelLevel * 1.4, 0);
    ctx.lineTo(-25, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 245, 170, ${0.54 * flame})`;
    ctx.beginPath();
    ctx.moveTo(-25, -5);
    ctx.lineTo(-40 - car.accelLevel, 0);
    ctx.lineTo(-25, 5);
    ctx.closePath();
    ctx.fill();
  }

  if (boss) {
    ctx.fillStyle = "#0e151d";
    roundRect(-34, -23, 68, 46, 10);
    ctx.fill();
    ctx.fillStyle = "#ff7138";
    ctx.beginPath();
    ctx.moveTo(29, -23);
    ctx.lineTo(45, -15);
    ctx.lineTo(29, -7);
    ctx.moveTo(29, 23);
    ctx.lineTo(45, 15);
    ctx.lineTo(29, 7);
    ctx.fill();
  }

  ctx.fillStyle = "#141a20";
  ctx.fillRect(boss ? -30 : -23, boss ? -22 : -18, boss ? 60 : 46, boss ? 44 : 36);
  ctx.fillStyle = car.color;
  roundRect(boss ? -31 : -24, boss ? -17 : -14, boss ? 62 : 48, boss ? 34 : 28, boss ? 10 : 8);
  ctx.fill();
  ctx.strokeStyle = "#172632";
  ctx.lineWidth = boss ? 5 : 4;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  roundRect(boss ? -2 : -5, boss ? -13 : -11, boss ? 18 : 17, boss ? 26 : 22, 5);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  roundRect(boss ? -22 : -18, boss ? -12 : -10, boss ? 12 : 10, boss ? 24 : 20, 4);
  ctx.fill();

  if (boss) {
    ctx.strokeStyle = "#ff7138";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -2);
    ctx.lineTo(0, -11);
    ctx.lineTo(19, -2);
    ctx.moveTo(-18, 5);
    ctx.lineTo(0, 14);
    ctx.lineTo(19, 5);
    ctx.stroke();
    ctx.fillStyle = "#f4c04f";
    ctx.fillRect(18, -11, 12, 5);
    ctx.fillRect(18, 6, 12, 5);
  }

  ctx.fillStyle = "#10161c";
  ctx.fillRect(boss ? -24 : -18, boss ? -27 : -22, boss ? 13 : 10, boss ? 8 : 7);
  ctx.fillRect(boss ? 11 : 8, boss ? -27 : -22, boss ? 13 : 10, boss ? 8 : 7);
  ctx.fillRect(boss ? -24 : -18, boss ? 19 : 15, boss ? 13 : 10, boss ? 8 : 7);
  ctx.fillRect(boss ? 11 : 8, boss ? 19 : 15, boss ? 13 : 10, boss ? 8 : 7);

  ctx.fillStyle = "#fff";
  ctx.font = "900 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(car.name === "YOU" ? "1" : car.name[0], 0, 0);
  ctx.restore();
}

function drawPlayerMarker(car) {
  if (!car) return;
  const pulse = 1 + Math.sin((state.raceTime + Date.now() / 1000) * 5.6) * 0.08;

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.scale(pulse, pulse);
  ctx.strokeStyle = "rgba(82, 221, 255, 0.78)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 30, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(11, 31, 45, 0.9)";
  roundRect(-36, -62, 72, 26, 9);
  ctx.fill();
  ctx.strokeStyle = "#52ddff";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "1000 15px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("YOU", 0, -49);

  ctx.fillStyle = "#52ddff";
  ctx.beginPath();
  ctx.moveTo(-10, -35);
  ctx.lineTo(10, -35);
  ctx.lineTo(0, -22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawSkids() {
  for (const mark of state.skidMarks) {
    ctx.save();
    ctx.globalAlpha = clamp(mark.life / 1.6, 0, 1);
    ctx.translate(mark.x, mark.y);
    ctx.rotate(mark.angle);
    ctx.strokeStyle = mark.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, -13);
    ctx.lineTo(20, -16);
    ctx.moveTo(-18, 13);
    ctx.lineTo(20, 16);
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles(layer) {
  for (const p of state.particles) {
    const isSmoke = p.type === "smoke";
    if ((layer === "back") !== isSmoke) continue;
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    if (p.type === "confetti") {
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      roundRect(-p.size * 0.5, -p.size * 0.25, p.size, p.size * 0.5, 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawRankEvents() {
  const { width } = size();
  for (const [index, event] of state.rankEvents.entries()) {
    const t = clamp(event.life / event.maxLife, 0, 1);
    const y = 146 + index * 44 - (1 - t) * 22;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "1000 24px Inter, system-ui, sans-serif";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(12, 28, 37, 0.86)";
    ctx.strokeText(event.improved ? `▲ ${event.text}` : `▼ ${event.text}`, width * 0.5, y);
    ctx.fillStyle = event.improved ? "#8ff1cc" : "#ffd85a";
    ctx.fillText(event.improved ? `▲ ${event.text}` : `▼ ${event.text}`, width * 0.5, y);
    ctx.restore();
  }
}

function drawStartOverlay() {
  if (state.startFlash <= 0) return;
  const { width, height } = size();
  const t = clamp(state.startFlash / 1.35, 0, 1);
  const scale = 1 + (1 - t) * 0.32;
  ctx.save();
  ctx.translate(width * 0.5, height * 0.36);
  ctx.scale(scale, scale);
  ctx.globalAlpha = Math.min(1, t * 1.4);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "1000 84px Inter, system-ui, sans-serif";
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(13, 35, 48, 0.88)";
  ctx.strokeText("GO!", 0, 0);
  ctx.fillStyle = "#ffd85a";
  ctx.fillText("GO!", 0, 0);
  ctx.font = "900 18px Inter, system-ui, sans-serif";
  ctx.lineWidth = 5;
  ctx.strokeText("FULL THROTTLE", 0, 66);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("FULL THROTTLE", 0, 66);
  ctx.restore();
}

function drawFinishBanners() {
  const { width, height } = size();
  for (const banner of state.finishBanners) {
    const t = clamp(banner.life / banner.maxLife, 0, 1);
    const alpha = Math.min(1, t * 1.6);
    const y = height * 0.39 + Math.sin(t * Math.PI * 4) * 4;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "1000 72px Inter, system-ui, sans-serif";
    ctx.lineWidth = 14;
    ctx.strokeStyle = "rgba(9, 26, 36, 0.92)";
    ctx.strokeText(banner.text, width * 0.5, y);
    ctx.fillStyle = banner.text === "WINNER!" || banner.text === "CHAMPION!" ? "#ffd85a" : banner.color;
    ctx.fillText(banner.text, width * 0.5, y);
    ctx.restore();
  }
}

function render() {
  const { width, height } = size();
  ctx.clearRect(0, 0, width, height);
  drawBackground();
  drawTrack();
  drawSkids();
  drawParticles("back");
  for (const car of [...state.cars].sort((a, b) => a.y - b.y)) drawCar(car);
  drawPlayerMarker(state.cars.find((car) => car.isPlayer));
  drawParticles("front");
  drawRankEvents();
  drawFinishBanners();
  drawStartOverlay();
}

function frame(time) {
  if (!state.lastTime) state.lastTime = time;
  const dt = Math.min(0.04, (time - state.lastTime) / 1000);
  state.lastTime = time;
  updateRace(dt * GAME_SPEED);
  updateEffects(dt);
  updateUi();
  render();
  requestAnimationFrame(frame);
}

ui.upgradeControl.addEventListener("click", () => upgradeStat("control"));
ui.upgradeSpeed.addEventListener("click", () => upgradeStat("speed"));
ui.upgradeAccel.addEventListener("click", () => upgradeStat("accel"));
ui.startRace.addEventListener("click", startRace);
ui.resetRace.addEventListener("click", () => {
  restartDayFromUpgrade("RESETしました。レベルとETH強化履歴は保持しています。");
});
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
startNewDay();
requestAnimationFrame(frame);
