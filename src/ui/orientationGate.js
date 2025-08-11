// src/ui/orientationGate.js
export class OrientationGate {
    constructor({
        minAspect = 1.1,        // tỷ lệ w/h tối thiểu coi là "ngang"
        tryLock = true,         // thử khóa landscape khi người dùng chạm
        overlayText = 'Vui lòng xoay ngang điện thoại để tiếp tục'
    } = {}) {
        this.minAspect = minAspect;
        this.tryLock = tryLock;
        this.overlay = this.#makeOverlay(overlayText);
        document.body.appendChild(this.overlay);

        // Sự kiện
        this._onResize = this.check.bind(this);
        window.addEventListener('resize', this._onResize);
        window.addEventListener('orientationchange', this._onResize);

        // Nhấn overlay => thử vào fullscreen + lock landscape (nếu cho phép)
        this.overlay.addEventListener('click', async () => {
            await this.#tryFullscreenAndLock();
            this.check(); // kiểm tra lại sau khi thử lock
        });

        // Khởi tạo lần đầu
        this.check();
    }

    // Kiểm tra có phải mobile & đang dọc không
    check() {
        const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        const aspect = (window.innerWidth || 1) / (window.innerHeight || 1);
        const isPortrait = aspect < this.minAspect;

        if (isMobile && isPortrait) {
            this.overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            this.overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    destroy() {
        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('orientationchange', this._onResize);
        this.overlay?.remove();
    }

    async #tryFullscreenAndLock() {
        try {
            // Vào fullscreen nếu chưa
            const el = document.documentElement;
            if (document.fullscreenElement == null && el.requestFullscreen) {
                await el.requestFullscreen();
            }
            // Khóa orientation (Android Chrome/Edge có thể cho; iOS đa phần không)
            if (this.tryLock && screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
            }
        } catch (_) {
            // Bỏ qua lỗi (trình duyệt không cho)
        }
    }

    #makeOverlay(text) {
        const wrap = document.createElement('div');
        wrap.className = 'rotate-overlay';
        wrap.innerHTML = `
      <div class="rotate-box">
        <div class="phone-icon" aria-hidden="true"></div>
        <div class="rotate-title">Vui lòng xoay ngang</div>
        <div class="rotate-sub">${text}</div>
        <button class="rotate-try">Thử toàn màn hình</button>
      </div>
    `;
        // nút thử cũng gọi lock
        wrap.querySelector('.rotate-try').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.#tryFullscreenAndLock();
            this.check();
        });
        return wrap;
    }
}
