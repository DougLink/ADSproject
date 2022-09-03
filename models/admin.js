const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});
module.exports = mongoose.model("Admin", adminSchema);