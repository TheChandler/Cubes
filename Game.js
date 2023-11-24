import { MakeGameCamera } from "./GameCamera.js";
import { Cubes } from "./Cubes.js";

let canvas = document.getElementById("canv");
canvas.height = 1300;
canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight);

let ctx = MakeGameCamera(canvas.getContext("2d"), canvas, 0, 0);

new Cubes()

export { ctx, canvas }