// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

function add_lib(lib_src) {
    var library = document.createElement("script");
    library.type = "text/javascript";
    library.src = lib_src;
    document.getElementsByTagName("head")[0].appendChild(library);
}

add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");

var attack_mode = true

var buying = false;
var pots = ["mpot1", "hpot1"];

setInterval(function () {

    if (buying) {
        buying = buy_potions(pots);
    } else {
        if (character.max_hp - character.hp >= 300) {
            use('use_hp');
        }
        if (character.max_mp - character.mp >= 300) {
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
            } else if (null == target && character.max_hp - character.hp > 300) {
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

function getPartyMembers() {
    return Object.values(parent.entities).filter(char =>
        is_character(char) && !char.rip &&
        char.party && char.party === character.party);
}

function getMonsters() {
    return Object.values(parent.entities).filter(e => is_monster(e));
}

function item_quantity(name) {
    for (var i = 0; i < 42; i++) {
        if (character.items[i] && character.items[i].name == name) {
            return character.items[i].q || 0;
        }
    }
    return 0;
}

function setBuying() {
    set_message("Buying");
    buying = true;
}

function buy_potions() {
    if (item_quantity("mpot0") < 1000) {
        buy("mpot0", 100);
    }
    if (item_quantity("hpot0") < 1000) {
        buy("hpot0", 100);
    }
    if (character.gold <= 5000 ||
        (item_quantity("hpot0") > 1000 && item_quantity("mpot0") > 1000)) {
        buying = false;
    }
}

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
