import { ctx } from "./Game.js";

export class Vector2 {
    constructor(x, y) {
        if (x[1]) {
            this.x = x[0]
            this.y = x[1]
        } else {
            this.x = x;
            this.y = y;
        }
    }
    add(a, b) {
        let newVec = convertToVector2(a, b)
        this.x += newVec.x;
        this.y += newVec.y;
        return this;
    }
    difference(a, b) {
        let newVec = convertToVector2(a, b);
        return new Vector2(this.x - newVec.x, this.y - newVec.y);
    }
    distanceTo(a, b) {
        let newVec = convertToVector2(a, b)
        return Math.sqrt(Math.pow(this.x - newVec.x, 2) + Math.pow(this.y - newVec.y, 2))
    }
    squaredDistanceTo(a, b) {//Sometimes taking the squareroot is a waste because we immediately square the distance
        let newVec = convertToVector2(a, b)
        return Math.pow(this.x - newVec.x, 2) + Math.pow(this.y - newVec.y, 2)
    }

    draw( color) {
        ctx.fillStyle = color ?? 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    toString() {
        return `[${this.x},${this.y}]`;
    }
}
function convertToVector2(a, b) {
    if (a instanceof Vector2) {
        return a;
    } else if (Array.isArray(a) && a.length == 2) {
        return new Vector2(a[0], a[1]);
    } else if (Object.hasOwn(a, 'x') && Object.hasOwn(a, 'y')) {
        return new Vector2(a.x, a.y);
    } else if (typeof a === 'number' && typeof b === 'number') {
        return new Vector2(a, b);
    } else {
        throw new Error("Not a Vector2 or vector2 compatible")
    }
}


export class Line {
    constructor(a, b) {
        try {
            this.a = convertToVector2(a);
            this.b = convertToVector2(b);
        } catch (e) {
            console.error(e)
            throw new Error("Cannot create Line from ", a, b);
        }
        this.length = this.a.distanceTo(this.b)
    }
    collides(shape) {
        if (shape instanceof Vector2) {
            return shape.distanceTo(this.a) + shape.distanceTo(this.b) - this.length == 0;
        } else if (shape instanceof Circle) {
            if (shape.collides(this.a) || shape.collides(this.b)) {
                return true;
            }
            let dot = (((shape.position.x - this.a.x) * (this.b.x - this.a.x)) + ((shape.position.y - this.a.y) * (this.b.y - this.a.y))) / this.a.squaredDistanceTo(this.b);
            if (dot < 0 || dot > 1) {
                return false;
            }
            let collide = shape.collides(new Vector2(this.a.x + dot * (this.b.x - this.a.x), this.a.y + dot * (this.b.y - this.a.y)))
            if (collide) {
                console.log("Here is the collision")
                console.log(this.a.x + dot * (this.b.x - this.a.x), this.a.y + dot * (this.b.y - this.a.y))
                console.log(shape.position)
                return true
            }

        } else {
            throw new Error("Unhandled collsions type for Line and ", shape.constructor.name)
        }
    }
    distanceTo(a, b) {
        let point = convertToVector2(a, b);
        let dot = (((point.x - this.a.x) * (this.b.x - this.a.x)) + ((point.y - this.a.y) * (this.b.y - this.a.y))) / this.a.squaredDistanceTo(this.b);
        if (dot < 0 || dot > 1) {
            return Math.min(point.distanceTo(this.a), point.distanceTo(this.b));
        }
        return point.distanceTo(new Vector2(this.a.x + dot * (this.b.x - this.a.x), this.a.y + dot * (this.b.y - this.a.y)))

    }
    draw(ctx, color) {
        // ctx.fillStyle = color ?? 'green'; //Lines don't fill
        ctx.beginPath()
        ctx.moveTo(this.a.x, this.a.y)
        ctx.lineTo(this.b.x, this.b.y)
        ctx.stroke();
    }
    toString() {
        return this.a + " " + this.b;
    }
}


export class Circle {
    constructor(x, y, r) {
        this.position = new Vector2(x, y);
        this.radius = r;
        this.color = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0') + 'C0';
    }
    get x() {
        return this.position.x
    }
    set x(num) {
        this.position.x = num
    }

    get y() {
        return this.position.y
    }
    set y(num) {
        this.position.y = num
    }

    collides(shape) {
        if (shape instanceof Vector2) {
            if (shape.distanceTo(this.position) < this.radius)
                console.log(shape.distanceTo(this.position), this.radius)
            return shape.distanceTo(this.position) < this.radius;
        } else if (shape instanceof Circle) {
            return shape.position.distanceTo(this.position) < this.radius + shape.radius;
        } else {
            throw new Error("Unhandled collsions type for Line and " + shape.constructor.name)
        }
    }
    draw(color, offset, isSolid=true) {

        offset = offset ?? { x: 0, y: 0 }
        ctx.fillStyle = color ?? this.color;
        ctx.beginPath();
        ctx.arc(this.position.x + (offset.x), this.position.y + (offset.y), this.radius, 0, 2 * Math.PI);
        if (isSolid){
            ctx.fill()
        }else{
            ctx.stroke();
        }
    }
    drawOutline(offset){
        this.draw(null,offset,false);
    }
    getPointAt(degree, isRadian=false){
        let radians;
        if (isRadian){
            radians = degree
        }else{
            radians = degree * 0.0174533;
        }
        // console.log(degree)
        let x = (Math.cos(radians) * this.radius ) + this.position.x;
        let y = (Math.sin(radians) * this.radius) + this.position.y;
        return new Vector2(x,y);
    }
}


export class Polygon {
    /**
     * 
     * @param {[Vector2] } points
     */
    constructor(points) {
        this.points = points.map(p => convertToVector2(p))
        this.lines = this.points.map((p, i, a) => {
            if (i < a.length - 1) {
                return new Line(p, a[i + 1])
            }
            if (i == a.length - 1) {
                return new Line(p, a[0]);
            }
        })
        this.collided = false;
        this.color = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0') + 'C0';
    }
    collides(shape, debug) {
        // if (debug) {
        //     console.log("Collides shape: ", shape)
        //     console.log(this.points)
        // }
        if (shape instanceof Circle || shape instanceof Vector2) {
            for (let line of this.lines) {
                if (line.collides(shape)) {
                    if (debug) {
                        console.log("collided with Line")
                        console.log("line: ", line, "shape: ", shape)
                    }
                    return true;
                }
            }
            let px
            let py

            let collision = false;
            try {
                px = shape.x ?? shape.position.x;
                py = shape.y ?? shape.position.y;
            } catch (e) {
                console.error("Polygon error colliding with: ", shape)
            }
            if (debug) {
                // console.log("px py: ", px, py)
            }
            this.points.forEach((vc, i) => {
                let vn = i < this.points.length - 1 ? this.points[i + 1] : this.points[0];
                if (((vc.y > py) != (vn.y > py)) && (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
                    collision = !collision;
                }
            });
            return collision
        } else {
            throw new Error("Unhandled collision type for Polygon and ", shape.constructor.name);
        }
    }
    draw(offset) {
        ctx.fillStyle = (this.collided ? 'red' : this.color);
        ctx.beginPath();
        ctx.moveTo(this.points[0].x + (offset?.x ?? 0), this.points[0].y + (offset?.y))
        for (let point of this.points) {
            ctx.lineTo(point.x + (offset?.x ?? 0), point.y + (offset?.y ?? 0));
        }
        ctx.closePath();
        ctx.fill();
    }
    printLines() {
        for (let line of this.lines) {
            console.log(line.toString());
        }
        return "new Polygon([" + this.points.reduce((val, val2) => val + "," + val2) + "])";
    }
}
export class Sprite {
    constructor(image, x, y, width, height) {
        this.image = image;

        // this.image = new Image()
        // this.image.src = './images/playButton.png'
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.polygon = new Polygon([
            [x, y], [x + width, y], [x + width, y + height], [x, y + height]
        ])
    }
    collides(shape, debug) {
        return this.polygon.collides(shape, debug);
    }
    draw(ctx, offset) {
        ctx.drawImage(this.image, this.x + (offset?.x ?? 0), this.y + (offset?.y ?? 0), this.width, this.height);
    }
}

//Stolen from https://github.com/joeiddon/perlin/blob/master/perlin.js until I'm able to wrap my tiny brain around it
export class Perlin {
    constructor(){
        this.seed();
    }
    rand_vect(){
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    }
    dot_prod_grid(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    }
    smootherstep(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    }
    interp(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    }
    seed(){
        this.gradients = {};
        this.memory = {};
    }
    get(x, y) {
        if (this.memory.hasOwnProperty([x,y]))
            return this.memory[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    }
}