const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    office_room: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
    }
});


employeeSchema.pre('save', function(next){
    const employee = this
    console.log(employee)
    bcrypt.hash(employee.password, 10, (error, hash) => {
        employee.password = hash
        next()
    })
});

module.exports = mongoose.model("Employee", employeeSchema);