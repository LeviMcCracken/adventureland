function get_item(name) {
    for (var i = 0; i < 42; i++) {
        if (character.items[i] && character.items[i].name == name) {
            return character.items[i];
        }
    }
    return 0;
}

function item_quantity(name) {
    return get_item(name).q||0;
}

function setBuying() {
    set_message("Buying");
    buying = true;
}


function buy_potion(name) {
    let quant = item_quantity(name);
    if (quant < buy_potions_up_to) {
        buy(name, pots_at_a_time);
    } else {
        return false;
    }
    return true;
}

function buy_potions() {
    let needMore = false;
    for (pot in pots) {
        if (buy_potion(pots[pot].id)) {
            needMore = true;
        }
    }
    if (!needMore || character.gold <= gold_min_thresh) {
        set_message("done buying");
        return false;
    }
    return true;
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

function getLeadersTarget(c) {
    var leader = get_player(c.party);
    set_message(c.party);
    return get_target_of(leader);
}

function acquireTarget(c) {
    let ret = get_targeted_monster();
    if (!ret) {
        ret = getLeadersTarget(c);
    }
    if (!ret) {
        ret = getPriorityTarget();
    }
    if (!ret) {
        ret = getEngagedTarget();
    }

    return ret;
}

function getPartyMembers() {
    return Object.values(parent.entities).filter(char =>
        is_character(char) && !char.rip &&
        char.party && char.party === character.party);
}

function getMonsters() {
    return Object.values(parent.entities).filter(e =>
        is_monster(e));
}

function use_pots() {
    if (character.max_hp - character.hp >= pots[1].gives[0][1]) {
        use('use_hp');
    }
    if (character.max_mp - character.mp >= pots[0].gives[0][1]) {
        use('use_mp');
    }
}

function isNeedMorePots() {
    let runningLow = false;
    for (pot in pots) {
        let quant = item_quantity(pots[pot].id);
        if (null == quant || quant < min_pot_thresh) {
            runningLow = true;
        }
    }
    return runningLow;
}

function lets_go() {
    let party = getPartyMembers();
    for (member in party){
        send_cm(member.name, "Need Pots");
    }
}

function on_cm(name, data) {
    console.log("cm:" + data);
}
