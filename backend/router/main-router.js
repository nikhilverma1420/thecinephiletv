const express = require("express");
const router = express.Router();
const controller = require("../controller/main-controller");
const { authenticateAdmin } = require("../middleware/auth");

router.route("/").get( controller.home);
router.route("/registration").post(controller.registration);
router.route("/login").post(controller.login);
router.route("/upload").post(controller.upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), controller.uploadPost);
router.route("/posts").get(controller.getAllPosts);
router.route("/posts/clear").delete(controller.clearAllPosts);
router.route("/posts/sample").post(controller.createSamplePosts);
router.route("/users").get(authenticateAdmin, controller.getAllUsers);

module.exports = router;