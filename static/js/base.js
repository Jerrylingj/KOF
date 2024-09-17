import { GameMap } from '/static/js/game_map/base.js';
import { Kyo } from '/static/js/player/kyo.js'
import { Yagami } from './player/yagami.js';

class KOF { 
    constructor(id) {
        // 用ajax取到div中对应id的元素
        this.$kof = $('#' + id);

        this.game_map = new GameMap(this);

        this.players = [
            new Kyo(this, {
                id: 0,
                x: 200,
                y: 260,
                width: 120,
                height: 200,
                color: 'blue',

            }),
            new Yagami(this, {
                id: 1,
                x: 950,
                y: 260,
                width: 150,
                height: 200,
                color: 'red',

            }),

        ]
    }
}

export {
    KOF
}