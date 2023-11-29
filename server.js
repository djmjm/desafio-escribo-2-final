const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 100,
    message:{
    "mensagem": "Muitos acessos, tente após 20 minutos ..."
    }
});

app.use(apiLimiter);
app.use(express.json({limit: "30kb"}));
app.use(cors({
    origin:'*'
}));

require('dotenv').config();
const port = process.env.PORT;
const uriMongodb = process.env.DB_URI;

const routesUser = require('./routes/user');
app.use('/user', routesUser);


mongoose.set("strictQuery", false);
mongoose.connect(uriMongodb)
.then(
    () => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    }
)

