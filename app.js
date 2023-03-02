const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database Connection
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB", function (err) {
  if (err) {
    console.log("Connection Problem");
  } else {
    console.log("Connected Database");
  }
});

const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item = [
  {
    name: "Wellcome To you ToDoList",
  },
  {
    name: "Prese the + add more you List",
  },
  {
    name: "<-- hit this delete remove the data",
  },
];



// Find Percoluer data in the database

// Item.findOne({_id: ("63f500e11d05406d025fa2a6")}, (err, result) =>{
//   if(err){
//     console.log(err.message);
//   }else{
//     console.log(result);
//   }
// });
// Request Route file
app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(item, (err) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log("Data Inserted SuccessFully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, (err, foundItem)=> {
       foundItem.items.push(item);
       foundItem.save();
       res.redirect("/" + listName);
    });
  }
  

});

app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId, (err) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Successfully deleted the item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, (err, foundItemId)=> {
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
  
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) =>{
    if(!err){
      if(!foundList){
        // Create a new list
        const list = new List({
          name: customListName,
          items: item,
        });
        list.save();
        res.redirect("/" + customListName);
      }else {
        // Show exising data
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });
  
  
});

//   app.get("/work", function(req,res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
//   });

//   app.get("/about", function(req, res){
//     res.render("about");
//   });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
