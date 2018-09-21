// all the middleware goes here
var middlewareObj = {};
var Campground    = require("../models/campground");
var Comment       = require("../models/comment");

//funcion middleware para autorizar al usuario a hacer algun post o evento. {
middlewareObj.checkCampgroundOwnership = function(req, res, next){
//comprobar si esta log in
    if(req.isAuthenticated()){
    // encontrar el id en la base de datos si ambos user id son iguales
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){ //evitar crash si harcodeas el id
              req.flash("error","Campground not found");
              res.redirect("back");
            } else {
            //autorizacion ya que son iguales
                if(foundCampground.author.id.equals(req.user._id)||req.user.isAdmin){ //comparar mongoose objetct con un string id or si es admin
                    next();
                } else {
                    req.flash("error", "You don't have permision to do that");
                    res.redirect("back");
                }
            }
        });
    // redirrect si no esta log in
    } else {
    // si no esta atenticado redirect a la pagina anterior 
       req.flash("error", "You need to be logged in to do that");
       res.redirect("back");
    }
};

// funcion middleware para authorizar y checkear si el comentario pertenece al usuario
middlewareObj.checkCommentOwnership = function(req,res,next){
    //comprobar si esta log in
    if(req.isAuthenticated()){
    // encontrar el id en la base de datos si ambos user id son iguales
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
               req.flash("error", "Comment not found");
               res.redirect("back");
            } else {
            //autorizacion ya que son iguales
               if(foundComment.author.id.equals(req.user._id)||req.user.isAdmin){ //comparar mongoose objetct con un string id o si es admin
                  next();
               } else {
                  req.flash("error", "You don't have permission to do that");
                  res.redirect("back");
               }
            }
        });
        // redirrect si no esta log in
    } else {
    // si no esta atenticado redirect a la pagina anterior 
        req.flash("error","You need to be login to do that.");
        res.redirect("back");
    }
};

//funcion middleware para que los usuarios que no esten login no comenten
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
        req.flash("error", "You need to be logged in to do that"); //before always porque se guarda para el siguiente display
        res.redirect("/login");
}; 
//----------------------------------------------------------------------------
module.exports = middlewareObj;