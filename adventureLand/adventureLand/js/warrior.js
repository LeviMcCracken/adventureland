add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var pots = [G.items.mpot0, G.items.hpot1];
var aggroCircle;
var my_target;

setInterval(function () {

    start_party();

    if (buying) {
        buying = buy_potions();
    } else {
        use_pots();

        loot();

        if (!attack_mode || character.rip || is_moving(character)) return;
        
        if (isNeedMorePots() && character.gold >= gold_min_thresh + gold_min_thresh) {
            lets_go();
        }

        my_target = target = acquireTarget(character);
        if (null != target && can_use("taunt")) {
            if (character.hp > character.max_hp / 2) {
                parent.use_skill("taunt", target);
            }
        }

        if ((alwaysKite || character.hp < character.max_hp) && null != target) {
            kite(target);
        }

        if (can_attack(target)) {
            attack(target);
        }
    }
}, 1000 / 4); // Loops every 1/4 seconds.

function on_draw() {
    if (null != aggroCircle){
        aggroCircle.destroy();
    }
    if (null != my_target) {
        set_message(my_target.name);
        aggroCircle = draw_circle(my_target.x, my_target.y, my_target.range)
    }
}
