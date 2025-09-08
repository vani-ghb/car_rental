const mongoose = require('mongoose');
require('dotenv').config();
const Car = require('./models/Car');

// Car data to seed into database
const carsData = [
  {
    name: "Toyota Camry",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    pricePerDay: 45,
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    seats: 5,
    fuelType: "petrol",
    transmission: "automatic",
    category: "sedan",
    features: ["Air Conditioning", "GPS Navigation", "Bluetooth"],
    location: "Downtown Branch",
    availability: true,
    description: "Comfortable and reliable sedan perfect for city driving",
    owner: "507f1f77bcf86cd799439011" // Placeholder owner ID
  },
  {
    name: "Honda Civic",
    brand: "Honda",
    model: "Civic",
    year: 2023,
    pricePerDay: 40,
    images: ["https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    seats: 5,
    fuelType: "petrol",
    transmission: "automatic",
    category: "sedan",
    features: ["Sunroof", "Backup Camera", "Keyless Entry"],
    location: "Airport Branch",
    availability: true,
    description: "Sporty and efficient compact car ideal for airport transfers",
    owner: "507f1f77bcf86cd799439011"
  },
  {
    name: "BMW 3 Series",
    brand: "BMW",
    model: "3 Series",
    year: 2023,
    pricePerDay: 75,
    images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    seats: 5,
    fuelType: "petrol",
    transmission: "automatic",
    category: "luxury",
    features: ["Leather Seats", "Premium Sound", "Parking Sensors"],
    location: "City Center",
    availability: false,
    description: "Luxury sedan with premium features and exceptional performance",
    owner: "507f1f77bcf86cd799439011"
  },
  {
    name: "Ford Mustang",
    brand: "Ford",
    model: "Mustang",
    year: 2023,
    pricePerDay: 85,
    images: ["https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    seats: 4,
    fuelType: "petrol",
    transmission: "automatic",
    category: "coupe",
    features: ["Convertible", "Sport Mode", "Premium Wheels"],
    location: "Beach Branch",
    availability: true,
    description: "Iconic American muscle car for an unforgettable driving experience",
    owner: "507f1f77bcf86cd799439011"
  },
  {
    name: "Toyota RAV4",
    brand: "Toyota",
    model: "RAV4",
    year: 2023,
    pricePerDay: 55,
    images: ["https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    seats: 5,
    fuelType: "hybrid",
    transmission: "automatic",
    category: "suv",
    features: ["All-Wheel Drive", "Roof Rack", "Spacious Interior"],
    location: "Mountain Branch",
    availability: true,
    description: "Versatile SUV perfect for mountain adventures and family trips",
    owner: "507f1f77bcf86cd799439011"
  },
  {
    name: "Mercedes C-Class",
    brand: "Mercedes",
    model: "C-Class",
    year: 2023,
    pricePerDay: 90,
    images: ["https://images.unsplash.com/photo-1563720223880-4d93eef1f1c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    seats: 5,
    fuelType: "petrol",
    transmission: "automatic",
    category: "luxury",
    features: ["Premium Interior", "Advanced Safety", "LED Headlights"],
    location: "Luxury Branch",
    availability: true,
    description: "Executive luxury sedan with cutting-edge technology and comfort",
    owner: "507f1f77bcf86cd799439011"
  }
];

async function seedCars() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing cars
    await Car.deleteMany({});
    console.log('🗑️ Cleared existing cars');

    // Insert new cars
    const insertedCars = await Car.insertMany(carsData);
    console.log(`✅ Successfully seeded ${insertedCars.length} cars into database`);

    // Display inserted cars
    console.log('\n📋 Seeded Cars:');
    insertedCars.forEach((car, index) => {
      console.log(`${index + 1}. ${car.name} - $${car.pricePerDay}/day - ${car.location}`);
    });

    console.log('\n🎉 Car seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding cars:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedCars();
