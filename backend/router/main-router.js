const express = require("express");
const router = express.Router();
const controller = require("../controller/main-controller")


router.route("/").get( controller.home);
router.route("/registration").post(controller.registration);
router.route("/login").post(controller.login);

module.exports = router;