const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(
  async (request, response, next) => {
    const reviews = await Review.find();

    response.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

exports.createReview = catchAsync(async (request, response, next) => {
  // Allow nested routes
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;
  const newReview = await Review.create(request.body);

  response.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
