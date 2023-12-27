const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const mongoose=require('mongoose')


router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList) {
      res.status(404).json({
        success: false,
        error: "No category found",
      });
    }
    res.status(200).send(categoryList);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const catByid = await Category.findById(req.params.id);
    if (!catByid) {
      res.status(404).json({
        success: false,
        message: "No category found",
      });
    }
    res.status(200).send(catByid);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      color: req.body.color,
      icon: req.body.icon,
      image: req.body.image,
    });
    const newCategory = await category.save();
    if (!newCategory) {
      res.status(404).send({
        success: false,
        error: "Category cannnot be created",
      });
    }
    res.status(201).send(newCategory);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      error: err,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if(!mongoose.isValidObjectId(req.params.id)){
      res.status(400).json({
        success : false,
        error : 'Id not found'
      })
    }
    const categoryUp = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      {
        new: true,
      }
    );
    if (!categoryUp) {
      res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    res.status(200).send(categoryUp);
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const delCategory = await Category.findByIdAndDelete(req.params.id);
    if (!delCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Category is deleted",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

module.exports = router;
