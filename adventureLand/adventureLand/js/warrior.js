// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var pots = ["mpot0", "hpot1"];

setInterval(function () {

    if (buying) {
        buying = buy_potions(pots);
    } else {
        let hpPot = get_item(pots[1]);
        set_message(hpPot);
        if (character.max_hp - character.hp >= hpPot.get("gives")[1]) {
            use('use_hp');
        }
        let mpPot = get_item(pots[0]);
        if (character.max_mp - character.mp >= mpPot.get("gives")[1]) {
            use('use_mp');
        }
        loot();

        if (!attack_mode || character.rip || is_moving(character)) return;

        let runningLow = false;
        for (pot in pots){
            if (item_quantity(pot) < min_pot_thres) {
                runningLow = true;
            }
        }

        if (runningLow && character.gold >= gold_min_thresh + gold_min_thresh) {
            set_message("Traveling");
            smart_move({ to: "potions", return: true }, function () { setBuying(); });
            // while the smart_move is happening, is_moving is false
            // therefore the attack routine doesn't execute
            return;
        } else {

            acquireTarget();
            if (null != target) {
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
    }
}, 1000 / 4); // Loops every 1/4 seconds.
