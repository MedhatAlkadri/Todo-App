//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const app = express();
const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
};
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List "
});

const item2 = new Item({
  name: "Press + to add New Task"
});

const item3 = new Item({
  name: "Press - to Delete a Task"
});



const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, found) {
    items = found;


    if (found.length === 0) {
      const defaultItems = [item1, item2, item3];

      Item.insertMany(defaultItems, function(err) {});
      res.redirect("/");
    };
    res.render("list", {
      listTitle: day,
      newListItems: items
    });
  });
});

app.post("/", function(req, res) {

  const list = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  if (list === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: list
    }, function(err, founds) {
      founds.items.push(item);
      founds.save();
      res.redirect("/" + list);
    })
  }

});

app.post("/delete", function(req, res) {
  const checkedBoxId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === day) {
    Item.findByIdAndRemove(checkedBoxId, function(err) {});
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedBoxId
        }
      }
    }, function(err, founds) {
      res.redirect("/" + listName);
    })
  }

})

app.get("/:customListName", function(req, res) {
  const defaultItems = [item1, item2, item3];
  const customList = _.capitalize(req.params.customListName);

  List.findOne({
    name: customList
  }, function(err, results) {
    if (results === null) {
      const list = new List({
        name: customList,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customList);
    } else {
      res.render("list", {
        listTitle: results.name,
        newListItems: results.items
      });
    }
  })


});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port==null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started Successfully.");
});
