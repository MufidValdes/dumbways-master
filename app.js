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
app.get('/', home)
app.get('/contact', contact)

app.get('/add_project', project)
app.post('/add_project', add_project)
app.post('/delete_project/:id', del_project)

app.get('/update_project/:id', update_projectView)
app.post('/update_project', update_project)

app.get('/detail_project/:project_id', detail_projectbyId)
app.get('/detail_project', detail_project)

app.get('/testimonial', testimonial)


async function home(req, res) {
    const query = "SELECT * FROM tb_projects ORDER BY id ASC ";
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });
    
    console.log("ini data dari tb_projects :", result);
    res.render('index', {data : result})
}

function contact(req, res) {
    res.render('contact')
}

function project(req, res) {
    res.render('add_project')
}
function add_project(req, res) {
    console.log(req.body)
    const {title, startDate, endDate, discription} = req.body

    // const data_Project = {
    //     title: req.body.title,
    // }
    const data_Project = {
        title, 
        startDate, 
        endDate, 
        image, 
        discription
    }
    const image = "https://cdnb.artstation.com/p/assets/images/images/078/860/057/small/theo-malheuvre-ekko-beautyshot3.jpg?1723277001"
    
    data.unshift(data_Project);
    
    res.redirect('/')
}

function del_project(req, res) {
    const { id } = req.params
    
    data.splice(id, 1)
    // const dataproject = data.find( index => index.id == id );
    res.redirect('/')
}

function update_projectView(req, res) {
    const { id } = req.params
    
    const dataFilter = data[parseInt(id)]
    dataFilter.id = parseInt(id)
    
    res.render('update_project', { data: dataFilter })
}
function update_project(req, res) {
    const {id, title, startDate, endDate, discription} = req.body
    
    console.log(req.body)

    const image = "https://cdnb.artstation.com/p/assets/images/images/078/860/057/small/theo-malheuvre-ekko-beautyshot3.jpg?1723277001"
    // const newData ={
    //  ...data?
    // }
    // const index = data.find( project_id => project_id.id == id );
    //  data[index] = newData;
    data[parseInt(id)] = {
        title, 
        startDate, 
        endDate, 
        image, 
        discription
    }
    
    res.redirect('/')
}

function detail_project(req, res) {
    res.redirect('/')
}

function detail_projectbyId(req, res) {
    const { id } = req.params.project_id

    // const dataproject = data[parseInt(id)]
    // dataproject.id = parseInt(id)

    const dataproject = data.find( project_id => project_id.id == id );

    res.render('detail_project', { data: dataproject })
}
function testimonial(req, res) {
    res.render('testimonial')
}

app.listen(port, () => {
    console.log(`Aplikasi berjalan pada port ${port}`);
})

// run => node app.js