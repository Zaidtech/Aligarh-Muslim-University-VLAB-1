var express = require("express");
var bodyParser = require("body-parser");
var mongoose  = require("mongoose");
var path = require('path'); 
var fs = require('fs'); 
var multer= require('multer');
var methodOverride = require("method-override");
var app = express();
var assignmentModel = require('./models/assignment');
var submitassignmentModel=require('./models/submitassignment');
const MONGODB_URL ='mongodb+srv://AMU_VLAB_ADMIN:ZVL1vxcOIdbJ2VkH@cluster0.5csqp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
mongoose.connect(MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

var experiments  = [

"1. VI Characteristics of a Diode",
"2. Half Wave Rectification",
"3. Full Wave Rectification",
"4. Capacitative Rectification",
"5. Zener Diode-Voltage Regulator",
"6. BJT Common Emitter Characteristics**",
"7. BJT Common Base Characteristics**",
"8. Studies on BJT CE Amplifier",
"9. RC Frequency Response"
]

// app.use exps
app.set("view engine", "ejs");

app.use(express.static(__dirname+"/public/"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: false}));


var teacherstorage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, './public/uploads/teacher') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
var studentstorage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
      cb(null, './public/uploads/students') 
  }, 
  filename: (req, file, cb) => { 
      cb(null, file.fieldname + '-' + Date.now()) 
  } 
}); 

var upload = multer({ storage: teacherstorage }); 
var studentupload=multer({storage:studentstorage});
app.use(function(req,res,next){
  if(!req.body["expvalue"])
    next();
  else{
    res.locals.expname = req.body["expvalue"];
    next();
  }
});


app.get("/", function (req, res) {
  res.render("home");
});


app.get("/experiment", function (req, res) {
  res.render("experimentmenu" , {experiments :experiments });
});


app.get("/index", function (req, res) {
  res.render("experimentindex");
});





app.get("/theory", function (req, res) {
  res.render("experimenttheory");
});


app.get("/procedure", function (req, res) {
  res.render("experimentprocedure");
});

app.get('/assignment',(req, res) => { 
assignmentModel.find({}, (err, items) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            res.render('experimentassignment', { items: items }); 
        } 
    }); 
}); 
// Uploading the assignment by teacher
app.post('/assignment', upload.single('image'), (req, res, next) => { 
  
    var obj = { 
		subjectcode: req.body.subjectcode,
        topic: req.body.topic, 
        marks_alloted: req.body.marks_alloted, 
		last_date:req.body.last_date,
        img: 'uploads/teacher/' + req.file.filename,
          
    } 
    assignmentModel.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            
            res.redirect('/assignment'); 
        } 
    }); 
}); 

//Get request for assignments submitted by students

// app.get('/submitassignment',(req, res) => { 
  
//   }); 


// Submitting the assignment by student
app.post('/submitassignment', studentupload.single('image'), (req, res, next) => { 
  
  var obj = { 
      name:req.body.name,
      enrollment_no:req.body.enrollment_no,
      img: 'uploads/students/'+ req.file.filename,
        
  } 
  submitassignmentModel.create(obj, (err, item) => { 
      if (err) { 
          console.log(err); 
      } 
      else { 
          
          res.redirect('/assignmentdetails'); 
      } 
  }); 
}); 


//Downloading the assignment
app.get('/download/:id',(req,res)=>{  
     assignmentModel.find({_id:req.params.id},(err,item)=>{  
         if(err){  
             console.log(err)  
         }   
         else{  
            var path= __dirname+'/public/'+item[0].img;  
            res.download(path);  
         }  
     })
       
})  

app.get("/assignment/:id", function(req, res){
   assignmentModel.findById(req.params.id, function(err,assignment){
       if(err){
           res.redirect("/assignment");
       } else {
           res.render("assignmentdetails", {assignment:assignment});
       }
   })
   
   
});

app.delete("/assignment/:id", function(req, res){
  
  assignmentModel.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/assignment");
       } else {
           res.redirect("/assignment");
       }
   })
 
});

app.get("/quiz", function (req, res) {
  res.render("experimentquiz");
});

app.get("/liveclass", function (req, res) {
  res.render("experimentliveclass");
});

app.get("/experiment1", function (req, res) {
  res.render("experiments/experiment1");
});

mongoose.connection.on("connected", () => {
  console.log("connected");
});

app.listen(3000, function () {
  console.log("Welcome you to AMUVLAB");
});