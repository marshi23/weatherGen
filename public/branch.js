// let windFactor = 1.0;
// let rotDecay = 1.1;
//
// let mDamp = 0.00002;
// let wDamp = 0.003;
// let mFriction = 0.98;
//
// let mouseWind = 0;
// let mouseWindV = 0;



function Branch(len, s) {
  this.len = len;
  this.s = s;

  // stroke(random(0, 192));
  stroke(0);
  strokeWeight(4);
  // rotate(this.rot + (rotOffset * 0.1 + this.mouseWind) * this.currentWindSpeed);
  line(0,0,0, -this.len);
  translate(0,-this.len);


  if (this.s > 0) {
    let bcoef = angle/branches;

    for (let i = 1; i <= branches; i++) {

      push();
      rotate(i*bcoef);
      new Branch(this.len*coef, this.s-1);
      pop();

      push();
      rotate(-i*bcoef);
      new Branch(this.len*coef, this.s-1);
      pop();
  }
}
}
