//===================================================
//              Initialize NPM BOYZ
//===================================================
require('dotenv').config();
var  express           = require("express"),
     app               = express(),
     bodyParser        = require("body-parser"),
     mongoose          = require("mongoose"),
     flash             = require("connect-flash"),
     passport          = require("passport"),
     LocalStrategy     = require("passport-local"),
     methodOverride    = require("method-override"),
     Campground        = require("./models/campground"),
     Comment           = require("./models/comment"),
     User              = require("./models/user"),
     seedDB            = require("./seeds");
     app.locals.moment = require('moment');

//               routes
var  commentRoutes      = require("./routes/comments"),
     indexRoutes        = require("./routes/index"),
     campgroundsRoutes  = require("./routes/campgrounds");

//-----------------------SETUP--------------------------------------///  

// conectar a la base de datos si no existe la crea dinamicamente     
//mongoose.connect("mongodb://localhost/yelp_camp_v10");
mongoose.connect("mongodb://fernando:fercho57@ds125342.mlab.com:25342/yelpcampdb");
// sacar variables del html body para post request
app.use(bodyParser.urlencoded({extended:true}));
// setear el ejs en view. para que los archivos no terminen en .ejs
app.set("view engine", "ejs");
// stylesheets
app.use(express.static(__dirname + "/public"));
// method override para usar PUT y DELETE de los form request
app.use(methodOverride("_method"));
app.use(flash());
 //seedDB();// execute the seed for the database

//-------------------PASSPORT CONFIGURATION-------------------------///

    app.use(require("express-session")({
        secret:"Once again Rusty wins cutest dog!",
        resave:false,
        saveUninitialize: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.use(new LocalStrategy(User.authenticate())); // usar la estrategia 
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

//------------------------------------------------------------------------
//  MIDDLEWARE SESSION -> LOOK IF A SESSION IS ACTIVE OR NOT (DISPLAY) ///
//-----------------------------------------------------------------------

//  middleware para ver la session activa del usuario asi se toma el login/signup vs logout display

    app.use(function(req, res, next){
        res.locals.currentUser = req.user;
        res.locals.error =req.flash("error");
        res.locals.success = req.flash("success");
        next();
    });
    
//-------------------------- REQUERING ROUTES APP.USE() --------------------------------------------------
    
    app.use("/", indexRoutes);
    app.use("/campgrounds", campgroundsRoutes); // usando el ("/campgrounds") enfrente lo appends al / de las rutas. eso evita duplicado y limpia mas el codigo
    app.use("/campgrounds/:id/comments",commentRoutes);

//-------------------------------- EVENT LISTENER SERVER -------------------------------------------------
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!"); 
});