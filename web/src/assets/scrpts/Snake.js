import { AcGameObject } from "./AcGameObject";
import { Cell } from "./Cell";

export class Snake extends AcGameObject {
    constructor(info, gamemap) {
        super();
        this.id = info.id;
        this.color = info.color;
        this.gamemap = gamemap;
        // 存放蛇的身体，cells[0]存放蛇头
        this.cells = [new Cell(info.r, info.c)];
        this.speed = 5;
        this.direction = -1;
        this.status = "idle";  //idle: 静止, move: 移动, die: 死亡
        this.next_cell = null;
        this.dr = [-1, 0, 1, 0];
        this.dc = [0, 1, 0, -1];
        this.step = 0;
        this.eps = 1e-2;

        this.eye_direction = 0;
        if (this.id === 1) {
            this.eye_direction = 2;
        }
        this.eye_dx = [
            [-1, 1],
            [1, 1],
            [1, -1],
            [-1, -1]
        ];
        this.eye_dy = [
            [-1, -1],
            [-1, 1],
            [1, 1],
            [1, -1]
        ]
    }
    
    start() {

    }

    set_direction(d) {
        this.direction = d;
    }

    check_tail_increasing() {
        if (this.step <= 10) {
            return true;
        }
        if (this.step % 3 === 1) {
            return true;
        }
        return false;
    }

    update_move() {
        // 向右移动
        // this.cells[0].x += this.speed * this.timedelta / 1000;
        // 向上移动
        // this.cells[0].y -= this.speed * this.timedelta / 1000;
        const dx = this.next_cell.x - this.cells[0].x;
        const dy = this.next_cell.y - this.cells[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.eps) {
            // 添加一个新蛇头
            this.cells[0] = this.next_cell;
            this.next_cell = null;
            this.status = "idle";
            if (!this.check_tail_increasing()) {
                this.cells.pop();
            }
        } else {
            const move_distance = this.speed * this.timedelta / 1000;
            this.cells[0].x += move_distance * dx / distance;
            this.cells[0].y += move_distance * dy / distance;
            if (!this.check_tail_increasing()) {
                const k = this.cells.length;
                const tail = this.cells[k - 1], tail_target = this.cells[k - 2];
                const tail_dx = tail_target.x - tail.x;
                const tail_dy = tail_target.y - tail.y;
                tail.x += move_distance * tail_dx / distance;
                tail.y += move_distance * tail_dy / distance;
            }
        }
    }

    next_step() {
        const d = this.direction;
        this.next_cell = new Cell(this.cells[0].r + this.dr[d], this.cells[0].c + this.dc[d]);
        this.eye_direction = d;
        this.direction = -1;
        this.status = "move";
        this.step++;

        const lengh = this.cells.length;
        for (let i = lengh; i > 0; i--) {
            // 头节点不变，其余节点往前移动一位
            this.cells[i] = JSON.parse(JSON.stringify(this.cells[i - 1]));
        }

        if (!this.gamemap.check_valid(this.next_cell)) {
            this.status = "die";
        }
    }

    update() {
        if (this.status === 'move') {
            this.update_move();
        }
        this.render();
    }

    render() {
        const L = this.gamemap.L;
        const ctx = this.gamemap.ctx;
        ctx.fillStyle = this.color;

        if (this.status === "die") {
            ctx.fillStyle = "white";
        }

        for (const cell of this.cells) {
            ctx.beginPath();
            ctx.arc(cell.x *L, cell.y * L, L / 2 * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 1; i < this.cells.length; i++) {
            const a = this.cells[i - 1], b= this.cells[i];
            if (Math.abs(a.x - b.x) < this.eps && Math.abs(a.y - b.y) < this.eps) {
                continue;
            }
            if (Math.abs(a.x - b.x) < this.eps) {
                ctx.fillRect((a.x - 0.4) * L, Math.min(a.y, b.y) * L, L * 0.8, Math.abs(a.y - b.y) * L);
            } else {
                ctx.fillRect(Math.min(a.x, b.x) * L, (a.y - 0.4) * L, Math.abs(a.x - b.x) * L, L * 0.8);
            }
        }

        ctx.fillStyle = "black";
        for (let i = 0; i < 2; i++) {
            const eyee_x = (this.cells[0].x + this.eye_dx[this.eye_direction][i] * 0.15) * L;
            const eyee_y = (this.cells[0].y + this.eye_dy[this.eye_direction][i] * 0.15) * L;
            ctx.beginPath();
            ctx.arc(eyee_x, eyee_y, L * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
    }

}