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
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var pots = ["mpot0", "hpot1"];

setInterval(function () {

    if (buying) {
        buying = buy_potions(pots);
    } else {
        set_message(pots);
        if (character.max_hp - character.hp > get_item(pots[1]).get("gives")[1]) {
            use('use_hp');
        }
        if (character.max_mp - character.mp > get_item(pots[0]).get("gives")[1]) {
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
