import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://birwaspfxawbpekpaqpk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcndhc3BmeGF3YnBla3BhcXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczODY0NDMsImV4cCI6MjA2Mjk2MjQ0M30.32GsuRNRdJi7v_lHklC1hB7OxSG6F-AcHD_QBF0CpVs"
);

export default function App() {
  const [usuario, setUsuario] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [arquivo, setArquivo] = useState(null);

  useEffect(() => {
    buscarMensagens();
    const canal = supabase
      .channel("mensagens")
      .on("postgres_changes", { event: "*", schema: "public", table: "mensagens" }, (payload) => {
        buscarMensagens();
      })
      .subscribe();
    return () => supabase.removeChannel(canal);
  }, []);

  async function buscarMensagens() {
    const { data } = await supabase.from("mensagens").select("*").order("criado_em", { ascending: true });
    setMensagens(data);
  }

  async function enviarMensagem() {
    let midia_url = null;
    if (arquivo) {
      const nomeArquivo = `${Date.now()}-${arquivo.name}`;
      await supabase.storage.from("midias").upload(nomeArquivo, arquivo);
      const { data } = supabase.storage.from("midias").getPublicUrl(nomeArquivo);
      midia_url = data.publicUrl;
    }

    await supabase.from("mensagens").insert([{ usuario, texto: mensagem, midia_url }]);
    setMensagem("");
    setArquivo(null);
  }

  if (!usuario) {
    const nome = prompt("Digite seu nome:");
    setUsuario(nome || "Anônimo");
    return null;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>VaultBox Chat</h2>
      <div style={{ maxHeight: "60vh", overflowY: "auto", marginBottom: 10 }}>
        {mensagens.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 10 }}>
            <strong>{msg.usuario}:</strong> {msg.texto}
            {msg.midia_url && (
              <>
                <br />
                {msg.midia_url.match(/.(mp4|webm)$/) ? (
                  <video src={msg.midia_url} controls width="200" />
                ) : (
                  <img src={msg.midia_url} alt="mídia" width="200" />
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <input type="text" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Mensagem..." />
      <input type="file" onChange={(e) => setArquivo(e.target.files[0])} />
      <button onClick={enviarMensagem}>Enviar</button>
    </div>
  );
}