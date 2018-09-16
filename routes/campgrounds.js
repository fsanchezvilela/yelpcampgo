//================================================
//          SET UP EXPRESS-ROUTER.
//================================================

var express     = require("express");
var Campground  = require("../models/campground");
var router      = express.Router();
var middleware  = require("../middleware");
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'opencage',
  httpAdapter: 'https',
  apiKey: 'f7199edf6b0a48b9a7799a7169e56893',
  formatter:null
};

var geocoder = NodeGeocoder(options);

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

    router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name  = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc =  req.body.description;

    //link user to a campground
    var author ={
        id: req.user._id,
        username: req.user.username
    };
// parse the geografic data and save    
   geocoder.geocode(req.body.location, function(err, data){
      if(err || !data.length){
          req.flash('error', 'Invalid address');
          return res.redirect('back');
      } 
      var lat =data[0].latitude;
      var lng =data[0].longitude;
      var location = data[0].formattedAddress;

var newCampground = {name: name, price:price, image: image, description:desc, author:author, location:location, lat: lat, lng: lng};
   // Create a new campground and save to DB
   Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err); 
           req.flash("error","something weird happend, sorry :(");
       } else {
            //redirect back to campgrounds page.
            console.log(newlyCreated);
            req.flash("success","A New Campground was create yey!!");
            res.redirect("/campgrounds");
       }
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
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //geocode stuff
    geocoder.geocode(req.body.location, function(err,data){
       if(err || !data.length){
           req.flash('error', 'Invalid address');
           return res.redirect('back');
       } 
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
    
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
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
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          req.flash("error",err.message);
          res.redirect("/campgrounds");
      } else{
          req.flash("success","Campground was delete");
          res.redirect("/campgrounds");
      }
   });
});

//reglular exprecion funcion. match anything with this plug query string to this function 
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");  
};

//-----------------EXPORT ROUTER------------------------
module.exports = router;