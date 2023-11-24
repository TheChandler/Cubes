import { Vector2 } from "./GameMath.js";
import { canvas } from "./Game.js";

const SPEED = 170;


//This is pretty dumb but it basically turns ctx into a camera object
// Overrides the methods listed below with ones that take position into account
export function MakeGameCamera(ctx, canvas, x, y) {
    let ctxarc = ctx.arc;
    let ctxmoveTo = ctx.moveTo;
    let ctxlineTo = ctx.lineTo;
    let ctxfillText = ctx.fillText;
    let ctxdrawImage = ctx.drawImage;
    let ctxfillRect = ctx.fillRect;

    return Object.assign(ctx, {
        position: new Vector2(x, y),
        destination: new Vector2(x, y),
        size: new Vector2(canvas.width, canvas.height),
        offset: [],
        update: function (x, y) {
            this.destination = new Vector2(x, y)
            if (this.position.distanceTo(this.destination) < SPEED) {
                this.position.x = this.destination.x;
                this.position.y = this.destination.y;
                // console.log("OPTION ONE")
            } else {
                let velocity = this.destination.difference(this.position)
                let scale = SPEED / velocity.distanceTo(0, 0)
                // console.log("OPTION TWO", velocity, scale)
                this.position.x += velocity.x * scale;
                this.position.y += velocity.y * scale;
            }

            let o = this.offset.length ? this.offset.shift() : { x: 0, y: 0 };
            this.position.x = this.position.x + o.x
            this.position.y = this.position.y + o.y
        },
        smallShake: function (startingIntensity, time, endingIntensity = startingIntensity) {
            let intensity = startingIntensity;
            this.offset = []
            for (let i = 0; i <= time; i++) {
                let angle = Math.random() * 2 * Math.PI
                this.offset.push(new Vector2(Math.sin(angle) * intensity, Math.cos(angle) * intensity))
                intensity = startingIntensity + ((endingIntensity - startingIntensity) * i / (time - 1))
            }
        },
        arc: function (x, y, r, a, c) {
            ctxarc.apply(ctx, [x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2, r, a, c]);
        },
        moveTo(x, y) {
            ctxmoveTo.apply(ctx, [x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2]);
        },
        lineTo(x, y) {
            ctxlineTo.apply(ctx, [x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2]);
        },
        fillText(string, x, y) {
            ctxfillText.apply(ctx, [string, x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2])
        },
        drawImage(image, x, y, dx, dy) {
            try {
                if (dx && dy) {
                    ctxdrawImage.apply(ctx, [image, x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2, dx, dy])
                } else {
                    ctxdrawImage.apply(ctx, [image, x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2])
                }
            } catch (e) {
                ctx.fillStyle = Math.random() > .5 ? 'red' : 'black';
                // console.log(image)
                if (dx && dy) {
                    ctxfillRect.apply(ctx, [x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2, dx, dy])
                } else {
                    ctxfillRect.apply(ctx, [x - this.position.x + this.size.x / 2, y - this.position.y + this.size.y / 2, 100, 100])
                }
            }
        },
        test: function () {
            console.log('test')
        },
        drawShapes(shapes) {
            for (let shape of shapes) {
                shape.draw(this)
            }
        },
        convertScreenCordsToWorldCords(x, y) {
            return [
                ((x / canvas.clientWidth) * this.size.x) + this.position.x - (this.size.x / 2),
                ((y / canvas.clientHeight) * this.size.y) + this.position.y - (this.size.y / 2)
            ]
        },
        getWorldCordsFromEvent(event) {
            return [
                ((event.clientX / canvas.clientWidth) * this.size.x) + this.position.x - (this.size.x / 2),
                ((event.clientY / canvas.clientHeight) * this.size.y) + this.position.y - (this.size.y / 2)
            ]
        }
    })
}