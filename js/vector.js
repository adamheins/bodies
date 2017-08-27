'use strict';

// Simple 2D vector.
// All methods return a new vector rather than modifying the vector in place.
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
