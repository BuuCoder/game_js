export class Input {
  constructor(target=document){
    this.keys = new Set();
    this.modShift = false;
    this.modCtrl  = false;

    this.keyToDir = {
      w: 'up', a: 'left', s: 'down', d: 'right',
      arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right'
    };

    target.addEventListener('keydown', this.onKeyDown, {passive:false});
    target.addEventListener('keyup',   this.onKeyUp,   {passive:false});
  }

  onKeyDown = (e) => {
    const k = e.key.toLowerCase();
    if (k in this.keyToDir){ e.preventDefault(); this.keys.add(this.keyToDir[k]); }
    if (k === 'shift') this.modShift = true;
    if (k === 'control') this.modCtrl = true;
  }

  onKeyUp = (e) => {
    const k = e.key.toLowerCase();
    if (k in this.keyToDir){ e.preventDefault(); this.keys.delete(this.keyToDir[k]); }
    if (k === 'shift') this.modShift = false;
    if (k === 'control') this.modCtrl = false;
  }

  currentSpeed(base){
    let mul = 1;
    if (this.modShift) mul *= 1.8;
    if (this.modCtrl)  mul *= 0.6;
    return base * mul;
  }
}
