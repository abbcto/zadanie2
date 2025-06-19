const express   = require('express')
const app       = express()
const port      = 3000
const fs        = require('fs')
const exhbs     = require('express-handlebars')
const path      = require('path')
const multer    = require('multer')
const upload    = multer()
const { Pool } = require('pg');

const pool = new Pool({
    host:     'localhost',
    port:     5432,
    user:     'postgres',   //  юзер
    password: 'postgres',     //  пароль
    database: 'articles'
  });

// Настройка Handlebars
app.engine('hbs', exhbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// Для парсинга полей формы
app.use(express.urlencoded({ extended: true }));

// Главная
app.get('/', (req, res) => {
  res.render('main_page')
})

// Логин
app.get('/login', (req, res) => {
  res.render('login')
})
app.post('/login', upload.any(), (req, res) => {
  console.log('email:', req.body.email)
  console.log('pass:',  req.body.pass)
  res.send('ok')
})

// Регистрация (GET и POST)
app.get('/reg', (req, res) => {
    res.render('reg');
  });

app.post('/reg', upload.none(), (req, res) => {
    const { name, login, pass } = req.body;
  
    // Выводим в консоль
    console.log('Регистрация:');
    console.log('Имя:  ', name);
    console.log('Логин:', login);
    console.log('Пароль:', pass);
  
    // Тут можно добавить вставку в БД пользователей, хеширование, валидацию и т.д.
    res.send('Регистрация принята — смотрите консоль');
  });

// Тест
app.get('/hello', (req, res) => {
  res.send("TEST")
})

// Форма добавления статьи
app.get('/add_article', (req, res) => {
    res.render('add_article');
  });
  app.post('/add_article', upload.none(), async (req, res) => {
    const { title, content, author } = req.body;
  
    try {
      const client = await pool.connect();
      await client.query(
        'INSERT INTO articles(title, content, author) VALUES($1, $2, $3)',
        [title, content, author]
      );
      client.release();
      res.send('Статья успешно добавлена в PostgreSQL');
    } catch (err) {
      console.error(err);
      res.status(500).send('Ошибка при записи в базу');
    }
  });

// Запуск
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
