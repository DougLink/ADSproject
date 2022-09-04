const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket_repair");
const Employee = require("../models/employee");
const multer = require("multer");
const fs = require("fs");

// add ticket page route
router.get("/add", (req,res) => {
    res.render("add_ticket", { title: "Add Ticket"});
});

// login page route
router.get("/login", (req,res) => {
    res.render("login", { title: "Login Page"});
});

// register page route
router.get("/register", (req,res) => {
    res.render("register", { title: "Register Page"});
});

// register new employee into the DB
router.post("/register", (req, res) => {
    const employee = new Employee({
        employee_id: req.body.employee_id,
        name: req.body.name,
        email: req.body.email,
        office_room: req.body.office_room,
        password: req.body.password,
    });
    employee.save((err) => {
        if(err){
            res.json({message: err.message, type: 'danger'});
        }else{
            req.session.message = {
                type: 'success',
                message: 'Employee Registered Successfully!'
            };
            res.redirect('/admin_tickets');
        }
    })
});


// image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname +"_"+ Date.now() +"_"+ file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

// inserting ticket into the DB route
router.post("/add", upload, (req, res) => {
    const ticket = new Ticket({
        employee_id: req.body.employee_id,
        email: req.body.email,
        office_room: req.body.office_room,
        description: req.body.description,
        image: req.file.filename,
    });
    ticket.save((err) => {
        if(err){
            res.json({message: err.message, type: 'danger'});
        }else{
            req.session.message = {
                type: 'success',
                message: 'Ticket Added Successfully!'
            };
            res.redirect('/tickets');
        }
    })
});

//Get ticket route(Admin)
router.get("/", (req,res) => {
    Ticket.find().exec((err,tickets) => {
        if(err){
            res.json({message: err.message });
        }else{
            res.render('admin_tickets', {
                title:'Admin Tickets Page',
                tickets: tickets
            })
        }
    })
});

//Get my tickets route
router.get('/tickets', (req,res) => {
    Ticket.find().exec((err,tickets) => {
        if(err){
            res.json({message: err.message });
        }else{
            res.render('tickets', {
                title:'Tickets Page',
                tickets: tickets
            })
        }
    })
});

// Edit ticket
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    Ticket.findById(id, (err, ticket) => {
        if (err) {
            res.redirect("/");
        } else {
            if (ticket == null) {
                res.redirect("/");
            } else {
                res.render("edit_ticket", {
                    title: "Edit Ticket",
                    ticket: ticket,
                });
            }
        }
    });
});

// Update ticket route
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch(err){
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    Ticket.findByIdAndUpdate(id, {
        employee_id: req.body.employee_id,
        email: req.body.email,
        office_room: req.body.office_room,
        description: req.body.description,
        status: req.body.status,
        image: new_image,
    }, (err, result) => {
        if(err){
            res.json({message: err.message, type: 'danger'});
        } else {
            req.session.message = {
                type: 'success',
                message: 'Ticket updated with success!'
            };
            res.redirect('/');
        }
    })
});


// Delete Ticket Route
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    Ticket.findByIdAndRemove(id, (err, result) => {
        if (result.image !="") {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log(err);
            }
        }
        
        if (err) {
            res.json({ message: err.message});
        } else {
            req.session.message = {
                type: "info",
                message:"Ticket deleted with success!",
            };
            res.redirect("/");
        }
    });
});

module.exports = router;
