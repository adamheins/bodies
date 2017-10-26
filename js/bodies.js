'use strict';


let G = 100;  // Gravitational constant. In my simulation, I make the rules.
let DT = 0.1; // Time step, in seconds.

const VECTOR_ZERO = [0, 0];


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
        this.path = [pos]; // Store all past and current positions here.
        this.pos = pos;
        this.vel = vel;
        this.force = VECTOR_ZERO;
    }

    // Update velocity and position in response to a force.
    step() {
        let acc = Vector.scale(this.force, 1 / this.mass);
        this.vel = Vector.add(this.vel, Vector.scale(acc, DT));
        this.pos = Vector.add(this.pos, Vector.scale(this.vel, DT));

        // Only add a new point to the path if it is reasonably distant from
        // the last one.
        let last = this.path[this.path.length - 1];
        if (Vector.square(Vector.subtract(this.pos, last)) > this.radius * this.radius) {
            this.path.push(this.pos);
        }
    }

    // Returns a new velocity.
    collide(other) {
        let m = 2 * other.mass / (this.mass + other.mass);
        let dx = Vector.subtract(this.pos, other.pos);
        let dx2 = Vector.square(dx);
        let dv = Vector.subtract(this.vel, other.vel);

        return Vector.subtract(this.vel, Vector.scale(dx, m * Vector.dot(dv, dx) / dx2));
    }

    draw(ctx) {
        fillCircle(ctx, this.pos[0], this.pos[1], this.radius, this.color);
    }

    drawPath(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.path[0][0], this.path[0][1]);
        this.path.slice(1).forEach(pos => {
            ctx.lineTo(pos[0], pos[1]);
        });
        ctx.strokeStyle = this.color;
        ctx.stroke();
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


function render(ctx, bodies) {
    // Clear the screen.
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    // Draw the paths.
    bodies.forEach(body => {
        body.drawPath(ctx);
    });

    // Draw the bodies.
    bodies.forEach(body => {
        body.draw(ctx);
    });
}


// Perform a step of the simulation.
function step(ctx, bodies) {
    // Reset force on each body.
    bodies.forEach(body => {
        body.force = VECTOR_ZERO;
    });

    // Calculate new gravitational forces.
    pairs(bodies, (a, b) => {
        let del = Vector.subtract(a.pos, b.pos);
        let dist = Vector.norm2(del);

        // Check for collision.
        if (dist <= a.radius + b.radius) {
            // Elastic collision.
            let va = a.collide(b);
            let vb = b.collide(a);

            a.vel = va;
            b.vel = vb;
        } else {
            // Force of gravity.
            let dir = Vector.normalize(del);
            let force = Vector.scale(dir, -G * a.mass * b.mass / dist);

            a.force = Vector.add(a.force, force);
            b.force = Vector.subtract(b.force, force);
        }
    });

    // Update positions and velocities.
    bodies.forEach(body => {
        body.step();
    });

    // Draw.
    render(ctx, bodies);
}


function getBodies() {
    let one = new Body('one', 10, 10, 'blue');
    one.init([350, 150], [20, 0]);

    let two = new Body('two', 12, 12, 'red');
    two.init([350, 550], [-20, 0]);

    let three = new Body('three', 0.05, 3, 'green');
    three.init([150, 350], [-12, 10]);

    return [one, two, three];
}


function main() {
    let canvas = document.getElementById('gameCanvas');
    let ctx = canvas.getContext('2d');

    let bodies = getBodies();

    // Start the simulation.
    let interval = setInterval(step.bind(null, ctx, bodies), DT * 1000);

    let paused = false;

    // Pause button.
    let pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.addEventListener('click', () => {
        if (paused) {
            pauseBtn.innerHTML = 'Pause';
            interval = setInterval(step.bind(null, ctx, bodies), DT * 1000);
        } else {
            pauseBtn.innerHTML = 'Play';
            clearInterval(interval);
        }
        paused = !paused;
    }, false);

    // Reset button.
    document.getElementById('resetBtn').addEventListener('click', () => {
        clearInterval(interval);
        bodies = getBodies();
        render(ctx, bodies);
        if (!paused) {
            interval = setInterval(step.bind(null, ctx, bodies), DT * 1000);
        }
    }, false);
}


window.onload = function() {
    main();
}
