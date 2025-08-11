export class InteractionSystem {
    constructor({ world, viewport, player, npcs, camera, menu, radius = 96 }) {
        this.world = world;
        this.viewport = viewport;
        this.player = player;
        this.npcs = npcs;
        this.camera = camera;
        this.menu = menu;
        this.radius = radius;

        // Click contact → mở menu
        for (const npc of this.npcs) {
            npc.contactBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.menu.showForNPC(npc);
            });
        }
        // ESC để đóng
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.menu.hide(); });
    }

    // gọi mỗi frame sau khi cập nhật player & camera
    tick() {
        const px = this.player.x, py = this.player.y;
        for (const npc of this.npcs) {
            const dx = npc.x - px;
            const dy = npc.y - py;
            const d = Math.hypot(dx, dy);
            npc.setContactVisible(d <= this.radius);
        }
    }
}
