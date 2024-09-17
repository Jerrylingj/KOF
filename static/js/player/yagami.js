import { Player } from '../player/base.js'
import { GIF } from '../utils/gif.js';

export class Yagami extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    
    init_animations() {
        let outer = this; // 存储当前kyo对象
        let offsets = [0, -6, -6, -140, -12, -200, -200, -66, -200, 80, -30, -200, 0, 0, -200, -200]; // 偏移量
        for (let i = 0; i < 16; i ++ ) {
            let gif = GIF();
            gif.load(`/static/images/player/yagami/${i}.gif`);
            console.log(gif.frames);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0, // 总图片数量
                frame_rate: 5, // 渲染速度 
                offset_y: offsets[i], // 竖直偏移量
                loaded: false, // 是否被渲染
                scale: 2, // 缩放比例 
            });

            gif.onload = function() {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                if (i === 3) {
                    obj.frame_rate = 12;
                } else if (i === 4 || i === 5 || i === 7 || i === 14) {
                    obj.frame_rate = 10;
                }  
                
                
            }
        }
    }

    
    render() {
        // // 碰撞测试
        // this.ctx.fillStyle = 'yellow';
        // if (this.direction > 0) {
        //     this.ctx.fillRect(this.x + 150, this.y - 125, 80, 200);
        // } else {
        //     this.ctx.fillRect(this.x - 80, this.y - 125, 80, 200);
        // }

        super.render();
    }
}