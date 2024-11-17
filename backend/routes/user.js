const express = require("express");
const {
  login,
  signup,
  getAll,
  deleteUser,
  makeAdmin,
} = require("../controllers/user");
const authMiddleware = require("../utils/auth");
const { adminOnly } = require("../utils/roleCheck");

const router = express.Router({ mergeParams: true });

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/").get(authMiddleware, adminOnly, getAll);
router.route("/:userId").delete(authMiddleware, adminOnly, deleteUser);
router.route("/:userId/make-admin").post(authMiddleware, adminOnly, makeAdmin);

module.exports = router;
