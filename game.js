const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 700;
const ZOMBIE_SPEED = 0.5;
const MAX_WIDTH = 300;
const ZOMBIE_COUNT = 100;

class Gun {
    constructor(name, magazine, ammo, damage, firerate, reloadspeed) {
        this.name = name
        this.xPosition = 600;
        this.magazine = magazine;
        this.currentMag = magazine;
        this.firerate = firerate;
        this.reloadSpeed = reloadspeed;
        this.damage = damage;
        this.ammo = ammo;
        this.image = new Image();
        this.gunSrc = 'resources/images/' + this.name + '.png'
        this.shootSrc = 'resources/images/' + this.name + '_shoot.png'
        this.reloadSrc = 'resources/images/' + this.name + '_reload.png'
        this.image.src = this.gunSrc;
        this.isShoot = false;
        this.isReload = false;
        this.fireSound = new Audio('resources/sound/' + this.name + ".mp3");
        this.reloadSound = new Audio('resources/sound/' + this.name + "_reload.mp3");
    }
    draw(Game) {
        let ctx = Game.ctx;
        ctx.drawImage(this.image, this.xPosition, CANVAS_HEIGHT - this.image.height);
    }
    async shoot(e) {
        if (!this.isShoot && !this.isReload) {
            if (!this.currentMag == 0) {
                if (this.ammo >= 0) {
                    this.fireSound.currentTime = 0;
                    this.fireSound.play();
                    this.currentMag--;
                    this.isShoot = true;
                    this.image.src = this.shootSrc;
                    killZombie(e.clientX, e.clientY, this.damage)
                    await new Promise(resolve => setTimeout(resolve, this.firerate));
                    this.fireSound.pause();
                    this.image.src = this.gunSrc;
                    this.isShoot = false;
                }
            } else {
                this.reload();
            }
        }
    }
    async reload() {
        if (!this.ammo == 0 && !(this.currentMag == this.magazine)) {
            this.reloadSound.currentTime = 0;
            this.reloadSound.play();
            this.isReload = true;
            this.image.src = this.reloadSrc;
            if (this.ammo >= (this.magazine - this.currentMag)) {
                this.ammo -= this.magazine - this.currentMag;
                this.currentMag += this.magazine - this.currentMag;
            } else {
                this.currentMag += this.ammo;
                this.ammo = 0;
            }
            await new Promise(resolve => setTimeout(resolve, this.reloadSpeed));
            this.image.src = this.gunSrc;
            this.isReload = false;
        }
    }

}
class Game {
    constructor(gun) {
        this.gun = gun;
        this.health = 10;
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
    }
    start() {
        setInterval(spawnZombie, 3000);
        this.interval = setInterval(update, 20);
    }
    stop() {
        clearInterval(this.interval);
        setTimeout(() => {
            (confirm("You died. Try again? ")) ? location.reload() : window.close();
        }, 2000)
    }
    win() {
        clearInterval(this.interval);
        setTimeout(() => {
            (confirm("You survived the zeds. Try again? ")) ? location.reload() : window.close();
        }, 2000)
    }
    clear() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    move(e) {
        this.gun.xPosition = e.clientX - 100;
    }
    setGun(gun) {
        this.gun = gun;
    }
    displayHUD() {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "60px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText("HP " + this.health.toFixed(0), 100, CANVAS_HEIGHT - 100);
        this.ctx.fillText(this.gun.currentMag, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 120);
        this.ctx.fillText("Killed " + zombieKilled, CANVAS_WIDTH - 350, 120);
        this.ctx.fillStyle = "silver";
        this.ctx.fillText(this.gun.ammo, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 50);
    }
}
class Zombie {
    constructor(src) {
        this.image = new Image();
        this.image.src = src;
        this.xPosition = Math.floor(Math.random() * (CANVAS_WIDTH - MAX_WIDTH));
        this.yPosition = Math.floor(Math.random() * 99) - 100;
        this.health = Math.floor(Math.random() * 3) + 1;
        this.width = 50;
        this.height = 100;
    }
    draw(game) {
        let ctx = game.ctx;
        ctx.drawImage(this.image, this.xPosition, this.yPosition, this.width, this.height)
    }
    move() {
        if (this.width < MAX_WIDTH) {
            this.yPosition += ZOMBIE_SPEED*2;
            this.width += ZOMBIE_SPEED;
            this.height += ZOMBIE_SPEED * 2;
        } else {
            game.health -= 1 / 50;
            eating.play();
        }
    }
}
let handgun = new Gun("handgun", 15, 75, 1, 100, 500);
let shotgun = new Gun("shotgun", 8, 48, 3, 500, 1000);
let game = new Game(handgun);
let headshot = new Audio("resources/sound/headshot.mp3");
let eating = new Audio("resources/sound/eating.mp3");
let theme = new Audio("resources/sound/a.mp3");
let zombieSound = new Audio("resources/sound/zombie.mp3");
zombieSound.volume = 0.5;

let zombieSpawned = 0;
let zombieKilled = 0;

let zombies = [];
function spawnZombie() {
    theme.loop = true;
    theme.play();
    zombieSound.loop = true;
    zombieSound.play();
    let number = Math.floor(Math.random() * 10) + 3;
    let index = 0;
    for (var i = 0; i < number; i++) {
        if (zombieSpawned < ZOMBIE_COUNT) {
            index = Math.floor(Math.random() * 6) + 1;
            let zombie = new Zombie("resources/images/zom" + index + ".png");
            zombies.push(zombie);
            zombieSpawned++;
        } else
            break;
    }
}
function moveZombie() {
    for (var i = 0; i < zombies.length; i++) {
        zombies[i].draw(game)
        zombies[i].move();
    }
}
function killZombie(gunX, gunY, dmg) {
    for (var i = 0; i < zombies.length; i++) {
        var zomLeft = zombies[i].xPosition;
        var zomRight = zombies[i].xPosition + zombies[i].width;
        var zomTop = zombies[i].yPosition;
        var zomBot = zombies[i].yPosition + zombies[i].height;
        var zomHead = zombies[i].yPosition + zombies[i].height / 3;
        if (gunX < zomRight && gunX > zomLeft && gunY < zomBot && gunY > zomTop) {
            if (gunY < zomHead) {
                zombies.splice(i, 1);
                zombieKilled++;
                headshot.currentTime = 0;
                headshot.play();
            } else {
                zombies[i].health -= dmg;
                if (zombies[i].health <= 0) {
                    zombies.splice(i, 1);
                    zombieKilled++;
                }
            }
        }
    }
}
function changeGun(event) {
    switch (event.key) {
        case "1":
            game.setGun(handgun);
            break;
        case "2":
            game.setGun(shotgun);
            break;
        case "r":
            game.gun.reload();
            break;
    }
}
function update() {
    game.clear();
    moveZombie();
    game.gun.draw(game);
    game.displayHUD();
    if (game.health <= 0)
        game.stop();
    if (zombieKilled == ZOMBIE_COUNT)
        game.win();
}
