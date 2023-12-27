const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/products");

router.get("/", async (req, res) => {
  try {
    const OrderList = await Order.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });
    if (!OrderList) {
      res.status(400).send("No orders found");
    }
    res.status(200).send(OrderList);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error);
  }
});

router.get("/get/userorders/:userid", async (req, res) => {
  try {
    const orderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderitems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });
    if (!orderList) {
      res.status(400).send("No order found");
    }
    res.status(200).send(orderList);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderitems",
        populate: {
          path: "product",
          populate: "category",
        },
      });
    if (!order) {
      res.status(400).send("Product not found");
    }
    res.status(200).send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/", async (req, res) => {
  try {
    let orderItemIds = await Promise.all(
      req.body.orderitems.map(async (orderItem) => {
        let newOrder = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        newOrder = await newOrder.save();
        return newOrder._id;
      })
    );
    let totalPrices = await Promise.all(
      orderItemIds.map(async (orderItemId) => {
        const order = await OrderItem.findById(orderItemId);
        const product = await Product.findById(order.product);
        const totalPrice = order.quantity * product.price;
        return totalPrice;
      })
    );
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    let order = new Order({
      orderitems: orderItemIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });
    order = await order.save();
    if (!order) {
      res.status(400).send("Not able to place order");
    }
    res.status(200).send(order);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );
    if (!order) {
      return res.status(400).send("order not found");
    }
    res.status(200).send(order);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(401).send("No order found");
    }
    await Promise.all(
      order.orderitems.map(async (orderitem) => {
        await OrderItem.findByIdAndDelete(orderitem);
      })
    );
    res.status(200).send("Order deleted");
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
      // cannot remove _id as mongoose cannot work without _id
    ]);
    if (!totalSales) {
      res.status(400).send("No sales found");
    }
    res.status(200).send({ totalSales: totalSales.pop().totalSales });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments({});
    if (!orderCount) {
      res.status(400).json({
        success: false,
        message: "Ther are no orders",
      });
    } else {
      res.status(200).json({
        success: true,
        orderCount: orderCount,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
