"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
;
var isUser = function (e) {
    return typeof e.UserID === "string" &&
        typeof e.FirstName === "string" &&
        typeof e.LastName === "string" &&
        typeof e.EmailAddress === "string" &&
        typeof e.Password === "string";
};
// we have sqlite at home
var readUsers = function () {
    try {
        var res = JSON.parse(fs_1["default"].readFileSync("users.json").toString());
        if (!Array.isArray(res))
            return [];
        for (var _i = 0, res_1 = res; _i < res_1.length; _i++) {
            var val = res_1[_i];
            if (!isUser(val))
                return [];
        }
        return res;
    }
    catch (e) {
        return [];
    }
};
var writeUsers = function (u) {
    fs_1["default"].writeFileSync("users.json", JSON.stringify(u));
};
var error = function (msg) {
    return { "status": "error", "reason": msg };
};
var ok = function (msg) {
    return { "status": "ok", "message": msg };
};
var app = express_1["default"]();
app.use(express_1["default"].json());
app.use(express_1["default"].static("page"));
app.get("/", function (req, res) {
    var text = fs_1["default"].readFileSync("page/index.html");
    res.set("Content-Type", "text/html");
    res.send(text);
});
app.get("/Users", function (req, res) {
    res.json(readUsers());
});
app.post("/User", function (req, res) {
    var b = req.body;
    if (typeof b.UserID !== "string" ||
        typeof b.FirstName !== "string" ||
        typeof b.LastName !== "string" ||
        typeof b.EmailAddress !== "string" ||
        typeof b.Password !== "string") {
        res.status(400);
        res.json(error("The post body must have 'UserID', 'FirstName' and 'LastName' entries."));
        return;
    }
    var users = readUsers();
    if (users.some(function (x) { return x.UserID == b.UserID; })) {
        res.status(400);
        res.json(error("A user with UserID " + b.UserID + " already exists."));
        return;
    }
    users.push({ UserID: b.UserID, FirstName: b.FirstName, LastName: b.LastName, EmailAddress: b.EmailAddress, Password: b.Password });
    writeUsers(users);
    res.status(201);
    res.json(ok("The user " + b.UserID + " was successfully created."));
});
app.get("/User/:id", function (req, res) {
    if (typeof req.params.id !== "string") {
        res.status(404);
        res.json(error("An id must be given."));
        return;
    }
    var users = readUsers().filter(function (x) { return x.UserID === req.params.id; });
    if (users.length === 0) {
        res.status(404);
        res.json(error("No user found with id '" + req.params.id + "'"));
        return;
    }
    res.json(users[0]);
});
app.patch("/User/:id", function (req, res) {
    if (typeof req.params.id !== "string") {
        res.status(404);
        res.json(error("An id must be given."));
        return;
    }
    var oldUsers = readUsers();
    var users = oldUsers.filter(function (x) { return x.UserID === req.params.id; });
    if (users.length === 0) {
        res.status(404);
        res.json(error("No user found with id '" + req.params.id + "'"));
        return;
    }
    var user = users[0];
    if (typeof req.body.FirstName === "string") {
        user.FirstName = req.body.FirstName;
    }
    if (typeof req.body.LastName === "string") {
        user.LastName = req.body.LastName;
    }
    if (typeof req.body.EmailAddress === "string") {
        user.EmailAddress = req.body.EmailAddress;
    }
    if (typeof req.body.Password === "string") {
        user.Password = req.body.Password;
    }
    writeUsers(oldUsers.filter(function (x) { return x.UserID !== req.params.id; }).concat([user]));
    res.json(ok("User " + req.params.id + " has been updated."));
});
app["delete"]("/User/:id", function (req, res) {
    if (typeof req.params.id !== "string") {
        res.status(404);
        res.json(error("An id must be given."));
        return;
    }
    var oldUsers = readUsers();
    var users = oldUsers.filter(function (x) { return x.UserID === req.params.id; });
    if (users.length === 0) {
        res.status(404);
        res.json(error("No user found with id '" + req.params.id + "'"));
        return;
    }
    writeUsers(oldUsers.filter(function (x) { return x.UserID !== req.params.id; }));
    res.json(ok("User " + req.params.id + " has been deleted."));
});
app.get("*", function (req, res) { return res.redirect("/"); });
app.use(function (req, res) {
    res.status(404);
    res.json(error(req.path + " not found"));
});
console.log("Express listening on port 3000");
app.listen(3000);
