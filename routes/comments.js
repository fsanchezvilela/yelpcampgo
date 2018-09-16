//==================================================================
//                   SET UP EXPRESS-ROUTER.
//===================================================================

    var express     = require("express");
    var router      = express.Router({mergeParams:true});
    var Campground  = require("../models/campground");
    var Comment     = require("../models/comment");
    var middleware  = require("../middleware"); 

// ==================================================================
//                  COMMENTS NEW/GET - FORM ROUTE
// ==================================================================
//  NOTA: el error es que no encuentra la base de datos el id ya que el parametro no lo tiene 
//      es decir no se pasa y devuelve NULL. "/campground/:id/comments" ese :id no se pasa  

//  Solucion: pasar con un objeto al express.Router {mergeParams:true} 
//          cuando quieras pasar parametros que el id este en otro lado

    router.get("/new", middleware.isLoggedIn, function(req,res){
    // find campground by id
     Campground.findById(req.params.id, function(err,campground){
        if (err){
            console.log(err);
         } else {
            res.render("comments/new",{campground: campground});
         }
     });
});

// =====================================================================
//                  COMMENTS CREATE/POST - FORM ROUTE AND SAVE DB
// =====================================================================
    
    router.post("/",middleware.isLoggedIn, function(req, res){
    //lookup campground using ID
      Campground.findById(req.params.id, function(err, campground){
       
        if(err){
          console.log(err);
          res.redirect("/campgrounds");
        } else {
          //Create new comment
          Comment.create(req.body.comment, function(err,comment){
              if(err){
                req.flash("error","Something went wrong");
                console.log(err);
              } else {
        // add username and id to comment asociar usuario con comentario por referencia
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            // save comment
            comment.save();
          //connect new comment to campground  
            campground.comments.push(comment);
            campground.save();
            console.log(comment);
          //redirect campground show page /campgrounds/:id
            req.flash("success","Successfully added comment");
            res.redirect('/campgrounds/'+campground._id);
                }
         });
        }
      });
    });


//=====================================================
//              Edit comments ROUTE 
//=====================================================
    
    router.get("/:comment_id/edit",middleware.checkCommentOwnership, function(req,res){
//req.params.id; // este ID se refiere al de los comentarios y el id en app.js es el id de los campgrounds
    Campground.findById(req.params.id, function(err,foundCampground){ //comprobar que existe el campground
       if(err || !foundCampground){
           req.flash("error", "No Campground found");
           return res.redirect("back");
       }
       
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment:foundComment});
            }
        });
    });
});

//=====================================================
//               Update comments ROUTE 
//=====================================================

    router.put("/:comment_id",middleware.checkCommentOwnership, function(req,res){
        Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment, function(err, updatedComment){
           if(err){
             res.redirect("back");  
           } else {
               req.flash("Success","Successfully edited comment");
               res.redirect("/campgrounds/"+req.params.id) // este id se refiere el de la ruta comment nested;
           }
        });
    });
    
//=====================================================
//               DESTROY comments ROUTE 
//=====================================================

router.delete("/:comment_id",middleware.checkCommentOwnership, function(req,res){
   //findByIdAndRemove
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back");
      } else {
          req.flash("success", "Comment deleted");
          res.redirect("/campgrounds/"+ req.params.id);
      }
   });
});
//-----------------EXPORT ROUTER------------------------
    module.exports = router;