import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix

kaplay({
    width: 320,
    height: 240,
    background: "#d52e2e",
    scale: 2,
    canvas: document.getElementById("canvas"),
});

loadRoot("./"); // A good idea for Itch.io publishing later
loadSprite("wizard", "sprites/wizard.png");
loadSprite("bullet", "sprites/bullet.png");

loadSprite("opp", "sprites/opp.png");
loadSprite("opp2", "sprites/opp2.png");
loadSprite("opp3", "sprites/opp3.png");

loadSprite("munchie", "sprites/munchie.png");
loadSprite("munchie2", "sprites/munchie2.png");
loadSprite("munchie3", "sprites/munchie3.png");

loadSprite("healthbar_heart", "sprites/healthbar_heart.png");
loadSprite("healthbar_empty", "sprites/healthbar_empty.png");
loadSprite("healthbar_redpart", "sprites/healthbar_redpart.png");
loadSprite("red", "sprites/red_overlay.png");

loadSound("hit", "sounds/hit.mp3");
loadSound("shot", "sounds/shot.mp3");
loadSound("die", "sounds/die.mp3");
loadSound("munchiedie", "sounds/munchiedie.mp3");


scene("wave_1", () => {
    let wizardX = 120;
    let wizardY = 80;
    let wave2Started = false;

    let health = 100;
    const maxHealth = 100;
    let redOpacity = 0;

    play("hit");

    add([
        text("WAVE 1", {
            size: 24,
            align: "center",
        }),
        z(200),
        opacity(1),
        anchor("center"),
        pos(center()),
        lifespan(2, {fade: 1
        }),
    ])

    const red = add([
        sprite("red"),
        pos(0,0),
        fixed(),
        scale(1),
        opacity(redOpacity),
        anchor("topleft"),
        z(1000)
    ])

    const healthbar_empty = add([
        sprite("healthbar_empty"),
        pos(240,10),
        fixed(),
        z(100),
    ])

    const healthbar_heart = add([
        sprite("healthbar_heart"),
        pos(205,10),
        fixed(),
        z(102),
    ])

    const healthbar_redpart = add([
        sprite("healthbar_redpart"),
        pos(240,22.5),
        fixed(),
        scale(1, 1),
        anchor("left"),
        z(101),
    ])

        let healthdecreaseTimePassed = 0;
        const ratio = health / maxHealth;

        onUpdate(() => {
            health = Math.max(0, health - 5 * dt());
            healthbar_redpart.scale.x =  health/maxHealth;;
            const lerpSpeed = 1; 
            const targetOpacity = 2.5 * (1 - health / maxHealth); //so the opacity can decrease too
            redOpacity += (targetOpacity - redOpacity) * lerpSpeed * dt();
            red.opacity = Number(redOpacity);
        })

    const wizard = add([
        pos(wizardX, wizardY), {
            speed: 150
        },
        sprite("wizard"),
        scale(0.04),
        area(),
        body(),
        anchor("center"),
        rotate(0),
        "wizard",        
    ]);

    let oppNumber = 0;
    
    wizard.onUpdate(() => {
        wizard.rotateTo(mousePos().angle(wizard.pos));
        
        wizard.pos.x = clamp(wizard.pos.x, 0, width());
        wizard.pos.y = clamp(wizard.pos.y, 0, height());
     });
    
  wizard.onKeyDown((key) => {
    if (key === "w") {
        wizard.move(0, -wizard.speed)
    }
    if (key === "s") {
        wizard.move(0, wizard.speed)
    }
    if (key === "a") {
        wizard.move(-wizard.speed, 0)
    }        
    if (key === "d") {
        wizard.move(wizard.speed, 0)
    }    
  })

    onClick(() => {
        const bullet = add([
            sprite("bullet"),
            pos(wizard.pos),
            scale(0.3),
            area(),
            anchor(vec2(-4, -4)),
            offscreen({
                destroy: true,
            }),
            rotate(wizard.angle),
            move(mousePos().sub(wizard.pos).unit(), 400),
            "bullet",
        ]);
        play("shot");
    });

        const munchies = [];

        function addMunchie() {
            const options = ["munchie","munchie2","munchie3"];
            const index = Math.floor(rand(0, options.length));
            const randomSprite = options[index];
            
            let spawnPos = rand(vec2(width(), height()));
            
            const newMunchie = add([
                    sprite(randomSprite),
                    pos(spawnPos),
                    anchor("bot"),
                    scale(0.03),            
                    area(),
                    z(1),
                    "munchie",
                    {speed: 50},            
                ]);

                newMunchie.onUpdate(() => {
                    move(wizard.pos.sub(newMunchie.pos).unit().scale(newMunchie.speed)); 
                });

                munchies.push(newMunchie);
        }

        let munchieSpawnTime = 1;    
        let munchietimePassed = 0;

        onUpdate(() => {
            munchietimePassed += dt();

            if (munchietimePassed >= munchieSpawnTime) {
                addMunchie();
                munchietimePassed = 0;


                munchieSpawnTime = Math.max(0.2, munchieSpawnTime - 0.003);
            }
        })

        loop(munchieSpawnTime, () => {
            addMunchie();
        });

        onCollide("munchie", "bullet", (munchie, bullet) => {
            destroy(munchie);
            health = Math.min(maxHealth, health + 2);
            play("munchiedie")
        })


    const opps = [];

    function addOpp() {
        const options = ["opp","opp2","opp3"];
        const index = Math.floor(rand(0, options.length));
        const randomSprite = options[index];
        
        let spawnPos;
        const safeRadius = 90;

        do {
            spawnPos = rand(vec2(width(), height()));
        } while (spawnPos.dist(wizard.pos) < safeRadius);

        const newOpp = add([
                sprite(randomSprite),
                pos(spawnPos),
                anchor("bot"),
                scale(0.03),            
                area(),
                z(1),
                "opp",
                {speed: 50},
            ]);

            opps.push(newOpp);

        newOpp.onUpdate(() => {
            const dir = wizard.pos.sub(newOpp.pos).unit();
            newOpp.move(dir.scale(newOpp.speed));            
        })

        oppNumber += 1;

        if (!wave2Started && oppNumber >= 100) {
            wave2Started = true;
            go("wave_2");
        }
    }

    let oppSpawnTime = 1;    
    let timePassed = 0;

    onUpdate(() => {
        timePassed += dt();

        if (timePassed >= oppSpawnTime) {
            addOpp();
            timePassed = 0;


            oppSpawnTime = Math.max(0.2, oppSpawnTime - 0.02);
        }

        if (health <= 0) {
            go("death");
        }
    })

    loop(oppSpawnTime, () => {
        addOpp();
    });

    onCollide("opp", "bullet", (opp, bullet) => {
        destroy(opp);
        play("die");
    })
    
    onCollide("opp", "wizard", (opp, wizard) => {
        health = Math.min(maxHealth, health - 3);
        play("hit");

    }) 
});

go("wave_1");

scene("wave_2", () => {
    let wizardX = 120;
    let wizardY = 80;
    let wave3Started = false;

    let health = 100;
    const maxHealth = 100;
    let redOpacity = 0;

    add([
        text("WAVE 1", {
            size: 24,
            align: "center",
        }),
        z(200),
        opacity(1),
        anchor("center"),
        pos(center()),
        lifespan(2, {fade: 1
        }),
    ])

    const red = add([
        sprite("red"),
        pos(0,0),
        fixed(),
        scale(1),
        opacity(redOpacity),
        anchor("topleft"),
        z(1000)
    ])

    const healthbar_empty = add([
        sprite("healthbar_empty"),
        pos(240,10),
        fixed(),
        z(100),
    ])

    const healthbar_heart = add([
        sprite("healthbar_heart"),
        pos(205,10),
        fixed(),
        z(102),
    ])

    const healthbar_redpart = add([
        sprite("healthbar_redpart"),
        pos(240,22.5),
        fixed(),
        scale(1, 1),
        anchor("left"),
        z(101),
    ])

        let healthdecreaseTimePassed = 0;
        const ratio = health / maxHealth;

        onUpdate(() => {
            health = Math.max(0, health - 5 * dt());
            healthbar_redpart.scale.x =  health/maxHealth;;
            const lerpSpeed = 1; 
            const targetOpacity = 2.5 * (1 - health / maxHealth); //so the opacity can decrease too
            redOpacity += (targetOpacity - redOpacity) * lerpSpeed * dt();
            red.opacity = Number(redOpacity);
        })

    const wizard = add([
        pos(wizardX, wizardY), {
            speed: 150
        },
        sprite("wizard"),
        scale(0.04),
        area(),
        anchor("center"),
        rotate(0),        
    ]);

    let oppNumber = 0;
    
    wizard.onUpdate(() => {
        wizard.rotateTo(mousePos().angle(wizard.pos));
        
        wizard.pos.x = clamp(wizard.pos.x, 0, width());
        wizard.pos.y = clamp(wizard.pos.y, 0, height());
     });
    
  wizard.onKeyDown((key) => {
    if (key === "w") {
        wizard.move(0, -wizard.speed)
    }
    if (key === "s") {
        wizard.move(0, wizard.speed)
    }
    if (key === "a") {
        wizard.move(-wizard.speed, 0)
    }        
    if (key === "d") {
        wizard.move(wizard.speed, 0)
    }    
  })

    onClick(() => {
        const bullet = add([
            sprite("bullet"),
            pos(wizard.pos),
            scale(0.3),
            area(),
            anchor(vec2(-4, -4)),
            offscreen({
                destroy: true,
            }),
            rotate(wizard.angle),
            move(mousePos().sub(wizard.pos).unit(), 400),
            "bullet",
        ]);
        play("shot");
    });

        const munchies = [];

        function addMunchie() {
            const options = ["munchie","munchie2","munchie3"];
            const index = Math.floor(rand(0, options.length));
            const randomSprite = options[index];
            
            let spawnPos = rand(vec2(width(), height()));
            
            const newMunchie = add([
                    sprite(randomSprite),
                    pos(spawnPos),
                    anchor("bot"),
                    scale(0.03),            
                    area(),
                    z(1),
                    "munchie",
                    {speed: 50},            
                ]);

                newMunchie.onUpdate(() => {
                    move(wizard.pos.sub(newMunchie.pos).unit().scale(newMunchie.speed)); 
                });

                munchies.push(newMunchie);
        }

        let munchieSpawnTime = 0.8;    
        let munchietimePassed = 0;

        onUpdate(() => {
            munchietimePassed += dt();

            if (munchietimePassed >= munchieSpawnTime) {
                addMunchie();
                munchietimePassed = 0;


                munchieSpawnTime = Math.max(0.2, munchieSpawnTime - 0.003);
            }
        })

        loop(munchieSpawnTime, () => {
            addMunchie();
        });

        onCollide("munchie", "bullet", (munchie, bullet) => {
            destroy(munchie);
            health = Math.min(maxHealth, health + 2);
            play("munchiedie");
        })


    const opps = [];

    function addOpp() {
        const options = ["opp","opp2","opp3"];
        const index = Math.floor(rand(0, options.length));
        const randomSprite = options[index];
        
        let spawnPos;
        const safeRadius = 90;

        do {
            spawnPos = rand(vec2(width(), height()));
        } while (spawnPos.dist(wizard.pos) < safeRadius);

        const newOpp = add([
                sprite(randomSprite),
                pos(spawnPos),
                anchor("bot"),
                scale(0.03),            
                area(),
                z(1),
                "opp",
                {speed: 50},
            ]);

            opps.push(newOpp);

        newOpp.onUpdate(() => {
            const dir = wizard.pos.sub(newOpp.pos).unit();
            newOpp.move(dir.scale(newOpp.speed));            
        })

        oppNumber += 1;

        if (!wave3Started && oppNumber >= 150) {
            wave3Started = true;
            go("wave_3");
        }
    }

    let oppSpawnTime = 0.4;    
    let timePassed = 0;

    onUpdate(() => {
        timePassed += dt();

        if (timePassed >= oppSpawnTime) {
            addOpp();
            timePassed = 0;


            oppSpawnTime = Math.max(0.2, oppSpawnTime - 0.02);
        }

        if (health <= 0) {
            go("death");
        }
    })

    loop(oppSpawnTime, () => {
        addOpp();
    });

    onCollide("opp", "bullet", (opp, bullet) => {
        destroy(opp);
        play("die");
    })
    
    onCollide("opp", "wizard", (opp, wizard) => {
        health = Math.min(maxHealth, health - 35);
        play("hit");
    }) 
});

scene("wave_3", () => {

})

scene("death", () => {
 add([
    text("bye"),
    pos(center()),
 ])
})
