const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket_repair");
const Employee = require("../models/employee");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require('bcrypt');

// add ticket page route
router.get("/add", (req,res) => {
    res.render("add_ticket", { title: "Add Ticket"});
});

// login page route
router.get("/", (req,res) => {
    res.render("login", { title: "Login Page"});
});

// register page route
router.get("/register", (req,res) => {
    res.render("register", { title: "Register Page"});
});




// register new employee into the DB
router.post("/register", (req, res) => { 

    Employee.create(req.body, (error, user) => {
        //console.log("successful")
   
        if(error){
        console.log(error)
        return res.redirect('/auth/register')
        }
        req.session.message = {
            type: 'success',
            message: 'Employee Registered Successfully!'
        };
        res.redirect('/')
    })
});


// login
router.post("/login", (req, res) => {

    const { employee_id, password } = req.body;
    console.log(employee_id, password);
    Employee.findOne({employee_id:employee_id}, (error,employee) => {
        if (employee){
            bcrypt.compare(password, employee.password, (error, same) =>{
                if(same){ // if passwords match
                    // store user session, will talk about it later
                    req.session.employeeId = employee.employee_id
                    req.session.Admin = employee.admin;
                
                    console.log(req.session)
                    
                    console.log("logged in successfuly")
                    if(employee.admin == true){
                        res.redirect('/admin_tickets')
                    } else{
                        res.redirect('/tickets')
                    } 
                } else{
                    req.session.message = {
                        type: 'danger',
                        message: 'Wrong Password!'
                    };
                    res.redirect('/');
                }
            })
        } 
        else{
            req.session.message = {
                type: 'danger',
                message: 'Wrong Employee ID!'
            };
            res.redirect('/');
        }
    })

}); 


// logout
router.get("/logout", (req, res) => {
    req.session.destroy(() =>{
        res.redirect('/')
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
router.get("/admin_tickets", (req,res) => {
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
            res.redirect("/admin_tickets");
        } else {
            if (ticket == null) {
                res.redirect("/admin_tickets");
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
            res.redirect('/admin_tickets');
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
            res.redirect("/admin_tickets");
        }
    });
});





module.exports = router;
