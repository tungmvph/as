const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
        
    },
    price: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },  
     ma:{
        type: String,
        required: true
    },
    namekh:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);