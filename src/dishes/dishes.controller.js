const { match } = require("assert");
const { pseudoRandomBytes } = require("crypto");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// validations

function namePropertyIsValid(req, res, next){
    const {data: {name} = {}} = req.body;
    if(name){
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a name",
    });
}

function descriptionPropertyIsValid(req, res, next){
    const {data: {description} ={}} = req.body;
    if(description){
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a description",
    });
}

function pricePropertyIsValid(req, res, next) {
    const { data: { price } = {} } = req.body;
  
    if (!price) {
      next({
        status: 400,
        message: "Dish must include a price",
      });
    } else if (price <= 0 || typeof price != "number") {
      next({
        status: 400,
        message: "Dish must hav a price that is an integer greater than 0",
      });
    }
  
    return next();
  }

function imagePropertyIsValid(req, res, next){
    const {data: {image_url} ={}} = req.body;
    if(image_url){
        return next();
    }
    next({
        status: 400,
        message: "Dish must include an image_url",
    })
}

function dishExists(req, res, next) {
    const {dishId} = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if(foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`,
    });
};

// CRUDL

function list(req, res, next) {
    res.json({data: dishes})
}

function create(req, res, next){
    const {data: {name, description, price, image_url} = {}} = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish});
}


function read(req, res, next) {
    res.json({data: res.locals.dish});
};

function update(req, res, next) {
 const {dishId} = req.params;
 const {data: {id, name, description, price, image_url} ={}} = req.body;
 if(!id || dishId === id) {
    const updateDish = {
        id: dishId,
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    };
    res.json({data: updateDish});
 }
 next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
 })
}

function destroy(req, res, next) {
    const {dishId} = req.params;
    const index = dishes.findIndex((dish) => dish.id === Number(dishId));
    // `splice()` returns an array of the deleted elements, even if it is not one element
    const deletedDishes = dishes.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
 create: [
    namePropertyIsValid,
    descriptionPropertyIsValid,
    pricePropertyIsValid,
    imagePropertyIsValid,
    create
 ],
 read: [dishExists, read],
 update: [
    dishExists,
    namePropertyIsValid,
    descriptionPropertyIsValid,
    pricePropertyIsValid,
    imagePropertyIsValid,
    update
 ],
 list,
};




