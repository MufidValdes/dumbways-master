// ========== set global variable ==========
//Import library/module
const express = require("express"); // Import Express framework untuk membuat aplikasi web
const UserSession = require("express-session"); // Import express-session untuk mengelola sesi pengguna
const app = express(); // Inisialisasi aplikasi Express
const path = require("path"); // Import modul path untuk memanipulasi path file
const bcrypt = require("bcrypt"); // Import bcrypt untuk enkripsi password
const multer = require("multer"); // Import multer untuk upload file

// Konfigurasi multer untuk menyimpan file upload di folder './src/uploads'
const upload = multer({ dest: "./src/uploads" });
app.use("/uploads", express.static(path.join(__dirname, "src/uploads"))); // Middleware untuk menyajikan file statis dari folder uploads
const tb_project = require("./models").tb_project; // Import model tb_project dari file models
const tb_users = require("./models").users; // Import model users dari file models

// ORM (Object Relational Mapping), Teknik penyelarasan antara aplikasi dan database ataupun jembatan, penyederhanaan, pemetaan object ke struktur database
const { Sequelize, QueryTypes } = require("sequelize");
// ====Ready To Deploy====
// Menggunakan dotenv untuk mengakses variabel environment
require("dotenv").config();
const port = process.env.PORT || 5000; // Tentukan port aplikasi dari environment atau gunakan 5000
//config db
const config = require("./config/config.js"); // Import konfigurasi database
// Konfigurasi environment berdasarkan mode aplikasi (production/development)
const envConfig =
  process.env.NODE_ENV === "production"
    ? config.production
    : config.development;
    
const sequelize = new Sequelize({ ...envConfig, dialectModule: require("pg") }); // Inisialisasi Sequelize dengan konfigurasi environment dan modul PostgreSQL
// app.set = setting variable global, configuration, dll
// Mengatur view engine menggunakan handlebars (hbs) dan menentukan folder views
app.set("view engine", "hbs");
app.set("views", "src/views");


// app.use = setting middleware
app.use("/assets", express.static(path.join(__dirname, "src/assets"))); // Middleware untuk menyajikan file statis dari folder assets
app.use("/uploads", express.static("uploads")); // Middleware untuk menyajikan file statis dari folder uploads

app.use(express.urlencoded({ extended: true })); // Middleware untuk parsing body dari form data
// extended : false => querystring bawaan dari express
// extended : true = > menggunakan query string third party => qs

//  ======= User Session =====
// Middleware untuk mengelola sesi pengguna
app.use(
  UserSession({
    name: "session_data", // Nama cookie sesi
    secret: "secret-room", // Secret key untuk mengamankan sesi
    resave: false, // Tidak menyimpan sesi yang tidak diubah
    saveUninitialized: true, // Menyimpan sesi baru yang belum diinisialisasi

    cookie: {
      httpOnly: true, // Cookie hanya dapat diakses melalui HTTP, tidak dapat diakses oleh JavaScript
      secure: false, // Jika menggunakan HTTPS, set secure ke true
      maxAge: 1000 * 60 * 60 * 24, // Masa berlaku cookie selama 1 hari
    },
  })
);

// ========== Route ==========
// get = mengambil data
// post = mengirimkan data
// request = dari client ke server
// response = dari server ke client
app.get("/", home); // Route untuk halaman utama
app.get("/contact", contact); // Route untuk halaman kontak

app.get("/login", login); // Route untuk halaman login
app.post("/login", loginbyEmail); // Route untuk proses login

app.get("/register", register); // Route untuk halaman registrasi
app.post("/register", registerUser); // Route untuk proses registrasi

app.post("/logout", logout); // Route untuk logout

app.get("/add_project", project); // Route untuk halaman tambah proyek
app.post("/add_project", upload.single("image"), add_project); // Route untuk proses tambah proyek
app.post("/delete_project/:id", del_project); // Route untuk hapus proyek

app.get("/update_project/:id", update_projectView); // Route untuk halaman update proyek
app.post("/update_project", upload.single("image"), update_project); // Route untuk proses update proyek

app.get("/detail_project/:id", detail_projectbyId); // Route untuk detail proyek berdasarkan ID
app.get("/detail_project", detail_project); // Route untuk detail proyek

app.get("/testimonial", testimonial); // Route untuk halaman testimonial

// ========== SET Function ==========
// Fungsi untuk menampilkan halaman utama
async function home(req, res) {
  try {
    // const query = "SELECT * FROM tb_projects ORDER BY id ASC ";
    // const result = await sequelize.query(query, { type: QueryTypes.SELECT });

    // console.log("ini data dari tb_projects :", result);
    const data = await tb_project.findAll(); // Mengambil semua data proyek dari database

    const isLogin = req.session.isLogin; // Cek status login
    const user = req.session.user; // Ambil data user dari sesi

    res.render("index", {
      data,
      isLogin,
      user,
    }); // Render halaman utama dengan data proyek, status login, dan user
  } catch (error) {
    throw error; // Jika terjadi error, lemparkan error
  }
}

// Fungsi untuk menampilkan halaman kontak
function contact(req, res) {
  const { isLogin, user } = req.session; // Ambil status login dan user dari sesi
  res.render("contact", { isLogin, user }); // Render halaman kontak dengan status login dan user
}

// ========== Login & Register ==========
// # AUTHENTICATION => AUTHORIZATION
// - proses verifikasi pengguna
// # ENCRYPTION
// - digunakan untuk password, untuk keamanan apabila dbms di bobol
// # SESSION
// - waktu di mulai website ketika user akses website

// Fungsi untuk menampilkan halaman login
function login(req, res) {
  res.render("login");
}

// Fungsi untuk proses login berdasarkan email
async function loginbyEmail(req, res) {
  const { email, password } = req.body; // Ambil email dan password dari form body
  const query = `SELECT * FROM users WHERE email='${email}'`; // Query untuk mencari pengguna berdasarkan email
  const isResult = await sequelize.query(query, { type: QueryTypes.SELECT }); // Eksekusi query
  if (!isResult.length) {
    console.log("user belum register!"); // Jika pengguna tidak ditemukan
    return res.redirect("/login"); // Redirect ke halaman login
  }
  bcrypt.compare(password, isResult[0].password, function (err, result) { // Bandingkan password dengan hash yang disimpan
    if (!result) {
      console.log("Password Salah!"); // Jika password salah
      return res.redirect("/login"); // Redirect ke halaman login
    } else {
      req.session.isLogin = true; // Set status login di sesi
      req.session.user = isResult[0].name; // Simpan nama pengguna di sesi
      req.session.idUser = isResult[0].id; // Simpan ID pengguna di sesi
      console.log("Login Berhasil!");
      return res.redirect("/"); // Redirect ke halaman utama
    }
  });
}

// Fungsi untuk menampilkan halaman registrasi
function register(req, res) {
  res.render("register");
}

// Fungsi untuk proses registrasi pengguna baru
async function registerUser(req, res) {
  const { name, email, password } = req.body; // Ambil data dari form body

  const query = `SELECT * FROM users WHERE email='${email}'`; // Query untuk cek apakah email sudah terdaftar
  const isResult = await sequelize.query(query, { type: QueryTypes.SELECT }); // Eksekusi query
  if (isResult.length) {
    console.log("email sudah pernah digunakan!"); // Jika email sudah digunakan
    return res.redirect("/register"); // Redirect ke halaman registrasi
  }
  const salt = 10; // Nilai salt untuk bcrypt
  bcrypt.hash(password, salt, async (err, hashPassword) => { // Hash password menggunakan bcrypt
    if (err) {
      console.log("Failed to encrypt Password!"); // Jika proses hashing gagal
      return res.redirect("/register"); // Redirect ke halaman registrasi
    } else {
      await sequelize.query(`
          INSERT INTO users (name, email, password, "createdAt", "updatedAt")
          VALUES ('${name}','${email}','${hashPassword}', NOW() , NOW())`); // Simpan data pengguna baru ke database
      console.log("Hash result :", hashPassword);
      // req.flash("success", "Register success!");
      return res.redirect("/"); // Redirect ke halaman utama
    }
  });
}

// Fungsi untuk logout
async function logout(req, res) {
  req.session.destroy(function (err) { // Hapus sesi pengguna
    if (err) return console.error("Logout failed!"); // Jika gagal logout

    console.log("Logout success!");
    res.redirect("/"); // Redirect ke halaman utama
  });
}

// ========== CRUD MyProject ==========
// Fungsi untuk menampilkan halaman tambah proyek
function project(req, res) {
  const { isLogin, user } = req.session; // Ambil status login dan user dari sesi
  isLogin
    ? res.render("add_project", { isLogin, user }) // Jika login, render halaman tambah proyek
    : res.redirect("/login"); // Jika tidak login, redirect ke halaman login
}

// Fungsi untuk menambah proyek baru
async function add_project(req, res) {
  const {
    project_name,
    technology,
    description,
    repository,
    deploy_url,
    start_date,
    end_date,
  } = req.body; // Ambil data dari form body

  const { isLogin, idUser } = req.session; // Ambil status login dan ID pengguna dari sesi

  if (!isLogin) return res.redirect("/login"); // Jika tidak login, redirect ke halaman login

  const data = {
    project_name,
    technology,
    description,
    repository,
    deploy_url,
    start_date,
    end_date,
    image: req.file.filename, // Simpan nama file gambar yang diupload
    user_id: idUser, // Simpan ID pengguna yang login
  };

  await tb_project.create(data); // Simpan data proyek baru ke database
  res.redirect("/"); // Redirect ke halaman utama
}

// Fungsi untuk menghapus proyek berdasarkan ID
async function del_project(req, res) {
  const { id } = req.params; // Ambil ID proyek dari parameter URL
  const { isLogin, user } = req.session; // Ambil status login dan user dari sesi

  if (!isLogin) return res.redirect("/login"); // Jika tidak login, redirect ke halaman login

  await tb_project.destroy({ where: { id } }); // Hapus proyek dari database berdasarkan ID
  res.redirect("/"); // Redirect ke halaman utama
}

// Fungsi untuk menampilkan halaman update proyek berdasarkan ID
async function update_projectView(req, res) {
  const { id } = req.params; // Ambil ID proyek dari parameter URL
  const { isLogin, user } = req.session; // Ambil status login dan user dari sesi

  if (!isLogin) return res.redirect("/login"); // Jika tidak login, redirect ke halaman login

  const project = await tb_project.findOne({ where: { id } }); // Ambil data proyek dari database berdasarkan ID
  res.render("update_project", { project, isLogin, user }); // Render halaman update proyek dengan data proyek
}

// Fungsi untuk update proyek berdasarkan data yang diinput
async function update_project(req, res) {
  const {
    id,
    project_name,
    technology,
    description,
    repository,
    deploy_url,
    start_date,
    end_date,
  } = req.body; // Ambil data dari form body

  const { isLogin } = req.session; // Ambil status login dari sesi

  if (!isLogin) return res.redirect("/login"); // Jika tidak login, redirect ke halaman login

  const data = {
    project_name,
    technology,
    description,
    repository,
    deploy_url,
    start_date,
    end_date,
  };

  if (req.file) {
    data.image = req.file.filename; // Jika ada file gambar yang diupload, simpan nama file
  }

  await tb_project.update(data, { where: { id } }); // Update data proyek di database berdasarkan ID
  res.redirect("/"); // Redirect ke halaman utama
}

// Fungsi untuk menampilkan detail proyek berdasarkan ID
async function detail_projectbyId(req, res) {
  const { id } = req.params; // Ambil ID proyek dari parameter URL
  const project = await tb_project.findOne({ where: { id } }); // Ambil data proyek dari database berdasarkan ID
  const { isLogin, user } = req.session; // Ambil status login dan user dari sesi
  res.render("detail_project", { project, isLogin, user }); // Render halaman detail proyek dengan data proyek
}

// Fungsi untuk menampilkan semua detail proyek
async function detail_project(req, res) {
  const projects = await tb_project.findAll(); // Ambil semua data proyek dari database
  const { isLogin, user } = req.session; // Ambil status login dan user dari sesi
  res.render("detail_project", { projects, isLogin, user }); // Render halaman detail proyek dengan data proyek
}

// Fungsi untuk menampilkan halaman testimonial
function testimonial(req, res) {
  const { isLogin, user } = req.session; // Ambil status login dan user dari sesi
  res.render("testimonial", { isLogin, user }); // Render halaman testimonial dengan status login dan user
}

// Jalankan server pada port yang sudah ditentukan
app.listen(port, () => {
  console.log(`Server ready to run on http://localhost:${port}`);
});
