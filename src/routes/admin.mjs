import express from "express";
import passwordGenerator from "generate-password";
import passport from "passport";
import bcrypt from "bcrypt";
import joinUrl from "url-join";
import multer from "multer";
import bodyParser from "body-parser";

import { ensureAuthenticated } from "../util/passportUtil.mjs";
import config from "../config.mjs";

function createPageData(name1, name2) {
    const newPageData = JSON.parse(JSON.stringify(defaultPageData)); // Deep-clone

    newPageData.name1 = name1;
    newPageData.name2 = name2;
    newPageData.messageOps.push({ insert: name1 + " & " + name2 + "\n" });

    return newPageData;
}

function extendGuestbookRouter(db, assetStorage) {
    const router = express.Router();

    router.get("/login", (req, res) => {
        if (req.isAuthenticated() && req.user.page_id === req.pageData.id) {
            return res.redirect("/" + req.pageData.pageKey + "/admin/settings");
        }

        res.render("admin/login", { title: "Login", data: req.pageData, page: "admin/login" });
    });

    router.post("/login", (req, res, next) => {
        passport.authenticate("local", {
            successRedirect: "/" + req.pageData.pageKey + "/admin/settings",
            failureRedirect: "/" + req.pageData.pageKey + "/admin/login"
        })(req, res, next);
    });

    return router;
}

export default {

};
