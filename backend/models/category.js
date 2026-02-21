import mongoose from 'mongoose';

/**
 * Category Model - Main learning domains
 * Examples: Web Development, AI/ML, Cybersecurity, etc.
 */

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Category name must be at least 2 characters'],
            maxlength: [100, 'Category name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        icon: {
            type: String,
            default: '📚',
        },
        color: {
            type: String,
            default: '#3B82F6', // Blue
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
// Note: 'name' already has index from unique: true
categorySchema.index({ isActive: 1, order: 1 });

// Static method to get all active categories
categorySchema.statics.getActiveCategories = async function () {
    return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
