const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./app");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// CREATE: SIGN UP
app.post("/create", (req, res) => {
    const data = req.body;
    console.log("Received signup data:", data);

    const ref = db.ref("players");

    // Check if email already exists
    ref.orderByChild("email").equalTo(data.email).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                return res.status(400).send("Email already in use");
            }

            // Check if username already exists
            return ref.orderByChild("username").equalTo(data.username).once("value");
        })
        .then(snapshot => {
            if (snapshot && snapshot.exists()) {
                return res.status(400).send("Username already in use");
            }

            // Save new user
            return ref.push(data)
                .then(() => res.status(201).send("User created successfully"));
        })
        .catch(error => res.status(400).send(error));
});

// READ
app.get("/read/:id", (req, res) => {
    const ref = db.ref("players/" + req.params.id);
    ref
        .once("value")
        .then(snapshot => res.status(200).send(snapshot.val()))
        .catch(error => res.status(400).send(error));
});

// UPDATE
app.put("/update/:id", (req, res) => {
    const data = req.body;
    const ref = db.ref("players/" + req.params.id);
    ref
        .update(data)
        .then(() => res.status(200).send("User updated successfully"))
        .catch(error => res.status(400).send(error));
});

// DELETE
app.delete("/delete/:id", (req, res) => {
    const ref = db.ref("players/" + req.params.id);
    ref
        .remove()
        .then(() => res.status(200).send("User deleted successfully"))
        .catch(error => res.status(400).send(error));
});

// LOGIN
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    const ref = db.ref("players");
    ref.orderByChild("username").equalTo(username).once("value")
        .then(snapshot => {
            if (!snapshot.exists()) {
                return res.status(404).json({ message: "User not found" });
            }

            let userData;
            snapshot.forEach(child => {
                userData = { id: child.key, ...child.val() };
            });

            if (userData.password !== password) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Return user as Player
            res.status(200).json({
                id: userData.id,
                username: userData.username,
                email: userData.email
            });
        })
        .catch(error => res.status(500).json({ message: "Server error", error }));
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});