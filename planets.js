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

    square() {
        return this.x * this.x + this.y * this.y;
    }

    magnitude() {
        return Math.sqrt(this.square());
    }

    // fromPolar(mag, angle) {
    //     return new Vector(mag * Math.sin(angle), mag * Math.cos(angle));
    // }

    unit() {
        let mag = this.magnitude();
        return new Vector(this.x / mag, this.y / mag);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    // String representation of the vector.
    str(num_decimal_places = 2) {
        let x = this.x.toFixed(num_decimal_places);
        let y = this.y.toFixed(num_decimal_places);
        return '(' + x + ', ' + y + ')';
    }
}


let VECTOR_ZERO = new Vector(0, 0);


// Convenience function for drawing a filled circle.
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

    step() {
        let a = this.force.scale(1 / this.mass);
        this.vel = this.vel.add(a.scale(DT));
        this.pos = this.pos.add(this.vel.scale(DT));
    }

    // Returns a new velocity.
    collide(other) {
        let m = 2 * other.mass / (this.mass + other.mass);
        let dx = this.pos.subtract(other.pos);
        let dx2 = dx.square();
        let dv = this.vel.subtract(other.vel);

        return this.vel.subtract(dx.scale(m * dv.dot(dx) / dx2));
    }

    draw(ctx) {
        fillCircle(ctx, this.pos.x, this.pos.y, this.radius, this.color);
    }
}


// Call a callback on each pair of items in the list.
function pairs(list, cb) {
    for (let i = 0; i < list.length; ++i) {
        for (let j = i + 1; j < list.length; ++j) {
            cb(list[i], list[j]);
        }
    }
}


// Perform a step of the simulation.
function step(ctx, bodies) {
    // Reset force on each body.
    bodies.forEach(body => {
        body.force = VECTOR_ZERO;
    });

    // Calculate new gravitational forces.
    pairs(bodies, (a, b) => {
        let del = a.pos.subtract(b.pos);
        let dist = del.magnitude();
        let dir = del.unit();

        // Don't let bodies get too close.
        let min_dist = a.radius + b.radius;
        if (dist < min_dist) {
            // Collision!
            let va = a.collide(b);
            let vb = b.collide(a);

            a.vel = va;
            b.vel = vb;

            // dist = min_dist;
        } else {
            // Force of gravity.
            let F = dir.scale(-G * a.mass * b.mass / dist);

            a.force = a.force.add(F);
            b.force = b.force.add(F.negate());
        }
    });

    ctx.clearRect(0, 0, 500, 500);

    // Update positions and velocities, and draw.
    bodies.forEach(body => {
        body.step();
        body.draw(ctx);
    });
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

    let three = new Body('three', 10, 10, 'green');
    three.init(new Vector(400, 100),
               new Vector(-5, 5));

    let bodies = [one, two, three];

    // Start the simulation.
    let interval = setInterval(step.bind(null, ctx, bodies), DT * 1000);

    let paused = false;
    document.getElementById('pauseBtn').addEventListener('click', () => {
        if (paused) {
            console.log('Unpaused.');
            interval = setInterval(step.bind(null, ctx, bodies), DT * 1000);
        } else {
            console.log('Paused.');
            clearInterval(interval);
        }
        paused = !paused;
    }, false);
}


window.onload = function() {
    main();
}
