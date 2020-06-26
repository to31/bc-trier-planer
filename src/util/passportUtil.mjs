import passport from "passport";
import LocalStrategy from "passport-local";

import config from "../config.mjs";

function configure(app) {
    passport.use(
        new LocalStrategy(
            {
                usernameField: "unused",
                passwordField: "password"
            },
            async function (_, password, done) {
                console.log("login");
                console.log(password);
                console.log(config.password);

                if (password === config.password) {
                    return done(null, {});
                }

                return done(null, false);
            }
        )
    );

    passport.serializeUser(function (user, callback) {
        callback(null, {});
    });

    passport.deserializeUser(async function (id, callback) {
        try {
            callback(null, {});
        } catch (ex) {
            callback(ex);
        }
    });

    app.use(passport.initialize());
    app.use(passport.session());
}

export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

export default { configure };
