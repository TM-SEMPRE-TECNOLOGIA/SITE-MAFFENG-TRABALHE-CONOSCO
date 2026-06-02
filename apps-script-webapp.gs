/**
 * MAFFENG — Web App para receber candidaturas do site
 *
 * COMO IMPLANTAR:
 * 1. Abra o Apps Script onde o Web App já está
 * 2. Apague todo o código atual e cole este arquivo
 * 3. Salve (Ctrl+S)
 * 4. Clique em "Implantar" → "Gerenciar implantações" → lápis (editar)
 * 5. Versão: selecione "Nova versão" → Implantar
 * 6. Confirme que Acesso está como "Qualquer pessoa"
 * 7. Copie a URL /exec — deve ser a mesma que já está no index.html
 */

var SPREADSHEET_ID = '1HRv378hq-2y1SqlOOsRbJdYiO_2gFD5H_i5S4rLfeik';
var DRIVE_FOLDER_ID = '1BpgiPPR7mLg83lwg3XtdCUMDuvYX7a0E';
var EMAIL_DESTINO  = 'thiagonascimento.barbosapro@gmail.com';
var NOME_EMPRESA   = 'MAFFENG Engenharia e Manutenção';

function doPost(e) {
  try {
    var dados     = JSON.parse(e.postData.contents);
    var timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // 1. Salvar CV no Drive (se enviado)
    var cvLink = 'Não enviado';
    if (dados.cvBase64 && dados.cvNome) {
      var bytes  = Utilities.base64Decode(dados.cvBase64);
      var blob   = Utilities.newBlob(bytes, getMimeType(dados.cvNome), dados.cvNome);
      var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      var file   = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      cvLink = file.getUrl();
    }

    // 2. Salvar linha na planilha
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Data/Hora', 'Nome', 'E-mail', 'Telefone', 'Área', 'Mensagem', 'Currículo']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }
    sheet.appendRow([timestamp, dados.nome, dados.email, dados.tel, dados.area, dados.msg || '—', cvLink]);

    // 3. Enviar e-mail
    MailApp.sendEmail({
      to: EMAIL_DESTINO,
      subject: 'Nova candidatura — ' + dados.nome + ' | ' + NOME_EMPRESA,
      htmlBody: buildEmail(dados, timestamp, cvLink)
    });

    return json({ status: 'ok' });

  } catch (err) {
    return json({ status: 'error', message: err.message });
  }
}

function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

function getMimeType(filename) {
  var ext   = filename.split('.').pop().toLowerCase();
  var types = {
    pdf:  'application/pdf',
    doc:  'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return types[ext] || 'application/octet-stream';
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function row(label, value) {
  return '<tr style="border-bottom:1px solid #ddd">'
    + '<td style="padding:10px 12px;font-weight:bold;color:#555;width:38%">' + label + '</td>'
    + '<td style="padding:10px 12px;color:#222">' + value + '</td></tr>';
}

function buildEmail(d, timestamp, cvLink) {
  var cvHtml = cvLink !== 'Não enviado'
    ? '<a href="' + cvLink + '" style="color:#e20014;font-weight:600">Abrir currículo no Drive</a>'
    : '<span style="color:#999">Não enviado</span>';

  return '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">'
    + '<div style="background:#e20014;padding:20px 24px">'
    + '<h2 style="color:#fff;margin:0;font-size:18px">Nova candidatura — ' + NOME_EMPRESA + '</h2>'
    + '</div>'
    + '<div style="background:#f5f5f5;padding:24px">'
    + '<p style="color:#333;margin:0 0 16px"><strong>Recebido em:</strong> ' + timestamp + '</p>'
    + '<table style="width:100%;border-collapse:collapse">'
    + row('Nome', d.nome)
    + row('E-mail', '<a href="mailto:' + d.email + '" style="color:#e20014">' + d.email + '</a>')
    + row('Telefone', d.tel)
    + row('Área de interesse', d.area)
    + row('Mensagem', d.msg || '—')
    + row('Currículo', cvHtml)
    + '</table>'
    + '<p style="color:#888;font-size:12px;margin:20px 0 0">'
    + 'Candidatura recebida via site MAFFENG. Gerado automaticamente.</p>'
    + '</div></div>';
}
