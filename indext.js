const canvas = document.getElementById('player1');
const ctx = canvas.getContext("2d");

const keys = {};

let renderMode = "main";

const playerRatio = (1839 / 2680) * 200;
const towerRatio = (758 / 2680) * 200;
const image1 = new Image();
image1.src = './img/9.png';
const image2 = new Image();
image2.src = './img/11.png';
const image3 = new Image();
image3.src = './img/9111.png';

const player = {
    x: 0,
    y: 0.2,
    color: 'red',
    image: image1,
    width: playerRatio,
    height: 200,
    speed: 0.0004, // Units per second
    dashDistance: 0.001, // Distance for the dash
    dashDuration: 0.1, // Duration of the dash in seconds
    isDashing: false,
    dashStartTime: null,
    dashCooldown: 5,
    dashCooldownStart: null,
    dashDirection: 0,
    canOpenUp: true,
    OpenUpTime: 1,
    openUpCoolDownStart: null,
    openUpCoolDown: 15,
    isOpen: false,
    openUpStartTime: null,
    isClosing: false
};

const tower1 = {
    x: player.x,
    y: player.y,
    width: towerRatio,
    height: 200,
    speed: 0.0005,
    // speed: 0,
    color: 'blue',
    image: image2,
}
const tower2 = {
    x: player.x,
    y: player.y,
    width: towerRatio,
    height: 200,
    speed: 0.0005,
    // speed: 0,
    color: 'blue',
    image: image3,
}

const airPlaine = {

}

let mouseX = 0;
let mouseY = 0;

const mouse = {
    x: 0,
    y: 0
}

const imageRatio = 1106 / 1231;

const hand = {
    x: 1,
    y: -2,
    color: 'yellow',
    width: 400 * imageRatio,
    height: 400,
    imgSrc: './img/binladen hand.png',
    isHand: false,
    handOpenTime: 3,
    handOpenSpeed: 0.01,
    handCloseSpeed: 0.001,
    handOpenUpStartTime: null
}

const image = new Image();

function updateMousePosition(event) {
    // Get the canvas bounding rectangle
    const rect = canvas.getBoundingClientRect();
    // Calculate mouse position relative to the canvas
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    // Update coordinates display
    document.getElementById('coordinates').textContent = `Mouse Position: (${mouseX.toFixed(1)}, ${mouseY.toFixed(1)})`;
    const normal = positionToNormal(mouseX, mouseY);
    mouse.x = normal.x;
    mouse.y = normal.y
    // Optional: Visualize mouse position
    // draw();
}
window.addEventListener('mousemove', updateMousePosition);

const targetFPS = 200; // Target frames per second
const frameInterval = 1000 / targetFPS; // Time per frame in milliseconds

let lastFrameTime = performance.now();
let frameCount = 0;
let fpsCountTime = lastFrameTime;
const image4 = new Image();
image4.src = './img/crosshair.png';

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    requestAnimationFrame(gameLoop);

    if (deltaTime >= frameInterval) {
        lastFrameTime = currentTime;
        frameCount++;
        handelInput(deltaTime);
        updatePlayer(deltaTime);
        clearScrean();
        drawTower();
        // drawObject(hand);
        drawPointingObject(hand, deltaTime);
        drawObject({ color: "black", width: 20, height: 20, x: mouse.x, y: mouse.y ,image: image4});
        // Update FPS counter every second
        if (currentTime - fpsCountTime >= 1000) {
            document.getElementById('fpsCounter').textContent = 'FPS: ' + frameCount;
            fpsCountTime = currentTime;
            frameCount = 0;
        }
    }
}
function drawRotatedCube(x, y, angle, cubeSize) {
    ctx.save(); // Save the current state
    ctx.translate(x + cubeSize / 2, y + cubeSize / 2); // Move to the center

    ctx.rotate(angle); // Rotate in radiance
    ctx.translate(-cubeSize / 2, -cubeSize / 2); // Move back to top-left corner

    // Draw the cube rectangle
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, cubeSize, cubeSize);

    ctx.restore(); // Restore the original state

}

function drawPointingObject(object, deltaTime) {
    const xy = normalToPosition(object);
    // const point = normalToPosition(object1);
    // const deltaX = point.x - (xy.x + object.width / 2);
    // const deltaY = point.y - (xy.y + object.height / 2);
    // const angle = Math.atan2(deltaY, deltaX);
    // ctx.save(); // Save the current state

    // ctx.translate(xy.x + object.width/2 , xy.y + object.height /2); // Move to the center

    // ctx.rotate(angle); // Rotate in radiance
    // ctx.scale(1, 1);
    // ctx.translate(-object.width, -object.height/2); // Move back to top-left corner

    // Draw the cube rectangle
    // ctx.fillStyle = object.color;
    if (hand.isHand) {
        if (hand.handOpenUpStartTime == null) {
            hand.handOpenUpStartTime = performance.now();
        }
        if (hand.handOpenUpStartTime != null) {

            const elapsed = (performance.now() - hand.handOpenUpStartTime) / 1000; // Time in seconds

            // Non-linear easing function (ease out)
            const t = Math.min(elapsed / hand.handOpenTime, 1);
            const easeOut = t * (2 - t); // Cubic easing function

            if (hand.y < -1.1 && (performance.now() - hand.handOpenUpStartTime) / 1000 < hand.handOpenTime) {
                hand.y += easeOut * hand.handOpenSpeed * deltaTime;
            }
        }
        if ((performance.now() - hand.handOpenUpStartTime) / 1000 >= hand.handOpenTime) {
            const elapsed = (performance.now() - hand.handOpenUpStartTime) / 1000; // Time in seconds

            // Non-linear easing function (ease out)
            const t = Math.min(elapsed / hand.handOpenTime, 1);
            const easeOut = t * (2 - t); // Cubic easing function
            // console.table(hand.y -= easeOut * hand.handOpenSpeed * deltaTime);
            if (hand.y >= -2) {
                hand.y -= easeOut * hand.handCloseSpeed * deltaTime;
            }
            else {
                hand.isHand = false;
            }
        }

    }

    image.src = hand.imgSrc;
    ctx.drawImage(image, xy.x - object.width, xy.y - object.height, object.width, object.height);

    // ctx.restore(); // Restore the original state
}

function handelInput(deltaTime) {
    if (player.x <= 0.6 && player.isOpen == false) {
        if (keys['arrowRight'] || keys['d'] || keys['D']) player.x += player.speed * deltaTime;
    }
    if (player.x >= -0.6 && player.isOpen == false) {
        if (keys['arrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed * deltaTime;
    }
    if (player.dashCooldownStart != null) {
        if ((performance.now() - player.dashCooldownStart) / 1000 >= player.dashCooldown) {
            document.getElementById('dash').innerText = "Dash : avalable";
        }
        else {
            document.getElementById('dash').innerText = "Dash : " + (player.dashCooldown - ((performance.now() - player.dashCooldownStart) / 1000)).toFixed(2);
        }

    }
    if (player.openUpCoolDownStart != null) {
        if ((performance.now() - player.openUpCoolDownStart) / 1000 <= player.openUpCoolDown) {
            document.getElementById('open').innerText = "OpenUp : " + (player.openUpCoolDown - ((performance.now() - player.openUpCoolDownStart) / 1000)).toFixed(2);
        }
        else {
            document.getElementById('open').innerText = "OpenUp : avalable";
        }
    }
    if (keys['f'] && !player.isOpen && (player.openUpCoolDownStart == null || (performance.now() - player.openUpCoolDownStart) / 1000 >= player.openUpCoolDown) && !player.isClosing) {
        player.isOpen = true;
        renderMode = "2";
        player.openUpStartTime = performance.now();
        // player.openUpCoolDownStart = performance.now(); // Start cooldown

    }
    else if (!keys['f'] && player.isOpen && !player.isClosing) {
        player.isOpen = false;
        player.isClosing = true;
    }
    if (keys[' '] && !player.isDashing && (player.dashCooldownStart == null || (performance.now() - player.dashCooldownStart) / 1000 >= player.dashCooldown) && !player.isOpen && !player.isClosing) {
        if (keys['arrowLeft'] || keys['a'] || keys['A']) player.dashDirection = -1; // Left
        else if (keys['arrowRight'] || keys['d'] || keys['D']) player.dashDirection = 1; // Right
        else {
            return
        }
        player.isDashing = true;
        player.dashStartTime = performance.now();
        player.dashCooldownStart = performance.now(); // Start cooldown
        // Decide dash direction
    }
    if (player.x < -0.6) {
        player.x = -0.6;
    }
    if (player.x > 0.6) {
        player.x = 0.6;
    }
}
function drawTower() {
    if (renderMode == "main") {
        drawObject(player)
    }
    else if (renderMode == "2") {
        drawObject(tower1);
        drawObject(tower2);
    }
}
const savePo = { x1: 0, x2: 0 };
let isSaveed = false;
function updatePlayer(deltaTime) {
    // Handle dash behavior
    if (player.isDashing) {
        const elapsed = (performance.now() - player.dashStartTime) / 1000; // Time in seconds
        // Non-linear easing function (ease out)
        const t = Math.min(elapsed / player.dashDuration, 1);
        const easeOut = t * (2 - t); // Cubic easing function

        // Calculate new position based on dash distance
        if (player.x <= -0.6) {
            player.x = -0.6;
        }
        else if (player.x >= 0.6) {
            player.x = 0.6;
        }
        else {
            player.x += easeOut * player.dashDistance * player.dashDirection * deltaTime;
        }


        if (t === 1) {
            player.isDashing = false; // Dash complete
        }
    }

    if (player.isOpen) {
        const elapsed = (performance.now() - player.openUpStartTime) / 1000; // Time in seconds
        const t = Math.min(elapsed / player.OpenUpTime, 1);
        const easeOut = t * (2 - t); // Cubic easing function
        console.log(tower1.x, tower2.x);
        if (!isSaveed) {
            const playerPosition = normalToPosition(player);
            tower1.x = positionToNormal(playerPosition.x + 42, playerPosition.y).x;
            tower2.x = positionToNormal(playerPosition.x - 42, playerPosition.y).x;
            savePo.x1 = tower1.x;
            savePo.x2 = tower2.x;
            isSaveed = true;
        }
        if (tower1.x <= 0.6) {
            tower1.x += easeOut * tower1.speed * deltaTime;
        }
        if (tower2.x >= -0.6) {
            tower2.x -= easeOut * tower2.speed * deltaTime;
        }
    }
    if (player.isOpen == false && player.isClosing == true) {
        const elapsed = (performance.now() - player.openUpStartTime) / 1000; // Time in seconds
        const t = Math.min(elapsed / player.OpenUpTime, 1);
        const easeOut = t * (2 - t); // Cubic easing function

        if (tower1.x >= savePo.x1) {
            tower1.x -= easeOut * tower1.speed * deltaTime;
        }
        if (tower2.x <= savePo.x2) {
            tower2.x += easeOut * tower2.speed * deltaTime;
        }
        if (tower1.x <= savePo.x1 && tower2.x >= savePo.x2) {
            tower1.x = savePo.x1;
            tower2.x = savePo.x2;
            player.x = (tower1.x + tower2.x) / 2;
            renderMode = "main";
            player.isClosing = false;
            isSaveed = false;
            player.openUpCoolDownStart = performance.now(); // Start cooldown
        }
    }

}
document.addEventListener('keydown', function (event) {
    keys[event.key.toLocaleLowerCase()] = true; // Register that this key is pressed
});

document.addEventListener('keyup', function (event) {
    keys[event.key.toLocaleLowerCase()] = false; // Register that this key is released
});

document.addEventListener('resize', function (event) {
    normalizeCanvas();
});

// Start the game loop
requestAnimationFrame(gameLoop);

function normalizeCanvas() {
    const ratio = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;

    ctx.scale(ratio, ratio);
}

normalizeCanvas();
function drawObject(object) {
    const normalizedWidth = 1; // Width in normalized space: -1 (left) -> 1 (right)
    const normalizedHeight = 1; // Height in normalized space: -1 (bottom) -> 1 (top)

    const canvasX = canvas.width * ((object.x + normalizedWidth) / (2 * normalizedWidth));
    const canvasY = canvas.height * ((-object.y + normalizedHeight) / (2 * normalizedHeight)); // Invert y for canvas
    // ctx.fillStyle = object.color;
    ctx.drawImage(object.image, canvasX / 2 - object.width / 2, canvasY / 2 - object.height / 2, object.width, object.height);

}

function positionToNormal(x, y) {
    const normalX = (((x * 2) * (2)) / canvas.width) - 1;
    const normalY = (((-y * 2) * (2)) / canvas.height) + 1;
    return { x: normalX, y: normalY }
}

function normalToPosition(object) {
    const normalizedWidth = 1; // Width in normalized space: -1 (left) -> 1 (right)
    const normalizedHeight = 1; // Height in normalized space: -1 (bottom) -> 1 (top)

    const canvasX = canvas.width * ((object.x + normalizedWidth) / (2 * normalizedWidth));
    const canvasY = canvas.height * ((-object.y + normalizedHeight) / (2 * normalizedHeight)); // Invert y for canvas
    return { x: canvasX / 2, y: canvasY / 2 };
}

function clearScrean() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener('click', () => {
    if (!hand.isHand) {
        hand.isHand = true;
        hand.handOpenUpStartTime = performance.now();
    }
    else {
        hand.handOpenUpStartTime = performance.now();
    }

});