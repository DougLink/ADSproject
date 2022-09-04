const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    office_room: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: "Awaiting First Evaluation"
    },
});
module.exports = mongoose.model("Ticket", ticketSchema);
