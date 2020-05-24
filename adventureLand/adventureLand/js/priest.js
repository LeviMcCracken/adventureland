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
var target = null;
var max_att_p = 500;

setInterval(function () {

    if (buying) {
        buy_potions();
    } else {
        if (character.max_hp - character.hp >= 300) {
            use('use_hp');
        }
        if (character.max_mp - character.mp >= 300) {
            use('use_mp');
        }
        loot();

        if (!attack_mode || character.rip || is_moving(character)) return;

        if ((item_quantity("mpot0") < 20 || item_quantity("hpot0") < 20) &&
            character.gold >= 10000) {
            set_message("Traveling");
            smart_move({ to: "potions", return: true }, function () { setBuying(); });
            // while the smart_move is happening, is_moving is false
            // therefore the attack routine doesn't execute
            return;
        } else {

            acquireTarget();

            let partyList = getPartyMembers();
            let warrior = partyList.filter(char => char.ctype == "warrior")[0];
            if (can_use("darkblessing") &&
                character.level >= G.skills.darkblessing.level) {
                parent.use_skill("darkblessing", warrior);
            }
            if (can_use("partyheal")) {
                let hurtList = partyList.filter(char => char.max_hp - char.hp > 200);
                if (hurtList.length > 0) {
                    set_message("partyheal");
                    parent.use_skill("partyheal");
                    hurtList.sort(function (a, b) {
                        return (b.max_hp - b.hp) - (a.max_hp - a.hp)
                    }
                    );
                }
                else {
                    set_message("All Healed");
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

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
