
function sendMail() {
    let inputName = document.getElementById('inputName').value
    let inputEmail = document.getElementById('inputEmail').value
    let inputNumber = document.getElementById('inputNumber').value
    let subject = document.getElementById('subject').value
    let message = document.getElementById('message').value

   // kondisi (memunculkan sebuah alert "{field} harus diisi")
    if (inputName == "") {
      return alert("Nama harus diisi");
    } else if (inputEmail == "") {
      return alert("Email harus diisi");
    } else if (inputNumber == "") {
      return alert("Phone harus diisi!");
    } else if (subject == "") {
      return alert("Subject harus dipilih!");
    } else if (message == "") {
      return alert("Message harus diisi!")
    } else {
        console.log(`Name : ${inputName}\nEmail: ${inputEmail}\nPhone: ${inputNumber}\nSubject: ${subject}\nMessage: ${message}`)
        
        let emailReceiver = "muhamadmufidbachri27@gmail.com";
        
        let a = document.createElement("a");
        a.href = `mailto:${emailReceiver}?subject=${subject}&body=Halo, nama saya, ${inputName} ${message}. Silahkan kirimkan pesan saya di nomor ${inputNumber}`;
        a.click();
    }
  }
  