export class Joystick {
    /**
     * @param {HTMLElement} root - container .dpad-circle
     * @param {Object} opts
     *  - radius: bán kính điều khiển (px)
     *  - dead: deadzone (0..1)
     *  - snap8: true -> bám 8 hướng (tuỳ chọn)
     */
    constructor(root, { radius = 70, dead = .12, snap8 = false } = {}) {
        this.root = root;
        this.thumb = root.querySelector('.thumb');
        this.center = { x: root.clientWidth / 2, y: root.clientHeight / 2 };
        this.radius = radius;
        this.dead = dead;
        this.snap8 = snap8;
        this.vec = { x: 0, y: 0 }; // -1..1
        this.activeId = null;

        root.addEventListener('pointerdown', this.onDown, { passive: false });
        root.addEventListener('pointermove', this.onMove, { passive: false });
        root.addEventListener('pointerup', this.onUp);
        root.addEventListener('pointercancel', this.onUp);
        root.addEventListener('pointerleave', this.onUp);
        window.addEventListener('resize', () => {
            this.center = { x: this.root.clientWidth / 2, y: this.root.clientHeight / 2 };
        });
    }

    onDown = (e) => {
        e.preventDefault();
        this.root.setPointerCapture(e.pointerId);
        this.activeId = e.pointerId;
        this.updateFromEvent(e);
    }

    onMove = (e) => {
        if (e.pointerId !== this.activeId) return;
        this.updateFromEvent(e);
    }

    onUp = (e) => {
        if (e.pointerId !== this.activeId) return;
        this.activeId = null;
        this.vec = { x: 0, y: 0 };
        this.thumb.style.transform = `translate(-50%,-50%)`; // snap về tâm
    }

    getVector() { return this.vec; } // {x,y} in [-1..1]

    updateFromEvent(e) {
        const rect = this.root.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        let dx = px - this.center.x;
        let dy = py - this.center.y; // y xuống là + (như canvas)

        // clamp theo radius
        const dist = Math.hypot(dx, dy);
        const clamped = Math.min(dist, this.radius);
        const angle = Math.atan2(dy, dx);
        const cx = Math.cos(angle) * clamped;
        const cy = Math.sin(angle) * clamped;

        // normalize -1..1
        let nx = cx / this.radius;
        let ny = cy / this.radius;

        // deadzone
        const len = Math.hypot(nx, ny);
        if (len < this.dead) { nx = 0; ny = 0; }

        // snap 8 hướng (nếu bật)
        if (this.snap8 && len >= this.dead) {
            const deg = Math.atan2(ny, nx) * 180 / Math.PI;
            const dirs = [0, 45, 90, 135, 180, -135, -90, -45]; // rải 8 hướng
            let best = 0, mind = 999;
            for (const d of dirs) {
                const diff = Math.abs(((deg - d + 180) % 360) - 180);
                if (diff < mind) { mind = diff; best = d; }
            }
            const rad = best * Math.PI / 180;
            const mag = Math.min(1, len);
            nx = Math.cos(rad) * mag;
            ny = Math.sin(rad) * mag;
        }

        this.vec = { x: nx, y: ny };

        // di chuyển thumb
        this.thumb.style.transform =
            `translate(calc(-50% + ${nx * this.radius}px), calc(-50% + ${ny * this.radius}px))`;
    }
}
