add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var target = null;
var pots = [G.items.mpot1, G.items.hpot1];

setInterval(function () {

    party();

    if (buying) {
        buying = buy_potions();
    } else {
        use_pots();

        loot();

        if (!attack_mode || character.rip || is_moving(character)) return;
        
        if (isNeedMorePots() && character.gold >= gold_min_thresh + gold_min_thresh) {
            lets_go();
            get_pots();
            return;
        }

        target = acquireTarget(character);

        let partyList = getPartyMembers();
        let warrior = partyList.filter(char => char.ctype == "warrior")[0];
        if (can_use("darkblessing") &&
            character.level >= G.skills.darkblessing.level) {
            parent.use_skill("darkblessing", warrior);
        }
        if (can_use("curse")) {
            parent.use_skill("curse", target);
        }
        if (can_use("partyheal")) {
            let hurtList = partyList.filter(char => char.max_hp - char.hp > partyheal_thresh);
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
}, 1000 / 4); // Loops every 1/4 seconds.

