add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true

var buying = false;
var pots = [G.items.mpot1, G.items.hpot1];
var chosenMonsterHunt = false;

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
            return;
        }

        if (!is_on_monster_hunt()) {
            send_get_monster_hunt();
        }

        if (is_on_monster_hunt() && party_is_on_monster_hunt() && !chosenMonsterHunt) {
            chosenMonsterHunt = true;
            let monsterHuntList = getPartyMonsterList();
            //TODO evaluate and go
            smart_move(farming);
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
}, 1000 / 4); // Loops every 1/4 seconds.