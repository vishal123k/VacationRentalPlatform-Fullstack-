const joi = require("joi");
module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required(),
        comment: joi.string().required(),
    }).required(),
});