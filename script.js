let poochs = 0;
let clickPower = 1;
let muted = false;

let clickCount = 0;
let rageActive = false;
let rageTimer = 0;
let rageCooldown = 300; // 5 minutes = 300 seconds
let angle = 0;
let pokeIndex = 0;
let pokeVelocity = [];

let allowSave = true;

/* ---------------- IMAGES ---------------- */

const poochEl = document.getElementById("pooch");

const normalPoochImg = "https://github.com/therealpoocher/poochclicker/blob/main/Pooch.png?raw=true";
const ragePoochImg = "https://raw.githubusercontent.com/therealpoocher/poochclicker/refs/heads/main/RagePooch.png";
const rageSound = document.getElementById("rageSound");
/* ---------------- UPGRADES ---------------- */

const upgrades = [
    {
        id: "treat",
        name: "Dog Treat",
        desc: "+1 click power",
        cost: 10,
        owned: 0,
        scale: (lvl) => Math.floor(10 * Math.pow(1.5, lvl)),
        buy: () => clickPower += 1
    },
    {
        id: "fan",
        name: "Poochling",
        desc: "+1 per second",
        cost: 50,
        owned: 0,
        scale: (lvl) => Math.floor(50 * Math.pow(1.8, lvl)),
        buy: () => updateOrbiters()
    },
    {
        id: "critbark",
        name: "Critical Bark",
        desc: "10% chance x3 clicks",
        cost: 500,
        owned: 0,
        scale: (lvl) => Math.floor(500 * Math.pow(2, lvl)),
        buy: () => {
            window.critChance = Math.min(0.6, (window.critChance || 0) + 0.05);
        }
    },
    {
        id: "ragemode",
        name: "Rage Mode",
        desc: "Every 5 minutes triggers x5 power for 5s",
        cost: 800,
        owned: 0,
        scale: (lvl) => Math.floor(800 * Math.pow(2, lvl)),
        buy: () => {
            window.rageUnlocked = (window.rageUnlocked || 0) + 1;
        }
    }
];

/* ---------------- SOURCE OF TRUTH ---------------- */

function getPPS() {
    return upgrades.find(u => u.id === "fan").owned || 0;
}

/* ---------------- FLOATING TEXT SAFETY ---------------- */

function spawnBoostText(msg) {
    const el = document.createElement("div");
    el.className = "floating-pooch";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

/* ---------------- SAVE ---------------- */

function saveGame() {
    if (!allowSave) return;

    localStorage.setItem("poochclicker", JSON.stringify({
        poochs,
        clickPower,
        upgrades: upgrades.map(u => ({
            id: u.id,
            cost: u.cost,
            owned: u.owned
        }))
    }));
}

function loadGame() {
    const save = JSON.parse(localStorage.getItem("poochclicker"));
    if (!save) return;

    poochs = save.poochs || 0;
    clickPower = save.clickPower || 1;

    if (save.upgrades) {
        save.upgrades.forEach(s => {
            const u = upgrades.find(x => x.id === s.id);
            if (u) {
                u.cost = s.cost;
                u.owned = s.owned;
            }
        });
    }

    setTimeout(updateOrbiters, 0);
}

/* ---------------- RESET ---------------- */

function resetGame() {
    allowSave = false;
    localStorage.removeItem("poochclicker");

    poochs = 0;
    clickPower = 1;

    upgrades.forEach(u => {
        u.owned = 0;
        if (u.id === "treat") u.cost = 10;
        if (u.id === "fan") u.cost = 50;
    });

    updateOrbiters();
    updateUI();

    allowSave = true;
}

/* ---------------- UI ---------------- */

function updateUI() {
    document.getElementById("poochs").textContent = Math.floor(poochs);
    renderShop();
}

function renderShop() {
    const shop = document.getElementById("shop");
    shop.innerHTML = "<h3>Shop</h3>";

    upgrades.forEach((u, i) => {
        const btn = document.createElement("button");

        const canBuy = poochs >= u.cost;

        btn.innerHTML = `
            ${u.name} (${u.desc})<br>
            Cost: ${u.cost} | Owned: ${u.owned}
        `;

        btn.disabled = !canBuy;

        btn.onclick = () => {
            if (!canBuy) return;
            buyUpgrade(i);
        };

        shop.appendChild(btn);
    });
}

function buyUpgrade(i) {
    const u = upgrades[i];

    if (poochs < u.cost) return;

    poochs -= u.cost;
    u.owned++;
    u.buy();

    u.cost = u.scale(u.owned);

    updateUI();
}

/* ---------------- CLICK ---------------- */

document.getElementById("pooch").addEventListener("click", (e) => {
    let gain = clickPower;

    clickCount++;

    // RAGE START


    if (rageActive) gain *= 1 + (window.rageUnlocked * 2);

    // CRIT
    if (Math.random() < (window.critChance || 0)) {
        gain *= 3;
        spawnBoostText("CRIT BARK!");
    }

    poochs += gain;
    updateUI();

    spawnFloatingText(e.clientX, e.clientY, gain);
});

/* ---------------- FLOATING CLICK ---------------- */

function spawnFloatingText(x, y, amt) {
    const pop = document.createElement("div");
    pop.className = "floating-pooch";
    pop.innerHTML = `<span>+${amt}</span>`;
    pop.style.left = x + "px";
    pop.style.top = y + "px";
    pop.style.transform = "translate(-50%, -50%)";
    pop.style.pointerEvents = "none";
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
}

/* ---------------- ORBIT ---------------- */

const orbitPooches = [];

function updateOrbiters() {
    document.querySelectorAll(".orbit-pooch").forEach(e => e.remove());

    orbitPooches.length = 0;
    pokeVelocity.length = 0;

    const container = document.getElementById("poochContainer");

    for (let i = 0; i < getPPS(); i++) {
        const img = document.createElement("img");
        img.src = "https://github.com/therealpoocher/poochclicker/blob/main/ezgif-1128212db36590e7.gif?raw=true";
        img.className = "orbit-pooch";

        container.appendChild(img);

        orbitPooches.push(img);
        pokeVelocity.push({ x: 0, y: 0 });
    }
}

function animateOrbit() {
    const radius = 140;

    orbitPooches.forEach((pooch, i) => {
        const a = angle + (i * (Math.PI * 2)) / Math.max(orbitPooches.length, 1);

        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;

        const offset = pokeVelocity[i] || { x: 0, y: 0 };

        pooch.style.left = (125 + x + offset.x - 20) + "px";
        pooch.style.top = (125 + y + offset.y - 20) + "px";

        const dx = 125 - (125 + x);
        const dy = 125 - (125 + y);

        const rot = Math.atan2(dy, dx) * (180 / Math.PI);
        pooch.style.transform = `rotate(${rot + 90}deg)`;
    });

    angle += 0.005;

    pokeVelocity.forEach(v => {
        v.x *= 0.85;
        v.y *= 0.85;
    });

    requestAnimationFrame(animateOrbit);
}

/* ---------------- POKE ---------------- */

function pokePoochlings() {
    if (!orbitPooches.length) return;

    const i = pokeIndex % orbitPooches.length;

    const a = angle + (i * (Math.PI * 2)) / orbitPooches.length;

    const x = 125 + Math.cos(a) * 140;
    const y = 125 + Math.sin(a) * 140;

    const dx = 125 - x;
    const dy = 125 - y;

    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    pokeVelocity[i].x += (dx / len) * 10;
    pokeVelocity[i].y += (dy / len) * 10;

    pokeIndex++;
}

/* ---------------- GAME LOOP ---------------- */

setInterval(() => {
    poochs += getPPS();

    if (getPPS() > 0) pokePoochlings();

    updateUI();
}, 1000);

/* ---------------- RAGE TIMER ---------------- */

setInterval(() => {
    if (!window.rageUnlocked) return;

    rageCooldown--;

    if (rageCooldown <= 0 && !rageActive) {
        rageActive = true;
        rageTimer = 5;
        rageCooldown = 300; // reset cooldown

        poochEl.src = ragePoochImg;
        spawnBoostText("RAGE MODE!");
        rageSound.currentTime = 0;
        rageSound.volume = 0.5;
        rageSound.play();
        poochEl.style.filter = `drop-shadow(0 0 ${5 + (window.rageUnlocked * 3)}px red)`;
        poochEl.style.transform = "scale(1.1)";
    }

    if (rageActive) {
        rageTimer--;

        if (rageTimer <= 0) {
            rageActive = false;
            poochEl.src = normalPoochImg;
            poochEl.style.filter = "none";
            poochEl.style.transform = "scale(1)";
        }
    }
}, 1000);

/* ---------------- START ---------------- */

loadGame();
updateUI();
renderShop();
updateOrbiters();
animateOrbit();
setInterval(saveGame, 5000);
