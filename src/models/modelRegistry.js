/**
 * Model registry: dễ dàng thêm model mới chỉ bằng cách khai báo basePath.
 * Cấu trúc thư mục mặc định:
 *  assets/<modelName>/
 *    idle/down_idle.gif
 *    walk/{up,down,left,right,up_left,up_right,down_left,down_right}_walk.gif
 *    run/{...}_run.gif
 */


function makeEightDirMap(dir){
  // chuyển 'up-left' => 'up_left' theo folder convention
  return dir.replace('-', '_');
}

function buildModel({name, basePath, size=72}){
  return {
    name, size,
    getSprite: ({dir, state, speedMode}) => {
      const dirKey = makeEightDirMap(dir || 'down');
      if (state === 'idle') return `${basePath}/idle/down_idle.gif`; // idle hướng xuống mặc định
      const folder = (state === 'run') ? 'run' : 'walk';
      return `${basePath}/${folder}/${dirKey}_${folder}.gif`;
    }
  };
}

export function buildStaticModel({ name, img, size = 72 }) {
  return {
    name,
    size,
    getSprite: () => img  // luôn trả về 1 ảnh
  };
}

// Ví dụ model mặc định tương thích với cấu trúc người dùng đang có
export const Models = {
  hero: buildModel({ name: 'hero', basePath: './assets/knight', size: 80 }),
  knight: buildModel({ name: 'knight', basePath: './assets/knight', size: 80 }),
  village:  buildStaticModel({ name: 'village',  img: './assets/npc/village/down_idle.gif',  size: 72 }),
  business: buildStaticModel({ name: 'business', img: './assets/npc/business/down_idle.gif', size: 72 }),
  healer:   buildStaticModel({ name: 'healer',   img: './assets/npc/healer/down_idle.gif',   size: 72 }),
};

/**
 * Hướng dẫn thêm model mới:
 * 1) Tạo thư mục ./assets/<yourModel>/idle + walk + run giống cấu trúc trên.
 * 2) Đăng ký: Models.yourModel = buildModel({ name:'yourModel', basePath:'./assets/<yourModel>', size:72 });
 * 3) Ở main.js, truyền model muốn dùng vào Game.init({ model: Models.yourModel }).
 */