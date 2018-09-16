var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
    {
    name:"Cloud's Rest", 
    image: "https://cdn-media-1.lifehack.org/wp-content/files/2016/11/18234422/tent-1208201_1280-1024x682.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dapibus ex non sapien placerat gravida. Nunc vitae velit velit. Mauris sodales velit eu odio ullamcorper, sit amet imperdiet ipsum dictum. Aenean eget mauris est. Phasellus sodales elit arcu, faucibus sollicitudin odio ultrices quis. Quisque mollis lobortis vestibulum. Nam interdum, ex a gravida facilisis, arcu erat tincidunt orci, in blandit purus mi a odio. Duis porta quis mauris quis malesuada. Nam sit amet nunc blandit, aliquet risus eu, posuere nisi. Morbi vitae suscipit nunc. In cursus risus blandit ipsum hendrerit pellentesque."    
    },
    
    {
    name:"Granite Hill", 
    image: "http://www.leregolediv.it/wp-content/uploads/2017/04/galateo-del-campeggio.jpg",
    description: "Beauty Landscape with a river and a big Granite mountain. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dapibus ex non sapien placerat gravida. Nunc vitae velit velit. Mauris sodales velit eu odio ullamcorper, sit amet imperdiet ipsum dictum. Aenean eget mauris est. Phasellus sodales elit arcu, faucibus sollicitudin odio ultrices quis. Quisque mollis lobortis vestibulum. Nam interdum, ex a gravida facilisis, arcu erat tincidunt orci, in blandit purus mi a odio. Duis porta quis mauris quis malesuada. Nam sit amet nunc blandit, aliquet risus eu, posuere nisi. Morbi vitae suscipit nunc. In cursus risus blandit ipsum hendrerit pellentesque."    
    },
    
    {
    name:"King Hill", 
    image: "https://photos.smugmug.com/Gallery/Mountain-Life/i-R8k2Bwx/0/16769d32/L/MountainLife-1-L.jpg",
    description: "One of the best Hills in Spain. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dapibus ex non sapien placerat gravida. Nunc vitae velit velit. Mauris sodales velit eu odio ullamcorper, sit amet imperdiet ipsum dictum. Aenean eget mauris est. Phasellus sodales elit arcu, faucibus sollicitudin odio ultrices quis. Quisque mollis lobortis vestibulum. Nam interdum, ex a gravida facilisis, arcu erat tincidunt orci, in blandit purus mi a odio. Duis porta quis mauris quis malesuada. Nam sit amet nunc blandit, aliquet risus eu, posuere nisi. Morbi vitae suscipit nunc. In cursus risus blandit ipsum hendrerit pellentesque."    
    }
];

function seedDB(){
    //Wipe all campgrounds
    Campground.remove({},function(err){
        if(err){
            console.log(err);
        } else {
            console.log("removed campgrounds!"); 
            //add a few campgrounds
            data.forEach(function(seed){
              Campground.create(seed, function(err, campground){
                  if(err){
                      console.log(err);
                  } else {
                      console.log("added a campground");
                      //Create a comment // add a few comments
                      Comment.create(
                          {
                              text:"This place is great, but i wish there was internet",
                              author:"Homer"
                          }, function(err,comment){
                              if(err){
                                  console.log(err);
                              } else {
                              campground.comments.push(comment);
                              campground.save();
                              console.log("Created new Comment");
                              }
                          });
                    }
                });   
            });        
        }
    });
}

module.exports = seedDB;