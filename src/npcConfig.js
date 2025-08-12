import { Models } from './models/modelRegistry.js';

import { CONFIG } from './config.js';
const start = {
  x: CONFIG.world.width / 2,
  y: CONFIG.world.height / 2
};

export const npcList = [
  {
    id: 'trader01',
    name: 'Triệu Tử Long',
    x: start.x - 220,
    y: start.y - 60,
    model: Models.healer,
    facing: 'right',
    size: 'auto',
    actions: [
      {
        id: 'trade',
        label: 'Nâng cấp',
        panelHtml: '<b>Chọn vũ khí cần nâng cấp</b>',
        // panelUrl: '/panels/trade.html',
        // api: {
        //   url: '/api/trade/start',
        //   method: 'POST',
        //   body: { npcId: 'trader01' }
        // }
      },
      {
        id: 'repair',
        label: 'Sửa chửa',
        panelUrl: '/panels/repair.html'
      }
    ]
  },
  {
    id: 'guild01',
    name: 'Lý Mộ Uyển',
    x: start.x + 140,
    y: start.y + 100,
    model: Models.business,
    facing: 'left',
    size: 'auto',
    actions: [
      {
        id: 'quest',
        label: 'Nhận nhiệm vụ',
        panelHtml: '<b>Luyện 3 viên vong trần đan</b>',
        // panelUrl: '/panels/quest.html',
        // api: {
        //   url: '/api/quest/assign',
        //   method: 'POST',
        //   body: { npcId: 'guild01' }
        // }
      }
    ]
  },
  {
    id: 'healer01',
    name: 'Ma Thần',
    x: start.x + 340,
    y: start.y - 140,
    model: Models.village,
    facing: 'down',
    size: 72,
    actions: [
      {
        id: 'heal',
        label: 'Bạn thấy tôi như thế nào',
        panelHtml: '<b>Thật là Soái Ca…</b>',
      }
    ]
  }
];
