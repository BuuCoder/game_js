import { Character } from './Character.js';

export class NPC extends Character {
    constructor({ el, model, worldBounds, initial, facing = 'down', id, name, actions = [], size }) {
        super({ el, model, worldBounds, initial });
        if (typeof size === 'number') this.size = size;        // override per-NPC
        el.style.setProperty('--size', `${this.size}px`);      // đẩy ra CSS
        this.id = id;
        this.name = name || id;
        this.actions = actions;
        this.applySprite(facing, 'idle', 'normal');
        this.size = model.size ?? this.size;

        // Nút contact
        this.contactBtn = document.createElement('button');
        this.contactBtn.className = 'contact-btn';
        this.contactBtn.textContent = 'contact';
        el.appendChild(this.contactBtn);

        // tên NPC (ẩn/hiện khi lại gần)
        this.nameEl = document.createElement('div');
        this.nameEl.className = 'npc-name';
        this.nameEl.textContent = this.name || '';
        el.appendChild(this.nameEl);

        // Nhãn tên NPC (hiện khi lại gần – hoặc bạn để luôn hiển thị)
        this.nameEl = document.createElement('div');
        this.nameEl.className = 'npc-name';
        this.nameEl.textContent = this.name || '';
        el.appendChild(this.nameEl);

        this.contactVisible = false;
    }

    setContactVisible(v) {
        if (this.contactVisible === v) return;
        this.contactVisible = v;
        this.contactBtn.style.display = v ? 'inline-block' : 'none';
        this.nameEl.style.display = v ? 'block' : 'none';
    }
}
