import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix

kaplay({
    width: 320,
    height: 240,
    background: "#ffffff",
    scale: 2,
    canvas: document.getElementById("canvas"),
});

loadRoot("./"); // A good idea for Itch.io publishing later
loadSprite("wizard", "sprites/gun_spritesheet.png", {
    sliceX: 10,
    anims: {
        shoot: {
            from: 0,
            to: 9,
            loop: false,
            speed: 10,
        }
    }
});
loadSprite("bullet", "sprites/bullet_spritesheet.png", {
    sliceX: 4,
    anims: {
        bulletshot: {
            from: 0,
            to: 3,
            loop: false,
            speed: 10,
        }
    }
});

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

loadSprite("boss", "sprites/boss.png");
loadSprite("ball", "sprites/ball_spritesheet.png", {
        sliceX: 5,
        anims: {
            launch: {
                from: 0,
                to: 4,
                loop: false,
                speed: 7,
            }
        }
    })

loadSprite("background1", "sprites/background1.png");
loadSprite("background2", "sprites/background2.png");
loadSprite("background3", "sprites/background3.png");

loadSound("hit", "sounds/hit.mp3");
loadSound("shot", "sounds/shot.mp3");
loadSound("die", "sounds/die.mp3");
loadSound("balllaunch", "sounds/balllaunch.mp3");
loadSound("munchiedie", "sounds/munchiedie.mp3");

scene("wave_1", () => {
    let wizardX = 120;
    let wizardY = 80;
    let wave2Started = false;

    let health = 100;
    const maxHealth = 100;
    let redOpacity = 0;

    add([
        sprite("background1"),
        pos(0,0),
        fixed(),
        scale(1),
        anchor("topleft"),
        z(-100)
    ])  

    add([
        text("WAVE 1", {
            size: 24,
            align: "center",
        }),
        color(rgb(154, 9, 9)),
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
        sprite("wizard", {
            anim: "shoot",
            animSpeed: 10,
            frame: 0,
        }),
        scale(0.15),
        area(),
        body(),
        anchor("center"),
        rotate(0),
        "wizard",        
    ]);

    let oppNumber = 0;
    
    wizard.onUpdate(() => {
        wizard.rotateTo(mousePos().angle(wizard.pos));
        if (mousePos().x < wizard.pos.x) {
            wizard.scale.x = -Math.abs(wizard.scale.x); // face left
        } else {
            wizard.scale.x = Math.abs(wizard.scale.x); // face right
        }
   
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
            animate("shot"),
            rotate(wizard.angle),
            move(mousePos().sub(wizard.pos).unit(), 400),
            "bullet",
        ]);
        wizard.play("shoot");
        bullet.play("bulletshot");
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
                    scale(0.1),            
                    area(),
                    z(1),
                    "munchie",
                    {speed: 50},            
                ]);
                
                wait(0.1, () => {
                    newMunchie.scale = vec2(0.07);
                    wait(0.1, () => {
                        newMunchie.scale = vec2(0.09);
                        wait(0.1, () => {
                            newMunchie.scale = vec2(0.1);
                        });
                    });                    
                })

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
            wizard.color = rgb(74, 255, 174);
            wait(0.1, () => {
                wizard.color = rgb(255, 255, 255);
                munchie.scale = vec2(0.09);
                munchie.color = rgb(159, 58, 58);
            }),
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
                scale(0.1),            
                area(),
                z(1),
                "opp",
                {speed: 50},
            ]);

            wait(0.1, () => {
                newOpp.scale = vec2(0.07);
                wait(0.1, () => {
                    newOpp.scale = vec2(0.09);
                    wait(0.1, () => {
                        newOpp.scale = vec2(0.1);
                    });
                });                    
            })

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
        opp.color = rgb(159, 58, 58);
        wait (0.1, () => {
            opp.scale = vec2(0.09);
            destroy(opp);
        })
        play("die");
    })
    
    onCollide("opp", "wizard", (opp, wizard) => {
        health = Math.min(maxHealth, health - 3);
        play("hit");
        wizard.color = rgb(159, 58, 58);
        wait(0.1, () => {
            wizard.color = rgb(255, 255, 255);
        })
    }) 

    onCollide("munchie", "wizard", (munchie, wizard) => {
        health = Math.min(maxHealth, health + 2);
        play("munchiedie");
        munchie.color = rgb(159, 58, 58);
        wizard.color = rgb(74, 255, 174);
        wait(0.05, () => {
            munchie.scale = vec2(0.09);
            wizard.color = rgb(255, 255, 255);
             wait(0.05, () => {
                munchie.scale = vec2(0.15);
                wait(0.05, () => {
                    munchie.scale = vec2(0.14);
                    wait(0.05, () => {
                        destroy(munchie);
                    });
                });
            })
        })
    })

    onKeyPress("space", () => {
        go("wave_2");
    });
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
        sprite("background2"),
        pos(0,0),
        fixed(),
        scale(1),
        anchor("topleft"),
        z(-100)
    ])

    add([
        text("WAVE 2", {
            size: 24,
            align: "center",
        }),
        color(rgb(154, 9, 9)),
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
        sprite("wizard", {
            anim: "shoot",
            animSpeed: 10,
            frame: 0,
        }),
        scale(0.15),
        area(),
        anchor("center"),
        rotate(0),
        "wizard",        
    ]);

    let oppNumber = 0;
    
    wizard.onUpdate(() => {
        wizard.rotateTo(mousePos().angle(wizard.pos));
        if (mousePos().x < wizard.pos.x) {
            wizard.scale.x = -Math.abs(wizard.scale.x); // face left
        } else {
            wizard.scale.x = Math.abs(wizard.scale.x); // face right
        }

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
        wizard.play("shoot");
        bullet.play("bulletshot");
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
                    scale(0),            
                    area(),
                    z(1),
                    "munchie",
                    {speed: 50},         
                ]);

                wait(0.1, () => {
                    newMunchie.scale = vec2(0.07);
                    wait(0.1, () => {
                        newMunchie.scale = vec2(0.09);
                        wait(0.1, () => {
                            newMunchie.scale = vec2(0.1);
                        });
                    });                    
                })

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
            wizard.color = rgb(74, 255, 174);
            munchie.color = rgb(159, 58, 58);
                    wait(0.05, () => {
            munchie.scale = vec2(0.09);
            wizard.color = rgb(255, 255, 255);
             wait(0.05, () => {
                    munchie.scale = vec2(0.15);
                    wait(0.05, () => {
                        munchie.scale = vec2(0.14);
                        wait(0.05, () => {
                            destroy(munchie);
                        });
                    });
                })
            })
            play("munchiedie");
        })

        onCollide("munchie", "wizard", (munchie, wizard) => {
            health = Math.min(maxHealth, health + 2);
            play("munchiedie");
            munchie.color = rgb(159, 58, 58);
            wizard.color = rgb(74, 255, 174);
            wait(0.05, () => {
                munchie.scale = vec2(0.09);
                wizard.color = rgb(255, 255, 255);
                wait(0.05, () => {
                    munchie.scale = vec2(0.15);
                    wait(0.05, () => {
                        munchie.scale = vec2(0.14);
                        wait(0.05, () => {
                            destroy(munchie);
                        });
                    });
                })
            })
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
                scale(0.1),            
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

        if (!wave3Started && oppNumber >= 100) {
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
        opp.color = rgb(159, 58, 58);
        wait (0.1, () => {
            opp.scale = vec2(0.09);
            destroy(opp);
        })
        play("die");
    })
    
    onCollide("opp", "wizard", (opp, wizard) => {
        health = Math.min(maxHealth, health - 2);
        play("hit");
    }) 
    onKeyPress("space", () => {
        go("wave_3");
    });
});

scene("wave_3", () => {
      add([
        text("WAVE 3", {
            size: 24,
            align: "center",
        }),
        color(rgb(255, 255, 255)),
        z(200),
        opacity(1),
        anchor("center"),
        pos(center()),
        lifespan(2, {fade: 1
        }),
    ])

    
    let health = 100;
    const maxHealth = 100;
    let redOpacity = 0;

    add([
        sprite("background3"),
        pos(0,0),
        fixed(),
        scale(1),
        anchor("topleft"),
        z(-100)
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


    const boss = add([
        sprite("boss"),
        scale(0.4),
        pos(160, 20),
        anchor("center"),
    ])

    let wizardX = 160;
    let wizardY = 270;

        const wizard = add([
        pos(wizardX, wizardY), {
            speed: 150
        },
        sprite("wizard", {
            anim: "shoot",
            animSpeed: 10,
            frame: 0,
        }),
        scale(0.15),
        area(),
        anchor("center"),
        rotate(0),
        "wizard",        
    ]);

    let oppNumber = 0;
    
    wizard.onUpdate(() => {
        wizard.rotateTo(mousePos().angle(wizard.pos));
        if (mousePos().x < wizard.pos.x) {
            wizard.scale.x = -Math.abs(wizard.scale.x); // face left
        } else {
            wizard.scale.x = Math.abs(wizard.scale.x); // face right
        }

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
        wizard.play("shoot");
        bullet.play("bulletshot");
        play("shot");
    });
 

    wait(0.1, () => {
        boss.pos.y += 5;
        wait(0.1, () => {
            boss.pos.y += 40;
            wait(0.1, () => {
                boss.pos.y += 15;
                wait(0.1, () => {
                    boss.pos.y += 5;
                    wait(0.1, () => {
                        boss.pos.y += 2;
                        wait(0.1, () => {
                            boss.pos.y += 1;
                        })
                    })
                })
            })
        })
    })

     wait(0.5, () => {
        wizard.pos.y -= 5;
        wait(0.1, () => {
            wizard.pos.y -= 40;
            wait(0.1, () => {
                wizard.pos.y -= 15;
                wait(0.1, () => {
                    wizard.pos.y -= 5;
                    wait(0.1, () => {
                        wizard.pos.y -= 2;
                        wait(0.1, () => {
                            wizard.pos.y -= 1;
                        })
                    })
                })
            })
        })
    })

    wait(2, () => {
           const balls = [];

            function addBall() {                
                play("balllaunch");

                let spawnPos = vec2(rand(0, width()), 60);
                
                const newBall = add([
                        sprite("ball"),
                        pos(spawnPos),
                        anchor("bot"),
                        scale(0),            
                        area(),
                        z(1),
                        "ball",
                        {speed: 50},         
                    ]);

                    wait(0.1, () => {
                        newBall.scale = vec2(0.07);
                        wait(0.1, () => {
                            newBall.scale = vec2(0.09);
                            wait(0.1, () => {
                                newBall.scale = vec2(0.1);
                            });
                        });                    
                    })

                const dir = wizard.pos.sub(newBall.pos).unit();

                newBall.onUpdate(() => {
                    newBall.move(dir.scale(newBall.speed));
                });

                return newBall;
    
                balls.push(newBall);
            }

            let ballSpawnTime = 5;    
            let balltimePassed = 0;

            onUpdate(() => {
                balltimePassed += dt();

                if (balltimePassed >= ballSpawnTime) {
                    addBall();
                    addBall();
                    addBall();
                    balltimePassed = 0;
                }
            })

            loop(ballSpawnTime, () => {
                addBall();
            });

            onCollide("ball", "wizard", (ball, wizard) => {
                health = Math.min(maxHealth, health - 2);
                play("hit");
                ball.color = rgb(255, 169, 56);
                wizard.color = rgb(159, 58, 58);
                    wait(0.05, () => {
                        wizard.color = rgb(255, 255, 255);
                        destroy(ball);    
                    })
                })
    })

});


scene("death", () => {
 add([
    text("bye", {
        size: 48,
        align: "center",
    }),
    color(rgb(154, 9, 9)),
    z(200),
    opacity(1),
    anchor("center"),
    pos(center()),
 ])
})
