'use strict';


let G = 100;
let DT = 0.1; // seconds
let DURATION = 20; // seconds


class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    negate() {
        return this.scale(-1);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // fromPolar(mag, angle) {
    //     return new Vector(mag * Math.sin(angle), mag * Math.cos(angle));
    // }

    unit() {
        let mag = this.magnitude();
        return new Vector(this.x / mag, this.y / mag);
    }

    str() {
        return '(x=' + this.x + ' , y=' + this.y + ')';
    }
}


function fillCircle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}


class Body {
    constructor(name, mass, radius, color) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.color = color;
    }

    init(pos, vel) {
        this.pos = pos;
        this.vel = vel;
        this.force = new Vector(0, 0);
    }

    tick(force) {
        let a = force.scale(1 / this.mass);
        this.vel = this.vel.add(a.scale(DT));
        this.pos = this.pos.add(this.vel.scale(DT));
    }

    draw(ctx) {
        fillCircle(ctx, this.pos.x, this.pos.y, this.radius, this.color);
    }
}

function pairs(list, cb) {
    for (let i = 0; i < list.length; ++i) {
        for (let j = i + 1; j < list.length; ++j) {
            cb(list[i], list[j]);
        }
    }
}

function tick(ctx, bodies) {
    // for each body, calculate force vector based on the other bodies
    // calculate acceleration based on force and mass
    // v += a * dt
    // p += v * dt
    //
    // two bodies for now
    let b1 = bodies[0];
    let b2 = bodies[1];

    pairs(bodies, (a, b) => {

    });

    let del = b1.pos.subtract(b2.pos);
    let dist = del.magnitude();
    let dir = del.unit();

    // Don't let bodies get too close.
    let min_dist = (b1.radius + b2.radius) * 2;
    if (dist < min_dist) {
        dist = min_dist;
    }

    // Force of gravity.
    let F = dir.scale(-G * b1.mass * b2.mass / dist);

    b1.tick(F);
    b2.tick(F.negate());

    // Drawing.
    ctx.clearRect(0, 0, 500, 500);
    bodies.forEach(body => {
        body.draw(ctx);
    });
}

function stop(interval) {
    console.log('Stopping execution.');
    clearInterval(interval);
}

function main() {
    let canvas = document.getElementById('gameCanvas');
    let ctx = canvas.getContext('2d');

    let one = new Body('one', 20, 10, 'blue');
    one.init(new Vector(100, 100),
             new Vector(20, 0));

    let two = new Body('two', 5, 10, 'red');
    two.init(new Vector(400, 400),
             new Vector(-20, 0));

    let bodies = [one, two];

    // Start the simulation.
    let interval = setInterval(tick.bind(null, ctx, bodies), DT * 1000);

    // Stop the simulation eventually.
    setTimeout(stop.bind(null, interval), DURATION * 1000);
}


window.onload = function() {
    main();
}
