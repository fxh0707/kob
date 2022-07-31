import { AcGameObject } from "./AcGameObject";
import { Wall } from "./wall";

export class GameMap extends AcGameObject {
    constructor(ctx, parent) {
        super();

        this.ctx = ctx;
        this.parent = parent;
        this.L = 0;

        this.rows = 13;
        this.cols = 13;

        this.wall = [];
        this.inner_walls_count = 20;
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
        for (let i = 0; i < this.cols; i++) {
            g[i] = [];
            for (let j = 0; j < this.rows; j++) {
                g[i][j] = false;
            }
        }

        // 四周障碍物
        for (let i = 0; i < this.rows; i++) {
            g[i][0] = g[i][this.rows - 1] = true;
        }

        for (let j = 0; j < this.cols; j++) {
            g[0][j] = g[this.rows - 1][j] = true;
        }

        // 随机生成障碍物
        for (let i = 0; i < this.inner_walls_count / 2; i++) {
            for (let j = 0; j < 1000; j++) {
                let x = parseInt(Math.random() * this.rows);
                let y = parseInt(Math.random() * this.cols);
                if (g[x][y] || g[x][y]) {
                    continue;
                }
                //排除左下角和右上角
                if (x == this.rows - 2 && y == 1 || x == 1 && y == this.cols - 2) {
                    continue;
                }
                g[x][y] = g[y][x] = true;
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
                    this.wall.push(new Wall(i, j, this));
                }
            }
        }

        return true;
    }

    start() {
        for (let i = 0; i< 1000; i++) {
            if (this.create_walls()) {
                break;
            }
        }
    }

    update_size() {
        // 计算小正方形边长
        this.L = parseInt(Math.min(this.parent.clientWidth / this.cols, this.parent.clientHeight / this.rows));
        this.ctx.canvas.width = this.L * this.cols;
        this.ctx.canvas.height = this.L * this.rows;
    }

    update() {
        this.update_size();
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