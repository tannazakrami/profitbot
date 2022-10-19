const {google} = require("googleapis")
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
})

module.exports = async function getData(){
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client});
    const spreadsheetId = "1niBZs6iW8_Awa3_0J-85xi0o9JyEJjSzg0JNm8F4M8Y";
    let data = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Прибыль по аккаунтам!A1:AF18"
    })
    return data.data.values || undefined;
}