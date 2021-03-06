// const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures')

// exports.checkBody = (req, res, next) => {
//   const { name, price } = req.body;

//   if (!(name && price)) {
//     return res.status(400).json({
//       status: 'fail',
//       message: `Missing name or price`,
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}



exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // { duration: { '$gte': '5' }, difficulty: 'easy' }
    // { duration: { gte: '5' }, difficulty: 'easy' }

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy')

    // RESPONSE SENT
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour(req.body);
  // newTour.save()
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data',
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete({ _id: req.params.id });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      // {
      //   $match: {ratingsAverage: {$gte: 4.5}}
      // },
      {
        $group: {
          _id: '$difficulty',
          numTours : {$sum: 1},
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price'},
          minPrice: {$min : '$price'},
          maxPrice: {$max : '$price'},
        }
      }, 
      {
        $sort: {
          avgPrice: 1 // sort by average price in ascending order
        }
      }, 
      // {
      //   $match: {_id: {$ne : 'easy'}} // we can match multiple times
      // }
    ])

    res.status(200).json({
      status: 'success', 
      data: {
        stats
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
}

exports.getMonthlyPlan = async (req,res) => {
  try {
    const year = req.params.year * 1;
    
    const plan = await Tour.aggregate([
      {
        $unwind : '$startDates'
      }, 
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {$month: '$startDates'}, 
          numTourStarts: {$sum : 1},
          tours: {$push: '$name'}
        } 
      }, 
      {
        $addFields: {month : '$_id'}
      },
      {
        $project: {_id : 0}
      }, 
      {
        $sort: {numTourStarts: -1}
      }, 
      // {
      //   $limit: 12
      // }

    ])

    res.status(200).json({
      status: 'success', 
      data: {
        plan
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
}