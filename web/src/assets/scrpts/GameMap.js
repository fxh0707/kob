import { AcGameObject } from "./AcGameObject";
import { Snake } from "./Snake";
import { Wall } from "./Wall";

export class GameMap extends AcGameObject {
    constructor(ctx, parent) {
        super();

        this.ctx = ctx;
        this.parent = parent;
        this.L = 0;

        this.rows = 13;
        this.cols = 14;

        this.walls = [];
        this.inner_walls_count = 20;

        this.snakes = [
            new Snake({id: 0, color: "#4876ec", r: this.rows - 2, c: 1}, this),
            new Snake({id: 1, color: "#f94848", r: 1, c: this.cols - 2}, this)
        ];
    }

    // 检查连通性
    check_connectivity(g, sx, sy, tx, ty) {
        if (sx == tx && sy == ty) {
            return true;
        }
        g[sx][sy] = true;

        let dx = [-1, 0, 1, 0], dy = [0, 1, 0, -1];
        for (let i = 0; i < 4; i++) {
            let x = sx + dx[i], y = sy + dy[i];
            if (!g[x][y] && this.check_connectivity(g, x, y, tx, ty)) {
                return true;
            }
        }

        return false;
    }

    create_walls() {
        const g = [];
        for (let i = 0; i < this.rows; i++) {
            g[i] = [];
            for (let j = 0; j < this.cols; j++) {
                g[i][j] = false;
            }
        }

        // 四周障碍物
        for (let i = 0; i < this.rows; i++) {
            g[i][0] = g[i][this.cols - 1] = true;
        }

        for (let j = 0; j < this.cols; j++) {
            g[0][j] = g[this.rows - 1][j] = true;
        }

        // 随机生成障碍物
        for (let i = 0; i < this.inner_walls_count / 2; i++) {
            for (let j = 0; j < 1000; j++) {
                let x = parseInt(Math.random() * this.rows);
                let y = parseInt(Math.random() * this.cols);
                if (g[x][y] || g[this.rows - 1 - x][this.cols - 1 - y]) {
                    continue;
                }
                //排除左下角和右上角
                if (x == this.rows - 2 && y == 1 || x == 1 && y == this.cols - 2) {
                    continue;
                }
                g[x][y] = g[this.rows - 1 - x][this.cols - 1 - y] = true;
                break;
            }
        }

        // 检查两个起点是否连通
        const copy_g = JSON.parse(JSON.stringify(g));
        if (!this.check_connectivity(copy_g, this.rows - 2, 1, 1, this.cols - 2)) {
            return false;
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (g[i][j]) {
                    this.walls.push(new Wall(i, j, this));
                }
            }
        }

        return true;
    }

    add_listening_events() {
        this.ctx.canvas.focus();
        const [snake0, snake1] = this.snakes;
        this.ctx.canvas.addEventListener("keydown", e => {
            if (e.key === 'w') {
                snake0.set_direction(0);
            } else if (e.key === 'd') {
                snake0.set_direction(1);
            } else if (e.key === 's') {
                snake0.set_direction(2);
            } else if (e.key === 'a') {
                snake0.set_direction(3);
            } else if (e.key === 'ArrowUp') {
                snake1.set_direction(0);
            } else if (e.key === 'ArrowRight') {
                snake1.set_direction(1);
            } else if (e.key === 'ArrowDown') {
                snake1.set_direction(2);
            } else if (e.key === 'ArrowLeft') {
                snake1.set_direction(3);
            }
        });
    }

    start() {
        for (let i = 0; i< 1000; i++) {
            if (this.create_walls()) {
                break;
            }
        }
        this.add_listening_events();
    }

    update_size() {
        // 计算小正方形边长
        this.L = parseInt(Math.min(this.parent.clientWidth / this.cols, this.parent.clientHeight / this.rows));
        this.ctx.canvas.width = this.L * this.cols;
        this.ctx.canvas.height = this.L * this.rows;
    }

    /**
     * 判断两条蛇是否都准备好本回合操作
     */
    check_ready() {
        for (const snake of this.snakes) {
            if (snake.status !== "idle") {
                return false;
            }
            if (snake.direction === -1) {
                return false;
            }
        }
        return true;
    }

    /**
     * 让两条蛇进入下一回合
     */
    next_step() {
        for (const snake of this.snakes) {
            snake.next_step();
        }
    }

    /**
     * 检测非法逻辑
     */
    check_valid(cell) {
        for (const wall of this.walls) {
            if (wall.r === cell.r && wall.c === cell.c) {
                return false;
            }
        }

        for (const snake of this.snakes) {
            let k = snake.cells.length;
            // 当蛇尾会前进的时候，蛇尾不要判断
            if (!snake.check_tail_increasing()) {
                k--;
            }
            for (let i = 0; i < k; i++) {
                if (snake.cells[i].r === cell.r && snake.cells[i].c === cell.c) {
                    return false;
                }
            }
        }

        return true;
    }

    update() {
        this.update_size();
        if (this.check_ready()) {
            this.next_step();
        }
        this.render();
    }

    //渲染
    render() {
        // this.ctx.fillStyle = 'green';
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        const color_even = "#AAD751", color_odd = "#A2D149";
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (i + j & 1) {
                    this.ctx.fillStyle = color_odd;
                } else {
                    this.ctx.fillStyle = color_even;
                }
                this.ctx.fillRect(j * this.L, i * this.L, this.L, this.L);
            }
        }
    }
}