add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var pots = [G.items.mpot0, G.items.hpot1];

setInterval(function () {

    if (buying) {
        buying = buy_potions();
    } else {
        use_pots();

        loot();

        if (!attack_mode || character.rip || is_moving(character)) return;
        
        if (isNeedMorePots() && character.gold >= gold_min_thresh + gold_min_thresh) {
            lets_go();
        }

        target = acquireTarget(character);
        set_message(target);
        if (null != target && can_use("taunt")) {
            if (character.hp > character.max_hp / 2) {
                parent.use_skill("taunt", target);
            }
        }

        if (null != target && !is_in_range(target)) {
            move(
                character.x + (target.x - character.x) / 2,
                character.y + (target.y - character.y) / 2
            );
            // Walk half the distance
        }
        else if (can_attack(target)) {
            attack(target);
        }
    }
}, 1000 / 4); // Loops every 1/4 seconds.
