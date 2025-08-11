export class DPad {
  constructor(root, input){
    this.root = root;
    this.input = input;
    this.dirToKeys = {
      'up': ['up'], 'down': ['down'], 'left': ['left'], 'right': ['right'],
      'up-left': ['up','left'], 'up-right': ['up','right'],
      'down-left': ['down','left'], 'down-right': ['down','right'],
    };
    this.activePointers = new Map();
    this.setup();
  }

  setup(){
    const buttons = Array.from(this.root.querySelectorAll('.d-btn'));
    buttons.forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('pointerdown', (e)=>{
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        this.pressDir(e.pointerId, dir, btn);
      });
      const release = (e)=> this.releasePointer(e.pointerId, btn);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerout', release);
    });
  }

  pressDir(pointerId, dir, el){
    const dirs = this.dirToKeys[dir] || [];
    const set = new Set(dirs);
    this.activePointers.set(pointerId, set);
    dirs.forEach(d => this.input.keys.add(d));
    if (el) el.classList.add('active');
  }

  releasePointer(pointerId, el){
    const set = this.activePointers.get(pointerId);
    if (set){
      set.forEach(d => this.input.keys.delete(d));
      this.activePointers.delete(pointerId);
    }
    if (el) el.classList.remove('active');
  }
}
