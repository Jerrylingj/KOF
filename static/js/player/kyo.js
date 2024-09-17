import { Player } from '../player/base.js'
import { GIF } from '../utils/gif.js';

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    init_animations() {
        let outer = this; // 存储当前kyo对象
        let offsets = [-10, -22, -22, -140, 0, -10, -10, -30, -32, -2, 60, 45, 0, 0, -220, -150]; // 偏移量
        for (let i = 0; i < 16; i ++ ) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            console.log(gif.frames);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0, // 总图片数量
                frame_rate: 8, // 渲染速度 
                offset_y: offsets[i], // 竖直偏移量
                loaded: false, // 是否被渲染
                scale: 2, // 缩放比例 
            });

            gif.onload = function() {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                if (i === 3 || i === 4) {
                    obj.frame_rate = 8;
                } else if (i === 5 || i === 12 || i === 13) {
                    obj.frame_rate = 9;
                } else if (i === 9 || i === 14 || i === 15) {
                    obj.frame_rate = 10;
                }
            }
            
        }
    }

    render() {
    
        // // // 碰撞测试
        // this.ctx.fillStyle = "yellow";  // 设置新的填充颜色
        // if (this.direction > 0) {
        //     this.ctx.fillRect(this.x + 120, this.y - 70, 100, 55);  // 绘制一个额外的20x20方块
        // } else {
        //     this.ctx.fillRect(this.x - 100, this.y - 70, 100, 55);
        // }
        
        super.render();

        // kyo下蹲完停止
        let status = this.status;
        let obj = this.animations.get(status);
        if (status === 9) {
            if (this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1)) {
                this.frame_current_cnt --;
            }
        }
        
       
    }
}