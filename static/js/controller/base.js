export class Controller {
    constructor($canvas) {
        // 读取键盘输入
        this.$canvas = $canvas;

        this.press_keys = new Set();
        this.start();
    }

    start() {
        console.log("controller start");
        // 存储当前Controller对象
        let outer = this;
        
        // 读取键盘输入
        this.$canvas.keydown(function(e) {
            outer.press_keys.add(e.key);
            console.log("add " + e.key);
        });

        // 松手时删除
        this.$canvas.keyup(function(e) {
            outer.press_keys.delete(e.key);
            console.log("delete " + e.key);
        });
    }
}