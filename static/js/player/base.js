import { GameObject } from "../game_object/base.js";


export class Player extends GameObject {
    constructor(root, info) {
        super();

        this.root = root;

        // 取出player信息
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;

        this.vx = 0;
        this.vy = 0;

        this.speedx = 800; // 水平速度
        this.speedy = 1500; // 跳起的初速度
        
        this.gravity = 50; // 重力加速度
        this.ctx = this.root.game_map.ctx;
        this.press_keys = this.root.game_map.controller.press_keys;

        this.status = 3;  // 状态：0-待机 1-向左 2-向右 3-跳跃 4-攻击 5-被打 6-死亡 7-重击 8-技能 9-防御 10-蹲+轻击 11-蹲+重击 12-蹲+挨打 13-跳+挨打 14-跳+轻击 15-跳+重击
        this.animations = new Map(); // 存储动画
        this.frame_current_cnt = 0;

        this.hp = 100; // 血量
        this.ap = 0; // 攻击力
        this.dp = 0; // 防御
        this.fact_fact = false;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`); // 选择血条的div
        this.$hp_1 = this.root.$kof.find(`.kof-head-hp-${this.id}>div>div`);

        this.result = 0; // 0-对局进行 1-对局结束
        this.$result = this.root.$kof.find(`.kof-result`);
    }

    start() {
        console.log("player start");

    }

    update_move() {  // 移动
        this.vy += this.gravity;

        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        // 组织玩家向下越界
        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            if (this.status === 3) {
                // 跳完,进入静止状态
                this.status = 0;
            }
        }

        // 阻止玩家左右越界
        if (this.x < 20) {
            this.x = 20;
        } else if (this.x + this.width > this.root.game_map.$canvas.width() - 20) {
            this.x = this.root.game_map.$canvas.width() - this.width - 20;
        }
    }

    update_control() {  // 更新用户输入
        let w, a, d, s, j, k, l;
        // 判断是哪名用户
        if (this.id === 0) {
            w = this.press_keys.has("w");
            a = this.press_keys.has("a");
            d = this.press_keys.has("d");
            s = this.press_keys.has("s");
            j = this.press_keys.has("j");
            k = this.press_keys.has("k");
            l = this.press_keys.has("l");
            
        } else {
            w = this.press_keys.has("ArrowUp");
            a = this.press_keys.has("ArrowLeft");
            d = this.press_keys.has("ArrowRight");
            s = this.press_keys.has("ArrowDown");
            j = this.press_keys.has("1");
            k = this.press_keys.has("2");
            l = this.press_keys.has("3");
        }

        // 更新状态机
        if (this.status === 0 || this.status === 1) {
            if (j) { // 轻击
                console.log("轻击");
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0; // 重置
            } else if (k) { // 重击
                console.log("重击");
                this.status = 7;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (l) { // 技能
                console.log("技能");
                this.status = 8;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (s) {
                console.log("防御");
                this.status = 9;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (w) {  // 跳跃
                if (d) {
                    // 向右跳 
                    this.vx = this.speedx;
                    
                } else if (a) {
                    // 向左跳
                    this.vx = -this.speedx;
                } else {
                    // 原地跳
                    this.vx = 0;
                }
                this.vy = -this.speedy;
                this.status = 3;
            } else if (d) { // 向左
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) { // 向右
                this.vx = -this.speedx;
                this.status = 1;
            } 
            else  { // 剩下一律静止,不允许连跳
                this.vx = 0;
                this.status = 0;
            }
        } else if (this.status === 3) { // 跳跃
            if (j) {
                console.log("跳 + 轻击");
                this.status = 14;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (k) {
                console.log("跳 + 重击");
                this.status = 15;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } 
        } else if (this.status === 9) { // 下蹲
            if (j) {
                console.log("蹲 + 轻击");
                this.status = 10;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (k) {
                console.log("蹲 + 重击");
                this.status = 11;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } 
            else if (!s) {
                if (d) {
                    this.status = 1;
                    this.frame_current_cnt = 0;
                } else if (a) {
                    this.status = 1;
                    this.frame_current_cnt = 0;
                } else {
                    this.status = 0;
                    this.frame_current_cnt = 0;
                }
                
            }
        }  
        
    }

    update_direction() { // 更新两边用户朝向
        if (this.status === 5 || this.status === 6 || this.status === 9) return;

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1; // 朝右
            else me.direction = -1; // 朝左

        }

    }

    is_collision(r1, r2) { // 判断两个矩形是否有交集
        if (this.root.players[1 - this.id].status === 6 || this.root.players[1 - this.id].status === 5) { // 受攻击或者死了就无法选择
            console.log("别鞭尸了");
            return false;
        }

        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
            return false;
        }

        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
            return false;
        }

        return true;

    }

    update_beaten() {
        if (this.status === 9 || this.status === 10 || this.status === 11) {
            // 蹲着被打
            console.log(this.id + "蹲着被打");
            this.status = 12;
            console.log(this.status);
        } else if (this.status === 14 || this.status === 15) {
            // 跳着被打
            this.status = 13;
        } else {
            // 站着被打
            this.status = 5;
        } 
        this.frame_current_cnt = 0; // 从头渲染
    }

    is_attack() { // 被攻击到了
        this.update_beaten();

        let you = this.root.players[1 - this.id];
        

        // 更新伤害
        if (you.status === 4 || you.status === 10 || you.status === 14) this.ap = 5;
        else if (you.status === 7 || you.status === 11 || you.status === 15) this.ap = 10;
        else if (you.status === 8) this.ap = 15;
        
        if (this.status === 9) this.dp = 5;

        this.hp = Math.max(this.hp + this.dp - this.ap, 0); // 受到伤害

        // 渐扣血
        this.$hp.animate({ 
            width: this.$hp.parent().width() * this.hp / 100
        }, 300)

        this.$hp_1.animate({ 
            width: this.$hp_1.parent().parent().width() * this.hp / 100,
        }, 200)

        console.log("hp: " + this.hp);
        if (this.hp <= 0) {
            this.status = 6;
            this.result = you.result = 1;
            this.$result.text("KO");
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }

    update_attack() {  // 更新攻击
        
        // 轻击
        if (this.status === 4 && this.frame_current_cnt === 16) {
            console.log("更新轻击");
            // 攻击到达,判断是否被打到
            let me = this, you = this.root.players[1 - this.id];
            
            // 记录己方
            let r1;
            if (this.id === 0) {
                // kyo
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 120,
                        y1: me.y + 40,
                        x2: me.x + 120 + 100,
                        y2: me.y + 40 + 20,
                    }
                } else {
                    r1 = {
                        x1: me.x - 100,
                        y1: me.y + 40,
                        x2: me.x - 100 + 100,
                        y2: me.y + 40 + 20,
                    }
                }
            } else {
                // yagami
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 150,
                        y1: me.y + 40,
                        x2: me.x + 150 + 80,
                        y2: me.y + 40 + 160,
                    }
                } else {
                    r1 = {
                        x1: me.x - 80,
                        y1: me.y + 40,
                        x2: me.x,
                        y2: me.y + 40 + 160,
                    }
                }
            }

            // 记录敌方
            let offset_h = (you.status === 9 || you.status === 10 || you.status === 11 || you.status === 12) * 75 + (you.status === 3 || you.status === 13 || you.status === 14 || you.status === 15) * -125; // 高度偏移 
            let r2 =  {
                x1: you.x,
                y1: you.y + offset_h,
                x2: you.x + you.width,
                y2: you.y + offset_h + you.height,
            };

            if (this.is_collision(r1, r2)) {
                console.log(this.id + "攻击成功");
                you.is_attack();
            }
        }

        // 重击
        if (this.status === 7 && this.frame_current_cnt === 20) {
            console.log("更新重击");
            // 攻击到达,判断是否被打到
            let me = this, you = this.root.players[1 - this.id];
            
            // 记录己方
            let r1;
            if (this.id === 0) {
                // kyo
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 120,
                        y1: me.y + 50,
                        x2: me.x + 120 + 100,
                        y2: me.y + 50 + 150,
                    }
                } else {
                    r1 = {
                        x1: me.x - 100,
                        y1: me.y + 50,
                        x2: me.x - 100 + 100,
                        y2: me.y + 50 + 150,
                    }
                }
            } else {
                // yagami
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 150,
                        y1: me.y - 20,
                        x2: me.x + 150 + 90,
                        y2: me.y - 20 + 220,
                    }
                } else {
                    r1 = {
                        x1: me.x - 90,
                        y1: me.y - 20,
                        x2: me.x ,
                        y2: me.y - 20 + 220,
                    }
                }
            }

            // 记录敌方
            let offset_h = (you.status === 9 || you.status === 10 || you.status === 11 || you.status === 12) * 75 + (you.status === 3 || you.status === 13 || you.status === 14 || you.status === 15) * -125; // 高度偏移 
            let r2 =  {
                x1: you.x,
                y1: you.y + offset_h,
                x2: you.x + you.width,
                y2: you.y + offset_h + you.height,
            };

            if (this.is_collision(r1, r2)) {
                console.log(this.id + "攻击成功");
                you.is_attack();
            }
        }

        // 技能
        if (this.status === 8 && this.frame_current_cnt === 120) {
            console.log("更新技能");
            // 攻击到达,判断是否被打到
            let me = this, you = this.root.players[1 - this.id];
            
            // 记录己方
            let r1;
            if (this.id === 0) {
                // kyo
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 120,
                        y1: me.y + 50,
                        x2: me.x + 120 + 250,
                        y2: me.y + 50 + 150,
                    }
                } else {
                    r1 = {
                        x1: me.x - 250,
                        y1: me.y + 50,
                        x2: me.x,
                        y2: me.y + 50 + 150,
                    }
                }
            } else {
                // yagami
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 150,
                        y1: me.y + 180,
                        x2: me.x + 150 + 260,
                        y2: me.y + 180 + 20,
                    }
                } else {
                    r1 = {
                        x1: me.x - 260,
                        y1: me.y + 180,
                        x2: me.x ,
                        y2: me.y + 180 + 20,
                    }
                }
            }

            // 记录敌方
            let offset_h = (you.status === 9 || you.status === 10 || you.status === 11 || you.status === 12) * 75 + (you.status === 3 || you.status === 13 || you.status === 14 || you.status === 15) * -125; // 高度偏移 
            let r2 =  {
                x1: you.x,
                y1: you.y + offset_h,
                x2: you.x + you.width,
                y2: you.y + offset_h + you.height,
            };

            if (this.is_collision(r1, r2)) {
                console.log(this.id + "攻击成功");
                you.is_attack();
            }
        }

        // 蹲 + 轻击
        if (this.status === 10 && ((this.id === 0 && this.frame_current_cnt === 14) || (this.id === 1 && this.frame_current_cnt === 50))) {
            console.log("更新蹲 + 轻击 + 状态" + this.status);
            // 攻击到达,判断是否被打到
            let me = this, you = this.root.players[1 - this.id];
            
            // 记录己方
            let r1;
            if (this.id === 0) {
                // kyo
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 120,
                        y1: me.y + 50,
                        x2: me.x + 120 + 250,
                        y2: me.y + 50 + 150,
                    }
                } else {
                    r1 = {
                        x1: me.x - 250,
                        y1: me.y + 50,
                        x2: me.x,
                        y2: me.y + 50 + 150,
                    }
                }
            } else {
                // yagami
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 150,
                        y1: me.y + 20,
                        x2: me.x + 150 + 90,
                        y2: me.y + 20 + 180,
                    }
                } else {
                    r1 = {
                        x1: me.x - 90,
                        y1: me.y + 20,
                        x2: me.x ,
                        y2: me.y + 20 + 180,
                    }
                }
            }

            // 记录敌方
            let offset_h = (you.status === 9 || you.status === 10 || you.status === 11 || you.status === 12) * 75 + (you.status === 3 || you.status === 13 || you.status === 14 || you.status === 15) * -125; // 高度偏移 
            let r2 =  {
                x1: you.x,
                y1: you.y + offset_h,
                x2: you.x + you.width,
                y2: you.y + offset_h + you.height,
            };

            if (this.is_collision(r1, r2)) {
                console.log(this.id + "攻击成功");
                you.is_attack();
            }
        }

        // 蹲 + 重击
        if (this.status === 11 && this.frame_current_cnt === 20) {
            console.log("更新蹲 + 重击");
            // 攻击到达,判断是否被打到
            let me = this, you = this.root.players[1 - this.id];
            
            // 记录己方
            let r1;
            if (this.id === 0) {
                // kyo
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 120,
                        y1: me.y + 125,
                        x2: me.x + 120 + 150,
                        y2: me.y + 125 + 35,
                    }
                } else {
                    r1 = {
                        x1: me.x - 150,
                        y1: me.y + 125,
                        x2: me.x,
                        y2: me.y + 125 + 35,
                    }
                }
            } else {
                // yagami
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 150,
                        y1: me.y ,
                        x2: me.x + 150 + 80,
                        y2: me.y + 200,
                    }
                } else {
                    r1 = {
                        x1: me.x - 80,
                        y1: me.y,
                        x2: me.x ,
                        y2: me.y - 80 + 200,
                    }
                }
            }

            // 记录敌方
            let offset_h = (you.status === 9 || you.status === 10 || you.status === 11 || you.status === 12) * 75 + (you.status === 3 || you.status === 13 || you.status === 14 || you.status === 15) * -125; // 高度偏移 
            let r2 =  {
                x1: you.x,
                y1: you.y + offset_h,
                x2: you.x + you.width,
                y2: you.y + offset_h + you.height,
            };

            if (this.is_collision(r1, r2)) {
                console.log(this.id + "攻击成功");
                you.is_attack();
            }
        }

        // 跳 + 轻击
        if (this.status === 14 && this.frame_current_cnt === 50) {
            console.log("更新跳 + 轻击");
            // 攻击到达,判断是否被打到
            let me = this, you = this.root.players[1 - this.id];
            
            // 记录己方
            let r1;
            if (this.id === 0) {
                // kyo
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 120,
                        y1: me.y - 120,
                        x2: me.x + 120 + 50,
                        y2: me.y - 120 + 55,
                    }
                } else {
                    r1 = {
                        x1: me.x - 50,
                        y1: me.y - 120,
                        x2: me.x ,
                        y2: me.y - 120 + 55,
                    }
                }
            } else {
                // yagami
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 150,
                        y1: me.y - 125,
                        x2: me.x + 150 + 60,
                        y2: me.y - 125 + 200,
                    }
                } else {
                    r1 = {
                        x1: me.x - 60,
                        y1: me.y - 125,
                        x2: me.x ,
                        y2: me.y - 125 + 200,
                    }
                }
            }

            // 记录敌方
            let offset_h = (you.status === 9 || you.status === 10 || you.status === 11 || you.status === 12) * 75 + (you.status === 3 || you.status === 13 || you.status === 14 || you.status === 15) * -125; // 高度偏移 
            let r2 =  {
                x1: you.x,
                y1: you.y + offset_h,
                x2: you.x + you.width,
                y2: you.y + offset_h + you.height,
            };

            if (this.is_collision(r1, r2)) {
                console.log(this.id + "攻击成功");
                you.is_attack();
            }
        }

        // 跳 + 重击
        if (this.status === 15 && (this.id === 0 && this.frame_current_cnt === 50 || this.id === 1 && this.frame_current_cnt === 120)) {
            console.log("更新跳 + 重击");
            // 攻击到达,判断是否被打到
            let me = this, you = this.root.players[1 - this.id];
            
            // 记录己方
            let r1;
            if (this.id === 0) {
                // kyo
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 120,
                        y1: me.y - 70,
                        x2: me.x + 120 + 100,
                        y2: me.y - 70 + 75,
                    }
                } else {
                    r1 = {
                        x1: me.x - 100,
                        y1: me.y - 70,
                        x2: me.x ,
                        y2: me.y - 70 + 75,
                    }
                }
            } else {
                // yagami
                if (this.direction > 0) {
                    r1 = {
                        x1: me.x + 150,
                        y1: me.y - 125,
                        x2: me.x + 150 + 80,
                        y2: me.y - 125 + 200,
                    }
                } else {
                    r1 = {
                        x1: me.x - 80,
                        y1: me.y - 125,
                        x2: me.x ,
                        y2: me.y - 125 + 200,
                    }
                }
            }

            // 记录敌方
            let offset_h = (you.status === 9 || you.status === 10 || you.status === 11 || you.status === 12) * 75 + (you.status === 3 || you.status === 13 || you.status === 14 || you.status === 15) * -125; // 高度偏移 
            let r2 =  {
                x1: you.x,
                y1: you.y + offset_h,
                x2: you.x + you.width,
                y2: you.y + offset_h + you.height,
            };

            if (this.is_collision(r1, r2)) {
                console.log(this.id + "攻击成功");
                you.is_attack();
            }
        }


    }

    
    update() {

        if (this.result === 0) {
            this.update_control();  
        }

        this.update_move();
        this.update_direction();
        this.update_attack();

        this.render();
    }

    render() {
         // 判断当前状态
        let status = this.status;
        
        if (status === 9 || status === 10 || status === 11 || status === 12) { // 蹲下状态
            this.height = 125;
        } else if (status === 3 || status === 13 || status === 14 || status === 15) { // 跳跃状态

        } else {
            this.height = 200;
        }

        // let offset_h = (status === 9 || status === 10 || status === 11 || status === 12) * 75 + (status === 3 || status === 13 || status === 14 || status === 15) * -125; // 高度偏移
        // // 平面人物暂时用矩形代替
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y + offset_h, this.width, this.height);
       
        if (this.status === 1 && this.direction * this.vx < 0) {
            status = 2;
        }

        let obj = this.animations.get(status);
        if (obj && obj.loaded) {
            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt; // 取出当前帧
                let image = obj.gif.frames[k].image; // 取出图片
                let offset_x;
                if (this.id === 1){
                    offset_x = [0, 0, 0, 0, 0, -180, -180, 0, -100, 12, 0, -50, 0, 0, 0, 0];
                } else {
                    offset_x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
                this.ctx.drawImage(image, this.x + offset_x[status], this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale); // 画图片
            } else {
                // 翻转图片,直接反转坐标系
                this.ctx.save();
                this.ctx.scale(-1, 1); // x *= -1, y = y;
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0); // 坐标系平移

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt; // 取出当前帧
                let image = obj.gif.frames[k].image; // 取出图片
                //let offset_x = (this.id === 1 && (status === 5 || status === 6)) * (-180) + (this.id === 1 && status === 8) * (-100) + (this.id === 1 && status === 9) * 12 + (this.id === 1 && status === 11) * (-50);
                let offset_x;
                if (this.id === 1){
                    offset_x = [0, 0, 0, 0, 0, -180, -180, 0, -100, 12, 0, -50, 0, 0, 0, 0];
                } else {
                    offset_x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.width - this.x + offset_x[status], this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale); // 画图片

                this.ctx.restore();
            }
            
            
        }

        // 播放完之后静止
        if (status === 4 || status === 5 || status === 6 || status === 7 || status === 8 || status === 10 || status === 11 || status === 12 || status === 13 || status === 14 || status === 15) {
            if (this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1)) {
                if (status === 6) {
                    this.frame_current_cnt --;
                } else if (status === 8 && this.id === 0) {
                    this.x += this.direction * 250;
                    this.status = 0;
                } else if (status === 5 && this.id === 1) {
                    this.x += -this.direction * 80;
                    this.status = 0;
                } else if (status === 10 || status === 11) {
                    this.status = 9;
                    this.frame_current_cnt = 1;
                } else {
                    this.status = 0;
                }
            }
        }

       

        this.frame_current_cnt ++;

    }

}