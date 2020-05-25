add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var pots = [G.item.mpot0, G.item.hpot1];

setInterval(function () {

    if (buying) {
        buying = buy_potions(pots);
    } else {
        if (character.max_hp - character.hp >= pots[1].gives[1]) {
            use('use_hp');
        }
        if (character.max_mp - character.mp >= pots[0].gives[1]) {
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
        }

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
}, 1000 / 4); // Loops every 1/4 seconds.
