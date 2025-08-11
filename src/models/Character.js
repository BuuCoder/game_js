import { clamp } from '../utils.js';

/**
 * Model interface (data-driven):
 * {
 *   name: 'heroA',
 *   size: 72,
 *   getSprite: ({dir, state, speedMode}) => 'assets/.../path.gif'
 * }
 * - dir: 'up'|'down'|'left'|'right'|'up-left'|'up-right'|'down-left'|'down-right'
 * - state: 'idle'|'walk'|'run'
 * - speedMode: 'normal'|'slow'|'fast' (derived from modifiers)
 */
export class Character {
  constructor({el, model, worldBounds, initial={x:0,y:0}}){
    this.el = el;
    this.model = model;
    this.x = initial.x;
    this.y = initial.y;
    this.worldBounds = worldBounds;
    this.size = (model.size ?? parseFloat(getComputedStyle(el).getPropertyValue('--size'))) || 72;
    this.lastDir = 'down';
    this.applySprite('down', 'idle', 'normal');
  }

  moveBy(dx, dy){
    this.x += dx;
    this.y += dy;
    // clamp to world
    const half = this.size/2;
    this.x = clamp(this.x, half, this.worldBounds.width - half);
    this.y = clamp(this.y, half, this.worldBounds.height - half);
  }

  screenPlace(camera){
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;
    this.el.style.left = `${screenX - this.size/2}px`;
    this.el.style.top  = `${screenY - this.size/2}px`;
  }

  applySprite(dir, state, speedMode){
    this.lastDir = dir || this.lastDir;
    const url = this.model.getSprite({dir: this.lastDir, state, speedMode});
    if (url){
      this.el.style.backgroundImage = `url('${url}')`;
    }
  }

  onIdle(){
    this.applySprite(this.lastDir, 'idle', 'normal');
  }

  onMove(dir, speedMode){
    const state = (speedMode === 'fast') ? 'run' : 'walk';
    this.applySprite(dir, state, speedMode);
  }
}
