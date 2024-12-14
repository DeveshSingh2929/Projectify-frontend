"use client";
import axios from "axios";
import { setAuthUser, getAuthUser, deleteAuthUser } from "../app/actions/cookies";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";

const UserContext = React.createContext();

// set axios to include credentials with every request
// axios.defaults.withCredentials = true;

export const UserContextProvider = ({ children }) => {
  // const serverUrl = "https://taskfyer.onrender.com";
  const serverUrl = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();

  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [token, setToken] = useState("");
  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // register user
  const registerUser = async (e) => {
    e.preventDefault();
    console.log(userState);
    if (!userState.email.includes("@") || !userState.password || userState.password.length < 6) {
      alert("Please enter a valid email and password (min 6 characters)");
      return;
    }
    try {
      const res = await axios.post(`${serverUrl}/api/v1/register`, userState);
      if (res.status === 200) {
        alert("User registered successfully");
      } else {
        alert("Some Error Occured");
      }

      // clear the form
      setUserState({
        name: "",
        email: "",
        password: "",
      });

      // redirect to login page
      router.push("/login");
    } catch (error) {
      console.log("Error registering user", error);
      alert("Error registering user");
    }
  };

  // login the user
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${serverUrl}/api/v1/login`, {
        email: userState.email,
        password: userState.password,
      });

      if (res.status === 200) {
        setAuthUser(res.data.token);
        alert("User logged in successfully");
        setUserState({
          email: "",
          password: "",
        });
        console.log("hello");
        await getUser();
        router.push("/");
      } else {
        alert(res.data.message);
      }
      // clear the form
    } catch (error) {
      console.log("Error logging in user", error);
      alert("Error logging in user");
    }
  };

  // get user Looged in Status
  const userLoginStatus = async () => {
    let loggedIn = false;
    try {
      const res = await axios.get(`${serverUrl}/api/v1/login-status`);
      loggedIn = !!res.data;
      setLoading(false);

      if (!loggedIn) {
        router.push("/login");
      }
    } catch (error) {
      console.log("Error getting user login status", error);
    }

    return loggedIn;
  };

  // logout user
  const logoutUser = async () => {
    try {
      await deleteAuthUser();
      alert("User logged out successfully");

      setUser({});

      // redirect to login page
      router.push("/login");
    } catch (error) {
      console.log("Error logging out user", error);
      alert(error.response.data.message);
    }
  };

  // get user details
  const getUser = async () => {
    setLoading(true);
    try {
      const token = await getAuthUser(); // Ensure this retrieves the valid token
      console.log(token.value);
      const res = await axios.get(`${serverUrl}/api/v1/user`, {
        headers: {
          token: token.value, // Include token in the headers
        },
      });
      console.log("hi", res);

      setUser((prevState) => {
        return {
          ...prevState,
          ...res.data,
        };
      });
    } catch (error) {
      console.log("Error getting user details", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false); // Ensure loading state is reset even on error
    }
  };

  // update user details
  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAuthUser();
      const res = await axios.patch(`${serverUrl}/api/v1/user`, data, {headers:{token:token.value}});

      // update the user state
      setUser((prevState) => {
        return {
          ...prevState,
          ...res.data,
        };
      });

      alert("User updated successfully");

      setLoading(false);
    } catch (error) {
      console.log("Error updating user details", error);
      setLoading(false);
      alert("Error updating user details");
    }
  };

  // email verification
  const emailVerification = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/verify-email`,
        {},
        {
          withCredentials: true, // send cookies to the server
        }
      );

      alert.success("Email verification sent successfully");
      setLoading(false);
    } catch (error) {
      console.log("Error sending email verification", error);
      setLoading(false);
      alert(error.response.data.message);
    }
  };

  // verify user/email
  const verifyUser = async (token) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/verify-user/${token}`,
        {},
        {
          withCredentials: true, // send cookies to the server
        }
      );

      alert.success("User verified successfully");
      console.log("inside verify user");
      // refresh the user details
      getUser();

      setLoading(false);
      // redirect to home page
      router.push("/");
    } catch (error) {
      console.log("Error verifying user", error);
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  // forgot password email
  const forgotPasswordEmail = async (email) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/forgot-password`,
        {
          email,
        },
        {
          withCredentials: true, // send cookies to the server
        }
      );

      alert.success("Forgot password email sent successfully");
      setLoading(false);
    } catch (error) {
      console.log("Error sending forgot password email", error);
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  // reset password
  const resetPassword = async (token, password) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/reset-password/${token}`,
        {
          password,
        },
        {
          withCredentials: true, // send cookies to the server
        }
      );

      alert.success("Password reset successfully");
      setLoading(false);
      // redirect to login page
      router.push("/login");
    } catch (error) {
      console.log("Error resetting password", error);
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  // change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);

    try {
      const token = await getAuthUser();
      const res = await axios.patch(
        `${serverUrl}/api/v1/change-password`,
        { currentPassword, newPassword },
        {headers:{token:token.value}}
      );

      alert("Password changed successfully");
      setLoading(false);
    } catch (error) {
      console.log("Error changing password", error);
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  // admin routes
  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${serverUrl}/api/v1/admin/users`,
        {},
        {
          withCredentials: true, // send cookies to the server
        }
      );

      setAllUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error getting all users", error);
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  // dynamic form handler
  const handlerUserInput = (name) => (e) => {
    const value = e.target.value;

    setUserState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(userState);
  };

  // delete user
  const deleteUser = async (id) => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${serverUrl}/api/v1/admin/users/${id}`,
        {},
        {
          withCredentials: true, // send cookies to the server
        }
      );

      alert.success("User deleted successfully");
      setLoading(false);
      // refresh the users list
      getAllUsers();
    } catch (error) {
      console.log("Error deleting user", error);
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loginStatusGetUser = async () => {
      await getUser();
    };
    if (token !== "") {
      loginStatusGetUser();
    }
  }, []);

  useEffect(() => {
    if (user.role === "admin") {
      getAllUsers();
    }
  }, [user.role]);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handlerUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        getUser,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
