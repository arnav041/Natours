/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true
    },
    slug: String,
    durations: {
        type: Number,
        require: [true, 'Tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour must have a group size']
    },
    difficult: {
        type: String,
        require: [true, 'Tour must have difficult']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 5
    },
    price: {
        type: Number,
        required: [true, 'Tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour must have summary']
    },
    duration: {
        type: Number,
        required: [true, 'Tour must have duration']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour must have difficulty']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'Tour must have cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date], 
    secretTour: {
        type: Boolean, 
        default: false
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7
})

// Document : Middleware
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true})
    console.log(this)
    next();
})

// Query: Middleware
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true}})
    this.start = Date.now()
    next();
})

tourSchema.post(/^find/, function(next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
    next()
})

tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({$match : {secretTour: {$ne : true}}})
    console.log(this)
    next()
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
