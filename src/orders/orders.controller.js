const path = require("path");
const { resourceLimits } = require("worker_threads");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// validations

function orderExists(req, res, next) {
    const {orderId} = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if(foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`,
    });
};

function deliverToPropertyIsValid(req, res, next) {
    const {data: {deliverTo} ={}} = req.body;

    if(deliverTo) {
        return next();
    }

    next({
        status: 400,
        message: "Order must include a deliverTo",
    });
}

function mobileNumberPropertyIsValid(req, res, next) {
    const {data: {mobileNumber} = {}} = req.body;

    if(mobileNumber) {
        return next();
    }
    next({
        status: 400,
        message: "Order must include a mobileNumber",
    });
}

function dishesPropertyIsValid(req, res, next){
    const {data: {dishes} ={}} = req.body;
    if(!dishes) {
        next({
            status: 400,
            message: "Order must include a dish",
        });
    } else if (!Array.isArray(dishes) || dishes.length === 0){
        next({
            status: 400,
            message: "Order must include at least one dish",
        });
    }
    return next();
}

function dishesQuantityPropertyIsValid(req, res, next){
    const {data: {dishes} ={}} = req.body;
    const index = dishes.findIndex((dish) => !dish.quantity || !Number.isInteger(dish.quantity));

    if (index >=0) {
        next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0`
        })
    }

    return next();
}

function statusPropertyIsValid(req, res, next) {
    const {data: {status} = {}} = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if(validStatus.includes(status)){
        return next();
    }
    next({
        status: 400,
        message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    })
}

function statusPropertyIsPending(req, res, next) {
  const {order} = res.locals;
  if(order.status === "pending"){
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending"
  });
    
}

// CRUDL

function list(req, res) {
    res.json({data: orders});
  }

function create(req, res, next){
    const {data: {deliverTo, mobileNumber, dishes} = {}} = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({data: newOrder});
}

function read(req, res, next) {
 res.json({data: res.locals.order});
};

function update(req, res, next) {
    const {data: {id, deliverTo, mobileNumber, status, dishes} = {}} = req.body;
    const {orderId} = req.params;

    if(!id || orderId === id) {
        const updateOrder = {
        //update the order
        id: orderId,
        deliverTo,
        mobileNumber,
        dishes,
        status,
        };
    
        res.json({data: updateOrder})
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });

}

function destroy(req, res, next) {
 const {orderId} = req.params;
 const index = orders.findIndex((order) => order.id === orderId);
 // `splice()` returns an array of the deleted elements, even if it is one element
 const deletedOrders = orders.splice(index, 1);
 res.sendStatus(204);
}

module.exports = {
    create: [
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        dishesPropertyIsValid,
        dishesQuantityPropertyIsValid,
        create,
    ],
    read: [orderExists, read],
    update: [
        orderExists,
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        dishesPropertyIsValid,
        dishesQuantityPropertyIsValid,
        statusPropertyIsValid,
        update,
    ],
    delete: [orderExists, statusPropertyIsPending, destroy],
    list,
};