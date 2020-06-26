import express from "express";
import passport from "passport";
import { promises as fs } from "fs";

import { ensureAuthenticated } from "./util/passportUtil.mjs";

export default function () {
    const router = express.Router();

    router.get("/login", (req, res) => {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }

        res.render("login");
    });

    router.post("/login", (req, res, next) => {
        passport.authenticate("local", function (err, user, info) {
            if (err) {
                return next(err);
            }
            
            if (!user) {
                return res.redirect("/login");
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                return res.redirect("/");
            });
        })(req, res, next);
    });

    router.post("/save", ensureAuthenticated, async (req, res, next) => {
        try {
            const dataString = await fs.readFile("data.json", "utf8");
            const data = JSON.parse(dataString);

            const nameData = {};

            for (let i = 0; i < data.trainingGroupAmount; i++) {
                nameData["name-" + i + "-0"] = req.body["name-" + i + "-0"];
                nameData["name-" + i + "-1"] = req.body["name-" + i + "-1"];
            }

            const weekId = req.body.weekId;
            const dayId = req.body.dayId;

            const fileIdentifier = weekId + "-" + dayId + "-" + req.body.groupId;

            await fs.writeFile("data/" + fileIdentifier + ".json", JSON.stringify(nameData));

            res.redirect("/" + weekId + "/" + dayId);
        } catch (ex) {
            next(ex);
        }
    });

    router.get("/:weekId?/:dayId?", ensureAuthenticated, async (req, res, next) => {
        try {
            const dataString = await fs.readFile("data.json", "utf8");

            const weekId = req.params.weekId;
            const dayId = req.params.dayId;

            const data = JSON.parse(dataString);

            const defaultNameData = {};

            for (let i = 0; i < data.trainingGroupAmount; i++) {
                defaultNameData["name-" + i + "-0"] = "";
                defaultNameData["name-" + i + "-1"] = "";
            }

            const trainingDateNames = [];

            if (weekId !== undefined && dayId !== undefined) {
                for (let i = 0; i < data.trainingDates[dayId].times.length; i++) {
                    try {
                        const nameDataString = await fs.readFile(
                            "data/" + weekId + "-" + dayId + "-" + i + ".json",
                            "utf8"
                        );

                        trainingDateNames.push(JSON.parse(nameDataString));
                    } catch (ex) {
                        trainingDateNames.push(JSON.parse(JSON.stringify(defaultNameData)));
                    }
                }
            }

            res.render("index", {
                weekId,
                dayId,
                data,
                trainingDateNames
            });
        } catch (ex) {
            next(ex);
        }
    });

    return router;
}
