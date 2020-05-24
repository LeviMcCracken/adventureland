
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

function getPriorityTarget() {
    for (x of targetFirstList) {
        target = get_nearest_monster({ min_xp: 100, max_att: max_att_p, type: x });
        if (target) {
            change_target(target);
            set_message("Tgt: " + x);
            break;
        }
    }
}

function getDefaultTarget() {
    target = get_nearest_monster({ min_xp: 100, max_att: max_att_p });
    if (target) set_message("Tgt: Def");
}

function getEngagedTarget() {
    var party = get_party();
    for (x in party) {
        target = get_nearest_monster({ target: x });
    }
    if (target) set_message("Tgt: Host");
}

function getLeadersTarget() {
    var leader = get_player(character.party);
    return get_target_of(leader);

    //if(target) set_message("Tgt: Lead");
}

function acquireTarget() {
    target = get_targeted_monster();
    if (!target) getLeadersTarget();
    if (!target) getPriorityTarget();
    if (!target) getEngagedTarget();

    return target;
}

function getPartyMembers() {
    return Object.values(parent.entities).filter(char =>
        is_character(char) && !char.rip &&
        char.party && char.party === character.party);
}
