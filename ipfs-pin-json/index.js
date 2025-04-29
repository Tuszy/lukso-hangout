const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 80;

app.use(cors());
app.use(express.json());

app.post(/(.*)/, async (req, res, next) => {
    try {
        const formData = new FormData();
        const blob = new Blob([JSON.stringify(req.body)], { type: "application/json" });
        formData.append("file", blob);

        const response = await fetch("http://ipfs:5001/api/v0/add", { method: "POST", body: formData }).then(response => response.json());
        if (!response?.Hash) throw new Error("Received invalid response " + JSON.stringify(response));
        fetch(`http://ipfs:5001/api/v0/routing/provide?arg=${response.Hash}`, { method: "POST" });
        res.status(201);
        res.json({ success: true, hash: response.Hash, ipfsUrl: "ipfs://" + response.Hash, resolvedUrl: "https://ipfs.tuszy.com/ipfs/" + response.Hash, data: req.body });
    } catch (e) {
        console.log(e.toString());
        res.status(400);
        res.json({ success: false, error: e.toString() });
    }
});

app.listen(PORT, function () {
    console.log('IPFS PIN JSON SERVICE RUNNING ON PORT ' + PORT);
});
