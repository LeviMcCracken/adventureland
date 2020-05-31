// Gold meter stolen from https://github.com/Spadar/AdventureLand/blob/master/GUI/GoldMeter.js
var startTime = new Date();
var elapsed = {};
var sumGold = 0;
var meters = [];
var currentMob;

setInterval(function () {
    let mob = get("hunting");
    if (currentMob != mob){
        if (!meters.includes(mob)) {
            meters.push(mob);
            elapsed[mob] = 0;
            init_goldmeter(mob);
        }
        startTime = new Date();
        currentMob = mob;
    }
    update_goldmeter();
}, 100);

function init_goldmeter(mob) {
    let $ = parent.$;
    let brc = $('#bottomrightcorner');

    brc.find('#goldtimer').remove();

    let xpt_container = $('<div id="goldtimer' + mob +'"></div>').css({
        fontSize: '28px',
        color: 'white',
        textAlign: 'center',
        display: 'table',
        overflow: 'hidden',
        marginBottom: '-5px',
        width: "100%"
    });

    //vertical centering in css is fun
    let xptimer = $('<div id="goldtimercontent' + mob +'"></div>')
        .css({
            display: 'table-cell',
            verticalAlign: 'middle'
        })
        .html("")
        .appendTo(xpt_container);

    brc.children().first().after(xpt_container);
}



function updateGoldTimerList() {
    let $ = parent.$;

    let mob = get("hunting");

    var gold = getGold(mob);

    var goldString = "<div>" + gold + " Gold/Hr " + mob + "</div>";

    $('#' + "goldtimercontent" + mob).html(goldString).css({
        background: 'black',
        border: 'solid gray',
        borderWidth: '5px 5px',
        height: '34px',
        lineHeight: '34px',
        fontSize: '30px',
        color: '#FFD700',
        textAlign: 'center',
    });
}


function update_goldmeter() {
    updateGoldTimerList();
}

function getGold(mob) {
    elapsed[mob] = elapsed[mob] + (new Date() - startTime);

    var goldPerSecond = parseFloat(Math.round((sumGold / (elapsed[mob] / 1000)) * 100) / 100);

    return parseInt(goldPerSecond * 60 * 60).toLocaleString('en');
}

//Clean out an pre-existing listeners
if (parent.prev_handlersgoldmeter) {
    for (let [event, handler] of parent.prev_handlersgoldmeter) {
        parent.socket.removeListener(event, handler);
    }
}

parent.prev_handlersgoldmeter = [];

//handler pattern shamelessly stolen from JourneyOver
function register_goldmeterhandler(event, handler) {
    parent.prev_handlersgoldmeter.push([event, handler]);
    parent.socket.on(event, handler);
};

function goldMeterGameResponseHandler(event) {
    if (event.response == "gold_received") {
        sumGold += event.gold;
    }
}

function goldMeterGameLogHandler(event) {
    if (event.color == "gold") {
        var gold = parseInt(event.message.replace(" gold", "").replace(",", ""));

        sumGold += gold;
    }
}


register_goldmeterhandler("game_log", goldMeterGameLogHandler);
register_goldmeterhandler("game_response", goldMeterGameResponseHandler);