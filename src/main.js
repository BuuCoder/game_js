import { CONFIG } from './config.js';
import { clamp, vecNormalizeDiag } from './utils.js';
import { Input } from './input.js';
import { Joystick } from './ui/joystick.js';
import { Character } from './models/Character.js';
import { Models } from './models/modelRegistry.js';
import { NPC } from './models/NPC.js';
import { ActionMenu } from './ui/actionMenu.js';
import { InteractionSystem } from './ui/interaction.js';
import { OrientationGate } from './ui/orientationGate.js';


const viewport = document.getElementById('viewport');
const world = document.getElementById('world');
const playerEl = document.getElementById('player');
const dpadEl = document.getElementById('dpad');

// const gate = new OrientationGate({
//   minAspect: 1.05,
//   tryLock: true,
//   overlayText: 'Xoay ngang hoặc nhấn “Thử toàn màn hình” (nếu được) để khoá landscape.'
// });

const Camera = {
  x: 0, y: 0,
  update(target, viewportSize, worldSize) {
    const camX = clamp(target.x - viewportSize.w / 2, 0, Math.max(0, worldSize.width - viewportSize.w));
    const camY = clamp(target.y - viewportSize.h / 2, 0, Math.max(0, worldSize.height - viewportSize.h));
    this.x = camX; this.y = camY;
    world.style.transform = `translate3d(${-camX}px, ${-camY}px, 0)`;
  }
};

function viewportSize() {
  return { w: viewport.clientWidth, h: viewport.clientHeight };
}

function getDirFromVector(dx, dy, allowDiagonal = false, axisBias = 1.0) {
  if (dx === 0 && dy === 0) return '';

  if (!allowDiagonal) {
    // 4 hướng, có thể tăng axisBias (1.2–1.5) để “cứng trục” hơn
    if (Math.abs(dx) > Math.abs(dy) * axisBias) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  // 8 hướng (nếu muốn bật sau này)
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  if (angle >= -22.5 && angle < 22.5) return 'right';
  if (angle >= 22.5 && angle < 67.5) return 'down-right';
  if (angle >= 67.5 && angle < 112.5) return 'down';
  if (angle >= 112.5 && angle < 157.5) return 'down-left';
  if (angle >= 157.5 || angle < -157.5) return 'left';
  if (angle >= -157.5 && angle < -112.5) return 'up-left';
  if (angle >= -112.5 && angle < -67.5) return 'up';
  if (angle >= -67.5 && angle < -22.5) return 'up-right';
  return '';
}

const Game = {
  init({ model = Models.hero } = {}) {
    this.input = new Input(window);
    this.joy = new Joystick(dpadEl, { radius: 70, dead: .12, snap8: false });
    this.worldSize = { width: CONFIG.world.width, height: CONFIG.world.height };

    const start = { x: this.worldSize.width / 2, y: this.worldSize.height / 2 };
    this.player = new Character({ el: playerEl, model, worldBounds: this.worldSize, initial: start });

    const loop = () => { this.tick(); requestAnimationFrame(loop); };

    // === NPCs: mỗi NPC model & action riêng, append vào .world ===
    this.npcs = [];
    const makeNpc = ({ id, name, x, y, model, facing='down', actions=[], size }) => {
      const el = document.createElement('div');
      el.className = 'npc';
      world.appendChild(el);
      const npc = new NPC({ el, model, worldBounds: this.worldSize, initial:{x,y}, facing, id, name, actions, size });

      const half = npc.size / 2;
      el.style.left = `${x - half}px`; el.style.top = `${y - half}px`;
      return npc;
    };

    // Ví dụ: 3 NPC khác nhau
    this.npcs.push(makeNpc({
      id: 'trader01', name: 'Merchant Linh',
      x: start.x - 220, y: start.y - 60,
      model: Models.healer, facing: 'right',
      size: 'auto',
      actions: [
        {
          id: 'trade', label: 'Trade', panelUrl: '/panels/trade.html',
          api: { url: '/api/trade/start', method: 'POST', body: { npcId: 'trader01' } }
        },
        { id: 'repair', label: 'Repair', panelUrl: '/panels/repair.html' }
      ]
    }));
    this.npcs.push(makeNpc({
      id: 'guild01', name: 'Guild Master',
      x: start.x + 140, y: start.y + 100,
      model: Models.business, facing: 'left',
      size: 'auto',
      actions: [
        {
          id: 'quest', label: 'Get Quest', panelUrl: '/panels/quest.html',
          api: { url: '/api/quest/assign', method: 'POST', body: { npcId: 'guild01' } }
        }
      ]
    }));
    this.npcs.push(makeNpc({
      id: 'healer01', name: 'Healer',
      x: start.x + 340, y: start.y - 140,
      model: Models.village, facing: 'down',
      size: 125,
      actions: [
        {
          id: 'heal', label: 'Heal Me', panelHtml: '<b>Healing…</b>',
          api: { url: '/api/heal', method: 'POST', body: { npcId: 'healer01' } }
        }
      ]
    }));

    this.actionMenu = new ActionMenu(viewport);
    this.interact = new InteractionSystem({
      world, viewport, player: this.player, npcs: this.npcs, camera: Camera,
      menu: this.actionMenu, radius: 110
    });

    this.updateCameraAndSprite();
    this.interact.tick();
    requestAnimationFrame(loop);
    window.addEventListener('resize', () => this.updateCameraAndSprite());
  },

  isMobile() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  },

  speedMode(usingJoy, joyMag) {
    if ((usingJoy && joyMag >= 0.98 && this.isMobile()) || this.input.modShift) return 'fast';
    if (this.input.modCtrl) return 'slow';
    return 'normal';
  },

  tick() {
    const base = CONFIG.player.baseSpeed;

    // vector từ joystick
    const j = this.joy.getVector(); // {x, y} in [-1..1]
    const joyMag = Math.min(1, Math.hypot(j.x || 0, j.y || 0)) || 0;
    const usingJoy = !!(j.x || j.y);

    // Tốc độ cơ bản
    let speed = this.input.currentSpeed(base);

    // Nếu dùng joystick: scale theo lực gạt
    if (usingJoy) {
      const analogScale = 0.6 + 0.4 * joyMag; // gạt nhẹ không quá chậm
      speed *= analogScale;

      // Turbo khi kéo sát rìa (mobile)
      if (this.isMobile() && joyMag >= 0.98) {
        speed *= 1.8;
      }
    }

    // vector di chuyển: ưu tiên joystick, fallback bàn phím
    let dx = 0, dy = 0;
    if (this.input.keys.has('left')) dx -= 1;
    if (this.input.keys.has('right')) dx += 1;
    if (this.input.keys.has('up')) dy -= 1;
    if (this.input.keys.has('down')) dy += 1;

    if (usingJoy) {
      dx = j.x; dy = j.y;
    } else if (dx && dy) {
      const inv = 1 / Math.hypot(dx, dy);
      dx *= inv; dy *= inv;
    }

    const moving = dx !== 0 || dy !== 0;

    if (moving) {
      const dir = getDirFromVector(
        dx, dy,
        true,
        1.2
      );

      this.player.moveBy(dx * speed, dy * speed);
      this.player.onMove(dir, this.speedMode(usingJoy, joyMag));
    } else {
      this.player.onIdle();
    }

    this.updateCameraAndSprite();
    this.interact.tick();
  },

  updateCameraAndSprite() {
    Camera.update(this.player, viewportSize(), this.worldSize);
    this.player.screenPlace(Camera);
  }
};

Game.init({ model: Models.knight });