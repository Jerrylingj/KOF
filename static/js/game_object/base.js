let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        // 存储与下一帧的时间间隔
        this.timedelta = 0;

        // 记录执行状态
        this.has_call_start = false;
    }

    start() {  // 初始时执行一次

    }

    update() {  // 每一帧执行一次(除第一帧)

    }

    destroy() {   // 删除当前对象
        for (let i in GAME_OBJECTS) {
            if (GAME_OBJECTS[i] === this) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let GAME_OBJECTS_FRAME = (timestamp) => {
    // 如果当前对象没有开始执行,就开始执行;否则更新
    for (let obj of GAME_OBJECTS) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;
    // requestAnimationFrame用递归的方式调用
    requestAnimationFrame(GAME_OBJECTS_FRAME);
}

requestAnimationFrame(GAME_OBJECTS_FRAME);

export {
    GameObject
}