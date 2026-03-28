const Product = require('../models/Product');

// @desc    Get all active products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};
        
        if (category && category !== 'All') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query);
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        
        // Filter reviews: Admin sees all, Public sees approved + their own pending review
        const isAdmin = req.query.view === 'admin';
        const userId = req.user?._id?.toString();
        
        let reviewList = product.reviews;

        if (!isAdmin) {
            reviewList = product.reviews.filter(r => 
                r.isApproved || (userId && r.user?.toString() === userId)
            );
        }

        // Create a copy to avoid mongoose internal issues when modifying array for response
        const productData = product.toObject();
        productData.reviews = reviewList;

        res.status(200).json({ success: true, data: productData });
    } catch (err) {
        res.status(500).json({ success: false, message: "Invalid Product ID or Error" });
    }
};

// @desc    Get all products (Admin)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        await product.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Product already reviewed' });
        }

        const review = {
            name: req.user.name,
            avatar: req.user.avatar || '',
            rating: Number(rating),
            comment,
            user: req.user._id
        };

        product.reviews.push(review);
        // Do not update numReviews and rating until approved
        
        await product.save();
        res.status(201).json({ success: true, message: 'Review added and is pending approval' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete product review (Admin)
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteProductReview = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const reviewIndex = product.reviews.findIndex(
            (r) => r._id.toString() === req.params.reviewId
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        product.reviews.splice(reviewIndex, 1);
        
        const approvedReviews = product.reviews.filter(r => r.isApproved);
        product.numReviews = approvedReviews.length;
        
        if (product.numReviews > 0) {
            product.rating = approvedReviews.reduce((acc, item) => item.rating + acc, 0) / product.numReviews;
        } else {
            product.rating = 0;
        }

        await product.save();
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Approve product review
// @route   PUT /api/products/:id/reviews/:reviewId/approve
// @access  Private/Admin
const approveProductReview = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const review = product.reviews.find(
            (r) => r._id.toString() === req.params.reviewId
        );

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.isApproved = true;

        const approvedReviews = product.reviews.filter(r => r.isApproved);
        product.numReviews = approvedReviews.length;
        product.rating = approvedReviews.reduce((acc, item) => item.rating + acc, 0) / product.numReviews;

        await product.save();
        res.status(200).json({ success: true, message: 'Review approved' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    deleteProductReview,
    approveProductReview
};
