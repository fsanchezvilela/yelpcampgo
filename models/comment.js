var mongoose = require("mongoose");
var commentSchema = mongoose.Schema({
   text: String,
   createdAt:{type:Date, default: Date.now},
   // Associations por referencia pasar id y asociar usuario a db. luego salvar y mostrar
   author: {
      id:{
          type: mongoose.Schema.Types.ObjectId, // relacionar bases de datos con los usuarions por asociacion
          ref: "User"
      },
      username: String
   }
});


module.exports = mongoose.model("Comment", commentSchema);