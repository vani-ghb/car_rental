import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "New York, NY",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      feedback: "Excellent service and well-maintained vehicles. The booking process was smooth and the staff was very helpful throughout my rental period."
    },
    {
      id: 2,
      name: "Michael Chen",
      location: "Los Angeles, CA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      feedback: "Great selection of cars and competitive pricing. I rented a luxury sedan for a business trip and everything was perfect from start to finish."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      location: "Miami, FL",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      feedback: "Outstanding customer service and clean, reliable vehicles. The 24/7 support was a lifesaver when I had a question late at night."
    },
    {
      id: 4,
      name: "David Thompson",
      location: "Chicago, IL",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      feedback: "Best car rental experience I've ever had. Transparent pricing, no hidden fees, and the vehicle was exactly as described. Highly recommended!"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Real experiences from our valued customers</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="customer-image"
                />
                <div className="customer-info">
                  <h4 className="customer-name">{testimonial.name}</h4>
                  <p className="customer-location">{testimonial.location}</p>
                  <div className="rating">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <div className="testimonial-content">
                <p className="feedback-text">"{testimonial.feedback}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
