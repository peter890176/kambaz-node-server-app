import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";
let currentUser = null;

export default function UserRoutes(app) {

  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role && role !== "ALL") {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }
    try {
      const users = await dao.findAllUsers();
      if (!users || users.length === 0) {
        res.status(404).json({ message: "No users found" });
        return;
      }
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  };



  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    try {
     
      const status = await dao.updateUser(userId, userUpdates);

      const currentUser = req.session["currentUser"];
      if (currentUser && currentUser._id === userId) {
        req.session["currentUser"] = { ...currentUser, ...userUpdates };
      }
      

      if (currentUser && currentUser._id === userId) {
         res.json(req.session["currentUser"]); 
      } else {
         const updatedUser = await dao.findUserById(userId); 
         res.json(updatedUser); 
      } 
 

    } catch (error) {
      console.error(`Error updating user ${userId}:`, error); 

      res.status(500).json({ message: `Failed to update user ${userId}` });
    }
  };




  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };


  const signin = async (req, res) => {
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };


  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };


  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };

  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const courses = courseDao.findCoursesForEnrolledUser(userId);
    res.json(courses);
  };

  const findUserById = async (req, res) => {
    const user = await dao.findUserById(req.params.userId);
    res.json(user);
  };

  const deleteUser = async (req, res) => {
    const status = await dao.deleteUser(req.params.userId);
    res.json(status);
};

const findCoursesForUser = async (req, res) => {
  const currentUser = req.session["currentUser"];
  if (!currentUser) {
    res.sendStatus(401);
    return;
  }
  if (currentUser.role === "ADMIN") {
    const courses = await courseDao.findAllCourses();
    res.json(courses);
    return;
  }
  let { uid } = req.params;
  if (uid === "current") {
    uid = currentUser._id;
  }
  const courses = await enrollmentsDao.findCoursesForUser(uid);
  res.json(courses);
};

const enrollUserInCourse = async (req, res) => {
  let { uid, cid } = req.params;
  if (uid === "current") {
    const currentUser = req.session["currentUser"];
    uid = currentUser._id;
  }
  const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
  res.send(status);
};
const unenrollUserFromCourse = async (req, res) => {
  let { uid, cid } = req.params;
  if (uid === "current") {
    const currentUser = req.session["currentUser"];
    uid = currentUser._id;
  }
  const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
  res.send(status);
};




  
  app.get("/api/users/:userId", findUserById);
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.get("/api/users/current/courses", findCoursesForEnrolledUser);
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  app.delete("/api/users/:userId", deleteUser);
  app.get("/api/users/:uid/courses", findCoursesForUser);
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);

}
