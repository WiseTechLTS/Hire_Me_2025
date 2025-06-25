import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import axios from "axios";

const HomePage = () => {
  const [user, token] = useAuth();
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    image: null,
  });
  const [editingCarId, setEditingCarId] = useState(null);

  // Fetch cars for the logged-in user
  useEffect(() => {
    const fetchCars = async () => {
      try {
        let response = await axios.get("http://127.0.0.1:8000/api/cars/mine/", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setCars(response.data);
      } catch (error) {
        console.log(error.response.data);
      }
    };
    fetchCars();
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // Create a new car
  const handleCreateCar = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("make", formData.make);
    data.append("model", formData.model);
    data.append("year", formData.year);
    data.append("price", formData.price);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/cars/mine/",
        data,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setCars([...cars, response.data]);
      resetForm();
    } catch (error) {
      console.log(error.response.data);
      alert("Failed to create car.");
    }
  };

  // Update an existing car
  const handleUpdateCar = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("make", formData.make);
    data.append("model", formData.model);
    data.append("year", formData.year);
    data.append("price", formData.price);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/cars/${editingCarId}/`,
        data,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setCars(
        cars.map((car) => (car.id === editingCarId ? response.data : car))
      );
      resetForm();
      setEditingCarId(null);
    } catch (error) {
      console.log(error.response.data);
      alert("Failed to update car.");
    }
  };

  // Delete a car
  const handleDeleteCar = async (carId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cars/${carId}/`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      setCars(cars.filter((car) => car.id !== carId));
    } catch (error) {
      console.log(error.response.data);
      alert("Failed to delete car.");
    }
  };

  // Start editing a car
  const startEditing = (car) => {
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      image: null, // Image is not pre-filled; user must re-upload if updating
    });
    setEditingCarId(car.id);
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: "",
      price: "",
      image: null,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Home Page for {user.username}!
      </h1>

      {/* Car Form */}
      <form
        onSubmit={editingCarId ? handleUpdateCar : handleCreateCar}
        className="mb-8 max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingCarId ? "Edit Car" : "Add New Car"}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium">Make</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
            accept="image/*"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {editingCarId ? "Update Car" : "Add Car"}
        </button>
        {editingCarId && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditingCarId(null);
            }}
            className="w-full bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Car List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Cars</h2>
        {cars.length > 0 ? (
          cars.map((car) => (
            <div
              key={car.id}
              className="flex items-center justify-between p-4 border-b"
            >
              <div>
                <p>
                  {car.year} {car.make} {car.model} - ${car.price}
                </p>
                {car.image && (
                  <img
                    src={`http://127.0.0.1:8000${car.image}`}
                    alt={`${car.make} ${car.model}`}
                    className="w-32 h-32 object-cover mt-2"
                  />
                )}
              </div>
              <div>
                <button
                  onClick={() => startEditing(car)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCar(car.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No cars found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;