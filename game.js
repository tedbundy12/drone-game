const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройки
const drone = { x: 100, y: 100, size: 20, speed: 6, angle: 0 };
let tanks = Array.from({ length: 2 }, () => ({
  x: randomPosition(canvas.width),
  y: randomPosition(canvas.height),
  size: 40,
}));
let soldiers = Array.from({ length: 3 }, () => ({
  x: randomPosition(canvas.width),
  y: randomPosition(canvas.height),
  size: 20,
  dx: Math.random() > 0.5 ? 1 : -1,
  dy: Math.random() > 0.5 ? 1 : -1,
}));

let score = 0;
let level = 1;
let isGameOver = false;
let bullets = [];

let targetAngle = drone.angle;
let targetSpeed = drone.speed;
const angleSpeed = 0.2; // Плавность поворота
const acceleration = 0.1; // Плавность ускорения/замедления
const maxSpeed = 8; // Максимальная скорость
const minSpeed = 1; // Минимальная скорость

// Управление направлением дрона
document.addEventListener("keydown", (e) => {
  if (isGameOver) return;
  switch (e.key) {
    case "ArrowLeft":
      targetAngle -= angleSpeed; // Плавное уменьшение угла
      break;
    case "ArrowRight":
      targetAngle += angleSpeed; // Плавное увеличение угла
      break;
    case "ArrowUp":
      targetSpeed = Math.min(targetSpeed + acceleration, maxSpeed); // Плавное увеличение скорости
      break;
    case "ArrowDown":
      targetSpeed = Math.max(targetSpeed - acceleration, minSpeed); // Плавное уменьшение скорости
      break;
  }
});

function updateDroneAngle() {
  const angleDiff = targetAngle - drone.angle;
  if (angleDiff > Math.PI) targetAngle -= Math.PI * 2;
  if (angleDiff < -Math.PI) targetAngle += Math.PI * 2;

  // Плавно изменяем угол
  drone.angle += angleDiff * 0.1;
}

// Функция для случайной позиции
function randomPosition(max) {
  return Math.floor(Math.random() * (max - 80)) + 40;
}

// Функция для перемещения дрона
function moveDrone() {
  // Плавный поворот
  updateDroneAngle();

  // Плавное движение
  drone.x += Math.cos(drone.angle) * targetSpeed;
  drone.y += Math.sin(drone.angle) * targetSpeed;

  // Проверяем выход за границы карты
  if (drone.x < 0) drone.x = canvas.width;
  if (drone.x > canvas.width) drone.x = 0;
  if (drone.y < 0) drone.y = canvas.height;
  if (drone.y > canvas.height) drone.y = 0;
}

function createBullet(x, y, dx, dy) {
  bullets.push({ x, y, dx, dy, size: 5 });
}

function shootSoldier() {
  soldiers.forEach((soldier) => {
    const dx = drone.x - soldier.x;
    const dy = drone.y - soldier.y;
    const angle = Math.atan2(dy, dx);
    const speed = 3;
    createBullet(
      soldier.x,
      soldier.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
  });
}

function moveBullets() {
  bullets.forEach((bullet, index) => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    // Удаляем пули, если они выходят за пределы экрана
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }
  });
}

// Отрисовка пуль
function drawBullets() {
  bullets.forEach((bullet) => {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Отрисовка фона
function drawBackground() {
  ctx.fillStyle = "#7CFC00"; // Зелёная трава
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Отрисовка дороги
  ctx.fillStyle = "#808080"; // Цвет дороги
  ctx.fillRect(canvas.width / 2 - 50, 0, 100, canvas.height); // Вертикальная дорога
  ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100); // Горизонтальная дорога
}

// Отрисовка дрона
// Отрисовка дрона камикадзе
function drawDrone() {
  ctx.save();
  ctx.translate(drone.x, drone.y);
  ctx.rotate(drone.angle);

  // Основной корпус - прямоугольник с закругленными углами
  ctx.fillStyle = "#ff0000"; // Ярко-красный цвет для корпуса
  ctx.beginPath();
  ctx.moveTo(-drone.size / 2, -drone.size / 4); // Верхний левый угол
  ctx.lineTo(drone.size / 2, -drone.size / 4); // Верхний правый угол
  ctx.lineTo(drone.size / 2, drone.size / 4); // Нижний правый угол
  ctx.lineTo(-drone.size / 2, drone.size / 4); // Нижний левый угол
  ctx.closePath();
  ctx.fill();

  // Добавление крыльев - форма, напоминающая треугольник
  ctx.fillStyle = "#ff4500"; // Оранжевый цвет для крыльев
  ctx.beginPath();
  ctx.moveTo(-drone.size / 2, -drone.size / 4); // Верхний левый угол
  ctx.lineTo(-drone.size / 1.2, -drone.size / 1.5); // Верхняя часть крыла
  ctx.lineTo(-drone.size / 2, -drone.size / 1.5); // Нижняя часть крыла
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(drone.size / 2, -drone.size / 4); // Верхний правый угол
  ctx.lineTo(drone.size / 1.2, -drone.size / 1.5); // Верхняя часть крыла
  ctx.lineTo(drone.size / 2, -drone.size / 1.5); // Нижняя часть крыла
  ctx.closePath();
  ctx.fill();

  // Центральная часть с "оружием" или системой
  ctx.fillStyle = "#d32f2f"; // Тёмно-красный для центра
  ctx.beginPath();
  ctx.rect(-drone.size / 8, -drone.size / 8, drone.size / 4, drone.size / 4); // Прямоугольник в центре
  ctx.fill();

  // Двигатели - 2 маленьких круга
  ctx.fillStyle = "#333"; // Темно-серый для двигателей
  ctx.beginPath();
  ctx.arc(-drone.size / 4, drone.size / 4, drone.size / 8, 0, Math.PI * 2); // Левый двигатель
  ctx.fill();
  ctx.beginPath();
  ctx.arc(drone.size / 4, drone.size / 4, drone.size / 8, 0, Math.PI * 2); // Правый двигатель
  ctx.fill();

  // Прямоугольники для стабилизаторов или дополнительных деталей
  ctx.fillStyle = "#b71c1c"; // Темно-красный для дополнительных деталей
  ctx.beginPath();
  ctx.rect(-drone.size / 6, drone.size / 4.5, drone.size / 3, 5); // Нижний стабилизатор
  ctx.fill();

  // Орудие спереди (например, взрывчатка)
  ctx.fillStyle = "#ffeb3b"; // Желтый для орудия
  ctx.beginPath();
  ctx.arc(0, -drone.size / 2, drone.size / 8, 0, Math.PI * 2); // Орудие спереди
  ctx.fill();

  // Тень от дрона для глубины
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    0,
    drone.size / 2 + 10,
    drone.size / 1.5,
    drone.size / 8,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

// Отрисовка танков
function drawTanks() {
  tanks.forEach((tank) => {
    ctx.save();
    ctx.translate(tank.x, tank.y);

    ctx.fillStyle = "green";
    ctx.fillRect(-tank.size / 2, -tank.size / 2, tank.size, tank.size);

    ctx.fillStyle = "darkgreen";
    ctx.fillRect(-tank.size / 8, -tank.size / 2, tank.size / 4, tank.size / 2);

    ctx.fillStyle = "black";
    ctx.fillRect(-tank.size / 2, -tank.size / 2, tank.size / 10, tank.size);
    ctx.fillRect(
      tank.size / 2 - tank.size / 10,
      -tank.size / 2,
      tank.size / 10,
      tank.size
    );

    ctx.restore();
  });
}

// Отрисовка пехотинцев
function drawSoldiers() {
  soldiers.forEach((soldier) => {
    ctx.save();
    ctx.translate(soldier.x, soldier.y);

    ctx.fillStyle = "brown";
    ctx.beginPath();
    ctx.arc(0, 0, soldier.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(0, -soldier.size / 2, soldier.size / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

// Перемещение пехотинцев
function moveSoldiers() {
  soldiers.forEach((soldier) => {
    soldier.x += soldier.dx;
    soldier.y += soldier.dy;

    if (soldier.x < 0 || soldier.x > canvas.width) soldier.dx *= -1;
    if (soldier.y < 0 || soldier.y > canvas.height) soldier.dy *= -1;
  });
}

// Проверка столкновений
function checkCollision() {
  // Проверяем столкновение пуль с дроном
  bullets.forEach((bullet, bulletIndex) => {
    const distX = bullet.x - drone.x;
    const distY = bullet.y - drone.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    if (distance < drone.size / 2 + bullet.size) {
      // Если пуля попала в дрон, сбрасываем игру
      resetGame();
    }
  });

  // Удаление танков и солдат при столкновении
  tanks = tanks.filter((tank) => {
    const distX = drone.x - tank.x;
    const distY = drone.y - tank.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance >= drone.size + tank.size / 2;
  });

  soldiers = soldiers.filter((soldier) => {
    const distX = drone.x - soldier.x;
    const distY = drone.y - soldier.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance >= drone.size + soldier.size / 2;
  });

  if (tanks.length === 0 && soldiers.length === 0) {
    nextLevel();
  }
}

// Переход на следующий уровень
function nextLevel() {
  level++;
  tanks = Array.from({ length: level + 1 }, () => ({
    x: randomPosition(canvas.width),
    y: randomPosition(canvas.height),
    size: 40,
  }));
  soldiers = Array.from({ length: level + 2 }, () => ({
    x: randomPosition(canvas.width),
    y: randomPosition(canvas.height),
    size: 20,
    dx: Math.random() > 0.5 ? 1 : -1,
    dy: Math.random() > 0.5 ? 1 : -1,
  }));
  drone.x = canvas.width / 2;
  drone.y = canvas.height / 2;
}

// Отрисовка счётчика
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Счёт: ${score} | Уровень: ${level}`, 10, 30);
}

function resetGame() {
  isGameOver = true;
  alert("Дрон уничтожен! Начинаем с нуля...");
  score = 0;
  level = 1;
  tanks = Array.from({ length: 2 }, () => ({
    x: randomPosition(canvas.width),
    y: randomPosition(canvas.height),
    size: 40,
  }));
  soldiers = Array.from({ length: 3 }, () => ({
    x: randomPosition(canvas.width),
    y: randomPosition(canvas.height),
    size: 20,
    dx: Math.random() > 0.5 ? 1 : -1,
    dy: Math.random() > 0.5 ? 1 : -1,
  }));
  bullets = [];
  drone.x = canvas.width / 2;
  drone.y = canvas.height / 2;
  isGameOver = false;
}

// Основной игровой цикл
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  moveDrone();
  moveSoldiers();
  checkCollision();
  drawDrone();
  drawTanks();
  drawSoldiers();
  drawScore();
  drawBullets();
  moveBullets();
  requestAnimationFrame(gameLoop);
}

setInterval(shootSoldier, 3000); // Стрельба пехотинцев каждую секунду

gameLoop();
