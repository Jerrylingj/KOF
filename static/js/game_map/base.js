import { GameObject } from '/static/js/game_object/base.js'
import { Controller } from '../controller/base.js';

export class GameMap extends GameObject{
    constructor(root) {
        // 调用基类构造函数
        super();

        this.root = root;

        // 定义canvas对象
        // tabindex=0使屏幕聚焦
        this.$canvas = $('<canvas width="1280px" height="720px" tabindex=0></canvas>');
        this.ctx = this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas); 
        this.$canvas.focus();  // 聚焦到canvas上

        this.controller = new Controller(this.$canvas);

        // 添加血条及计时器
        this.root.$kof.append($(`<div class="kof-head">
            <div class="kof-head-hp-0"><div><div></div></div></div>
            <div class="kof-head-timer">60</div>
            <div class="kof-head-hp-1"><div><div></div></div></div>
        </div>
        <div class="kof-result"></div>`));

        this.time_left = 60000; // 剩余时间
        this.$timer = this.root.$kof.find('.kof-head-timer');

    }

    start() {

    }

    update() { // 每一帧都要把地图清空,并展示下一帧状态,不然的话之前的图片还在canvas上

        let [a, b] = this.root.players;

        if (a.result === 0 && b.result === 0) {
             // 更新时间显示
            this.time_left -= this.timedelta;
            if (this.time_left < 0) {
                this.time_left = 0;
                
                
                if (a.status !== 6 && b.status !== 6) {
                    a.status = b.status = 6;
                    a.vx = b.vx = 0;
                    a.frame_current_cnt = b.frame_current_cnt = 0;
                }
                
            }
        }

        this.$timer.text(parseInt(this.time_left / 1000));

        this.render();
    }

    render() { // 渲染,重新画
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // 清空画布

    }


}