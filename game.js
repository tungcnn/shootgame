const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 700;
const ZOMBIE_SPEED = 0.5;
const MAX_WIDTH = 300;
const ZOMBIE_COUNT = 300;
let isBlowing = false;
let bombX = 0;
let boom = new Image();
boom.src = 'resources/images/boom.png'
let pistol = new Image();
pistol.src = 'resources/images/gun.png'
let bullet = new Image();
bullet.src = 'resources/images/bullet.png'
let grenadeIcon = new Image();
grenadeIcon.src = 'resources/images/grenadeIcon.png'
let health = new Image();
health.src = 'resources/images/health.png'
let dead = new Image();
dead.src = 'resources/images/dead.png'
let grenade = 3;

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
        this.pointerX = 0;
        this.pointerY = 0;
        this.image = new Image();
        this.gunSrc = 'resources/images/' + this.name + '.png'
        this.shootSrc = 'resources/images/' + this.name + '_shoot.png'
        this.reloadSrc = 'resources/images/' + this.name + '_reload.png'
        this.image.src = this.gunSrc;
        this.isShoot = false;
        this.isReload = false;
        this.isThrowing = false;
        this.fireSound = new Audio('resources/sound/' + this.name + ".mp3");
        this.reloadSound = new Audio('resources/sound/' + this.name + "_reload.mp3");
    }
    draw(Game) {
        let ctx = Game.ctx;
        ctx.drawImage(this.image, this.xPosition, CANVAS_HEIGHT - this.image.height);
    }
    async throwNade() {
        if (!this.isShoot && !this.isReloadS && !this.isThrowing && grenade > 0) {
            grenade--;
            this.isThrowing = true;
            bombX = this.pointerX;
            this.image.src = 'resources/images/grenade.png'
            pin.play();
            await new Promise(resolve => setTimeout(resolve, 300));
            fireinthehole.play();
            this.image.src = 'resources/images/grenade_throw.png'
            await new Promise(resolve => setTimeout(resolve, 300));
            this.image.src = this.gunSrc;
            this.isThrowing = false;
            await new Promise(resolve => setTimeout(resolve, 2000));
            explode.play();
            isBlowing = true;
            blowZombie(bombX - 500, bombX + 500);
            await new Promise(resolve => setTimeout(resolve, 700));
            isBlowing = false;
        }
    }
    shoot() {
        this.timer = setInterval(async () => {
            if (!this.isShoot && !this.isReload && !this.isThrowing) {
                if (!this.currentMag == 0) {
                    if (this.ammo >= 0) {
                        this.fireSound.currentTime = 0;
                        this.fireSound.play();
                        this.currentMag--;
                        this.isShoot = true;
                        this.image.src = this.shootSrc;
                        if (this.name == "shotgun") {
                            killZombie(this.pointerX - 100, this.pointerY, this.damage);
                            killZombie(this.pointerX + 100, this.pointerY, this.damage);
                        }
                        killZombie(this.pointerX, this.pointerY, this.damage);
                        shootBox(this.pointerX, this.pointerY);
                        await new Promise(resolve => setTimeout(resolve, this.firerate));
                        this.fireSound.pause();
                        this.image.src = this.gunSrc;
                        this.isShoot = false;
                    }
                } else {
                    this.reload();
                }
            }
        }, 20)
    }
    release() {
        clearInterval(this.timer);
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
        this.canvas;
        this.ctx;
    }
    start() {
        setInterval(spawnZombie, 3000);
        setInterval(spawnBigZombie, 15000);
        setInterval(spawnBossZombie, 20000);
        setInterval(randomSupplyDrop, 15000);
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
        this.ctx.fillText(this.health.toFixed(0), 100, CANVAS_HEIGHT - 100);
        this.ctx.drawImage(health, 40, CANVAS_HEIGHT - 150);
        this.ctx.fillText(this.gun.currentMag, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 120);
        this.ctx.drawImage(pistol, CANVAS_WIDTH - 260, CANVAS_HEIGHT - 160);
        this.ctx.fillText(grenade, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 200);
        this.ctx.drawImage(grenadeIcon, CANVAS_WIDTH - 260, CANVAS_HEIGHT - 250);
        this.ctx.fillText(zombieKilled, CANVAS_WIDTH - 180, 120);
        this.ctx.drawImage(dead, CANVAS_WIDTH - 250, 70);
        this.ctx.fillStyle = "silver";
        this.ctx.fillText(this.gun.ammo, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 50);
        this.ctx.drawImage(bullet, CANVAS_WIDTH - 250, CANVAS_HEIGHT - 95);
    }
}
class Zombie {
    constructor(src) {
        this.image = new Image();
        this.image.src = src;
        this.xPosition = Math.floor(Math.random() * (CANVAS_WIDTH - MAX_WIDTH));
        this.yPosition = CANVAS_HEIGHT / 2 - 100;
        this.health = 3;
        this.width = 50;
        this.height = 100;
        this.name = "small"
    }
    draw(game) {
        let ctx = game.ctx;
        ctx.drawImage(this.image, this.xPosition, this.yPosition, this.width, this.height)
    }
    move() {
        if (this.width < MAX_WIDTH) {
            this.width += ZOMBIE_SPEED;
            this.height += ZOMBIE_SPEED * 2;
        } else {
            game.health -= 1 / 50;
            eating.play();
        }
    }
}
class BigZombie extends Zombie {
    health = 5;
    name = "big";
    width = 70;
    height = 120;
}
class Boss extends Zombie {
    name = "boss";
    health = 50;
    width = 100;
    height = 200;
}
class SupplyBox {
    constructor(name) {
        this.name = name;
        this.image = new Image();
        this.xPosition = Math.floor(Math.random() * CANVAS_WIDTH - this.image.width) + 100;
        this.yPosition = -100;
        this.image.src = 'resources/images/' + this.name + '.png'
    }
    draw(game) {
        let ctx = game.ctx;
        ctx.drawImage(this.image, this.xPosition, this.yPosition);
        this.yPosition += 1;
    }
    effect() {
        switch(this.name) {
            case "ammoBox":
                game.gun.ammo += 20;
                break;
            case "healthBox":
                game.health += 2;
                break;
            case "grenadeBox":
                grenade++;
                break;
        }
    }
}
let handgun = new Gun("handgun", 15, 75, 1, 300, 500);
let shotgun = new Gun("shotgun", 2, 30, 3, 300, 500);
let assault = new Gun("assault", 50, 200, 1, 100, 2000);
let game = new Game(handgun);
let headshot = new Audio("resources/sound/headshot.m4a");
let eating = new Audio("resources/sound/eating.mp3");
let theme = new Audio("resources/sound/a.mp3");
let zombieSound = new Audio("resources/sound/zombie.mp3");
let pin = new Audio("resources/sound/pin.wav");
let explode = new Audio("resources/sound/boom.wav")
let fireinthehole = new Audio('resources/sound/fireinthehole.mp3')
zombieSound.volume = 0.5;

let zombieSpawned = 0;
let zombieKilled = 0;
let zombies = [];
let supplyList = [];
function spawnZombie() {
    theme.loop = true;
    theme.play();
    zombieSound.loop = true;
    zombieSound.play();
    let number = Math.floor(Math.random() * 7) + 3;
    let index = 0;
    for (var i = 0; i < number; i++) {
        if (zombieSpawned < ZOMBIE_COUNT) {
            index = Math.floor(Math.random() * 5) + 1;
            let zombie = new Zombie("resources/images/zom" + index + ".png");
            zombies.push(zombie);
            zombieSpawned++;
        } else
            break;
    }
}
function spawnBigZombie() {
    let number = Math.floor(Math.random() * 3) + 1;
    let index;
    for (var i = 0; i < number; i++) {
        if (zombieSpawned < ZOMBIE_COUNT) {
            index = Math.floor(Math.random() * 6) + 1;
            let zombie = new BigZombie("resources/images/bigzom" + index + ".png");
            zombies.push(zombie);
            zombieSpawned++;
        } else
            break;
    }
}
function spawnBossZombie() {
    let number = Math.floor(Math.random() * 2) + 1;
    let index;
    for (var i = 0; i < number; i++) {
        if (zombieSpawned < ZOMBIE_COUNT) {
            index = Math.floor(Math.random() * 5) + 1;
            let zombie = new Boss("resources/images/boss" + index + ".png");
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
                if (zombies[i].name == "big") {
                    doDamage(i, dmg * 2)
                } else if (zombies[i].name == "boss") {
                    doDamage(i, dmg * 3)
                }
                else {
                    zombies.splice(i, 1);
                    zombieKilled++;
                }
                headshot.currentTime = 0;
                headshot.play();
            } else {
                doDamage(i, dmg)
            }
        }
    }
}
function blowZombie(x1, x2) {
    for (var i = 0; i < zombies.length; i++) {
        var zomLeft = zombies[i].xPosition;
        var zomRight = zombies[i].xPosition + zombies[i].width;
        if (zomRight >= x1 && zomLeft <= x2) {
            zombies[i].health -= 25;
            if (zombies[i].health <= 0) {
                zombies.splice(i, 1);
                i--;
                zombieKilled++;
            }
        }
    }
}
function doDamage(i, dmg) {
    zombies[i].health -= dmg;
    if (zombies[i].health <= 0) {
        zombies.splice(i, 1);
        zombieKilled++;
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
        case "3":
            game.setGun(assault);
            break;
        case "r":
            game.gun.reload();
            break;
        case "g":
            game.gun.throwNade(game);
            break;
    }
}
function updatePointer(e) {
    game.gun.pointerX = e.clientX;
    game.gun.pointerY = e.clientY;
}
function drawExpolsion(x, game) {
    var ctx = game.ctx;
    ctx.drawImage(boom, x, CANVAS_HEIGHT / 2 - 250, 500, 500);
}
function randomSupplyDrop() {
    let names = ["ammoBox", "healthBox", "grenadeBox"];
    let number = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < number; i++) {
        let index = Math.floor(Math.random() * 3)
        let box = new SupplyBox(names[index]);
        supplyList.push(box);
    }
}
function dropSupply() {
    for (let i = 0; i < supplyList.length; i++) {
        supplyList[i].draw(game);
    }
}
function shootBox(gunX, gunY) {
    for (var i = 0; i < supplyList.length; i++) {
        var boxLeft = supplyList[i].xPosition;
        var boxRight = supplyList[i].xPosition + supplyList[i].image.width;
        var boxTop = supplyList[i].yPosition;
        var boxBot = supplyList[i].yPosition + supplyList[i].image.height;
        if (gunX < boxRight && gunX > boxLeft && gunY < boxBot && gunY > boxTop) {
            supplyList[i].effect();
            supplyList.splice(i, 1);
        }
    }
}
function start() {
    document.body.innerHTML = '<canvas id="game" width="1500" height="700" onmousedown="game.gun.shoot(event)" onmousemove="game.move(event); updatePointer(event)" onmouseup="game.gun.release()"></canvas>';
    game.canvas = document.getElementById("game");
    game.ctx = game.canvas.getContext("2d");
    game.start();
}
function update() {
    game.clear();
    moveZombie();
    if (isBlowing)
        drawExpolsion(bombX, game);
    dropSupply();
    game.gun.draw(game);
    game.displayHUD();
    if (game.health <= 0)
        game.stop();
    if (zombieKilled == ZOMBIE_COUNT)
        game.win();
}
