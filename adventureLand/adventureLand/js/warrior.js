add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/config.js");
add_lib("https://levimccracken.github.io/adventureland/adventureLand/adventureLand/js/util.js");

var attack_mode = true
var rareMobs = [];
var priorityTargets = [];
var targetFirstList = priorityTargets.concat(rareMobs);
var buying = false;
var pots = [G.items.mpot0, G.items.hpot1];
var aggroCircle;
var my_target;

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

        if (character && character.s && character.s.monsterhunt){
            set("Kracken", character.s.monsterhunt.id);
            if (get("hunting") == character.s.monsterhunt.id) {
                if (character.s.monsterhunt.c == 0) {
                    send_turn_in_monster_hunt();
                }
            }
        }

        if (!attack_mode || is_moving(character)) return;
        
        if (isNeedMorePots() && character.gold >= gold_min_thresh + gold_min_thresh) {
            lets_go();
        }

        if ((alwaysKite || character.hp < character.max_hp / 2) && null != target) {
            kite(target);
        } else if (null != target && !is_in_range(target)) {
            move(
                character.x + (target.x - character.x) / 2,
                character.y + (target.y - character.y) / 2
            );
            // Walk half the distance
        }

        if (can_attack(target)) {
            attack(target);
        }

    }
}, 1000 / 4); // Loops every 1/4 seconds.

function on_draw() {
    clear_drawings();

    target = acquireTarget(character);
    if (null != target && can_use("taunt")) {
        if (character.hp > character.max_hp / 2) {
            parent.use_skill("taunt", target);
        }
    }

    if (null != target) {
        set_message(target.name);
        aggroCircle = draw_circle(target.x, target.y, target.range)
    }
}