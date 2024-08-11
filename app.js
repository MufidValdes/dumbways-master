// ========== set global variable ==========
//Import library/module
const express = require('express')
const path = require('path')
const app = express()
const port = 3000

// app.set = setting variable global, configuration, dll
// use handlebars for template engine
app.set("view engine", "hbs")
app.set("views", "src/views");


// sequelize config
const config = require("./config/config.json");
// ORM (Object Relational Mapping), Teknik penyelarasan antara aplikasi dan database ataupun jembatan, penyederhanaan. pemetaan object ke struktur database
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);

// app.use = setting middleware
app.use("/assets",express.static(path.join(__dirname, 'src/assets')))

app.use("/assets", express.static(path.join(__dirname, "src/assets")));
app.use(express.urlencoded({ extended: true }));
// extended : false => querystring bawaan dari express
// extended : true = > menggunakan query strign third party => qs
app.use(express.json());


// ========== Route ==========
// get = mengambil data
// post = mengirimkan data
// request = dari client ke server
// respose = dari server ke client
app.get('/', home)
app.get('/contact', contact)

app.get('/add_project', project)
app.post('/add_project', add_project)
app.post('/delete_project/:id', del_project)

app.get('/update_project/:id', update_projectView)
app.post('/update_project', update_project)

app.get('/detail_project/:id', detail_projectbyId)
app.get('/detail_project', detail_project)

app.get('/testimonial', testimonial)

// ========== SET Function ==========
async function home(req, res) {
    const query = "SELECT * FROM tb_projects ORDER BY id ASC ";
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });
    
    console.log("ini data dari tb_projects :", result);
    res.render('index', {data : result})
}

function contact(req, res) {
    res.render('contact')
}
// ========== CRUD MyProject ==========
function project(req, res) {
    res.render('add_project')
}
// ==> ADD PROJECT <===
async function add_project(req, res) {
    const user_id = 12
    const image = "https://cdnb.artstation.com/p/assets/images/images/078/860/057/small/theo-malheuvre-ekko-beautyshot3.jpg?1723277001"    
    const {
        id, 
        name, 
        startDate, 
        endDate, 
        discription
    } = req.body 
    
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
    res.redirect('/')
}

async function del_project(req, res) {
    const { id } = req.params
    
    const query = `
    DELETE FROM tb_projects 
    WHERE id=${id}`;
    const result = await sequelize.query(query, { type: QueryTypes.DELETE });
    
    console.log("data berhasil dihapus :", result[0]);
    res.redirect("/");
}

async function update_projectView(req, res) {
    const { id } = req.params;
    const query = `SELECT * FROM tb_projects WHERE id=${id}`;
    const project = await sequelize.query(query, { type: QueryTypes.SELECT });

    console.log("ini update project", project);
    
    res.render('update_project', {data: project[0]})
}
async function update_project(req, res) {
    const image = "https://cdnb.artstation.com/p/assets/images/images/078/860/057/small/theo-malheuvre-ekko-beautyshot3.jpg?1723277001"    
    const {
        id,
        name, 
        startDate, 
        endDate, 
        discription
    } = req.body 

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

        console.log("data berhasil diperbarui", result)
    
        res.redirect('/')
}

function detail_project(req, res) {
    res.redirect('/')
}

async function detail_projectbyId(req, res) {
    const { id } = req.params;

    const query = `SELECT * FROM tb_projects WHERE id=${id}`;
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });

    res.render('detail_project', { data: result[0] })
}
function testimonial(req, res) {
    res.render('testimonial')
}

app.listen(port, () => {
    console.log(`Aplikasi berjalan pada port ${port}`);
})

// run => node app.js