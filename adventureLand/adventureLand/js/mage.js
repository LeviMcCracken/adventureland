// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true

var buying = false;
var pots = [G.item.mpot1, G.item.hpot1];

setInterval(function () {

    if (buying) {
        buying = buy_potions(pots);
    } else {
        if (character.max_hp - character.hp >= get_item(pots[1]).get("gives")[1]) {
            use('use_hp');
        }
        if (character.max_mp - character.mp >= get_item(pots[0]).get("gives")[1]) {
            use('use_mp');
        }
        loot();

        if (!attack_mode || character.rip || is_moving(character)) return;

        let runningLow = false;
        for (pot in pots) {
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

            var target = get_targeted_monster();
            let targetingMe = getMonsters().
                filter(m => m.target == character.name);
            set_message("Defending:" + targetingMe.length);
            if (targetingMe.length > 0) {
                target = targetingMe[0];
            } else if (null == target && character.max_hp - character.hp > get_item(pots[1]).get("gives")[1] + 100) {
                set_message("Healing Break");
            } else {
                target = get_nearest_monster({ min_xp: 100, max_att: max_att_p });
                if (target) {
                    change_target(target)
                } else {
                    set_message("No Monsters");
                    return;
                }
            }

            let partyList = getPartyMembers();
            let warrior = partyList.filter(char => char.ctype == "warrior")[0];
            if (can_use("energize") &&
                character.level >= G.skills.energize.level &&
                null != warrior) {
                parent.use_skill("energize", warrior);
            }
            if (can_use("reflection") &&
                character.level >= G.skills.reflection.level &&
                null != warrior) {
                parent.use_skill("reflection", warrior);
            }

            if (null != target && !is_in_range(target)) {
                set_message("Chasing");
                move(
                    character.x + (target.x - character.x) / 2,
                    character.y + (target.y - character.y) / 2
                );
                // Walk half the distance
            }
            else if (can_attack(target)) {
                //set_message(target.name);
                attack(target);
            }
        }
    }
}, 1000 / 4); // Loops every 1/4 seconds.
