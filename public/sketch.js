////variable declarations////
////  tree variables;
let slider_size, slider_level, slider_rot, slider_lenRand, slider_branchProb, slider_rotRand, slider_leafProb;
let button_seed, button_newSeed, button_randomParams, button_change;
let label_size, label_level, label_rot, label_lenRand, label_branchProb, label_rotRand, label_leafProb, label_perf, label_seed, label_source, label_source2;
let div_inputs;
let input_seed, size, maxLevel, rot, lenRan, branchProb, rotRand, leafProb;
let hide = false, prog = 1, growing = false, mutating = false, randSeed = 80, paramSeed = Math.floor(Math.random()*1000), randBias = 0;

// weather api call
let apiKey; // how do i import from .env file?
let cityName;
let countryCode;
let units='&cnt=16&units=metric';
let url = `http://api.openweathermap.org/data/2.5/weather?q=Seattle,us&units=metric&APPID=f2038a35dbc40be211675c09ae73bd2a`

// weather
let currentWindSpeed;
let currentWindDeg;
let currentCity;
let currentTempreture;
let currentWeather;

// wind
let wind;
let windPosition; // position of wind objects
let windAngle;

/// rain
let nDrops = 100;
let drops = [];

// flock
let flock;

//Mountains
let mountains;
let time;

function preload() {
  weatherAsk();
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  textSize(20);

  // create raindrops
  for (i = 0; i < nDrops; i++) {
    drops.push(new Drop());
  }

  // wind direction
  wind = createVector();
  windPosition = createVector(width, height);// where wind object starts moving from

  // create flock and add boids to them
  flock = new Flock();

  // create boids
  if (currentWindSpeed) {
    for (var i = 0; i < 50; i++) {
      var b = new Boid(width/2,height/2);
      flock.addBoid(b);
    }
  }

// mountains
  time = random(1);
  mountains = new Mountains(height - 10, height - 10 * 70, time);

  ///tree

  slider_size = createSlider(100, 200, /mobile/i.test(window.navigator.userAgent) ? 100 : 150, 1);
	// slider_size.position(width-180, 40);
	slider_level = createSlider(1, 13, 11, 1);
	// slider_level.position(width-180, 80);
	slider_rot = createSlider(0, PI/2, (PI/2) / 4, (PI/2) / (3 * 5 * 8));
	// slider_rot.position(width-180, 120);
	slider_lenRand = createSlider(0, 1, 1, 0.01);
	// slider_lenRand.position(width-180, 160);
	slider_branchProb = createSlider(0, 1, 0.9, 0.01);
	// slider_branchProb.position(width-180, 200);
	slider_rotRand = createSlider(0, 1, 0.1, 0.01);
	// slider_rotRand.position(width-180, 240);
	slider_leafProb = createSlider(0, 1, 0.5, 0.01);
	// slider_leafProb.position(width-180, 280);

	slider_size.input(function(){readInputs(true)});
	slider_level.input(function(){readInputs(true)});
	slider_rot.input(function(){readInputs(true)});
	slider_lenRand.input(function(){readInputs(true)});
	slider_branchProb.input(function(){readInputs(true)});
	slider_rotRand.input(function(){readInputs(true)});
	slider_leafProb.input(function(){readInputs(true)});


	label_size = createSpan('Size');
	// label_size.position(width-190, 20);
	label_level = createSpan('Recursion level');
	// label_level.position(width-190, 60);
	label_rot = createSpan('Split angle');
	// label_rot.position(width-190, 100);
	label_lenRand = createSpan('Length variation');
	// label_lenRand.position(width-190, 140);
	label_branchProb = createSpan('Split probability');
	// label_branchProb.position(width-190, 180);
	label_rotRand = createSpan('Split rotation variation');
	// label_rotRand.position(width-190, 220);
	label_leafProb = createSpan('Flower probability');
	// label_leafProb.position(width-190, 260);

	label_seed = createSpan('Seed:');
	// label_seed.position(width-190, 162);

	input_seed = createInput(randSeed);
	// input_seed.position(width-190, 160);
	input_seed.style('width', '50px')

	button_seed = createButton('Watch it grow!');
	// button_seed.position(width-190, 190);
	button_seed.mousePressed(function() {
		randSeed = input_seed.value();
		startGrow();
	});

	button_newSeed = createButton('Generate new tree');
	// button_newSeed.position(width-190, 190);
	button_newSeed.mousePressed(function(){
		randSeed = Math.floor(Math.random() * 1000);
		prog = 100;
		input_seed.value(randSeed);
		startGrow();
	});

	button_randomParams = createButton('Randomise parameters');
	// button_randomParams.position(width-190, 220);
	button_randomParams.mousePressed(function() {
		randomSeed(paramSeed);

		slider_level.value(1 * slider_level.value() + 4 * rand2() * slider_level.attribute('step'));
		slider_rot.value(1 * slider_rot.value() + 4 * rand2() * slider_rot.attribute('step'));
		slider_lenRand.value(1 * slider_lenRand.value() + 4 * rand2() * slider_lenRand.attribute('step'));
		slider_branchProb.value(1 * slider_branchProb.value() + 4 * rand2() * slider_branchProb.attribute('step'));
		slider_rotRand.value(1 * slider_rotRand.value() + 4 * rand2() * slider_rotRand.attribute('step'));
		slider_leafProb.value(1 * slider_leafProb.value() + 4 * rand2() * slider_leafProb.attribute('step'));

		paramSeed = 1000 * random();
		randomSeed(randSeed);

		readInputs(true);
	});

	button_change = createButton('Enable wind');
	// button_change.position(width-190, 300);

  button_change.mousePressed(function() {

		if ( !mutating ) {
			button_change.html('Disable wind')
			mutateTime = millis();
			mutating = true;
			mutate();
		} else {
			button_change.html('Enable wind')
			mutating = false;
		}
	});

	button_hide = createButton('Hide UI');
	// button_hide.position(width-190, 280);
	button_hide.mousePressed(hideUI);

	label_perf = createSpan('Generated in #ms');
	// label_perf.position(width-190, 310);
	label_perf.style('display', 'none');
  //
	// label_source = createA('https://github.com/someuser-321/TreeGenerator', 'Check it out on GitHub!');
	// label_source.position(10, 330);
	// label_source2 = createA('https://someuser-321.github.io/TreeGenerator/TreeD.html', 'See me in 3D!');
	// label_source2.position(10, 350);

	div_inputs = createDiv('');

	mX = mouseX;
	mY = mouseY;
	panX = 0;
	panY = 0;

	readInputs(false);
	startGrow();
  ////tree end
}

function draw() {
  background(0);
  // showWeather();

//  start rain
  push();
  if (currentWeather === "Rain") {
    drops.forEach(function(d) {
     d.drawAndDrop();
    });
  }
  pop();


  // draw wind 1 : circle
  push();
    windPosition.add(wind);
    stroke(0);
    fill(226, 114, 91);
    ellipse(windPosition.x,windPosition.y,100,100);
  pop();
  // keeps circle in the sreen
  if (windPosition.x > width)  windPosition.x = 0;
  if (windPosition.x < 0)      windPosition.x = width;
  if (windPosition.y > height) windPosition.y = 0;
  if (windPosition.y < 0)      windPosition.y = height;


  // draw wind 2
  push();
    flock.run();
  pop();

// draw mountain
push();
mountains.draw();
pop();

// draw tree
  push();
    let startTime = millis();
    let endTime = millis();
    translate(width/2, 0);
  	branch(1, randSeed);
  pop();
  /// end of draw tree

// display weather details
showWeather();
}


// weather details
function showWeather() {
  push();
    textSize(30)
    noStroke();
    fill(255);
    text(`${currentCity}`,20,70);
  pop();

  push();
    textSize(20)
    noStroke();
    fill(255);
    text(`${currentTempreture}°C`,21, 95);
  pop();

  push();
    textSize(20)
    noStroke();
    fill(255);
    text(`${currentWeather}`,21,120);
  pop();

  push();
    textSize(20)
    noStroke();
    fill(255);
    text(`Wind ${currentWindSpeed} mph`,21,145);
  pop();

  // wind direction arrow compass
  push();
  translate(32, height - 32);
  rotate(wind.heading() + PI/2); // Rotate by the wind's angle
  noStroke();
  fill(255);

  stroke(45, 123, 182);
  strokeWeight(3);
  line(0, -16, 0, 16);

  noStroke();
  fill(45, 123, 182);
  triangle(0, -18, -6, -10, 6, -10);
  pop();

  }

function mousePressed() {
  weatherAsk();
  // adds a boid with a click
  flock.addBoid(new Boid(mouseX,mouseY));
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

// geting weather data
function weatherAsk() {
  loadJSON(url, gotData);
}

function gotData(data) {
  weather = data;
  currentWeather = weather.weather[0].main;
  currentWindSpeed = weather.wind.speed;
  currentWindDeg = weather.wind.deg;
  currentTempreture = weather.main.temp;
  currentCity = weather.name;

  windAngle = radians(currentWindDeg);
  wind = p5.Vector.fromAngle(windAngle);
}


//////////////////create boid
///////////////////
function Boid(x,y) {

  this.acceleration = wind.copy();
  this.velocity =  createVector(random(-1,1),random(-1,1)); // currentWindSpeed
  this.position = createVector(x,y);
  this.r = 3.0;
  this.maxspeed = 3;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
// function Boid(x,y) {
//   this.acceleration = wind.copy();
//   this.velocity = windPosition.copy();
//   this.position = createVector(x,y);
//   this.r = 3.0;
//   this.maxspeed = 3;    // Maximum speed
//   this.maxforce = 0.05; // Maximum steering force
// }

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  var sep = this.separate(boids);   // Separation
  var ali = this.align(boids);      // Alignment
  var coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}


// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  var theta = this.velocity.heading() + radians(90);
  stroke(255);
  fill(225);
  push();
  translate(this.position.x,this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r*2);
  vertex(-this.r, this.r*2);
  vertex(this.r, this.r*2);
  endShape(CLOSE);
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width +this.r;
  if (this.position.y < -this.r)  this.position.y = height+this.r;
  if (this.position.x > width +this.r) this.position.x = -this.r;
  if (this.position.y > height+this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  var desiredseparation = 25.0;
  var steer = createVector(0,0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position,boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  var neighbordist = 50;
  var sum = wind.copy();// createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum,this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0,0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0,0);   // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0,0);
  }
}
///////////////
/////////////////end boids

//////start tree
function branch(level, seed) {
	if ( prog < level )
		return;

	randomSeed(seed);

	let seed1 = random(1000), seed2 = random(1000);

	let growthLevel = (prog - level > 1) || (prog >= maxLevel + 1) ? 1 : (prog - level);

	strokeWeight(12 * Math.pow((maxLevel - level + 1) / maxLevel, 2));
	let len = growthLevel * size* (1 + rand2() * lenRand);
  stroke(255);
	line(0,0, 0, len / level);
	translate(0, len / level);

	let doBranch1 = rand() < branchProb;
	let doBranch2 = rand() < branchProb;
	let doLeaves = rand() < leafProb;

	if ( level < maxLevel ) {
		let r1 = rot * (1 + rrand() * rotRand);
		let r2 = -rot * (1 - rrand() * rotRand);

		if ( doBranch1 ) {
			push();
			rotate(r1);
			branch(level + 1, seed1);
			pop();
		}

		if ( doBranch2 ) {
			push();
			rotate(r2);
			branch(level + 1, seed2);
			pop();
		}
	}

	if ( (level >= maxLevel || (!doBranch1 && !doBranch2)) && doLeaves ) {
		let p = Math.min(1, Math.max(0, prog - level));
		let flowerSize = (size / 100) * p * (1 / 6) * (len / level);

		strokeWeight(1);
		stroke(240 + 15 * rand2(), 140 + 15 * rand2(), 140 + 15 * rand2());
		rotate(-PI);
		for ( var i=0 ; i<=8 ; i++ )
		{
      stroke(255,215,0);
			line(0, 0, 0, flowerSize * (1 + 0.5 * rand2()));
			rotate(2 * PI/8);
		}
	}
}

function startGrow() {
	growing = true;
	prog = 1;
	grow();
}

function grow() {
	if ( prog > (maxLevel + 3) ) {
		prog = maxLevel + 3;
		loop();
		growing = false;
		return;
	}

	var startTime = millis();
	loop();
	var diff = millis() - startTime;

	prog += maxLevel / 8 * Math.max(diff, 20) / 1000;
	setTimeout(grow, Math.max(1, 20 - diff));
}


function rand() {
	return random(1000) / 1000;
}

function rand2() {
	return random(2000) / 1000 - 1;
}

function rrand() {
	return rand2() + randBias;
}
///////end tree

/// tree helpers
function mouseReleased() {
	if ( mouseX > 330 || mouseY > 400 ) {
		return false;
  }

	if ( hide ) {
		showUI();
    hide = !hide;
  }
	// hide = !hide;
}

function touchEnded() {
	if ( hide ) {
		showUI();
	  hide = !hide;

	   return false;
  }
}

function showUI() {
	slider_size.style('visibility', 'initial');
	slider_level.style('visibility', 'initial');
	slider_rot.style('visibility', 'initial');
	slider_lenRand.style('visibility', 'initial');
	slider_branchProb.style('visibility', 'initial');
	slider_rotRand.style('visibility', 'initial');
	slider_leafProb.style('visibility', 'initial');

	button_seed.style('visibility', 'initial');
	button_newSeed.style('visibility', 'initial');
	button_randomParams.style('visibility', 'initial');
	button_change.style('visibility', 'initial');
	button_hide.style('visibility', 'initial');

	label_size.style('visibility', 'initial');
	label_level.style('visibility', 'initial');
	label_rot.style('visibility', 'initial');
	label_lenRand.style('visibility', 'initial');
	label_branchProb.style('visibility', 'initial');
	label_rotRand.style('visibility', 'initial');
	label_leafProb.style('visibility', 'initial');
	label_perf.style('visibility', 'initial');
	label_seed.style('visibility', 'initial');
	label_source.style('visibility', 'initial');
	label_source2.style('visibility', 'initial');

	input_seed.style('visibility', 'initial');

	div_inputs.style('visibility', 'initial');
}

function hideUI() {
	slider_size.style('visibility', 'hidden');
	slider_level.style('visibility', 'hidden');
	slider_rot.style('visibility', 'hidden');
	slider_lenRand.style('visibility', 'hidden');
	slider_branchProb.style('visibility', 'hidden');
	slider_rotRand.style('visibility', 'hidden');
	slider_leafProb.style('visibility', 'hidden');

	button_seed.style('visibility', 'hidden');
	button_newSeed.style('visibility', 'hidden');
	button_randomParams.style('visibility', 'hidden');
	button_change.style('visibility', 'hidden');
	button_hide.style('visibility', 'hidden');

	label_size.style('visibility', 'hidden');
	label_level.style('visibility', 'hidden');
	label_rot.style('visibility', 'hidden');
	label_lenRand.style('visibility', 'hidden');
	label_branchProb.style('visibility', 'hidden');
	label_rotRand.style('visibility', 'hidden');
	label_leafProb.style('visibility', 'hidden');
	label_perf.style('visibility', 'hidden');
	label_seed.style('visibility', 'hidden');
	label_source.style('visibility', 'hidden');
	label_source2.style('visibility', 'hidden');

	input_seed.style('visibility', 'hidden');

	div_inputs.style('visibility', 'hidden');
}

function readInputs(updateTree) {
	size = slider_size.value();
	maxLevel = slider_level.value();
	rot = slider_rot.value();
	lenRand = slider_lenRand.value();
	branchProb = slider_branchProb.value();
	rotRand = slider_rotRand.value();
	leafProb = slider_leafProb.value();

	if ( updateTree && !growing ) {
		prog = maxLevel + 1;
		loop();
	}
}

function mutate() {
	if ( !mutating ) {
		return;
  }
	let startTime = millis();
	randomSeed(paramSeed);

	let n = noise(startTime/20000) - 0.5;

	randBias = 4 * Math.abs(n) * n;

	paramSeed = 1000 * random();
	randomSeed(randSeed);
	readInputs(true);

	let diff = millis() - startTime;

	if ( diff < 20 ) {
		setTimeout(mutate, 20 - diff);
	} else {
		setTimeout(mutate, 1);
  }
}
