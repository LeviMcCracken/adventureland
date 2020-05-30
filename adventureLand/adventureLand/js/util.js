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
    let t = get_target_of(leader);
    return t;
}

function acquireTarget(c) {
    let ret = get_targeted_monster();
    if (!ret) {
        ret = getLeadersTarget(c);
    }
    //if (!ret) {
    //    ret = getPriorityTarget();
    //}
    //if (!ret) {
    //    ret = getEngagedTarget();
    //}

    return ret;
}

function getPartyMembers() {
    return Object.values(parent.entities).filter(char =>
        is_character(char) && !char.rip &&
        char.party && char.party === character.party);
}

function getPartyMonsterList() {
    let list = [];
    for (member in party) {
        list.push(get_entity(party[member]).s.monsterhunt);
    }
    return list;
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
    get_pots();
    let party = getPartyMembers();
    for (member in party) {
        send_cm(party[member].name, "Need Pots");
    }
}

function in_party(name) {
    let party = getPartyMembers();
    for (member in party) {
        if (name == party[member].name){
            return true;
        }
    }
    return false;
}

function get_pots() {
    set_message("Traveling");
    smart_move({ to: "potions", return: true }, function () { setBuying(); });
}

function start_party() {
    if (character.name == leader) {
        invite_party();
    }
}

function invite_party() {
    for (member in party) {
        if (!parent.party_list.includes(party[member])){
            send_party_invite(party[member]);
        }
    }
}

function on_party_invite(name) {
    if (!character.party && name == leader) {
        accept_party_invite(name);
    }
}

var angle = 0;
function kite(t) {
    angle = angle + .1;
    let x = t.x + ((t.range * 1.5) * Math.cos(angle));
    let y = t.y + ((t.range * 1.5) * Math.sin(angle));
    console.log("x:" + x + "y:" + y + "angle:" + angle);
    move(x, y);
}

function send_range(i,j){
    for (i; i < j; i++){
        send_item("KrackenMerch",i, 1);
    }
}

var gettingMonsterHunt = false;
function is_on_monster_hunt() {
    return Boolean(character && character.s && character.s.monsterhunt);
}

function send_get_monster_hunt() {
    get_monster_hunt();
    let party = getPartyMembers();
    for (member in party) {
        send_cm(party[member].name, "mHunt");
    }
}

function start_monster_hunt_quest() {
    parent.socket.emit('monsterhunt');
    monsterhuntSet = false;
}

function complete_monster_hunt_quest() {
    parent.socket.emit('monsterhunt');
}

function get_monster_hunt() {
    if (!gettingMonsterHunt){
        gettingMonsterHunt = true;
        smart_move("monsterhunter", function () {
            start_monster_hunt_quest();
            gettingMonsterHunt = false;
        });
    }   
}

character.on("cm", function (data) {
    if (in_party(data.name)){
        game_log("cm:" + data.name + ":" + data.message);
        if (data.message == "Need Pots") {
            get_pots();
        }
        if (data.message == "mHunt") {
            get_monster_hunt();
        }
    }
});
