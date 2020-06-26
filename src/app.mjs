import express from "express";
import sirv from "sirv";
import bodyParser from "body-parser";
import path from "path";
import flash from "connect-flash";
import session from "express-session";
import helmet from "helmet";

import config from "./config.mjs";
import passportUtil from "./util/passportUtil.mjs";
import routes from "./routes.mjs";

const env = process.env.NODE_ENV || "development";

const app = express();

const __dirname = path.resolve(path.dirname(""));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(
    session({
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        name: "sessionId"
    })
);
passportUtil.configure(app);
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    sirv("public", {
        dev: env === "development"
    })
);

app.use(helmet());

app.post("/github/webhook", verifyPostData, function (req, res) {
    console.log("Update incoming");
    exec("cd /home/deploy/verband && ./deploy.sh", function (err, stdout, stderr) {
        if (err) {
            console.error(err);
            res.send(500, err);
        } else {
            res.send(200);
        }
    });
});

app.use("/", routes());

app.all("*", (req, res, next) => {
    let ex = new Error("Page Not Found");
    ex.statusCode = 404;

    next(ex);
});

app.use((ex, req, res, next) => {
    if (!ex.statusCode) ex.statusCode = 500;

    if (env === "development" && ex.statusCode === 500) {
        console.warn(JSON.stringify(ex));
    }

    res.status(ex.statusCode).render("error", { title: "Error", page: "error", ex, env });
});

app.listen(config.port, () => {
    console.log("Server started at http://localhost:" + config.port);
});

function verifyPostData(req, res, next) {
    const payload = JSON.stringify(req.body);
    if (!payload) {
        res.sendStatus(405);
        return next("Request body empty");
    }

    const hmac = crypto.createHmac("sha1", config.gitSecret);
    const digest = "sha1=" + hmac.update(payload).digest("hex");

    if (digest === req.headers["x-hub-signature"]) {
        return next();
    } else {
        res.sendStatus(405);
    }
}
