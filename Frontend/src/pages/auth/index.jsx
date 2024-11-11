import Background from "../../assets/login2.png";
import Victory from "../../assets/victory.svg";
import { FcGoogle } from "react-icons/fc"; // Import Google icon from react-icon
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE, OTP_ROUTE } from "@/lib/constants";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { validateEmail, validatePassword } from "@/utils/validation";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { useGoogleLogin } from '@react-oauth/google';

const Auth = () => {
  const navigate = useNavigate();
  // const [obj,setobj]=useState();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [temp, setTemp] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(""); // OTP state
  const [timer, setTimer] = useState(120); // Timer for OTP

//////////////login with google

   // Initialize Google login
   const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Fetch user info
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }).then((res) => res.json());
        toast.success("Google login successful!");
        try {
          const response = await apiClient.post(
            SIGNUP_ROUTE,
            {
              email:userInfo.email,
              password : "123456",
            },
            { withCredentials: true }
          );
          if (response.status == 201) {
            console.log(response.status);
            setUserInfo(response.data.user);
          }
      } catch (e) {
        if (e.response.status == 404) {
          try {
              const response = await apiClient.post(
                LOGIN_ROUTE,
                { 
                  email:userInfo.email,
                  password : "123456",
                },
                { withCredentials: true }
              );
              if (response.data.user.id) {
                setUserInfo(response.data.user);
                if (response.data.user.profileSetup) navigate("/chat");
                else navigate("/profile");
              } else {
                console.log("error");
              }
          } catch (e) {
            if (e.response.status === Number(404)) {
              toast.error("User Not Found");
              return false;
            }
            if (e.response.status === Number(400)) {
              toast.error("Invalid Password");
              return false;
            } else {
              toast.error("unwanted Error!!");
            }
          }
        }
        else{
          toast.error("Internal Server Error");
        }
      }
      } catch (error) {
        toast.error("Failed to retrieve Google user info.");
      }
    },
    onError: () => {
      toast.error("Google login failed!");
    },
  });
  /////////////////////////////////////////////////////////////
  

  // OTP Countdown Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(
        () => setTimer((prevTimer) => prevTimer - 1),
        1000
      );
    } else if (timer === 0) {
      clearInterval(interval); // Stop the timer when it reaches zero
    }
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [temp, timer]);

  const handleOTPVerification = async () => {
    if (otp.length !== 4) {
      toast.error("OTP must be 4 digits.");
      return;
    }
    try {
      const response = await apiClient.post(
        OTP_ROUTE,
        { email },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("OTP Verified!");
        navigate("/profile");
      }
    } catch (e) {
      toast.error("Invalid OTP");
    }
  };

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!validateEmail(email)) {
      toast.error("Please Enter Proper Email Address.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };
  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!validateEmail(email)) {
      toast.error("Please Enter Proper Email Address.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password should be same.");
      return false;
    }
    return true;
  };
  const handleLogin = async () => {
    try {
      if (validateLogin()) {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        if (response.data.user.id) {
          setUserInfo(response.data.user);
          if (response.data.user.profileSetup) navigate("/chat");
          else navigate("/profile");
        } else {
          console.log("error");
        }
      }
    } catch (e) {
      if (e.response.status === Number(404)) {
        toast.error("User Not Found");
        return false;
      }
      if (e.response.status === Number(400)) {
        toast.error("Invalid Password");
        return false;
      } else {
        toast.error("unwanted Error!!");
      }
    }
  };

  const handleSignup = async () => {
    try {
      if (validateSignup()) {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          {
            email,
            password,
          },
          { withCredentials: true }
        );
        if (response.status == 201) {
          console.log(typeof response.status);
          setTemp(0);
          setUserInfo(response.data.user);
        }
      }
    } catch (e) {
      if (e.response.status == 404) {
        handleLogin();
        return toast.error("User Alredy Exist");
      }
      toast.error("internal Server Error");
    }
  };

  const handlegoogleLogin = async () => { 
    try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          {
            email,
            password,
          },
          { withCredentials: true }
        );
        if (response.status == 201) {
          console.log(response.status);
          setUserInfo(response.data.user);
        }
    } catch (e) {
      if (e.response.status == 404) {
        return toast.error("User Alredy Exist");
      }
      toast.error("User Alredy Exist2");
    }
  };

  return temp === 1 ? (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white  border-2 border-white  text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex  items-center justify-center flex-col">
            <div className="flex  items-center justify-center">
              <h1 className="text-5xl md:text-6xl font-bold">Welcome</h1>
              <img src={Victory} className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full ">
            <Tabs defaultValue="login" className="w-3/4">
              <TabsList className="bg-transparent rounded-none w-full ">
                <TabsTrigger
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2    rounded-none w-full data-[state=active]:text-black  data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                  value="login"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2   rounded-none w-full data-[state=active]:text-black  data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300 "
                  value="signup"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="flex flex-col gap-5 mt-10">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className="rounded-full p-6" onClick={handleLogin}>
                  Login
                </Button>
                {/* Google Login Button */}
                <Button
                  className="rounded-full p-6 flex items-center justify-center gap-3"
                  onClick={() => googleLogin()}
                >
                  <FcGoogle size={24} /> {/* Google icon */}
                  Login with Google
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="flex flex-col gap-5 ">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-full p-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full p-6" onClick={handleSignup}>
                  Signup
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center ">
          <img src={Background} className="h-[700px] " />
        </div>

        {/* Login Signup COmponent */}
        {/* Branding */}
      </div>
    </div>
  ) : (
    // OTP Verification Page
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex items-center justify-center">
            <h1 className="text-5xl md:text-5xl font-extrabold">
              OTP Verification
            </h1>
            <img src={Victory} className="h-[100px]" />
          </div>
          <p className="font-medium text-2xl text-center">
            Enter the OTP sent to your email
          </p>
          <div className="flex flex-col gap-5 w-3/4">
            <Input
              placeholder="Enter OTP"
              type="text"
              maxLength={4}
              className="rounded-full p-6 text-center text-2xl font-semibold"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <p className="text-lg text-red-600 text-center">
              Time remaining: {timer}s
            </p>
            <Button
              className="rounded-full p-6"
              onClick={handleOTPVerification}
              disabled={otp.length !== 4 || timer <= 0}
            >
              Verify OTP
            </Button>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} className="h-[700px]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
