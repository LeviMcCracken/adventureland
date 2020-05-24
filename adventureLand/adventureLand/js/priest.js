// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;

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

            AcquireTarget();

            let partyList = getPartyMembers();
            let warrior = partyList.filter(char => char.ctype == "warrior")[0];
            if (can_use("darkblessing") &&
                character.level >= G.skills.darkblessing.level) {
                parent.use_skill("darkblessing", warrior);
            }
            if (can_use("partyheal")) {
                let hurtList = partyList.filter(char => char.max_hp - char.hp > 200);
                if (hurtList.size > 0) {
                    set_message("partyheal");
                    parent.use_skill("partyheal");
                    hurtList.sort(function (a, b) {
                        return (b.max_hp - b.hp) - (a.max_hp - a.hp)
                    }
                    );
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
        (item_quantity("hpot1") > 1000 && item_quantity("mpot1") > 1000) &&
        (item_quantity("hpot0") > 1000 && item_quantity("mpot0") > 1000)) {
        buying = false;
    }
}

function GetPriorityTarget() {
    for (x of targetFirstList) {
        target = get_nearest_monster({ min_xp: 100, max_att: 120, type: x });
        if (target) {
            change_target(target);
            set_message("Tgt: " + x);
            break;
        }
    }
}

function GetDefaultTarget() {
    target = get_nearest_monster({ min_xp: 100, max_att: 120 });
    if (target) set_message("Tgt: Def");
}

function GetEngagedTarget() {
    var party = get_party();
    for (x in party) {
        target = get_nearest_monster({ target: x });
    }
    if (target) set_message("Tgt: Host");
}

function GetLeadersTarget() {
    var leader = get_player(character.party);
    var leaderTarget = get_target_of(leader)
    if ((!target) || ((leaderTarget) && (target != leaderTarget))) {
        target = leaderTarget;
    }

    //if(target) set_message("Tgt: Lead");
}

function AcquireTarget() {
    target = get_targeted_monster();
    if (!target) GetLeadersTarget();
    if (!target) GetPriorityTarget();
    if (!target) GetEngagedTarget();

    if (!target) {
        //set_message("Tgt: None");
        return false;
    }
    return true;
}

function getPartyMembers() {
    return Object.values(parent.entities).filter(char =>
        is_character(char) && !char.rip &&
        char.party && char.party === character.party);
}

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
