//================================================
//          SET UP EXPRESS-ROUTER.
//================================================
var ocdkey      = process.env.OCD_API_KEY;
var express     = require("express");
var Campground  = require("../models/campground");
var router      = express.Router();
var middleware  = require("../middleware");
//setup maps neodegecoder with opencage
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'opencage',
  httpAdapter: 'https',
  apiKey: ocdkey,
  formatter:null
};

var geocoder = NodeGeocoder(options);

//setup multer and cloudinary IMAGE STORAGE
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) { //filtro para las imagenes
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});
// setup cloudinary
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'tfghotaru', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===============================================
//      INDEX - show all campgrounds
//================================================

    router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); // regular exp to the query gi is g global i ignore case 
        // Get all campgrounds from DB
        Campground.find({name:regex}, function(err, allCampgrounds){ //buscar la base de datos y lanzar las variables al ejs de campgrounds 
            if(err){
                console.log(err);
            } else {
                //handle with error when the query no match with the database.
                if(allCampgrounds.length <1){
                    req.flash("error","No Campgrounds match that query, plase try again");
                    res.redirect("/campgrounds");
                } else {
                res.render("campgrounds/index",{campgrounds : allCampgrounds, page:'campgrounds'});  
                }
            }
        });
    } else {
       // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){ //buscar la base de datos y lanzar las variables al ejs de campgrounds 
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index",{campgrounds : allCampgrounds, page:'campgrounds'});   
            }
        });
    }
});

//================================================
//      CREATE - add new campground to DB
//================================================

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    // get data from form and add to campgrounds array
  cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
      if(err){
          req.flash('error', err.message);
          return res.redirect('back');
      }
  // add cloudinary url for the image to the campground object under image property
  req.body.campground.image = result.secure_url;
  // add image's public_id to campground object
  req.body.campground.imageId = result.public_id;
  // add author to campground
  req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  };
// parse the geografic data and save    
   geocoder.geocode(req.body.location, function(err, data){
      if(err || !data.length){
          req.flash('error', 'Invalid address');
          return res.redirect('back');
      } 
      //parse the object campground
      req.body.campground.lat =     data[0].latitude;
      req.body.campground.lng  =     data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
    
      
   // Create a new campground and save to DB
   Campground.create(req.body.campground, function(err, newlyCreated){
       if(err){
           console.log(err); 
           req.flash("error",err.message);
           return res.redirect('back');
           
       } else {
            //redirect back to campgrounds page.
            console.log(newlyCreated);
            req.flash("success","A New Campground was create yey!!");
            res.redirect("/campgrounds");
       }
       });
     });
   });
});
//=================================================
//      NEW - show form to create new compground
//=================================================

    router.get("/new",middleware.isLoggedIn,function(req, res) {
    res.render("campgrounds/new");
});

//===================================================
//      SHOW -show more info about one campground
//===================================================

    router.get("/:id", function(req, res){
    //find the campground with provided ID //usando el req param para linkear 
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){ // solucionar bug que crashea cuando no existe el object en la DB
            req.flash("error","Campground not found");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            // render show template with that campground
            res.render("campgrounds/show",{campground: foundCampground});
        }
    });
});

//===================================================
//      EDIT - EDIT info about one campground
//===================================================

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    //mostrar la form si esta logeado y si le pertenece el id
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err) {
            //null error comprobacion 
            req.flash("error",err.message);
            console.log(err);
            res.redire("back");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});


//===================================================
//      UPDATE - UPDATE CAMPGROUND ROUTE 
//===================================================

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    //geocode stuff
    geocoder.geocode(req.body.location, function(err,data){
    if(err || !data.length){
        req.flash('error', 'Invalid address');
        return res.redirect('back');
    } 
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
    
     Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
                }
            }
            //save the campground data 
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
    });
});

//===================================================
//      DESTROY - DESTROY CAMPGROUND ROUTE 
//===================================================

router.delete("/:id",middleware.checkCampgroundOwnership, function(req,res){
   Campground.findById(req.params.id, async function(err, campground){
      if(err){
          req.flash("error",err.message);
          return res.redirect("back");
      } try {
        // borrando la imagen de la nube  
        await cloudinary.v2.uploader.destroy(campground.imageId); 
        // despues de borrar la imagen de la nube. borrar el campground
        campground.remove();
        req.flash("success","Campground was delete");
        res.redirect("/campgrounds");
      } catch(err){
        req.flash("error",err.message);
          return res.redirect("back");
      }
   });
});

//reglular expresion funcion. match anything with this plug query string to this function 
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");  
}

//-----------------EXPORT ROUTER------------------------
module.exports = router;