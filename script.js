let poochs = 0;
let pokeIndex = 0;
let clickPower = 1;
let poochsPerSecond = 0;
let pokeVelocity = [];
let treatCost = 10;
let fanCost = 50;
let muted = false;

function toggleMute() {
    muted = !muted;
    document.getElementById("muteBtn").textContent = muted ? "Unmute" : "Mute";
}
const poochText = document.getElementById("poochs");

const orbitPooches = [];
const pokeOffsets = [];

let angle = 0;

function spawnBoostText(message, x = window.innerWidth / 2, y = window.innerHeight / 2) {
    const pop = document.createElement("div");
    pop.className = "floating-pooch";

    const text = document.createElement("span");
    text.textContent = message;

    pop.appendChild(text);

    pop.style.left = x + "px";
    pop.style.top = y + "px";

    document.body.appendChild(pop);

    setTimeout(() => pop.remove(), 1000);
}
/* ---------------- UI ---------------- */

function updateUI() {
    poochText.textContent = Math.floor(poochs);
    document.getElementById("treatCost").textContent = treatCost;
    document.getElementById("fanCost").textContent = fanCost;
}

/* ---------------- CLICKING ---------------- */

const barkSound = document.getElementById("barkSound");

document.getElementById("pooch").addEventListener("click", (e) => {
    poochs += clickPower;
    updateUI();

    if (!muted) {
        barkSound.currentTime = 0;

        // fixed pitch (no changes)
        barkSound.playbackRate = 1;

        // lower volume
        barkSound.volume = 0.25;

        barkSound.play();
    }

    spawnFloatingText(e.clientX, e.clientY, clickPower);
});

/* ---------------- FLOATING TEXT ---------------- */

function spawnFloatingText(x, y, amount) {
    const pop = document.createElement("div");
    pop.className = "floating-pooch";

    const img = document.createElement("img");
    img.src = "https://github.com/therealpoocher/poochclicker/blob/main/Pooch.png?raw=trueh.png";

    const text = document.createElement("span");
    text.textContent = `+${amount}`;

    pop.appendChild(img);
    pop.appendChild(text);

    pop.style.left = x + "px";
    pop.style.top = y + "px";

    document.body.appendChild(pop);

    setTimeout(() => pop.remove(), 1000);
}

/* ---------------- ORBIT SYSTEM ---------------- */

function updateOrbiters() {
    document.querySelectorAll(".orbit-pooch").forEach(el => el.remove());

    orbitPooches.length = 0;
    pokeVelocity.length = 0;
    
    const container = document.getElementById("poochContainer");
    
    for (let i = 0; i < poochsPerSecond; i++) {
        const img = document.createElement("img");
        img.src = "https://github.com/therealpoocher/poochclicker/blob/main/Pooch.png?raw=true";
        img.className = "orbit-pooch";
    
        container.appendChild(img);
    
        orbitPooches.push(img);
        pokeVelocity.push({ x: 0, y: 0 });
    }
}

function animateOrbit() {
    const radius = 140;
    const centerX = 125;
    const centerY = 125;

    const count = orbitPooches.length;

    orbitPooches.forEach((pooch, i) => {
        const a =
            angle +
            (i * (Math.PI * 2)) / Math.max(count, 1);

            const x = Math.cos(a) * radius;
            const y = Math.sin(a) * radius;
            
            const offset = pokeVelocity[i] || { x: 0, y: 0 };

            pooch.style.left = (centerX + x + offset.x - 20) + "px";
            pooch.style.top = (centerY + y + offset.y - 20) + "px";

        const rot =
            Math.atan2(centerY - (centerY + y), centerX - (centerX + x)) *
            (180 / Math.PI);

        pooch.style.transform = `rotate(${rot + 90}deg)`;
    });

    angle += 0.005;
    pokeVelocity.forEach(v => {
        v.x *= 0.85;
        v.y *= 0.85;
    });
    requestAnimationFrame(animateOrbit);
    
}

/* ---------------- POKE EFFECT ---------------- */

function pokePoochlings() {
    if (orbitPooches.length === 0) return;

    const i = pokeIndex % orbitPooches.length;

    const centerX = 0;
    const centerY = 0;

    const a =
        angle + (i * (Math.PI * 2)) / orbitPooches.length;

    const x = Math.cos(a);
    const y = Math.sin(a);

    const len = Math.sqrt(x * x + y * y);

    const nx = -x / len;
    const ny = -y / len;

    const strength = 8; // small impulse

    pokeVelocity[i].x += nx * strength;
    pokeVelocity[i].y += ny * strength;

    pokeIndex++;
}

/* ---------------- SHOP ---------------- */

function buyTreat() {
    if (poochs < treatCost) return;

    poochs -= treatCost;
    clickPower++;
    treatCost = Math.floor(treatCost * 1.5);

    spawnBoostText("Click Power +1!");
    updateUI();
}

function buyFan() {
    if (poochs < fanCost) return;

    poochs -= fanCost;
    poochsPerSecond++;

    fanCost = Math.floor(fanCost * 1.8);

    spawnBoostText("+1 Poochling!");
    updateUI();
    updateOrbiters();
}

/* ---------------- GOLDEN POOCH ---------------- */

function spawnGoldenPooch() {
    const pooch = document.createElement("img");

    pooch.src = "images/pooch.png";
    pooch.className = "golden-pooch";

    const x = Math.random() * (window.innerWidth - 80);
    const y = Math.random() * (window.innerHeight - 80);

    pooch.style.left = x + "px";
    pooch.style.top = y + "px";

    document.body.appendChild(pooch);

    let collected = false;

    pooch.addEventListener("click", () => {
        if (collected) return;
        collected = true;

        applyGoldenReward();
        pooch.remove();
    });

    setTimeout(() => {
        if (!collected) pooch.remove();
    }, 5000);
}

function applyGoldenReward() {
    const type = Math.floor(Math.random() * 3);

    if (type === 0) {
        const bonus = poochsPerSecond * 10 + 10;
        poochs += bonus;
        spawnBoostText(`+${bonus} Poochs!`);
    }
    
    if (type === 1) {
        clickPower += 2;
        spawnBoostText(`Click Power +2!`);
    }
    
    if (type === 2) {
        poochsPerSecond += 2;
        updateOrbiters();
        spawnBoostText(`+2 Poochlings!`);
    }

    updateUI();
}

function startGoldenPoochSpawner() {
    setInterval(() => {
        if (Math.random() < 0.15) {
            spawnGoldenPooch();
        }
    }, 5000);
}
function resetGame() {
    localStorage.removeItem("poochclicker");

    poochs = 0;
    clickPower = 1;
    poochsPerSecond = 0;
    treatCost = 10;
    fanCost = 50;

    updateUI();
    updateOrbiters();

    location.reload();
}
/* ---------------- GAME LOOP ---------------- */

setInterval(() => {
    poochs += poochsPerSecond;
    updateUI();

    if (poochsPerSecond > 0) {
        pokePoochlings();
    }
}, 1000);

/* ---------------- SAVE / LOAD ---------------- */

function saveGame() {
    localStorage.setItem(
        "poochclicker",
        JSON.stringify({
            poochs,
            clickPower,
            poochsPerSecond,
            treatCost,
            fanCost
        })
    );
}

function loadGame() {
    const save = JSON.parse(localStorage.getItem("poochclicker"));
    if (!save) return;

    poochs = save.poochs;
    clickPower = save.clickPower;
    poochsPerSecond = save.poochsPerSecond;
    treatCost = save.treatCost;
    fanCost = save.fanCost;
}

/* ---------------- START ---------------- */

loadGame();
updateUI();
updateOrbiters();
animateOrbit();

startGoldenPoochSpawner();
setInterval(saveGame, 5000);
