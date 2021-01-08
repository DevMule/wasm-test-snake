// The entry file of your WebAssembly module.

enum FieldType {
    food = -1,
    empty = 0,
    head = 1,
    // все остальные - змейка, при том "1" - голова а каждое последующее - хвост
}

export enum Direction {
    left, up, right, down
}

export class Snake {
    private w: i32 = 10;
    private h: i32 = 10;

    // игровое поле
    private buffer: Uint32Array = new Uint32Array(100);
    private snakeLength: i32 = 4;
    private direction: Direction = Direction.right;

    public init(w: i32, h: i32): void {
        this.w = w;
        this.h = h;
        this.buffer = new Uint32Array(w * h);
        this.direction = Direction.right;

        // очистить поле
        for (let i = 0; i < this.buffer.length; i++) this.buffer[i] = 0;

        // поставить змейку посередине поля
        this.snakeLength = 4;
        let y: number = Math.floor(h / 2),
            x: number = Math.floor((w + this.snakeLength) / 2);
        for (let i = 0; i < this.snakeLength; i++) this.buffer[<i32>(y * h + x - i)] = i + 1;
        this.setDirection(Direction.right);

        // создадим еду
        this.generateFood();
    }

    private generateFood(): void {
        // находим случайным образом пустую клетку, ставим в неё еду
        let index: number = Math.floor(Math.random() * this.buffer.length);
        while (this.buffer[<i32>index] != FieldType.empty)
            index = Math.floor(Math.random() * this.buffer.length);
        this.buffer[<i32>index] = FieldType.food;
    }

    public setDirection(dir: Direction): void {
        let headIndex: number = this.buffer.indexOf(1);
        if (headIndex == -1) return; // перестрахов очка

        // новые координаты головы:
        let x: number = headIndex % this.h,
            y: number = Math.floor(headIndex / this.h);
        if (this.direction == Direction.right) x++;
        if (this.direction == Direction.left) x--;
        if (this.direction == Direction.up) y--;
        if (this.direction == Direction.down) y++;

        // игнорируем возможность головы повернуть назад
        if (this.direction == Direction.right && dir == Direction.left ||
            this.direction == Direction.left && dir == Direction.right ||
            this.direction == Direction.up && dir == Direction.down ||
            this.direction == Direction.down && dir == Direction.up) return;

        this.direction = dir;
    }

    public tick(): void {
        // если змейка заполнила всё поле, то не имеет смысла дальше играть, останавливаемся
        if (this.snakeLength == this.w * this.h) return;

        let tailIndex: number = 0, headIndex: number = 0;

        // двигаем змейку, всё тело инкрементируем
        for (let i = 0; i < this.buffer.length; i++) {
            if (this.buffer[i] != FieldType.food && this.buffer[i] != FieldType.empty) {
                if (this.buffer[i] == FieldType.head) headIndex = i;
                if (this.buffer[i] == this.snakeLength) tailIndex = i;
                this.buffer[i]++;
            }
        }

        // и добавляем голову в новое место, проверяя куда именно :)
        // новые координаты головы:
        let x: number = headIndex % this.h,
            y: number = Math.floor(headIndex / this.h);
        if (this.direction == Direction.right) x++;
        if (this.direction == Direction.left) x--;
        if (this.direction == Direction.up) y--;
        if (this.direction == Direction.down) y++;

        let newHeadIndex: number = y * this.h + x;
        // если змея
        if (x < 0 || x >= this.w || y < 0 || y >= this.h || // зашла за поле или пытается съесть себя
            (this.buffer[<i32>newHeadIndex] != FieldType.empty && this.buffer[<i32>newHeadIndex] != FieldType.food)) {
            this.init(this.w, this.h); // начинаем игру заново
            return;

        } else { // иначе
            // если в новом месте была еда, увеличиваем длину
            if (this.buffer[<i32>newHeadIndex] == FieldType.food) {
                this.snakeLength++;
                this.generateFood();
            }
            // удаляем хвост при необходимости
            else this.buffer[<i32>tailIndex] = FieldType.empty;
            // просто ставим голову в новое место
            this.buffer[<i32>newHeadIndex] = 1;
        }
    }

    public get text(): string {
        // вернуть поле в хорошем текстовом виде
        let text: string = "┌" + "─".repeat(this.w) + "┐\n";
        for (let i = 0; i < this.h; i++) {
            text += "│";
            for (let j = 0; j < this.w; j++) {
                switch (this.buffer[i * this.h + j]) {
                    case FieldType.food:
                        text += "●";
                        break;
                    case FieldType.empty:
                        text += " ";
                        break;
                    case FieldType.head:
                        text += "☻";
                        break;
                    default:
                        text += "○";
                        break
                }
            }
            text += "│\n";
        }
        text += "└" + "─".repeat(this.w) + "┘\n";
        return text;
    }
}
