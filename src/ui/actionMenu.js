export class ActionMenu {
    constructor(viewport) {
        this.viewport = viewport;
        this.root = document.createElement('div');
        this.root.className = 'action-overlay';
        this.root.innerHTML = `
        <div class="wish-modal" role="dialog" aria-modal="true">
            <button class="wish-close" title="Đóng">✕</button>
            <div class="wish-message" id="am-message">
            Ta sẽ ban cho ngươi 1 điều ước, ngươi có 5 phút, hãy suy nghĩ thật kỹ trước khi quyết định
            </div>
            <div class="wish-actions" id="am-list"></div>
            <div class="wish-panel" id="am-panel">Hãy chọn một hành động…</div>
        </div>`;
        viewport.appendChild(this.root);

        this.titleMsg = this.root.querySelector('#am-message');
        this.listEl = this.root.querySelector('#am-list');
        this.panelEl = this.root.querySelector('#am-panel');

        this.root.querySelector('.wish-close').addEventListener('click', () => this.hide());
        this.root.addEventListener('click', (e) => { if (e.target === this.root) this.hide(); });
    }

    showForNPC(npc) {
        this.currentNPC = npc;

        // Có thể tùy biến message theo NPC: npc.message hoặc fallback
        this.titleMsg.textContent = npc.message || `Đang tương tác với ${npc.name}. Chọn hành động:`;

        // Render nút vàng
        this.listEl.innerHTML = '';
        npc.actions.forEach(act => {
            const btn = document.createElement('button');
            btn.className = 'wish-btn';
            btn.textContent = act.label || act.id;
            btn.addEventListener('click', () => this.runAction(act, npc));
            this.listEl.appendChild(btn);
        });

        this.panelEl.innerHTML = 'Hãy chọn một hành động…';
        this.root.style.display = 'block';
    }

    hide() { this.root.style.display = 'none'; this.currentNPC = null; }

    async runAction(action, npc) {
        // 1) load panel HTML (nếu có)
        if (action.panelUrl) {
            try {
                const html = await fetch(action.panelUrl, { cache: 'no-store' }).then(r => r.text());
                this.panelEl.innerHTML = html;
            } catch (e) {
                this.panelEl.innerHTML = `<div style="color:#b00">Không tải được panel: ${action.panelUrl}</div>`;
            }
        } else if (action.panelHtml) {
            this.panelEl.innerHTML = action.panelHtml;
        } else {
            this.panelEl.innerHTML = `<div>Action <b>${action.id}</b> được chọn.</div>`;
        }

        // 2) gọi API (nếu có)
        if (action.api?.url) {
            try {
                const { url, method = 'GET', headers = {}, body } = action.api;
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', ...headers },
                    body: body ? JSON.stringify(body) : undefined
                });
                const text = await res.text();
                const out = document.createElement('div');
                out.style.marginTop = '8px';
                out.innerHTML = `<pre style="white-space:pre-wrap">${text.replace(/[<>&]/g, s => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[s]))}</pre>`;
                this.panelEl.appendChild(out);
            } catch (e) {
                const err = document.createElement('div');
                err.style.marginTop = '8px'; err.style.color = '#b00';
                err.textContent = `API lỗi: ${e.message}`;
                this.panelEl.appendChild(err);
            }
        }
    }
}
