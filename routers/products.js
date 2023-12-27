const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const Category = require("../models/category");
const { mongoose } = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// copied from documentation such that eery file name is unique
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, '/tmp/my-uploads')
    //  VALIDATION CHECK
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    // way of naming a file
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)

    const filename = file.originalname.replace(" ", "-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    const product = await Product.find(filter).populate("category");
    if (!product) {
      res.status(401).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

// Displays only name and image
router.get("/name/img", async (req, res) => {
  try {
    const product = await Product.find().select("name image");
    if (!product) {
      res.status(401).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(401).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.post(`/`, upload.single("image"), async (req, res) => {
  try {
    const cat = await Category.findById(req.body.category);
    if (!cat) {
      res.status(400).json({
        success: false,
        error: "Category not found",
      });
    }
    const file = req.file;
    if (!file) {
      res.status(400).send("No file found");
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      //  For full path -> http://localhost:3000/public/images-2456
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    const newProduct = await product.save();
    if (!newProduct) {
      res.status(500).json({
        success: false,
        error: "Product cannot be created",
      });
    }
    res.status(201).send(newProduct);
  } catch (err) {
    console.log(err);
    res.status(501).json({
      error: err,
      success: false,
    });
  }

  // product.save().then((createdProduct=>{
  //         res.status(201).json(createdProduct)
  //     })).catch((err)=>{
  //         res.status(501).json({
  //             error : err,
  //             success : false
  //         })
  //     })
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      res.status(400).json({
        success: false,
        error: "No category found related to product",
      });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        error: "No product found",
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      {
        new: true,
      }
    );
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err,
    });
  }
});

// count number of doccumnets
router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments({});
    if (!productCount) {
      res.status(400).json({
        success: false,
        message: "Ther are no products",
      });
    } else {
      res.status(200).json({
        success: true,
        productCount: productCount,
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

// router.get('/get/featured', async (req, res) => {
//   try {
//     const product = await Product.find({isFeatured : true}).populate('category');
//     if (!product) {
//       res.status(400).json({
//         success: false,
//         message: "Ther are no products",
//       });
//     } else {
//       res.status(200).send(product)
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// });

// in addition to this if u need limited feaurd product pass count along with url

router.get("/get/featured/:count?", async (req, res) => {
  // count? -> if no count is given then also it will work
  try {
    const count = req.params.count || 0;
    const product = await Product.find({ isFeatured: true })
      .populate("category")
      .limit(+count);
    // +count -> convert to int
    if (!product) {
      res.status(400).json({
        success: false,
        message: "Ther are no products",
      });
    } else {
      res.status(200).send(product);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.put(
  "/get/gallery-images/:id",
  upload.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        error: "No product found",
      });
    }
    const files = req.files;
    if (!files) {
      res.status(400).send("No image found");
    }
    const imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      {
        new: true,
      }
    );
    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).send(product);
  }
);

module.exports = router;
