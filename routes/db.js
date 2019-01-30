var express = require("express"),
    router = express.Router(),
    helper = require('../helper/db');

router.route('/')
    // .get(helper.getElements)
    .post(helper.getElements);

module.exports = router;