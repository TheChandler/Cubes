import { ctx } from "../Game.js";
import { Circle, Perlin, Polygon, Vector2 } from "../GameMath.js";
let perlin = new Perlin();

export class Cubes {
    constructor() {
        document.getElementById('cube-count').addEventListener('change', this.create.bind(this))
        document.getElementById('slider1').addEventListener('change', this.create.bind(this))
        document.getElementById('slider2').addEventListener('change', this.create.bind(this))
        document.getElementById('slider3').addEventListener('change', this.create.bind(this))
        document.getElementById('slider4').addEventListener('change', this.create.bind(this))
        document.getElementById('slider5').addEventListener('change', this.create.bind(this))
        document.getElementById('slider6').addEventListener('change', this.create.bind(this))
        document.getElementById('use-rgb').addEventListener('click', this.create.bind(this))
        document.getElementById('renoise').addEventListener('click', (() => {
            perlin.seed()
            this.create()
        }).bind(this))
        this.create()
    }
    create() {
        this.points = []
        this.points.push(this.getPointAtGrid(2, 0))
        // this.points = [new Vector2(1000, 0)]
        this.polygons = [];
        let size = document.getElementById('cube-count').value
        let useRGB = document.getElementById('use-rgb').checked
        console.log(useRGB)
        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                let xmod = (i + 999) % 2;
                let ymod = (j + 999) % 3

                if (xmod && !ymod) {
                    this.polygons.push(new Polygon([
                        this.getPointAtGrid(i, j),
                        this.getPointAtGrid(i + 1, j),
                        this.getPointAtGrid(i + 1, j + 1),
                        this.getPointAtGrid(i, j + 1),
                    ]))
                    useRGB ?
                        this.polygons[this.polygons.length - 1].color = '#f44' :
                        this.polygons[this.polygons.length - 1].color = this.getColorAt(i, j)
                } else if (!xmod && ymod == 1) {
                    this.polygons.push(new Polygon([
                        this.getPointAtGrid(i, j + 1),
                        this.getPointAtGrid(i + 1, j),
                        this.getPointAtGrid(i + 1, j + 1),
                        this.getPointAtGrid(i, j + 2),
                    ]))
                    useRGB ?
                        this.polygons[this.polygons.length - 1].color = '#f44' :
                        this.polygons[this.polygons.length - 1].color = this.getColorAt(i, j)
                } else if (!xmod && !ymod) {
                    this.polygons.push(new Polygon([
                        this.getPointAtGrid(i, j),
                        this.getPointAtGrid(i + 1, j),
                        this.getPointAtGrid(i + 1, j + 1),
                        this.getPointAtGrid(i, j + 1),
                    ]))
                    useRGB ?
                        this.polygons[this.polygons.length - 1].color = '#4f4' :
                        this.polygons[this.polygons.length - 1].color = this.getColorAt(i, j)
                } else if (xmod && ymod == 1) {
                    this.polygons.push(new Polygon([
                        this.getPointAtGrid(i, j),
                        this.getPointAtGrid(i + 1, j + 1),
                        this.getPointAtGrid(i + 1, j + 2),
                        this.getPointAtGrid(i, j + 1),
                    ]))
                    useRGB ?
                        this.polygons[this.polygons.length - 1].color = '#4f4' :
                        this.polygons[this.polygons.length - 1].color = this.getColorAt(i, j)
                } else if (xmod && ymod == 2) {
                    this.polygons.push(new Polygon([
                        this.getPointAtGrid(i, j),
                        this.getPointAtGrid(i + 1, j + 1),
                        this.getPointAtGrid(i, j + 1),
                        this.getPointAtGrid(i - 1, j + 1),
                    ]))
                    useRGB ?
                        this.polygons[this.polygons.length - 1].color = '#44f' :
                        this.polygons[this.polygons.length - 1].color = this.getColorAt(i, j)
                } else if (!xmod && ymod == 2) {
                    this.polygons.push(new Polygon([
                        this.getPointAtGrid(i, j),
                        this.getPointAtGrid(i + 1, j - 1),
                        this.getPointAtGrid(i, j - 1),
                        this.getPointAtGrid(i - 1, j - 1),
                    ]))
                    // this.points.push(this.getPointAtGrid(i, j))
                    useRGB ?
                        this.polygons[this.polygons.length - 1].color = '#44f' :
                        this.polygons[this.polygons.length - 1].color = this.getColorAt(i, j)
                }
            }
        }
        this.draw()
    }
    draw() {
        ctx.clearRect(0, 0, 10000, 10000)
        // for (let c of this.circles) {
        //     c.drawOutline();
        // }
        for (let p of this.points) {
            p.draw();
        }
        for (let p of this.polygons) {
            p.draw();
        }

    }
    getPointAtGrid(x, y) {
        if (x == 0 && y == 0) {
            return new Vector2(0, 0)
        }
        let newX
        let newY
        let scale = document.getElementById('slider4').value * 5;
        if (x % 2) {
            newX = x * scale * Math.cos(Math.PI / 6)
            newY = (y * scale) - (scale / 2)
        } else {
            newX = x * scale * Math.cos(Math.PI / 6)
            newY = y * scale
        }

        let hyp = Math.sqrt((Math.abs(newX) * Math.abs(newX)) + (Math.abs(newY) * Math.abs(newY)))
        let adjHyp = convertNumber(hyp)

        // if (newY < 0){
        //     return new Vector2(Math.max(0,adjHyp),0)
        // }
        let angle = Math.atan(newY / newX)
        if (!angle) { console.log(angle) }
        if (newX < 0) {
            angle += Math.PI
        }
        let addAngle = document.getElementById('slider5').value * .02 * Math.PI;

        angle += addAngle * (adjHyp / (document.getElementById('slider1').value * 10))

        return new Circle(0, 0, adjHyp).getPointAt(angle, true)

        newX = newX * (adjHyp / hyp)
        newY = newY * (adjHyp / hyp)
        return new Vector2(newX, newY)
    }
    getColorAt(x, y) {
        // console.log(perlin.get(12,55))
        let noiseScale = document.getElementById('slider6').value
        x *= noiseScale
        y *= noiseScale
        x += .01
        y += .01
        let r = (0xF - (Math.abs(Math.floor(perlin.get(x, y) * 0xF)))).toString(16)
        let g = (0xF - (Math.abs(Math.floor(perlin.get(-x, y) * 0xF)))).toString(16)
        let b = (0xF - (Math.abs(Math.floor(perlin.get(x, -y) * 0xF)))).toString(16)
        // console.log(color.toString(16))
        return "#" + r + g + b;

    }
    convertToPoints(index) {
        let vector2s = []
        for (let i of index) {
            vector2s.push(this.points[i])
        }
        return vector2s
    }
}
function convertNumber(num) {
    let limit = document.getElementById('slider1').value * 20;
    // if (num>limit){return limit}
    let normalized = Math.min(limit, (Math.abs(num))) / limit;
    let powA = document.getElementById('slider2').value * .01;
    // return limit * Math.pow(normalized, powA)

    let powBScale = document.getElementById('slider3').value * .02;
    return Math.sign(num) * Math.min(Math.abs(num * Math.pow(powA, normalized * powBScale)), 1000 * Math.pow(powA, powBScale) * powBScale)
}