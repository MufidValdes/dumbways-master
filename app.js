// ========== set global variable ==========
//Import library/module
const express = require("express");
// const path = require("path");
const app = express();
const port = 3000;

const path = require("path");
const bcrypt = require("bcrypt");
const UserSession = require("express-session");
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

app.use("/assets", express.static(path.join(__dirname, "src/assets")));
app.use(express.urlencoded({ extended: true }));
// extended : false => querystring bawaan dari express
// extended : true = > menggunakan query strign third party => qs
app.use(express.json());
// app.use(flash());

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
app.post("/add_project", add_project);
app.post("/delete_project/:id", del_project);

app.get("/update_project/:id", update_projectView);
app.post("/update_project", update_project);

app.get("/detail_project/:id", detail_projectbyId);
app.get("/detail_project", detail_project);

app.get("/testimonial", testimonial);

// ========== SET Function ==========
async function home(req, res) {
  try {
    const query = "SELECT * FROM tb_projects ORDER BY id ASC ";
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });

    console.log("ini data dari tb_projects :", result);
    res.render("index", {
         data: result,
         isLogin: req.session.isLogin ,
         user: req.session.user,
        });
  } catch (error) {}
}

function contact(req, res) {
  res.render("contact");
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
              console.log('Password Salah!')
          return res.redirect("/login");
        } else {
            console.log('Login Berhasil!')
            return res.redirect("/");
        }
    });
}

function register(req, res) {
    res.render("register");
}
async function registerUser(req, res) {

    const {name, email, password} = req.body;

    const query = `SELECT * FROM users WHERE email='${email}'`;
    const isResult = await sequelize.query(query, { type: QueryTypes.SELECT });
    if (isResult.length) {
        console.log("email sudah pernah digunakan!");
        return res.redirect("/register");
    } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        const query = 
        `INSERT INTO users 
        (name, email, password, "createdAt", "updatedAt")
        VALUES 
        ('${name}','${email}','${hashedPassword}', NOW() , NOW())`;
        const isResult = await sequelize.query(query, { type: QueryTypes.INSERT });
        console.log("registrasi akun berhasil!", isResult)
        return res.redirect("/login");
    }
    
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
  res.render("add_project");
}
// ==> ADD PROJECT <===
async function add_project(req, res) {
  try {
    const user_id = 12;
    const image =
      "https://cdnb.artstation.com/p/assets/images/images/078/860/057/small/theo-malheuvre-ekko-beautyshot3.jpg?1723277001";
    const { id, name, startDate, endDate, discription } = req.body;

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
              ARRAY['${req.body.Technologies1}','${req.body.Technologies2}','${req.body.Technologies3}','${req.body.Technologies4}'],
              '${image}',
              '${user_id}',
              '',
              NOW(), NOW())`;

    const result = await sequelize.query(query, { type: QueryTypes.INSERT });

    console.log("Data berhasil ditambahkan :", result);
    res.redirect("/");
  } catch (error) {}
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
  } catch (error) {}
}

async function update_projectView(req, res) {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM tb_projects WHERE id=${id}`;
    const project = await sequelize.query(query, { type: QueryTypes.SELECT });

    console.log("ini update project", project);

    res.render("update_project", { data: project[0] });
  } catch (error) {}
}
async function update_project(req, res) {
  try {
    const image =
      "https://cdnb.artstation.com/p/assets/images/images/078/860/057/small/theo-malheuvre-ekko-beautyshot3.jpg?1723277001";
    const { id, name, startDate, endDate, discription } = req.body;

    const query = `
          UPDATE tb_projects
          SET  name = '${name}' ,
          start_date = '${startDate}', 
          end_date = '${endDate}', 
          description = '${discription}',
          tecnologies= ' ARRAY['${req.body.Technologies1}','${req.body.Technologies2}','${req.body.Technologies3}','${req.body.Technologies4}']', 
          image = '${image}'
          WHERE
          id=${id}`;
    const result = await sequelize.query(query, { type: QueryTypes.UPDATE });

    console.log("data berhasil diperbarui", result);

    res.redirect("/");
  } catch (error) {}
}

function detail_project(req, res) {
  res.redirect("/");
}

async function detail_projectbyId(req, res) {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM tb_projects WHERE id=${id}`;
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });

    res.render("detail_project", { data: result[0] });
  } catch (error) {}
}
function testimonial(req, res) {
  res.render("testimonial");
}

app.listen(port, () => {
  console.log(`Aplikasi berjalan pada port ${port}`);
});

// run => node app.js
