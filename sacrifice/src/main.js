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

scene("wave_1", () => {
   let wizardX = 120;
   let wizardY = 80;

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
    });

    const opps = [];

    function addOpp() {
        const options = ["opp","opp2","opp3"];
        const index = Math.floor(rand(0, options.length));
        const randomSprite = options[index];
        
        const newOpp = add([
                sprite(randomSprite),
                pos(rand(vec2(width(),height()))),
                anchor("bot"),
                scale(0.03),            
                area(),
                z(1),
                "opp",
                {speed: rand(25000, 30000)},
            ]);

            opps.push(newOpp);
    
    }

    loop(0.75, () => {
        addOpp();
    });

    onCollide("opp", "bullet", (opp, bullet) => {
        destroy(opp);
    })

});

go("wave_1");
