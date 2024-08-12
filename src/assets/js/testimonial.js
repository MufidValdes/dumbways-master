// ======OOP======
// class Testimonial {
//     image = ""
//     review =""
//     name = ""


//     constructor(image,review,name){
//         this.image = image
//         this.review = review
//         this.name = name
//     }

//     html(){
//         return`
//         <div class="testimonial">
//                 <img src="${this.image}" class="profile-testimonial" />
//                 <p class="quote">"${this.review}"</p>
//                 <p class="author">- ${this.name}</p>
//             </div>
//         `
//     }
// }

// const testimonial1 = new Testimonial("https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8b34d29c-0458-4047-a924-c8c75109d1b4/width=960,quality=90/00768-111161737.jpeg","lorem ipsum ","hulk")
// const testimonial2 = new Testimonial("https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8b34d29c-0458-4047-a924-c8c75109d1b4/width=960,quality=90/00768-111161737.jpeg","lorem ipsum ","hulk")
// const testimonial3 = new Testimonial("https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8b34d29c-0458-4047-a924-c8c75109d1b4/width=960,quality=90/00768-111161737.jpeg","lorem ipsum ","hulk")

// const testimonials = [testimonial1, testimonial2, testimonial3]


// let testimonialsHTML = ``
// for(let i=0;i<testimonials.length; i++){
//     testimonialsHTML += testimonials[i].html()
// }

// document.getElementById("testimonials").innerHTML = testimonialsHTML

// =======HOF&CALLBACK======
// HOF(Higher-Order Functions) = A function that accepts and/or returns another function.

// XMLHttpRequest atau XHR merupakan class atau Browser API yang digunakan untuk membuat HTTP Requests menggunakan JavaScript.

const testimonialData = [
    {
        image:"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8b34d29c-0458-4047-a924-c8c75109d1b4/width=960,quality=90/00768-111161737.jpeg",
        review:"lorem ipsum",
        name:"Dono",
        rate: 5,
    },
    {
        image:"https://cdna.artstation.com/p/assets/images/images/078/897/988/small/anton-fort-5.jpg?1723398337",
        review:"lorem ipsum",
        name:"kasino",
        rate: 5,
    },
    {
        image:"https://cdnb.artstation.com/p/assets/images/images/078/672/633/small/guppy-20231203.jpg?1722777629",
        review:"lorem ipsum",
        name:"indro",
        rate: 5,
    },
    {
        image:"https://cdnb.artstation.com/p/assets/images/images/078/893/601/small/druki-son-jung-ho-cc-kv-01-v.jpg?1723388395",
        review:"lorem ipsum",
        name:"Dono",
        rate: 2,
    },
    {
        image:"https://cdnb.artstation.com/p/assets/images/images/078/883/635/small/matt-millard-asset.jpg?1723361595",
        review:"lorem ipsum",
        name:"Dono",
        rate: 1,
    },
    
]

function html(item) {
    return `
    <div class="testimonial">
        <img src="${item.image}" class="profile-testimonial" />
        <p class="quote">"${item.review}"</p>
        <p class="author">- ${item.name}</p>
        <p class="rate"> ${item.rate}<i class="fa-solid fa-star"></i></p>
    </div>
    `
}

function allTestimonials(rate) {
    let testimonialsHTML = ``
    testimonialData.forEach((item) => {
        testimonialsHTML += html(item)
    })
    document.getElementById("testimonials").innerHTML = testimonialsHTML
}

allTestimonials()

function filterTestimonials(rate) {
    let testimonialsHTML = ``
    const testimonialfilter = testimonialData.filter((item) =>{
        return item.rate === rate
    })

    if (testimonialfilter.length === 0){
        testimonialsHTML = `<h3> Data tidak ada</h3>`
    } else {
        testimonialfilter.forEach((item) =>{
            testimonialsHTML += html(item)
        })
    }
    document.getElementById("testimonials").innerHTML = testimonialsHTML
}