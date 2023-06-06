const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, {
  path: 'reviews',
});

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  response.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(
  async (request, response, next) => {
    const year = request.params.year * 1;

    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    response.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  }
);

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-distance/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(
  async (request, response, next) => {
    const { distance, latlng, unit } = request.params;
    const [lat, lng] = latlng.split(',');

    const radius =
      unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.'
        ),
        400
      );
    }

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    console.log(distance, lat, lng, unit);
    response.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  }
);
