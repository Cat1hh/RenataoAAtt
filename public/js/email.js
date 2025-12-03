// Configuração do EmailJS
(function() {
  emailjs.init("vlsGNmNM_dysEYYsP"); // seu User ID
})();

const formEmail = document.getElementById("formEmail");

formEmail.addEventListener("submit", e => {
  e.preventDefault();

  const destino = document.getElementById("destino").value;
  const titulo = document.getElementById("titulo").value;
  const mensagem = document.getElementById("mensagem").value;

  emailjs.send("service_jhmlpm3", "template_od8462n", {
    email: destino,
    title: titulo,
    message: mensagem
  })
  .then(() => alert("🐧 Pachequinho enviou a mensagem com sucesso!"))
  .catch((error) => alert("Erro ao enviar. Verifique o EmailJS.\n" + JSON.stringify(error)));
  
  formEmail.reset();
});
