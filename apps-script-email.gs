/**
 * MAFFENG — Notificação de e-mail por novo envio no Google Forms
 *
 * COMO CONFIGURAR:
 * 1. No Google Forms → Respostas → ícone de planilha (verde) → criar planilha vinculada
 * 2. Na planilha que abrir → Extensões → Apps Script
 * 3. Apague o código existente e cole TODO este arquivo
 * 4. Altere EMAIL_DESTINO abaixo para o e-mail que deve receber as notificações
 * 5. Clique em Salvar (Ctrl+S)
 * 6. No menu superior: Executar → onFormSubmit (primeira vez pedirá permissão — aceite)
 * 7. Gatilhos → Adicionar gatilho:
 *      Função: onFormSubmit
 *      Evento: Da planilha → Ao enviar o formulário
 * 8. Salvar — pronto, cada envio dispara um e-mail
 */

var EMAIL_DESTINO = "thiagonascimento.barbosapro@gmail.com";
var NOME_EMPRESA  = "MAFFENG Engenharia e Manutenção";

function onFormSubmit(e) {
  try {
    var respostas = e.namedValues;
    var timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    // Monta corpo do e-mail em HTML
    var corpo = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>";
    corpo += "<div style='background:#e20014;padding:20px 24px'>";
    corpo += "<h2 style='color:#fff;margin:0;font-size:18px'>Nova candidatura — " + NOME_EMPRESA + "</h2>";
    corpo += "</div>";
    corpo += "<div style='background:#f5f5f5;padding:24px'>";
    corpo += "<p style='color:#333;margin:0 0 16px'><strong>Recebido em:</strong> " + timestamp + "</p>";
    corpo += "<table style='width:100%;border-collapse:collapse'>";

    // Itera sobre todas as respostas do formulário
    for (var campo in respostas) {
      if (campo === "Carimbo de data/hora" || campo === "Timestamp") continue;
      var valor = respostas[campo][0] || "—";
      corpo += "<tr style='border-bottom:1px solid #ddd'>";
      corpo += "<td style='padding:10px 12px;font-weight:bold;color:#555;width:40%'>" + campo + "</td>";
      corpo += "<td style='padding:10px 12px;color:#222'>" + valor + "</td>";
      corpo += "</tr>";
    }

    corpo += "</table>";
    corpo += "<p style='color:#888;font-size:12px;margin:16px 0 0'>Este e-mail foi gerado automaticamente pelo sistema de candidaturas MAFFENG.</p>";
    corpo += "</div></div>";

    MailApp.sendEmail({
      to: EMAIL_DESTINO,
      subject: "Nova candidatura recebida — " + NOME_EMPRESA,
      htmlBody: corpo
    });

  } catch (err) {
    Logger.log("Erro ao enviar e-mail: " + err.message);
  }
}
