
const senhaCorreta = "458";

function verificarSenha() {
  const senha = document.getElementById('senha').value;
  if (senha === senhaCorreta) {
    document.getElementById('cofre').style.display = 'block';
  } else {
    alert("Senha incorreta!");
  }
}

function uploadArquivo() {
  const fileInput = document.getElementById('arquivo');
  const file = fileInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    const galeria = document.getElementById('galeria');
    const elemento = document.createElement(file.type.startsWith("image") ? "img" : "video");
    elemento.src = url;
    if (file.type.startsWith("video")) {
      elemento.controls = true;
    }
    elemento.style.maxWidth = "100%";
    galeria.appendChild(elemento);
  }
}
