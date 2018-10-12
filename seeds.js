
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user"); 
var seeds = [
    {
    name:"Granite Hill", 
    image: "http://www.leregolediv.it/wp-content/uploads/2017/04/galateo-del-campeggio.jpg",
    description: "Beauty Landscape with a river and a big Granite mountain.",
    location:"madrid",
    lat: 0,
    lng: 0,
    price:"4",
    username: "Admin",
    password: "Admin",
    avatar: "https://support.plymouth.edu/kb_images/Yammer/default.jpeg",
    firstName:"Admin",
    lastName:"Admin",
    email:"admin@admin.com",
    isAdmin: true,
    }
    
    
];

async function seedDB(){
 try{
    await User.remove({});
    console.log("Remove all user");
      //Wipe all campgrounds
   await Campground.remove({});
   console.log("Campgrounds remove");
    //Wipe all de comments
   await Comment.remove({});
   console.log("Comments removed");
    
        for(const seed of seeds){
            let campground = await Campground.create(seed);
            console.log("Campground created");
            let comment = await Comment.create(
                {
                    
                    text:'This place is great, but i wish there was internet',
                    
                }
                            
            );
    campground.comments.push(comment);
    campground.save();
    console.log("Comment added to campground");
    
    }  
 } catch(err){
     console.log(err);   
    }
    
}
module.exports = seedDB;