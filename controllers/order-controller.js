const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Order = require('../models').Order;
const OrderLine = require('../models').OrderLine;
module.exports = {
    getAll(req, res) {
        Order.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        }).then((orders) => {
            if (!orders || orders.length == 0) {
                return res.status(404).end()
            }
            return res.status(200).send(orders)
        }).catch((error) => res.status(500).send(error));
    },
    createOrder(req, res) {
        if (!req.body.products) {
            return res.status(400).send();
        }
        Order.create({
            dateReceived: new Date()
        }).then((orderCreated) => {
            if (!orderCreated) {
                return res.status(500).send();
            }
            let arrayOfPromises = [];
            let products = [];
            products = req.body.products;
            products.forEach(p => {
                arrayOfPromises.push(createOrderLine(p, orderCreated));
            })
            Promise.all(arrayOfPromises).then(() => {
                return res.status(201).send(orderCreated);
            }).catch(error => res.status(500).send(error));
        }).catch((error) => res.status(500).send(error));
    }
}

let createOrderLine = (product, order) => {
    return new Promise((resolve, reject) => {
        OrderLine.create({
            quantity: product.quantity,
            idProduct: product.id,
            idOrder: order.id
        }).then((oLCreated) => {
            if (!oLCreated) {
                reject();
            }
            resolve(oLCreated);
        })
            .catch(() => reject());
    });
}