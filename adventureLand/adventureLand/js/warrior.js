add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var pots = [G.items.mpot0, G.items.hpot1];
var aggroCircle;

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

        target = acquireTarget(character);
        if (null != target && can_use("taunt")) {
            if (character.hp > character.max_hp / 2) {
                parent.use_skill("taunt", target);
            }
        }

        parent.map.removeChild(aggroCircle);
        clear_drawings();
        if (null != target) {
            set_message(target.name);
            aggroCircle = draw_circle(target.x, target.y, target.range)
        }

        if (can_attack(target)) {
            attack(target);
        }
    }
}, 1000 / 4); // Loops every 1/4 seconds.
