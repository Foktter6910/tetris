const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

context.scale(30, 30);

const arena = createMatrix(10, 20);
let score = 0;
let message1Shown = false;
let message2Shown = false;
const colors = [
    null,
    "#ff4d6d",
    "#ff758f",
    "#ff8fa3",
    "#ffb3c1",
    "#ffccd5",
    "#c9184a",
    "#ff006e",
    "#ff69b4" // heart color
];

const player = {
    pos: {x: 0, y: 0},
    matrix: null
};

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    if (type === "T") return [[0,6,0],[6,6,6],[0,0,0]];
    if (type === "O") return [[4,4],[4,4]];
    if (type === "L") return [[0,3,0],[0,3,0],[0,3,3]];
    if (type === "J") return [[0,2,0],[0,2,0],[2,2,0]];
    if (type === "I") return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
    if (type === "S") return [[0,5,5],[5,5,0],[0,0,0]];
    if (type === "Z") return [[7,7,0],[0,7,7],[0,0,0]];
    if (type === "H") return [[8,0,8],[8,8,8],[0,8,0]];
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

document.getElementById("secretBtn").addEventListener("click", () => {
    score += 50;
    scoreElement.innerText = score;
    checkMessages();
});


function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        arena.splice(y, 1);
        arena.unshift(new Array(10).fill(0));


        
        score += 100; 
        scoreElement.innerText = score;
        checkMessages();

        ++y;
    }
}

function checkMessages() {
    if (score >= 1000 && !message1Shown) {
        message1Shown = true;
        alert("48.8606° N, 2.3376° E");
    }

    if (score >= 1402 && !message2Shown) {
        message2Shown = true;
        alert("???????");
    }
}


function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] =
            [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
}

function playerRotate() {
    const pos = player.pos.x;
    rotate(player.matrix);
    if (collide(arena, player)) player.pos.x = pos;
}

function playerReset() {
    const pieces = "ILJOTSZH"; 
    player.matrix = createPiece(
        pieces[Math.floor(Math.random() * pieces.length)]
    );
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0;
        scoreElement.innerText = score;
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);

                context.strokeStyle = "#ffffff";
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x,
                                   y + offset.y,
                                   1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = "#ffe6f0"; 
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}


let dropCounter = 0;
let dropInterval = 700;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();

    draw();
    requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
    if (event.keyCode === 37) playerMove(-1);
    else if (event.keyCode === 39) playerMove(1);
    else if (event.keyCode === 40) playerDrop();
    else if (event.keyCode === 38) playerRotate();
});

playerReset();
update();
