var admin = require("firebase-admin");

var serviceAccount = require("./arachnophobiagalaxyinfestation-firebase-adminsdk-fbsvc-dc9a630eb9.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://arachnophobiagalaxyinfestation-default-rtdb.firebaseio.com"
});

const db = admin.database();
module.exports = db;