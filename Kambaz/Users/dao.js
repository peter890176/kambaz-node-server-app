import model from "./model.js";
import { v4 as uuidv4 } from 'uuid';

export const createUser = (user) => {
  const newUser = { ...user, _id: uuidv4() };
  return model.create(newUser);
}


export const findAllUsers = async () => {
  try {
    const users = await model.find({
      $and: [
        { username: { $exists: true, $ne: null } },
        { firstName: { $exists: true, $ne: null } },
        { lastName: { $exists: true, $ne: null } },
        { role: { $in: ["STUDENT", "FACULTY", "ADMIN", "TA"] } }
      ]
    });
    return users;
  } catch (error) {
    console.error("Error in findAllUsers:", error);
    throw error;
  }
};
export const findUserById = (userId) => model.findById(userId);
export const findUserByUsername = (username) => model.findOne({ username: username });
export const findUserByCredentials = (username, password) => model.findOne({ username, password });
export const updateUser = (userId, user) => model.updateOne({ _id: userId }, { $set: user });
export const deleteUser = (userId) => model.deleteOne({ _id: userId });
export const findUsersByRole = (role) => model.find({ role: role }); // or just model.find({ role })

export const findUsersByPartialName = (partialName) => {
  const regex = new RegExp(partialName, "i"); // 'i' makes it case-insensitive
  return model.find({
    $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
  });
};


