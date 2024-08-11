// LOOPING : FOR , WHILE , DO-WHILE

// FOR =>


let dataProject = []; 

function addProject(event) {
  event.preventDefault();

  let inputTitle = document.getElementById("input-project-name").value;
  let inputStartdate =  document.getElementById("startDate").value;
  let inputEndDate =  document.getElementById("endDate").value;
  let inputDescription = document.getElementById("input-project-desc").value;
//   let inputImage = document.getElementById("input-uploadImage").files;
  

  console.log("title", inputTitle)
  console.log("startdate", inputStartdate)
  console.log("endDate", inputEndDate)
  console.log("description", inputDescription)
//   console.log("imageURL", imageURL)
  let durationTime = new Date(endDate) - new Date(startDate);
  
//   let imageURL = URL.createObjectURL(inputImage[0])

  let Project = {
    title: inputTitle,
    durationTime: durationTime,
    description: inputDescription,
    // image:imageURL
    nodeJs: true,
    reactJs: true,
    nextJs: false,
    typescript: false,
  };

  dataProject.push(Project);

  console.log("Data Project :",dataProject);
  renderProject();
}

function renderProject() {
  document.getElementById("contents").innerHTML = ''
  for (let i = 0; i < dataProject.length; i++) {
    document.getElementById("contents").innerHTML +=
        `<div class="container-content">
        <div class="container-profile">
            <img src="/assets/images/picture.jpg" alt="">
            <h4>${dataProject[i].title} </h4>
            <span id="totalMonth">durasi :${getDurationTime(dataProject[i].durationTime)}an</span>
            <p>${dataProject[i].description}</p>
        </div>
        <div class="container-logo">
          ${dataProject[i].nodeJs ? "nodeJs" : ""}
          ${dataProject[i].reactJs ? "reactJs" : ""}
          ${dataProject[i].nextJs ? "nextJs" : ""}
          ${dataProject[i].typescript ? "typescript" : ""}
        </div>
        <div class="container-button">
            <button class="edit-button">edit</button>
            <button class="delete-button">delete</button>
        </div>
    </div>`
  }
}

function getDurationTime(time) {
    let durationTime = time;

    let miliSecond = 1000;
    let secondInDay = 86400;
    let dayInMonth = 30;
    let monthInYear =12;
    
    // Math :
    // floor -> dibulatkan ke bawah, ex : 8.6 -> 8
    // round -> dibulatkan angka terdekat, ex : 8.3 -> 8
    // ceil -> dibulatkan ke atas, ex : 8.3 -> 9

    let durationTimeInDay = Math.floor(durationTime / (miliSecond * secondInDay));
    let durationTimeInMonth = Math.floor(durationTime / (miliSecond * secondInDay * dayInMonth));
    let durationTimeInYear = Math.floor(durationTime / (miliSecond * secondInDay * dayInMonth * monthInYear));

    let restOfMonthInYear = Math.floor((durationTime%(miliSecond * secondInDay * dayInMonth * monthInYear)) / (miliSecond * secondInDay * dayInMonth))

    if (durationTimeInYear > 0 ) {
        if (restOfMonthInYear > 0) {
            return `${durationTimeInYear} tahun ${restOfMonthInYear} bulan`;
        } else {
            return `${durationTimeInYear} tahun`;
        }
    } else if (durationTimeInMonth > 0 ) {
        return `${durationTimeInMonth} bulan`;
    } else {
        return `${durationTimeInDay} hari`
    }
}

setInterval(function() {
    renderProject()
}, 1000)