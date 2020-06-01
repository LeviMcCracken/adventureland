add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/goldMeter.js");

var attack_mode = true

var buying = false;
var pots = [G.items.mpot1, G.items.hpot1];

setInterval(function () {
    for (member in party){
        if (simple_distance(character, get_player(party[member])) > 200)) {
            parent.use_skill("magiport", get_player(party[member]));
        }
    }
}, 1000 * 30); // Loops every 1/4 seconds.


setInterval(function () {

    start_party();

    if (buying) {
        buying = buy_potions();
    } else {
        use_pots();

        loot();

        if (character.rip) {
            respawn();
            smart_move(farming);
            set("hunting", farming);
            return;
        }

        if (!is_on_monster_hunt() && null == get("Kracken") && null == get("KrackenHeals")) {
            send_get_monster_hunt();
        }

        if (character.s.monsterhunt && character.s.monsterhunt.c != 0) {
            set("epyonite", character.s.monsterhunt.id);
        } else if (character.s.monsterhunt && character.s.monsterhunt.c == 0 &&
            null != get("epyonite")) {
            send_turn_in_monster_hunt();
            set("epyonite", null);
        }
        

        let warMonster = get("Kracken");
        let healMonster = get("KrackenHeals");
        let myMonster = null;
        if (null != character.s.monsterhunt){
            myMonster = character.s.monsterhunt.id;
        }
        let hunting = get("hunting");
        if (!get("chosenMHunt") && hunting != warMonster && hunting != healMonster && (hunting != myMonster )) {
            if (warMonster != null && healMonster != null && null != myMonster) {
                let chosen = farming;
                for (monster in monsterhunts){
                    if (monsterhunts[monster] == warMonster) {
                        chosen = warMonster;
                        break;
                    } else if (monsterhunts[monster] == healMonster) {
                        chosen = healMonster;
                        break;
                    } else if (monsterhunts[monster] == character.s.monsterhunt.id) {
                        chosen = character.s.monsterhunt.id;
                        break;
                    }                
                }
                console.log(warMonster + ":" + healMonster + ":" + character.s.monsterhunt.id + ":" + monsterhunts[monster] );
                
                set("chosenMHunt", true);
                smart_move(chosen);
                send_goto(chosen);
            }
        }

        if (!attack_mode || is_moving(character)) return;
        
        if (isNeedMorePots() && character.gold >= gold_min_thresh + gold_min_thresh) {
            lets_go();
            return;
        }

        if (!is_on_monster_hunt()) {
            send_get_monster_hunt();
        }
        
        var target = get_targeted_monster();
        let targetingMe = getMonsters().filter(m => m.target == character.name);
        set_message("Defending:" + targetingMe.length);
	    if(null == target){
            if (targetingMe.length > 0) {
                target = targetingMe[0];
            } else if (null == target && character.max_hp - character.hp > pots[1].gives[1] + 100) {
                set_message("Healing Break");
            } else {
                target = get_nearest_monster({ min_xp: 100, max_att: max_att_p });
                if (null != target) {
                    change_target(target)
                } else {
                    set_message("No Monsters");
                    return;
            	}
            }
	    }

        let partyList = getPartyMembers();
        let warrior = partyList.filter(char => char.ctype == "warrior")[0];
        let priest = partyList.filter(char => char.ctype == "priest")[0];
        if (can_use("energize") &&
            character.level >= G.skills.energize.level &&
            null != priest) {
            parent.use_skill("energize", priest);
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
}, 1000 / 4); // Loops every 1/4 seconds.