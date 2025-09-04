const express = require('express');
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const Review = require('../models/Review');

const router = express.Router();

// @route   GET /api/cars
// @desc    Get all cars with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      category,
      minPrice,
      maxPrice,
      brand,
      transmission,
      fuelType,
      availability = true,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (location) filter.location = new RegExp(location, 'i');
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (availability !== undefined) filter.availability = availability === 'true';

    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const cars = await Car.find(filter)
      .populate('owner', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Car.countDocuments(filter);

    res.json({
      cars,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error while fetching cars' });
  }
});

// @route   GET /api/cars/:id
// @desc    Get single car by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('owner', 'name email phone')
      .select('-__v');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error('Get car error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid car ID' });
    }
    res.status(500).json({ message: 'Server error while fetching car' });
  }
});

// @route   POST /api/cars
// @desc    Create a new car
// @access  Private (would require auth middleware)
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Car name must be 2-100 characters'),
  body('brand').trim().isLength({ min: 1 }).withMessage('Brand is required'),
  body('model').trim().isLength({ min: 1 }).withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'truck', 'van', 'luxury']).withMessage('Invalid category'),
  body('transmission').isIn(['manual', 'automatic']).withMessage('Invalid transmission type'),
  body('fuelType').isIn(['petrol', 'diesel', 'electric', 'hybrid']).withMessage('Invalid fuel type'),
  body('seats').isInt({ min: 1, max: 9 }).withMessage('Seats must be between 1-9'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const carData = { ...req.body };

    // In a real app, you'd get owner from authenticated user
    // carData.owner = req.user.id;

    const car = new Car(carData);
    await car.save();

    await car.populate('owner', 'name email');

    res.status(201).json({
      message: 'Car created successfully',
      car
    });
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({ message: 'Server error while creating car' });
  }
});

// @route   PUT /api/cars/:id
// @desc    Update a car
// @access  Private (would require auth middleware and ownership check)
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Car name must be 2-100 characters'),
  body('pricePerDay').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'truck', 'van', 'luxury']).withMessage('Invalid category'),
  body('transmission').optional().isIn(['manual', 'automatic']).withMessage('Invalid transmission type'),
  body('fuelType').optional().isIn(['petrol', 'diesel', 'electric', 'hybrid']).withMessage('Invalid fuel type'),
  body('seats').optional().isInt({ min: 1, max: 9 }).withMessage('Seats must be between 1-9')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // In a real app, check if user owns the car
    // if (car.owner.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized to update this car' });
    // }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      message: 'Car updated successfully',
      car: updatedCar
    });
  } catch (error) {
    console.error('Update car error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid car ID' });
    }
    res.status(500).json({ message: 'Server error while updating car' });
  }
});

// @route   DELETE /api/cars/:id
// @desc    Delete a car (soft delete)
// @access  Private (would require auth middleware and ownership check)
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // In a real app, check if user owns the car
    // if (car.owner.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized to delete this car' });
    // }

    // Soft delete
    car.isActive = false;
    await car.save();

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid car ID' });
    }
    res.status(500).json({ message: 'Server error while deleting car' });
  }
});

// @route   GET /api/cars/search/:query
// @desc    Search cars by name, brand, or model
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, includeReviews = false } = req.query;

    const cars = await Car.find({
      isActive: true,
      $or: [
        { name: new RegExp(query, 'i') },
        { brand: new RegExp(query, 'i') },
        { model: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { location: new RegExp(query, 'i') }
      ]
    })
    .populate('owner', 'name')
    .limit(parseInt(limit))
    .select('name brand model pricePerDay images location rating category');

    // Include review stats if requested
    if (includeReviews === 'true') {
      const carsWithReviews = await Promise.all(
        cars.map(async (car) => {
          const reviewStats = await Review.getAverageRating('car', car._id);
          return {
            ...car.toObject(),
            reviewStats
          };
        })
      );
      return res.json(carsWithReviews);
    }

    res.json(cars);
  } catch (error) {
    console.error('Search cars error:', error);
    res.status(500).json({ message: 'Server error while searching cars' });
  }
});

// @route   GET /api/cars/advanced-search
// @desc    Advanced search with multiple filters
// @access  Public
router.get('/advanced-search', async (req, res) => {
  try {
    const {
      query,
      location,
      category,
      minPrice,
      maxPrice,
      brand,
      transmission,
      fuelType,
      minYear,
      maxYear,
      minSeats,
      maxSeats,
      features,
      availability = true,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      includeReviews = false
    } = req.query;

    // Build complex filter object
    const filter = { isActive: true };

    // Text search across multiple fields
    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { brand: new RegExp(query, 'i') },
        { model: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { location: new RegExp(query, 'i') }
      ];
    }

    // Location filter
    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    // Brand filter
    if (brand) {
      filter.brand = new RegExp(brand, 'i');
    }

    // Transmission filter
    if (transmission) {
      filter.transmission = transmission;
    }

    // Fuel type filter
    if (fuelType) {
      filter.fuelType = fuelType;
    }

    // Year range filter
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }

    // Seats range filter
    if (minSeats || maxSeats) {
      filter.seats = {};
      if (minSeats) filter.seats.$gte = Number(minSeats);
      if (maxSeats) filter.seats.$lte = Number(maxSeats);
    }

    // Features filter (array contains)
    if (features) {
      const featuresArray = Array.isArray(features) ? features : [features];
      filter.features = { $in: featuresArray };
    }

    // Availability filter
    if (availability !== undefined) {
      filter.availability = availability === 'true';
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price':
        sort.pricePerDay = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'rating':
        sort.rating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'year':
        sort.year = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'popularity':
        sort.bookingCount = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'relevance':
      default:
        if (query) {
          // For text search, sort by relevance (exact matches first)
          sort = { score: { $meta: 'textScore' } };
        } else {
          sort.createdAt = sortOrder === 'desc' ? -1 : 1;
        }
        break;
    }

    // Execute query with pagination
    let carsQuery = Car.find(filter)
      .populate('owner', 'name email rating')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add text score if doing text search
    if (query && sortBy === 'relevance') {
      carsQuery = carsQuery.select({ score: { $meta: 'textScore' } });
    }

    const cars = await carsQuery;
    const total = await Car.countDocuments(filter);

    // Include review stats if requested
    let carsWithStats = cars;
    if (includeReviews === 'true') {
      carsWithStats = await Promise.all(
        cars.map(async (car) => {
          const reviewStats = await Review.getAverageRating('car', car._id);
          return {
            ...car.toObject(),
            reviewStats
          };
        })
      );
    }

    // Get filter options for frontend
    const filterOptions = await getFilterOptions();

    res.json({
      cars: carsWithStats,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: filterOptions,
      appliedFilters: {
        query,
        location,
        category,
        minPrice,
        maxPrice,
        brand,
        transmission,
        fuelType,
        minYear,
        maxYear,
        minSeats,
        maxSeats,
        features,
        availability
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ message: 'Server error while performing advanced search' });
  }
});

// @route   GET /api/cars/filter-options
// @desc    Get available filter options
// @access  Public
router.get('/filter-options', async (req, res) => {
  try {
    const options = await getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ message: 'Server error while fetching filter options' });
  }
});

// Helper function to get filter options
async function getFilterOptions() {
  try {
    const [
      brands,
      categories,
      transmissions,
      fuelTypes,
      locations,
      features
    ] = await Promise.all([
      Car.distinct('brand', { isActive: true }),
      Car.distinct('category', { isActive: true }),
      Car.distinct('transmission', { isActive: true }),
      Car.distinct('fuelType', { isActive: true }),
      Car.distinct('location', { isActive: true }),
      Car.distinct('features', { isActive: true })
    ]);

    // Get price range
    const priceStats = await Car.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricePerDay' },
          maxPrice: { $max: '$pricePerDay' }
        }
      }
    ]);

    // Get year range
    const yearStats = await Car.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minYear: { $min: '$year' },
          maxYear: { $max: '$year' }
        }
      }
    ]);

    // Get seats range
    const seatsStats = await Car.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minSeats: { $min: '$seats' },
          maxSeats: { $max: '$seats' }
        }
      }
    ]);

    return {
      brands: brands.sort(),
      categories: categories.sort(),
      transmissions: transmissions.sort(),
      fuelTypes: fuelTypes.sort(),
      locations: locations.sort(),
      features: features.flat().filter((v, i, a) => a.indexOf(v) === i).sort(),
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 1000 },
      yearRange: yearStats[0] || { minYear: 2000, maxYear: new Date().getFullYear() },
      seatsRange: seatsStats[0] || { minSeats: 1, maxSeats: 9 }
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {};
  }
}

module.exports = router;
