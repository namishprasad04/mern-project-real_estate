import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
} from "../redux/user/userSlice";

import { Link } from "react-router-dom";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState("");
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListings, setShowListings] = useState(false);
  const [userListings, setUserListings] = useState([]);

  const dispatch = useDispatch();

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async (file) => {
    const CLOUD_NAME = "namish";
    const UPLOAD_PRESET = "userProfile";

    try {
      setFilePerc(0);
      setFileUploadError("");

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();

      setFilePerc(100);
      return data.secure_url;
    } catch (error) {
      setFileUploadError("Error uploading image. Please try again.");
      console.log(error);
      return null;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      let updatedFormData = { ...formData };

      if (selectedFile) {
        const uploadedUrl = await handleFileUpload(selectedFile);
        if (uploadedUrl) {
          updatedFormData.avatar = uploadedUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      const res = await fetch(`api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const data = await res.json();
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setSelectedFile(null); // Reset selected file after successful update
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch("/api/auth/sign-out");
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      // window.location.href = "/"; // Redirect to home page instead of reloading
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleShowListing = async () => {
    try {
      setShowListings(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListings(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListings(true);
      console.error(error);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          onChange={handleFileSelect}
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <div className="relative self-center">
          <img
            onClick={() => fileRef.current.click()}
            className="rounded-full h-24 w-24 object-cover cursor-pointer"
            src={formData.avatar || currentUser.avatar}
            alt="profile"
          />
        </div>
        {selectedFile && <p>New file selected: {selectedFile.name}</p>}
        <p className="text-sm self-center">
          {fileUploadError && (
            <span className="text-red-700">{fileUploadError}</span>
          )}
          {filePerc > 0 && filePerc < 100 && (
            <span className="text-blue-700">{`Uploading: ${filePerc}%`}</span>
          )}
          {filePerc === 100 && (
            <span className="text-green-700">Image Successfully Uploaded!</span>
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 uppercase rounded-lg hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
      <button onClick={handleShowListing} className="text-green-700 w-full">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListings ? "Error showing listings" : ""}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="flex justify-between items-center gap-4 border rounded-lg p-3"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="lisitng cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="flex-1 text-slate-700 font-semibold hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
