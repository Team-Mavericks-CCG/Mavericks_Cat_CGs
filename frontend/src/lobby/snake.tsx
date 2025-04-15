import './snake.css';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

//const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector('canvas');
canvas.width = 500;
canvas.height = 500;
//const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const Direction = {
    Right: 0,
    Left: 1,
    Down: 2,
    Up: 3
}

// export const SnakeGame: React.FC = () => {
// const canvas = document.querySelector('canvas') as HTMLCanvasElement;
// const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function Snake() {
  this.speed = 10
  this.food = {};

  this.init = function() {
    ctx.font = "25px Times New Roman";
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    this.tail = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 20, y: 0}, {x: 30, y: 0}, {x: 40, y: 0}]
    this.direction =  Direction.Right;
    this.score = 0;
    this.gameOver = false;
    this.willEat = false;
  }

  this.startGame = () => {
    this.init();
    this.move();
    this.foodGenerator();
  }

  this.setDirection = (direction) => {
    this.direction = direction;
  }

  this.draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw score
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.5;
    ctx.fillText('Score : ' + this.score, 70, 30);

    ctx.globalAlpha = 1;
    // draw food
    ctx.fillStyle = '#4B8D48'
    ctx.beginPath();
    ctx.rect(this.food.x, this.food.y, 10, 10);
    ctx.fill();

    // draw snake
    this.tail.forEach((item, index) => {
      if(index%2 === 0) {
        ctx.fillStyle = '#A1CCA5'
      } else {
        ctx.fillStyle = '#415D43'
      }
      ctx.beginPath();
      ctx.rect(item.x, item.y, 10, 10);
      ctx.fill();
    })

    
    this.isDead();

    this.eatFood();
  }

  this.move = () => {
    const head = {...this.tail[this.tail.length - 1]};
    const newHead = head;
    switch(this.direction) {
      case Direction.Right :
        newHead.x = (head.x + 10 === canvas.width) ? 0 : head.x + this.speed;
        break;
      case Direction.Left : 
        newHead.x = (head.x === 0) ? (canvas.width - 10) : head.x - this.speed;
        break;
      case Direction.Down : 
        newHead.y = (head.y + 10 === canvas.height) ? 0 : head.y + this.speed;
        break;
      case Direction.Up : 
        newHead.y = (head.y === 0) ? (canvas.height - 10) : head.y - this.speed;
        break;
    }
    if(!this.willEat){
      this.tail.shift();
    } else {
      this.willEat = !this.willEat;
    }
    
    this.tail.push(newHead)
    this.draw();
    

    setTimeout(() => {
      if(!this.gameOver) {
        window.requestAnimationFrame(this.move);
      } else {
        ctx.fillStyle = '#fff'
        ctx.globalAlpha = 1;
        ctx.fillText('Game Over', canvas.width/2, canvas.height/2);
        ctx.fillText('Press Enter to Restart', canvas.width/2, canvas.height/2 + 30);
      }
        
    }, 1000/(30 + this.score/2));
  }

  this.isDead = () => {
    const head = {...this.tail[this.tail.length - 1]};
    this.tail.forEach((item, index) => {
      if( index === this.tail.length - 1) {
        return
      } else if((head.x === item.x && head.y === item.y)) {
        this.gameOver = true;
      }
    })
  }

  this.foodGenerator = () => {
    const foodX = Math.floor(Math.random() * (canvas.width / 10)) * 10;
    const foodY = Math.floor(Math.random() * (canvas.height / 10)) * 10;

    let foodInside = false;
    for (let item of this.tail) {
      if (item.x === foodX && item.y === foodY) {
        foodInside = true;
        break;
      }
    }
    if(foodInside) {
      this.foodGenerator();
      return;
    }

    this.food['x'] = foodX;
    this.food['y'] = foodY;
  }

  this.eatFood = () => {
    const head = {...this.tail[this.tail.length - 1]};
    if(head.x === this.food.x && head.y === this.food.y) {
      this.willEat = true;
      this.score += 1;
      this.foodGenerator();
    }
  }
  
};

let snake = new Snake();
snake.startGame();


window.addEventListener('keyup', (event) => {
  switch(event.keyCode) {
    case 39:
      if(snake.direction !== Direction.Left) {
        snake.setDirection(Direction.Right)
      }
      break;
    case 37:
      if(snake.direction !== Direction.Right) {
        snake.setDirection(Direction.Left)
      }
      break;
    case 40:
      if(snake.direction !== Direction.Up) {
        snake.setDirection(Direction.Down)
      }
      break;
    case 38:
      if(snake.direction !== Direction.Down) {
        snake.setDirection(Direction.Up)
      }
      break;
    case 13:
      if(snake.gameOver) {
        snake.startGame();
      }
      break;
  }
})

