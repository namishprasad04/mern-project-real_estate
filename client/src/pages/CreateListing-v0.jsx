import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateListing() {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "userProfile");

      fetch(`https://api.cloudinary.com/v1_1/namish/image/upload`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          resolve(data.secure_url);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (files.length > 0 && files.length < 7) {
      try {
        const urls = await Promise.all(
          Array.from(files).map((file) => storeImage(file))
        );
        setLoading(false);
        toast.success("Files uploaded successfully!");
        setUploadedImages(urls);
      } catch (error) {
        setLoading(false);
        toast.error("Error uploading files");
        console.error("Error uploading images:", error);
      }
    } else {
      setLoading(false);
      toast.error("You can only upload between 1 and 6 images");
    }
  };
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            id="name"
            placeholder="Name"
            className="border p-3 rounded-lg"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
          />
          <input
            type="text"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-2 border border-gray-300 rounded-lg focus:outline-none"
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-2 border border-gray-300 rounded-lg focus:outline-none"
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="1"
                max="10"
                required
                className="p-2 border border-gray-300 rounded-lg focus:outline-none"
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">(₹ / Month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="1"
                max="10"
                required
                className="p-2 border border-gray-300 rounded-lg focus:outline-none"
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">(₹ / Month)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 7)
            </span>{" "}
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => {
                setFiles(e.target.files);
              }}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={loading}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            Create Lisitng
          </button>
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-40 object-cover rounded"
                  />
                  <button
                    onClick={() => {
                      setUploadedImages(
                        uploadedImages.filter((_, i) => i !== index)
                      );
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
