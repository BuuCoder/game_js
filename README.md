
# Responsive Map (OOP, Modular)

Tách file + viết lại theo hướng **data-driven model**. Bạn chỉ cần truyền thông tin `model` là có thể dùng sprite khác mà không phải sửa core.

## Cấu trúc
```
responsive-map-oop/
├── index.html
├── styles.css
└── src/
    ├── config.js
    ├── utils.js
    ├── input.js
    ├── main.js
    └── models/
        ├── Character.js
        └── modelRegistry.js
    └── ui/
        └── dpad.js
└── assets/
    └── (đặt sprite ở đây)
```

## Thêm model mới
1. Tạo thư mục sprite theo convention:
```
assets/yourModel/
  idle/down_idle.gif
  walk/{up,down,left,right,up_left,up_right,down_left,down_right}_walk.gif
  run/{up,down,left,right,up_left,up_right,down_left,down_right}_run.gif
```
> Gợi ý: Bạn có thể copy lại thư mục `animation_gif` hiện có vào `assets/animation_gif/`.

2. Đăng ký model trong `src/models/modelRegistry.js`:
```js
import { Models } from './models/modelRegistry.js';

// Ví dụ thêm model mới
Models.knight = buildModel({ 
  name: 'knight', 
  basePath: './assets/knight', 
  size: 72 
});
```

3. Khởi tạo game với model mới trong `src/main.js`:
```js
Game.init({ model: Models.knight });
```

## Tuỳ biến
- Tốc độ: chỉnh `--speed` trong `styles.css` hoặc `CONFIG.player.baseSpeed` trong `config.js`.
- Kích thước map: `--world-w`, `--world-h` trong `styles.css`.
- Kích thước player: sửa `model.size` hoặc CSS `--size` của `.player`.

## Lưu ý
- Hệ thống sử dụng **inline backgroundImage** cho sprite → không cần tạo hàng loạt class CSS theo từng hướng/trạng thái.
- Hỗ trợ **8 hướng** cho `walk` và `run`, `idle` mặc định nhìn xuống (`down_idle.gif`). Bạn có thể mở rộng hàm `getSprite` nếu cần idle theo mọi hướng.
