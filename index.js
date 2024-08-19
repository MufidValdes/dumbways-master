// ========== set global variable ==========
//Import library/module
const express = require("express");
const UserSession = require("express-session");
const app = express();
const port = 3000;
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require("multer");

const upload = multer({ dest: "./src/uploads" });
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
const tb_project = require("./models").tb_project;
const tb_users = require("./models").users;

// const flash = require("express-flash");

// app.set = setting variable global, configuration, dll
// use handlebars for template engine
app.set("view engine", "hbs");
app.set("views", "src/views");

// sequelize config
const config = require("./config/config.json");
// ORM (Object Relational Mapping), Teknik penyelarasan antara aplikasi dan database ataupun jembatan, penyederhanaan. pemetaan object ke struktur database
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);

// app.use = setting middleware
app.use("/assets", express.static(path.join(__dirname, "src/assets")));
app.use("/uploads", express.static("uploads"));

app.use(express.urlencoded({ extended: true }));
// extended : false => querystring bawaan dari express
// extended : true = > menggunakan query strign third party => qs

//  ======= User Session =====
app.use(
  UserSession({
    name: "session_data",
    secret: "secret-room",
    resave: false,
    saveUninitialized: true,

    cookie: {
      httpOnly: true,
      secure: false, // https => http
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    },
  })
);

// ========== Route ==========
// get = mengambil data
// post = mengirimkan data
// request = dari client ke server
// respose = dari server ke client
app.get("/", home);
app.get("/contact", contact);

app.get("/login", login);
app.post("/login", loginbyEmail);

app.get("/register", register);
app.post("/register", registerUser);

app.post("/logout", logout);

app.get("/add_project", project);
app.post("/add_project", upload.single("image"), add_project);
app.post("/delete_project/:id", del_project);

app.get("/update_project/:id", update_projectView);
app.post("/update_project", upload.single("image"), update_project);

app.get("/detail_project/:id", detail_projectbyId);
app.get("/detail_project", detail_project);

app.get("/testimonial", testimonial);

// ========== SET Function ==========
async function home(req, res) {
  try {
    // const query = "SELECT * FROM tb_projects ORDER BY id ASC ";
    // const result = await sequelize.query(query, { type: QueryTypes.SELECT });

    // console.log("ini data dari tb_projects :", result);
    const data = await tb_project.findAll();

    const isLogin = req.session.isLogin;
    const user = req.session.user;

    res.render("index", {
      data,
      isLogin,
      user,
    });
  } catch (error) {
    throw error;
  }
}

function contact(req, res) {
  const { isLogin, user } = req.session;
  res.render("contact", { isLogin, user });
}
// ========== Login & Register ==========
// # AUTHENTICATION => AUTHORIZATION
// - proses verifikasi pengguna
// # ENCRYPTION
// - digunakan untuk password, untuk keamanan apabila dbms di bobol
// # SESSION
// - waktu di mulai website ketika user akses website

function login(req, res) {
  res.render("login");
}

async function loginbyEmail(req, res) {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email='${email}'`;
  const isResult = await sequelize.query(query, { type: QueryTypes.SELECT });
  if (!isResult.length) {
    console.log("user belum register!");
    return res.redirect("/login");
  }
  bcrypt.compare(password, isResult[0].password, function (err, result) {
    if (!result) {
      console.log("Password Salah!");
      return res.redirect("/login");
    } else {
      req.session.isLogin = true;
      req.session.user = isResult[0].name;
      req.session.idUser = isResult[0].id;
      console.log("Login Berhasil!");
      return res.redirect("/");
    }
  });
}

function register(req, res) {
  res.render("register");
}
async function registerUser(req, res) {
  const { name, email, password } = req.body;

  const query = `SELECT * FROM users WHERE email='${email}'`;
  const isResult = await sequelize.query(query, { type: QueryTypes.SELECT });
  if (isResult.length) {
    console.log("email sudah pernah digunakan!");
    return res.redirect("/register");
  }
  const salt = 10;
  bcrypt.hash(password, salt, async (err, hashPassword) => {
    if (err) {
      console.log("Failed to encrypt Password!");
      return res.redirect("/register");
    } else {
      await sequelize.query(`
          INSERT INTO users (name, email, password, "createdAt", "updatedAt")
          VALUES ('${name}','${email}','${hashPassword}', NOW() , NOW())`);
      console.log("Hash result :", hashPassword);
      // req.flash("success", "Register success!");
      return res.redirect("/");
    }
  });
}

// Logout
async function logout(req, res) {
  req.session.destroy(function (err) {
    if (err) return console.error("Logout failed!");

    console.log("Logout success!");
    res.redirect("/");
  });
}
// ========== CRUD MyProject ==========
function project(req, res) {
  const { isLogin, user } = req.session;
  isLogin
    ? res.render("add_project", { isLogin, user })
    : res.redirect("/login");
}
// ==> ADD PROJECT <===
async function add_project(req, res) {
  try {
    const image = req.file ? req.file.filename : null;
    const userId = req.session.idUser;
    console.log(image);
    const {
      name,
      startDate,
      endDate,
      discription,
      Technologies1,
      Technologies2,
      Technologies3,
      Technologies4,
    } = req.body;
    const durationTime = getDurationTime(endDate, startDate);

    const tecnologies = [
      Technologies1,
      Technologies2,
      Technologies3,
      Technologies4,
    ].filter(Boolean);
    const query = `
    INSERT INTO tb_projects(
      name, 
      start_date, 
      end_date, 
      description, 
      tecnologies, 
      image,
      "user_id",
      duration_time, 
      "createdAt", 
      "updatedAt"
      ) 
      VALUES (
        '${name}',
        '${startDate}',
        '${endDate}',
        '${discription}',
        ARRAY['${tecnologies}'],
        '${image}',
        '${userId}',
              '${durationTime}',
              NOW(),
              NOW())`;

    const result = await sequelize.query(query, { type: QueryTypes.INSERT });

    console.log("Data berhasil ditambahkan :", result);
    res.redirect("/");
  } catch (error) {
    throw error;
  }
}

// Duration Time
function getDurationTime(endDate, startDate) {
  let durationTime = new Date(endDate) - new Date(startDate);

  let miliSecond = 1000;
  let secondInDay = 86400;
  let dayInMonth = 30;
  let monthInYear = 12;

  let durationTimeInDay = Math.floor(durationTime / (miliSecond * secondInDay));
  let durationTimeInMonth = Math.floor(
    durationTime / (miliSecond * secondInDay * dayInMonth)
  );
  let durationTimeInYear = Math.floor(
    durationTime / (miliSecond * secondInDay * dayInMonth * monthInYear)
  );

  let restOfMonthInYear = Math.floor(
    (durationTime % (miliSecond * secondInDay * dayInMonth * monthInYear)) /
      (miliSecond * secondInDay * dayInMonth)
  );

  if (durationTimeInYear > 0) {
    if (restOfMonthInYear > 0) {
      return `${durationTimeInYear} tahun ${restOfMonthInYear} bulan`;
    } else {
      return `${durationTimeInYear} tahun`;
    }
  } else if (durationTimeInMonth > 0) {
    return `${durationTimeInMonth} bulan`;
  } else {
    return `${durationTimeInDay} hari`;
  }
}

async function del_project(req, res) {
  try {
    const { id } = req.params;

    const query = `
    DELETE FROM tb_projects 
    WHERE id=${id}`;
    const result = await sequelize.query(query, { type: QueryTypes.DELETE });

    console.log("data berhasil dihapus :", result[0]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

async function update_projectView(req, res) {
  try {
    const { isLogin, user } = req.session;
    const { id } = req.params;

    // const query = `SELECT * FROM tb_projects WHERE id=${id}`;
    // const project = await sequelize.query(query, { type: QueryTypes.SELECT });

    // console.log("ini update project", project);
    const data = await tb_project.findOne({
      where: { id },
    });
    isLogin
    ? res.render("update_project", { data, isLogin, user })
    : res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
}
async function update_project(req, res) {
  try {
    console.log(req.body);
    const {
      id,
      name,
      startDate,
      endDate,
      discription,
      Technologies1,
      Technologies2,
      Technologies3,
      Technologies4,
    } = req.body;
    const durationTime = getDurationTime(endDate, startDate);

    const tecnologies = [
      Technologies1,
      Technologies2,
      Technologies3,
      Technologies4,
    ].filter(Boolean);
    const image = req.file ? req.file.filename : null;
    const userId = req.session.idUser;

    const query = `
          UPDATE tb_projects
          SET  name = '${name}' ,
          start_date = '${startDate}', 
          end_date = '${endDate}', 
          description = '${discription}',
          tecnologies= ' ARRAY['${tecnologies}']', 
          image = '${image}',
          "user_id" ='${userId}',
          duration_time ='${durationTime}'
          WHERE
          id=${id}`;
    const result = await sequelize.query(query, { type: QueryTypes.UPDATE });

    console.log("data berhasil diperbarui", result);

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

function detail_project(req, res) {
  res.redirect("/");
}

async function detail_projectbyId(req, res) {
  try {
    const { id } = req.params;
    const { isLogin, user } = req.session;
    // const query = `SELECT * FROM tb_projects WHERE id=${id}`;
    // const result = await sequelize.query(query, { type: QueryTypes.SELECT });

    const data = await tb_project.findOne({
      where: { id },
    });

    isLogin
    ? res.render("detail_project", {
      data,
      isLogin,
      user,
    })
    : res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
}
function testimonial(req, res) {
  const { isLogin, user } = req.session;
  res.render("testimonial", { isLogin, user });
}

app.listen(port, () => {
  console.log(`Aplikasi berjalan pada port ${port}`);
});

// run => node app.js
